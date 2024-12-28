import type { TranslateOptions } from "i18n-js";
import type { I18n } from "i18n-js";
import React from "react";
import reactStringReplace from "react-string-replace";

export function interpolate(
  i18n: I18n,
  message: string,
  options: TranslateOptions,
) {
  const transformedOptions = Object.keys(options).reduce((buffer, key) => {
    buffer[i18n.transformKey(key)] = options[key];
    return buffer;
  }, {} as TranslateOptions);

  return reactStringReplace(message, i18n.placeholder, (match, i) => {
    let value: React.ReactNode = "";
    const placeholder = match as string;
    const name = placeholder.replace(i18n.placeholder, "$1");

    if (transformedOptions[name] != null) {
      if (React.isValidElement(transformedOptions[name])) {
        value = transformedOptions[name];
      } else if (Array.isArray(transformedOptions[name])) {
        value = transformedOptions[name];
      } else if (typeof transformedOptions[name] === "object") {
        value = transformedOptions[name];
      } else {
        value = transformedOptions[name].toString().replace(/\$/gm, "_#$#_");
      }
    } else if (name in transformedOptions) {
      value = i18n.nullPlaceholder(
        i18n,
        placeholder,
        message,
        transformedOptions,
      );
    } else {
      value = i18n.missingPlaceholder(
        i18n,
        placeholder,
        message,
        transformedOptions,
      );
    }

    return <React.Fragment key={i}>{value}</React.Fragment>;
  });
}
