import { expect, test } from "vitest";
import { parseJS } from "../src/parsers/js.js";

test("extracts translation keys from t() function calls", () => {
  const code = `
    t("hello.world");
    t("another.key");
    notT("ignored");
  `;
  
  const keys = parseJS(code);
  expect(keys).toEqual(["hello.world", "another.key"]);
});

test("extracts translation keys from intl.formatMessage()", () => {
  const code = `
    intl.formatMessage({ id: "welcome" });
    intl.formatMessage({ id: "goodbye" });
    intl.something({ id: "ignored" });
  `;

  const keys = parseJS(code);
  expect(keys).toEqual(["welcome", "goodbye"]);
});

test("extracts translation keys from i18n.t() calls", () => {
  const code = `
    i18n.t("dashboard.title");
    i18n.t("user.profile");
    other.t("ignored");
  `;

  const keys = parseJS(code);
  expect(keys).toEqual(["dashboard.title", "user.profile"]);
});

test("extracts translation keys from JSX components", () => {
  const code = `
    <>
      <FormattedMessage id="header.title" />
      <Trans id="footer.copyright" />
      <OtherComponent id="ignored" />
    </>
  `;

  const keys = parseJS(code);
  expect(keys).toEqual(["header.title", "footer.copyright"]);
});

test("extracts translation keys from mixed usage", () => {
  const code = `
    function Component() {
      return (
        <div>
          {t("greeting")}
          <FormattedMessage id="welcome" />
          {intl.formatMessage({ id: "start" })}
          {i18n.t("continue")}
        </div>
      );
    }
  `;

  const keys = parseJS(code);
  expect(keys).toEqual(["greeting", "welcome", "start", "continue"]);
});

test("supports custom function names", () => {
  const code = `
    translate("custom.key");
    __("another.key");
  `;

  const keys = parseJS(code, ["translate", "__"]);
  expect(keys).toEqual(["custom.key", "another.key"]);
});

test("supports custom component names", () => {
  const code = `
    <>
      <Message id="custom.message" />
      <Translate id="another.message" />
    </>
  `;

  const keys = parseJS(code, ["t"], ["Message", "Translate"]);
  expect(keys).toEqual(["custom.message", "another.message"]);
});
