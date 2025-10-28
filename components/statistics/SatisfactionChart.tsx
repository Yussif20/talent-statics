"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieLabelRenderProps,
} from "recharts";
import { getChartColors, getTooltipStyle } from "@/lib/chartConfig";
import { StatisticsResponse } from "@/types/statistics";

interface SatisfactionChartProps {
  data: StatisticsResponse;
}

export default function SatisfactionChart({ data }: SatisfactionChartProps) {
  const t = useTranslations("Statistics");
  const locale = useLocale();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Process satisfaction distribution data
  const chartData = Object.entries(data.satisfaction.satisfactionDistribution)
    .map(([score, count]) => {
      const satisfactionScore = parseFloat(score);
      // Consider scores > 0.5 as satisfied
      const isSatisfied = satisfactionScore > 0.5;
      return {
        name: isSatisfied ? t("satisfied") : t("notSatisfied"),
        value: count,
        isSatisfied,
      };
    })
    .reduce((acc: Array<{ name: string; value: number }>, curr) => {
      const existing = acc.find((item) => item.name === curr.name);
      if (existing) {
        existing.value += curr.value;
      } else {
        acc.push({ name: curr.name, value: curr.value });
      }
      return acc;
    }, []);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const chartDataWithPercentage = chartData.map((item) => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1),
  }));

  const colors = getChartColors(isDark);

  const renderCustomLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

    if (
      typeof cx !== "number" ||
      typeof cy !== "number" ||
      typeof midAngle !== "number" ||
      typeof innerRadius !== "number" ||
      typeof outerRadius !== "number" ||
      typeof percent !== "number"
    ) {
      return null;
    }

    const radius =
      innerRadius + (outerRadius - innerRadius) * (locale === "ar" ? 0.7 : 0.1);
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="rounded-2xl bg-white/80 dark:bg-gray-800/80 p-6 shadow-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300">
      <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
        {t("sections.satisfaction")}
      </h3>
      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartDataWithPercentage}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={110}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {chartDataWithPercentage.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.name === t("satisfied")
                      ? colors.success
                      : colors.danger
                  }
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={getTooltipStyle(isDark)}
              itemStyle={{ color: isDark ? "#f9fafb" : "#111827" }}
              labelStyle={{ color: isDark ? "#f9fafb" : "#111827" }}
              formatter={(value: number) => [value, t("chartLabels.count")]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("averageSatisfaction")}:{" "}
            <span className="font-semibold text-gray-800 dark:text-white">
              {data.satisfaction.averageSatisfaction.toFixed(1)}%
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
