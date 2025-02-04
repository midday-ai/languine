"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";

export function ManageSubscription({
  polarCustomerId,
}: { polarCustomerId?: string }) {
  const t = useTranslations("manage_subscription");

  return (
    <div>
      {t("title")}

      <Card className="bg-transparent mt-6">
        <CardHeader>
          <CardDescription>{t("manage_description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="outline">
            <Link href={`/api/portal?id=${polarCustomerId}`}>
              {t("manage_button")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
