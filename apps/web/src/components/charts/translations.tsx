"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  value: {
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const chartData = [
  { month: "Oct", value: 7000 },
  { month: "Nov", value: 7000 },
  { month: "Dec", value: 10000 },
  { month: "Jan", value: 7000 },
  { month: "Feb", value: 3000 },
  { month: "Mar", value: 10000 },
  { month: "Apr", value: 8000 },
  { month: "May", value: 2000 },
  { month: "Jun", value: 5000 },
  { month: "Jul", value: 5000 },
  { month: "Aug", value: 5000 },
  { month: "Oct", value: 5000 },
];

export function TranslationsChart() {
  return (
    <Card className="w-full border-none bg-noise">
      <CardHeader>
        <CardTitle className="text-primary text-lg font-normal">
          36541
          <span className="text-secondary text-lg ml-2">keys in total</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="mt-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
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

            <Bar dataKey="value" fill="var(--color-value)" barSize={36} />
            <ChartTooltip content={<ChartTooltipContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
