import { cn } from "@/lib/utils";
import Link from "next/link";
import { Logo } from "./logo";

const links = [
  { href: "/pricing", label: "Pricing" },
  { href: "https://git.new/languine", label: "Github 1.2k" },
  { href: "/docs", label: "Docs" },
  { href: "/login", label: "Sign in", className: "text-primary" },
];

export function Header() {
  return (
    <div className="flex items-center justify-between">
      <Link href="/" className="block">
        <Logo />
      </Link>

      <div className="flex items-center gap-6 text-sm">
        {links.map((link) => (
          <Link
            href={link.href}
            className={cn(
              "text-secondary hover:text-primary transition-colors",
              link.className,
            )}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
