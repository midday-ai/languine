import type { API, FileInfo } from "jscodeshift";

interface ExtractedString {
  value: string;
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  parentType: string;
}

export default function transform(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const strings: ExtractedString[] = [];

  // Find all string literals in JSX
  for (const path of root.find(j.JSXText).paths()) {
    const value = path.node.value?.trim();
    if (value) {
      strings.push({
        value,
        loc: path.node.loc || undefined,
        parentType: path.parent.node.type,
      });
    }
  }

  // Find string literals in JSX attributes
  for (const path of root.find(j.StringLiteral).paths()) {
    if (path.parent.node.type === "JSXAttribute") {
      strings.push({
        value: path.node.value as string,
        loc: path.node.loc || undefined,
        parentType: path.parent.node.type,
      });
    }
  }

  // Generate translation keys
  const translations = createTranslationMap(strings, file.path);

  // Add import for translation function if not exists
  //   const hasTranslationImport =
  //     root
  //       .find(j.ImportDeclaration)
  //       .filter((path) => path.node.source?.value === "@/lib/i18n")
  //       .size() > 0;

  //   if (!hasTranslationImport) {
  //     root
  //       .get()
  //       .node.program.body.unshift(
  //         j.importDeclaration(
  //           [j.importSpecifier(j.identifier("t"))],
  //           j.literal("@/lib/i18n"),
  //         ),
  //       );
  //   }

  // Replace JSX text
  for (const path of root.find(j.JSXText).paths()) {
    const value = path.node.value?.trim();
    if (value && translations[value]) {
      const replacement = j.jsxExpressionContainer(
        j.callExpression(j.identifier("t"), [j.literal(translations[value])]),
      );
      path.replace(replacement);
    }
  }

  // Replace string literals in JSX attributes
  for (const path of root.find(j.StringLiteral).paths()) {
    if (path.parent.node.type === "JSXAttribute") {
      const value = path.node.value as string;
      if (translations[value]) {
        const replacement = j.jsxExpressionContainer(
          j.callExpression(j.identifier("t"), [j.literal(translations[value])]),
        );
        path.replace(replacement);
      }
    }
  }

  return root.toSource();
}

function createTranslationMap(
  strings: ExtractedString[],
  filePath: string,
): Record<string, string> {
  const translations: Record<string, string> = {};
  const seenValues = new Map<string, number>();
  const componentName =
    filePath
      .split("/")
      .pop()
      ?.replace(/\.[jt]sx?$/, "") || "";

  for (const { value, parentType } of strings) {
    const count = seenValues.get(value) || 0;
    seenValues.set(value, count + 1);

    const elementType = parentType === "JSXAttribute" ? "attribute" : "text";
    const key = generateTranslationKey(
      componentName,
      elementType,
      value,
      count,
    );
    translations[value] = key;
  }

  return translations;
}

function generateTranslationKey(
  componentName: string,
  elementType: string,
  value: string,
  index: number,
): string {
  const baseKey = `${componentName}.${elementType}`.toLowerCase();
  const suffix = index > 0 ? `_${index}` : "";
  return `${baseKey}${suffix}`;
}
