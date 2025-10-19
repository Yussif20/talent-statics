"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { StatisticsResponse } from "@/types/statistics";
import { getChartColors, getTooltipStyle } from "@/lib/chartConfig";

interface CategoryDistributionProps {
  data: StatisticsResponse;
}

export default function CategoryDistribution({
  data,
}: CategoryDistributionProps) {
  const t = useTranslations("Statistics");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    setIsDark(document.documentElement.classList.contains("dark"));

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setIsDark(document.documentElement.classList.contains("dark"));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const colors = getChartColors(isDark);

  const categoryData = [
    {
      name: t("categories.disabledOnly"),
      value: data.talentDisability.categories.disabledOnly,
      color: colors.danger,
    },
    {
      name: t("categories.talentedOnly"),
      value: data.talentDisability.categories.talentedOnly,
      color: colors.success,
    },
    {
      name: t("categories.dualExceptional"),
      value: data.talentDisability.categories.dualExceptional,
      color: colors.primary,
    },
    {
      name: t("categories.neither"),
      value: data.talentDisability.categories.neither,
      color: colors.text,
    },
  ];

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        {t("sections.categories")}
      </h3>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={categoryData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.grid}
            opacity={0.2}
          />
          <XAxis
            dataKey="name"
            stroke={colors.text}
            tick={{ fill: colors.text, fontSize: 12 }}
            angle={-15}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke={colors.text} tick={{ fill: colors.text }} />
          <Tooltip contentStyle={getTooltipStyle(isDark)} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {categoryData.map((entry, index) => (
              <Bar key={`bar-${index}`} dataKey="value" fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {categoryData.map((category, index) => (
          <div
            key={index}
            className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
          >
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {category.value}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {category.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
