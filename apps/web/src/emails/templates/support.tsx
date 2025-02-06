import { Footer } from "@/emails/components/footer";
import { Logo } from "@/emails/components/logo";
import {
  Body,
  Container,
  Font,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export default function SupportEmail({
  name,
  email,
  severity,
  description,
  projectId,
  organizationId,
}: {
  name: string;
  email: string;
  severity: "low" | "medium" | "high";
  description: string;
  projectId: string;
  organizationId: string;
}) {
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
      <Preview>New support request from {name}</Preview>
      <Tailwind>
        <Body className="bg-white font-mono">
          <Container className="mx-auto py-5 pb-12 max-w-[580px]">
            <Logo />

            <Text className="text-sm leading-7 mb-6 font-mono">
              New support request received from {name} ({email})
            </Text>

            <Section className="mb-6">
              <Text className="text-sm font-mono mb-2">
                <strong>Severity:</strong> {severity}
              </Text>
              <Text className="text-sm font-mono mb-2">
                <strong>Organization ID:</strong> {organizationId}
              </Text>
              <Text className="text-sm font-mono mb-2">
                <strong>Project ID:</strong> {projectId}
              </Text>
            </Section>

            <Section className="mb-6">
              <Text className="text-sm font-mono mb-2">
                <strong>Description:</strong>
              </Text>
              <Text className="text-sm font-mono whitespace-pre-wrap bg-gray-50 p-4 rounded">
                {description}
              </Text>
            </Section>

            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
