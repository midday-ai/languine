import { Footer } from "@/emails/components/footer";
import { Logo } from "@/emails/components/logo";
import { OutlineButton } from "@/emails/components/outline-button";
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

export default function InviteEmail({
  invitedByUsername = "Viktor",
  invitedByEmail = "viktor@languine.ai",
  teamName = "Languine",
  inviteLink = "https://languine.ai/invite",
}: {
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  inviteLink: string;
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
      <Preview>You've been invited to join {teamName} on Languine</Preview>
      <Tailwind>
        <Body className="bg-white font-mono">
          <Container className="mx-auto py-5 pb-12 max-w-[580px]">
            <Logo />

            <Text className="text-sm leading-7 mb-6 font-mono">
              Hi there! {invitedByUsername} ({invitedByEmail}) has invited you
              to join {teamName} on Languine.
            </Text>

            <Section className="mb-20 mt-8">
              <OutlineButton
                className="mr-6"
                variant="default"
                href={inviteLink}
              >
                Accept Invitation
              </OutlineButton>
            </Section>

            <Section className="mt-8">
              <Text className="text-sm leading-7 mb-6 font-mono text-[#707070]">
                If you have any questions or didn't expect this invitation,
                please contact{" "}
                <Link
                  href="mailto:support@languine.ai"
                  className="underline text-black font-mono"
                >
                  support@languine.ai
                </Link>
              </Text>
            </Section>

            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
