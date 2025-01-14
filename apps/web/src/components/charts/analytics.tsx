"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/locales/client";
import { trpc } from "@/trpc/client";
import { useParams } from "next/navigation";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  value: {
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function AnalyticsChart() {
  const t = useI18n();
  const { organization, project } = useParams();

  const [{ monthlyStats, totalKeys }] =
    trpc.analytics.getProjectStats.useSuspenseQuery({
      projectSlug: project as string,
      organizationId: organization as string,
    });

  const translatedData = monthlyStats.map((stat) => ({
    ...stat,
    // @ts-ignore
    month: t(`months.${stat.month.split("-").at(1)}`),
  }));

  return (
    <Card className="w-full border-none bg-noise">
      <CardHeader>
        <CardTitle className="text-primary text-lg font-normal">
          <span className="text-secondary text-lg ml-2">
            {t("translations.total_keys", { total: totalKeys })}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="mt-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={translatedData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            <XAxis
              dataKey="month"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickMargin={15}
              tick={{
                fill: "#878787",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
            />
            <YAxis
              stroke="#888888"
              tickFormatter={(value) => `${value}`}
              fontSize={12}
              tickMargin={10}
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "#878787",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
            />
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stoke-[#DCDAD2] dark:stroke-[#2C2C2C]"
            />

            <Bar
              dataKey="count"
              fill="var(--color-value)"
              barSize={36}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function AnalyticsChartSkeleton() {
  return (
    <Card className="w-full border-none bg-noise">
      <CardHeader>
        <Skeleton className="h-[22px] mt-1.5 w-48" />
      </CardHeader>

      <CardContent className="mt-4">
        <div className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}
