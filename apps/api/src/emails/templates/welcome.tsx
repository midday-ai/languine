import { setupI18n } from "@languine/react-email";
import {
  Body,
  Container,
  Font,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { Footer } from "../components/footer";
import { Logo } from "../components/logo";
import { OutlineButton } from "../components/outline-button";

export default function LanguineEmail({ locale }: { locale: string }) {
  const i18n = setupI18n(locale);

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Geist Mono"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@500&display=swap",
            format: "woff2",
          }}
          fontWeight={500}
          fontStyle="normal"
        />
      </Head>
      <Preview>{i18n.t("email.welcome.preview")}</Preview>
      <Tailwind>
        <Body className="bg-white font-mono">
          <Container className="mx-auto py-5 pb-12 max-w-[580px]">
            <Logo />

            <Text className="text-sm leading-7 mb-6 font-mono">
              {i18n.t("email.welcome.greeting", { name: "Viktor" })}
            </Text>

            <Text className="text-sm leading-7 pb-2 font-mono">
              {i18n.t("email.welcome.intro")}
            </Text>

            <Text className="text-sm font-mono">
              <span className="text-lg">◇ </span>
              {i18n.t("email.welcome.feature1")}
            </Text>
            <Text className="text-sm font-mono">
              <span className="text-lg">◇ </span>
              {i18n.t("email.welcome.feature2")}
            </Text>
            <Text className="text-sm font-mono">
              <span className="text-lg">◇ </span>
              {i18n.t("email.welcome.feature3")}
            </Text>
            <Text className="text-sm font-mono">
              <span className="text-lg">◇ </span>
              {i18n.t("email.welcome.feature4")}
            </Text>

            <Section className="mb-20 mt-8">
              <OutlineButton
                className="mr-6"
                variant="default"
                href="https://languine.ai"
              >
                {i18n.t("email.welcome.cta.automate")}
              </OutlineButton>

              <OutlineButton
                variant="secondary"
                href="https://languine.ai/docs"
              >
                {i18n.t("email.welcome.cta.docs")}
              </OutlineButton>
            </Section>

            <Section className="mt-8">
              <Text className="text-sm leading-7 mb-6 font-mono text-[#707070]">
                {i18n.t("email.welcome.support", {
                  email: (
                    <Link
                      href="mailto:support@languine.ai"
                      className="underline text-black font-mono"
                    >
                      support@languine.ai
                    </Link>
                  ),
                })}
              </Text>
            </Section>

            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
