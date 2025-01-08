import { getAppUrl } from "@/lib/url";
import { Img, Section } from "@react-email/components";

const appUrl = getAppUrl();

export function Logo() {
  return (
    <Section className="mb-12 mt-8">
      <Img
        src={`${appUrl}/email/logo.png`}
        alt="Languine Logo"
        width={194}
        height={32}
      />
    </Section>
  );
}
