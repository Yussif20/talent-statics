"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Activity, Users, TrendingUp, BarChart3, Sparkles } from "lucide-react";
import type { StatisticsResponse } from "@/types/statistics";
import { fetchStatistics } from "@/lib/api";
import LoadingState from "@/components/statistics/LoadingState";
import ErrorState from "@/components/statistics/ErrorState";
import StatsCard from "@/components/statistics/StatsCard";
import ExportButton from "@/components/statistics/ExportButton";
import DateRangeFilter from "@/components/statistics/DateRangeFilter";
import GeneralStats from "@/components/statistics/GeneralStats";
import CategoryDistribution from "@/components/statistics/CategoryDistribution";
import DisabilityBreakdown from "@/components/statistics/DisabilityBreakdown";
import DualExceptionalDisabilities from "@/components/statistics/DualExceptionalDisabilities";
import DemographicsCharts from "@/components/statistics/DemographicsCharts";
import AgeDistribution from "@/components/statistics/AgeDistribution";
import SatisfactionChart from "@/components/statistics/SatisfactionChart";

export default function StatisticsPage() {
  const locale = useLocale();
  const t = useTranslations("Statistics");

  const [data, setData] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);

  const fetchData = async (startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchStatistics(startDate, endDate);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (startDate: string, endDate: string) => {
    setDateFilter({ startDate, endDate });
    fetchData(startDate, endDate);
  };

  const handleClearFilter = () => {
    setDateFilter(null);
    fetchData();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={() => fetchData()} />;
  if (!data) return null;

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-purple-200/30 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100/80 dark:bg-blue-900/40 backdrop-blur-sm text-blue-800 dark:text-blue-200 text-sm font-medium mb-6 border border-blue-200/50 dark:border-blue-700/50">
            <BarChart3 className="w-4 h-4 mr-2" />
            {t("sections.overview")}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
              {t("pageTitle")}
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
            {t("pageSubtitle")}
          </p>

          <ExportButton
            startDate={dateFilter?.startDate}
            endDate={dateFilter?.endDate}
          />
        </div>

        {/* Date Range Filter */}
        <DateRangeFilter
          onFilterChange={handleFilterChange}
          onClear={handleClearFilter}
          isActive={!!dateFilter}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
          <StatsCard
            title={t("kpis.totalParticipants")}
            value={data.general.totalParticipants.toLocaleString(locale)}
            icon={<Users className="w-6 h-6" />}
            gradient="from-blue-500 to-blue-600"
          />
          <StatsCard
            title={t("kpis.percentageDisabled")}
            value={`${data.kpis.percentageDisabled.toFixed(1)}%`}
            icon={<Activity className="w-6 h-6" />}
            gradient="from-purple-500 to-purple-600"
          />
          <StatsCard
            title={t("kpis.percentageDualExceptional")}
            value={`${data.kpis.percentageDualExceptional.toFixed(1)}%`}
            icon={<Sparkles className="w-6 h-6" />}
            gradient="from-green-500 to-emerald-600"
          />
          <StatsCard
            title={t("kpis.averageTalent")}
            value={`${data.kpis.averageTalentPercent.toFixed(1)}%`}
            icon={<TrendingUp className="w-6 h-6" />}
            gradient="from-orange-500 to-red-500"
          />
          <StatsCard
            title={t("kpis.averageDisability")}
            value={`${data.kpis.averageDisabilityPercent.toFixed(1)}%`}
            icon={<Activity className="w-6 h-6" />}
            gradient="from-pink-500 to-rose-600"
          />
        </div>

        {/* Charts Section */}
        <div className="space-y-8">
          {/* General Stats and Satisfaction */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GeneralStats data={data} />
            <SatisfactionChart data={data} />
          </div>

          {/* Category Distribution - Full Width */}
          <CategoryDistribution data={data} />

          {/* Disability Breakdowns - Full Width */}
          <DisabilityBreakdown data={data} />
          <DualExceptionalDisabilities data={data} />

          {/* Demographics and Age Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DemographicsCharts data={data} />
            <AgeDistribution data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
