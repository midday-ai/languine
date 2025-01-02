import { DottedSeparator } from "./dotted-separator";
import { FooterLogo } from "./footer-logo";
import { GetStarted } from "./get-started";

export function Footer() {
  return (
    <div className="mt-24">
      <DottedSeparator />

      <div className="mt-24 mb-32 max-w-screen-lg mx-auto">
        <GetStarted />
      </div>

      <FooterLogo />
    </div>
  );
}
