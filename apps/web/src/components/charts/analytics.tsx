"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePeriod } from "@/hooks/use-period";
import { trpc } from "@/trpc/client";
import NumberFlow from "@number-flow/react";
import { endOfWeek, format, parseISO, startOfWeek } from "date-fns";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PeriodSelector } from "../period-selector";

const chartConfig = {
  value: {
    color: "#646464",
  },
  value2: {
    color: "#424242",
  },
} satisfies ChartConfig;

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    payload: {
      label: string;
    };
  }>;
}

function TooltipContent({ active, payload }: CustomTooltipProps) {
  const t = useTranslations("analytics");

  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1D1D1D]">
        <div className="border-b-[1px] border-background p-2 uppercase font-medium">
          <span>{payload[0]?.payload?.label}</span>
        </div>

        <div className="flex flex-col gap-2 p-2">
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ background: "var(--color-value)" }}
            />
            <span>
              {payload[0].value} {t("key")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ background: "var(--color-value2)" }}
            />
            <span>
              {payload[1].value} {t("document")}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function AnalyticsChart() {
  const t = useTranslations("analytics");
  const { organization, project } = useParams();
  const { period: periodValue } = usePeriod();
  const isMobile = useMediaQuery("(max-width: 768px)");

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

  const displayData = isMobile
    ? translatedData.slice(Math.floor((translatedData.length * 2) / 3))
    : translatedData;

  const maxValue = Math.max(
    ...displayData.map((item) => item.keyCount + item.documentCount),
  );

  const yAxisWidth = Math.max(
    String(maxValue).length * 8, // 8px per character at fontSize 12
    30,
  );

  return (
    <Card className="w-full border-none bg-noise">
      <CardHeader className="flex justify-between flex-row">
        <div className="text-primary text-lg font-normal flex flex-col">
          <span className="text-muted-foreground">{t("header")}</span>
          <div className="flex gap-4">
            <span className="text-primary text-2xl mt-2">
              <NumberFlow value={totalKeys} />
            </span>
          </div>
        </div>

        <div>
          <PeriodSelector />
        </div>
      </CardHeader>
      <CardContent className="mt-4 max-w-[calc(100vw)] md:max-w-full">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={displayData}>
            <ChartTooltip cursor={false} content={<TooltipContent />} />

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
              width={yAxisWidth}
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
              strokeDasharray="4 4"
              vertical={false}
              className="stoke-[#2C2C2C] dark:stroke-[#4f4e4e]"
            />

            <Bar
              dataKey="keyCount"
              name="Keys"
              fill="var(--color-value)"
              barSize={36}
              stackId="a"
            />

            <Bar
              dataKey="documentCount"
              name="Documents"
              fill="var(--color-value2)"
              barSize={36}
              stackId="a"
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
