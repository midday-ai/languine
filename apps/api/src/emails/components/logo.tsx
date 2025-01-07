import { getAppUrl } from "@/lib/envs";
import { Img, Section } from "@react-email/components";

export function Logo() {
  return (
    <Section className="mb-12 mt-8">
      <Img
        src={`${getAppUrl()}/email/logo.png`}
        alt="Languine Logo"
        width={194}
        height={32}
      />
    </Section>
  );
}
