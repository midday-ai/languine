"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

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
    <Card className="w-full">
      {/* <CardHeader>
        <CardTitle className="text-gray-400 text-sm font-normal">
          € 24,345.50
          <span className="ml-2 text-xs">April 28, 2024</span>
        </CardTitle>
      </CardHeader> */}
      <CardContent>
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
            <BarChart data={chartData} barGap={30}>
              <XAxis
                dataKey="month"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Bar
                dataKey="value"
                fill="var(--color-value)"
                radius={[4, 4, 0, 0]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
