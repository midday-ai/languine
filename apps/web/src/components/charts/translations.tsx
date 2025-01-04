"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

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
    <Card className="w-full border-none">
      <CardHeader>
        <CardTitle className="text-primary text-lg font-normal">
          36541
          <span className="text-secondary text-lg ml-2">keys in total</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="mt-4">
        <ChartContainer
          config={{
            value: {
              label: "Value",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="month"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickMargin={15}
                tick={{
                  fill: "#606060",
                  fontSize: 12,
                  fontFamily: "var(--font-sans)",
                }}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                stroke="#888888"
                fontSize={12}
                tickMargin={10}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "#606060",
                  fontSize: 12,
                  fontFamily: "var(--font-sans)",
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
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
