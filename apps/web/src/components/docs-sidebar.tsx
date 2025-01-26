"use client";

import { OutlinedButton } from "@/components/ui/outlined-button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDocs } from "@/contexts/docs";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { MdArrowBack, MdArrowForward } from "react-icons/md";

export function DocsSidebar() {
  const t = useTranslations("docs");
  const pathname = usePathname();
  const router = useRouter();
  const { sections, currentPage } = useDocs();

  return (
    <>
      <div className="md:hidden w-full mb-6">
        <Select
          value={pathname}
          onValueChange={(value) => router.push(value)}
          defaultValue={pathname}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a page" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((section) => (
              <SelectGroup key={section.title}>
                <SelectLabel>{section.title}</SelectLabel>
                {section.items.map((item) => (
                  <SelectItem key={item.href} value={item.href}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="hidden md:block w-72 pr-8 flex-shrink-0 sticky top-[90px] h-[calc(100vh-90px)]">
        <nav className="space-y-8 overflow-y-auto h-full pb-16">
          {sections.map((section) => (
            <div key={section.title}>
              <h5 className="mb-4 text-sm font-medium">{section.title}</h5>
              <ul className="space-y-2 pl-2">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={
                        currentPage?.href === item.href ? "page" : undefined
                      }
                      className={cn(
                        "block text-sm py-0.5 text-secondary hover:text-primary transition-colors",
                        currentPage?.href === item.href && "text-primary",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}

export function DocsNavigation() {
  const { previousPage, nextPage } = useDocs();

  return (
    <div className="border-t mt-16">
      <div className="max-w-3xl mx-auto flex justify-between items-center py-6">
        {previousPage ? (
          <OutlinedButton variant="secondary">
            <Link
              href={previousPage.href}
              className="flex items-center gap-2 text-sm"
            >
              <MdArrowBack />
              {previousPage.label}
            </Link>
          </OutlinedButton>
        ) : (
          <div />
        )}
        {nextPage ? (
          <OutlinedButton variant="secondary">
            <Link
              href={nextPage.href}
              className="flex items-center gap-2 text-sm"
            >
              {nextPage.label}
              <MdArrowForward />
            </Link>
          </OutlinedButton>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
