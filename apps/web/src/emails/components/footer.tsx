import { getAppUrl } from "@/lib/url";
import { Column, Img, Link, Row, Section, Text } from "@react-email/components";

const appUrl = getAppUrl();

export function Footer() {
  return (
    <Section>
      <Img
        src={`${appUrl}/email/separator.png`}
        alt="Separator"
        width="100%"
        className="mb-12"
      />

      <Text className="text-sm leading-6 mb-4 text-left font-mono">
        Automated localization for your applications
      </Text>

      <Row className="mt-8" align="left" width="auto">
        <Column className="align-middle pr-6">
          <Link
            href="https://twitter.com/languine_ai"
            className="text-black no-underline text-xl"
          >
            <Img src={`${appUrl}/email/x.png`} alt="X" width={22} height={22} />
          </Link>
        </Column>

        <Column className="align-middle">
          <Link
            href="https://github.com/midday-ai/languine"
            className="text-black no-underline text-xl"
          >
            <Img
              src={`${appUrl}/email/github.png`}
              alt="GitHub"
              width={22}
              height={22}
            />
          </Link>
        </Column>
      </Row>
      <Section className="mt-8 flex gap-3">
        <Text className="text-xs leading-6 mb-4 text-left font-mono text-[#B8B8B8]">
          © 2024 Languine. All rights reserved. This email was sent to you
          because you signed up for Languine.
        </Text>
      </Section>
    </Section>
  );
}
