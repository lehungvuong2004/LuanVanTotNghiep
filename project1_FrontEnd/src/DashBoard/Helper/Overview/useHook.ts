import { useState, useEffect, useMemo } from "react";
import { getHelperDashboardStats } from "../../../api/helpers";
import { getRootFontSizePx } from "../../../utils";

export interface HelperOverviewData {
  earnings: {
    total_income: number;
    booking_income: number;
    job_post_income: number;
    monthly_income: Record<string, number>;
  };
  jobs: {
    completed_jobs: number;
    in_progress_jobs: number;
    waiting_confirmation_jobs: number;
    acceptance_rate: number;
    cancel_rate: number;
  };
  reviews: {
    rating_avg: number;
    total_reviews: number;
    recent_reviews: Array<{
      id: number;
      rating: number;
      comment: string;
      created_at: string;
      customer?: {
        id: number;
        full_name: string;
        avatar?: string;
        phone?: string;
      };
    }>;
  };
  operations: {
    availabilities_this_week: number;
    active_working_areas: number;
    verification_status: string;
  };
}

export const useHelperOverview = () => {
  const [data, setData] = useState<HelperOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getHelperDashboardStats();
        setData(res);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Không thể tải dữ liệu thống kê bảng điều khiển.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const rem = getRootFontSizePx();

  // Monthly income chart (Bar/Line)
  const barOption = useMemo(() => {
    if (!data) return {};
    // Generate last 12 months array ending at the current month
    const monthlyMonths = [];
    const monthlyValues = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const monthKey = `${year}-${month}`;
      monthlyMonths.push(monthKey);

      // If the backend has value for this month, use it, otherwise default to 0.
      const val = data.earnings.monthly_income?.[monthKey] || 0;
      monthlyValues.push(val);
    }

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          lineStyle: {
            color: "#cbd5e1",
            width: 1,
            type: "dashed",
          },
        },
        formatter: (params: any) => {
          const item = params[0];
          const val = Number(item.value).toLocaleString("vi-VN") + " ₫";
          return `<div class="font-sans text-base p-1.5">
            <span class="text-slate-400 block mb-0.5">${item.name}</span>
            <span class="text-blue-600 font-bold text-lg">${val}</span>
          </div>`;
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "8%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: monthlyMonths.length > 0 ? monthlyMonths : ["Chưa có dữ liệu"],
        axisLabel: {
          fontSize: 1.0 * rem,
          color: "#64748b",
          margin: 0.75 * rem,
        },
        axisLine: { lineStyle: { color: "#e2e8f0" } },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          fontSize: 1.0 * rem,
          color: "#64748b",
          margin: 0.75 * rem,
          formatter: (val: number) => {
            if (val >= 1000000) return (val / 1000000).toFixed(1) + "M ₫";
            if (val >= 1000) return (val / 1000).toFixed(0) + "k ₫";
            return val + " ₫";
          },
        },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: [
        {
          name: "Doanh thu",
          type: "line",
          smooth: true,
          showSymbol: true,
          symbolSize: 8,
          data: monthlyValues.length > 0 ? monthlyValues : [0],
          lineStyle: {
            color: "#3b82f6",
            width: 3,
          },
          itemStyle: {
            color: "#3b82f6",
            borderWidth: 2,
            borderColor: "#fff",
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(59, 130, 246, 0.25)" },
                { offset: 1, color: "rgba(59, 130, 246, 0.00)" },
              ],
            },
          },
        },
      ],
    };
  }, [data, rem]);

  // Income sources pie chart option
  const pieOption = useMemo(() => {
    if (!data) return {};

    return {
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          const val = Number(params.value).toLocaleString("vi-VN") + " ₫";
          return `<div class="font-sans text-base">
            <span class="font-bold block">${params.name}</span>
            <span class="text-blue-500 font-semibold">${val} (${params.percent}%)</span>
          </div>`;
        },
      },
      legend: {
        bottom: "0%",
        left: "center",
        icon: "circle",
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          fontSize: 1.05 * rem,
          color: "#64748b",
        },
      },
      series: [
        {
          name: "Nguồn thu nhập",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: false,
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: data.earnings.booking_income, name: "Đặt lịch trực tiếp", itemStyle: { color: "#10b981" } },
            { value: data.earnings.job_post_income, name: "Bảng việc làm", itemStyle: { color: "#8b5cf6" } },
          ],
        },
      ],
    };
  }, [data, rem]);

  return {
    data,
    loading,
    error,
    barOption,
    pieOption,
  };
};
