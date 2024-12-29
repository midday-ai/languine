<p align="center">
  <img src="https://github.com/midday-ai/languine/blob/main/packages/react-email/image.png" />
</p>

<p align="center">
  A lightweight i18n library for React Email.
</p>

---

```bash
$ npm install @languine/react-email
```

## What is this?

This is a lightweight i18n library for React Email built on top of `i18n-js`.

Language files are automatically included in the `locales` folder.

## How to use

```tsx
import { setupI18n } from "@languine/react-email";

export function WelcomeEmail({ locale, name }) {
  const i18n = setupI18n(locale);

  return (
    <Html>
      <Head />
      <Preview>{i18n.t("preview")}</Preview>
      <Body>
         <Text>{i18n.t("welcome", { name  })}</Text>
      </Body>
    </Html>
  );
}
```

### Translation files (en.json)

Add your translation files in the `locales` folder.


```json
{
    "preview": "Welcome to our app!",
    "welcome": "Hello, %{name}!"
}
```

### Rendering the email
```tsx
import { render } from '@react-email/render';
import { WelcomeEmail } from "./emails/welcome";

const html = await render(<WelcomeEmail locale="en" name="John" />, {
  pretty: true,
});

console.log(html);
```


## Works together with Languine CLI

Automatically add and translate your email templates with [Languine CLI](https://languine.ai).

```bash
$ npx languine@latest
```
