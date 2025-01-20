"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { usePeriod } from "@/hooks/use-period";
import { useI18n } from "@/locales/client";
import { trpc } from "@/trpc/client";
import NumberFlow from "@number-flow/react";
import { endOfWeek, format, parseISO, startOfWeek } from "date-fns";
import { useParams } from "next/navigation";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PeriodSelector } from "../period-selector";

const chartConfig = {
  value: {
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function AnalyticsChart() {
  const t = useI18n();
  const { organization, project } = useParams();
  const { period: periodValue } = usePeriod();

  const [{ data, totalKeys, period }] =
    trpc.analytics.getProjectStats.useSuspenseQuery({
      projectSlug: project as string,
      organizationId: organization as string,
      period: periodValue,
    });

  const translatedData = data.map((stat) => ({
    ...stat,
    label:
      period === "daily"
        ? format(parseISO(stat.label), "MMM d")
        : period === "weekly"
          ? `${format(startOfWeek(parseISO(stat.label)), "MMM d")} - ${format(
              endOfWeek(parseISO(stat.label)),
              "d",
              { weekStartsOn: 1 },
            )}`
          : // @ts-ignore
            t(`months.${stat.label.split("-")[1]}`),
  }));

  return (
    <Card className="w-full border-none bg-noise">
      <CardHeader className="flex justify-between flex-row">
        <div className="text-primary text-lg font-normal flex flex-col">
          <span className="text-muted-foreground">
            {t("translations.header")}
          </span>
          <span className="text-primary text-2xl mt-2">
            <NumberFlow value={totalKeys} />
          </span>
        </div>

        <div>
          <PeriodSelector />
        </div>
      </CardHeader>

      <CardContent className="mt-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={translatedData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            <XAxis
              dataKey="label"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickMargin={15}
              interval={0}
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
      <CardHeader className="flex justify-between flex-row">
        <div className="flex flex-col mb-[4px]">
          <Skeleton className="h-[20px] mt-2 w-48" />
          <Skeleton className="h-[24px] mt-4 w-32" />
        </div>

        <div>
          <PeriodSelector />
        </div>
      </CardHeader>

      <CardContent className="mt-4">
        <div className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}
