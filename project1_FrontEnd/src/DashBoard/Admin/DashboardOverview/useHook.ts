import { useState, useEffect } from "react";
import { getRootFontSizePx } from "../../../utils";
import { QUALITATIVE_PALETTE, BLUE_PURPLE_07 } from "../../../constants/colors";
import { getDashboardOverview } from "../../../api/dashboard";
import type { KPICardData, BookingActivity, ServiceShare, RecentBooking } from "../../../api/dashboard";

export type { KPICardData, BookingActivity, RecentBooking };
export const useDashboardOverview = () => {
  const [kpis, setKpis] = useState<KPICardData[]>([]);
  const [weeklyBookings, setWeeklyBookings] = useState<BookingActivity[]>([]);
  const [serviceShares, setServiceShares] = useState<ServiceShare[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardOverview();

        const kpiMetaMap = {
          revenue: {
            title: "Tổng doanh thu",
            icon: "material-symbols:payments-outline-rounded",
            bgColor: "bg-blue-50 dark:bg-blue-950/30",
            textColor: "text-blue-600 dark:text-blue-400",
          },
          bookings: {
            title: "Tổng số đặt chỗ",
            icon: "material-symbols:event-available-outline-rounded",
            bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
            textColor: "text-emerald-600 dark:text-emerald-455",
          },
          helpers: {
            title: "Cộng tác viên hoạt động",
            icon: "material-symbols:group-outline-rounded",
            bgColor: "bg-amber-50 dark:bg-amber-950/30",
            textColor: "text-amber-600 dark:text-amber-400",
          },
          satisfaction: {
            title: "Mức độ hài lòng",
            icon: "material-symbols:rate-review-outline-rounded",
            bgColor: "bg-violet-50 dark:bg-violet-950/30",
            textColor: "text-violet-600 dark:text-violet-400",
          },
        };

        const dayMap = {
          2: "Thứ 2",
          3: "Thứ 3",
          4: "Thứ 4",
          5: "Thứ 5",
          6: "Thứ 6",
          7: "Thứ 7",
          1: "Chủ Nhật",
        };

        const payload = (data as any)?.data || data || {};
        const rawKpis = payload.kpis ?? [];
        const rawWeeklyBookings = payload.weeklyBookings ?? [];
        const rawServiceShares = payload.serviceShares ?? [];
        const rawRecentBookings = payload.recentBookings ?? [];

        const mappedKpis = rawKpis.map((kpi: any) => {
          const meta = kpiMetaMap[kpi.type] || {
            title: kpi.title || kpi.type || "KPI",
            icon: "material-symbols:analytics-outline",
            bgColor: "bg-slate-50 dark:bg-slate-900/30",
            textColor: "text-slate-600 dark:text-slate-400",
          };

          let changeFormatted = kpi.change;
          if (typeof kpi.change === "number") {
            const num = Number(kpi.change);
            const prefix = num >= 0 ? "+" : "";
            changeFormatted = `${prefix}${num.toFixed(1)}%`;
          }

          return {
            ...kpi,
            title: meta.title,
            icon: meta.icon,
            bgColor: meta.bgColor,
            textColor: meta.textColor,
            change: changeFormatted,
          };
        });

        const mappedWeeklyBookings = rawWeeklyBookings.map((item: any) => ({
          ...item,
          day: dayMap[item.day as keyof typeof dayMap] || `Thứ ${item.day}`,
        }));

        setKpis(mappedKpis);
        setWeeklyBookings(mappedWeeklyBookings);
        setServiceShares(rawServiceShares);
        setRecentBookings(rawRecentBookings);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Không thể tải dữ liệu tổng quan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Total Services Count (calculated for display on the top-right of pie chart)
  const totalServiceCount = serviceShares.length;
  const rem = getRootFontSizePx();

  // Weekly Bookings Bar Option
  const barOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "10%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: weeklyBookings.map((item) => item.day),
        axisTick: { alignWithLabel: true },
        axisLine: { lineStyle: { color: "#e2e8f0" } },
        axisLabel: { color: "#64748b", fontSize: 0.8125 * rem },
      },
    ],
    yAxis: [
      {
        type: "value",
        splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
        axisLine: { show: false },
        axisLabel: { color: "#64748b", fontSize: 0.8125 * rem },
      },
    ],
    series: [
      {
        name: "Đặt chỗ",
        type: "bar",
        barWidth: "50%",
        data: weeklyBookings.map((item, index) => ({
          value: item.count,
          itemStyle: {
            color: BLUE_PURPLE_07[index % BLUE_PURPLE_07.length],
          },
        })),
        itemStyle: {
          borderRadius: [0.25 * rem, 0.25 * rem, 0, 0],
        },
      },
    ],
  };

  // Service Shares Pie Option
  const pieOption = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      show: false,
    },
    series: [
      {
        name: "Tỷ trọng dịch vụ",
        type: "pie",
        radius: ["50%", "75%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 0.375 * rem,
          borderColor: "#fff",
          borderWidth: 0.125 * rem,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 1 * rem,
            fontWeight: "bold",
            formatter: "{b}\n{c}",
          },
        },
        labelLine: {
          show: false,
        },
        data: serviceShares.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: QUALITATIVE_PALETTE[index % QUALITATIVE_PALETTE.length] },
        })),
      },
    ],
  };

  return {
    kpis,
    recentBookings,
    totalServiceCount,
    barOption,
    pieOption,
    loading,
    error,
  };
};
