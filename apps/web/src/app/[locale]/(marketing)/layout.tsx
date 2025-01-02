import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { ReactElement } from "react";

export default function SubLayout({ children }: { children: ReactElement }) {
  return (
    <div className="p-6 bg-noise">
      <Header />
      <div className="container mx-auto">{children}</div>
      <Footer />
    </div>
  );
}
