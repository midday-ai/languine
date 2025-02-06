"use client";

import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  MdClose,
  MdMenu,
  MdOutlineBook,
  MdOutlineFilterCenterFocus,
  MdOutlineLeaderboard,
  MdOutlineSettings,
} from "react-icons/md";
import { Icons } from "../icons";

export function MobileMenu() {
  const t = useTranslations("navigation");
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const pathname = usePathname();

  const navigation = [
    {
      icon: MdOutlineLeaderboard,
      path: "/",
      isActive: pathname.endsWith(`/${params.organization}/${params.project}`),
      label: t("dashboard"),
    },
    {
      icon: Icons.Tune,
      path: "/tuning",
      isActive: pathname.endsWith("/tuning"),
      label: t("dashboard"),
    },
    {
      icon: MdOutlineFilterCenterFocus,
      path: "/overrides",
      isActive: pathname.endsWith("/overrides"),
      label: t("overrides"),
    },
    {
      icon: MdOutlineSettings,
      path: "/settings",
      isActive: pathname.endsWith("/settings"),
      label: t("settings"),
    },
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <MdClose className="size-6" />
        ) : (
          <MdMenu className="size-6" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-50 top-[70px] bg-background bg-noise"
          >
            <div className="flex flex-col h-full">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.1 }}
                >
                  <Link
                    href={`/${params.organization}/${params.project}${item.path}`}
                    className={cn(
                      "flex items-center gap-4 px-6 py-5 border-b border-border text-secondary",
                      item.isActive && "text-primary",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="size-6" />
                    <span className="text-lg">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
              <motion.div
                className="mt-auto border-t border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: navigation.length * 0.02,
                  duration: 0.1,
                }}
              >
                <Link href="/docs">
                  <motion.div
                    className="flex items-center gap-4 px-6 py-5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: navigation.length * 0.02 + 0.03,
                      duration: 0.1,
                    }}
                  >
                    <MdOutlineBook className="size-6" />
                    <span className="text-lg">{t("docs")}</span>
                  </motion.div>
                </Link>

                <motion.div
                  className="flex items-center gap-4 px-6 py-5 border-t border-border"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: navigation.length * 0.02 + 0.06,
                    duration: 0.1,
                  }}
                >
                  <UserMenu />
                  <span className="text-lg">{t("account")}</span>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
