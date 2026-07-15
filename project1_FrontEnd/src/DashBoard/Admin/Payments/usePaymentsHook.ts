import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "../../../contexts/ToastContext";
import type { Payment } from "../../../api/payments";
import { getPaymentsAdmin, updatePaymentStatusAdmin, getPaymentStatsAdmin } from "../../../api/payments";
import { getRootFontSizePx } from "../../../utils";

export const PAYMENT_METHODS_LABELS: Record<string, string> = {
  cash: "Tiền mặt",
  vnpay: "VNPay",
};

export const PAYMENT_METHODS_ICONS: Record<string, string> = {
  cash: "material-symbols:payments-outline",
  vnpay: "material-symbols:credit-score-outline",
};

export const usePaymentsHook = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  const { showToast } = useToast();

  const [liveStats, setLiveStats] = useState<{
    total_revenue: number;
    this_month_revenue: number;
    last_month_revenue: number;
    change_percent: number;
  } | null>(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getPaymentStatsAdmin();
      setLiveStats(res.data);
    } catch {
      // silently fallback
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = paymentStatusFilter !== "All" ? paymentStatusFilter.toLowerCase() : undefined;
      const methodParam = paymentMethodFilter !== "All" ? paymentMethodFilter : undefined;

      const response = await getPaymentsAdmin({
        page: paymentsPage,
        limit: itemsPerPage,
        status: statusParam,
        payment_method: methodParam,
      });

      setPayments(response.data.data);
      setPaymentsTotal(response.data.total);
    } catch (error: any) {
      showToast("error", "Lỗi", error.response?.data?.message || "Không thể tải danh sách thanh toán.");
    } finally {
      setLoading(false);
    }
  }, [paymentsPage, paymentStatusFilter, paymentMethodFilter, itemsPerPage, showToast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleUpdatePaymentStatus = async (id: number, status: "pending" | "completed" | "failed" | "refunded") => {
    try {
      await updatePaymentStatusAdmin(id, status);
      showToast("success", "Cập nhật thành công", `Trạng thái thanh toán đã chuyển thành ${status}`);
      fetchPayments();
      fetchStats();
    } catch (error: any) {
      showToast("error", "Lỗi", error.response?.data?.message || "Không thể cập nhật trạng thái.");
    }
  };

  const displayedPayments = useMemo(() => {
    return payments.filter((p) => {
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      return (p.transaction_code || "").toLowerCase().includes(term) || String(p.booking_id || "").includes(term) || String(p.job_post_id || "").includes(term) || String(p.id).includes(term);
    });
  }, [payments, searchQuery]);

  const revenueChartOption = useMemo(() => {
    const rem = getRootFontSizePx();
    const dateGroups: Record<string, number> = {};
    payments.forEach((p) => {
      if (p.status === "completed" && p.created_at) {
        const date = p.created_at.split("T")[0];
        dateGroups[date] = (dateGroups[date] || 0) + Number(p.amount || 0);
      }
    });

    const dates = Object.keys(dateGroups).sort();
    const revenues = dates.map((d) => dateGroups[d]);

    return {
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => `${params[0].name}: <b style="color:#0a9ea6">${Number(params[0].value).toLocaleString("vi-VN")} ₫</b>`,
      },
      grid: { top: 1.5 * rem, bottom: 1.5 * rem, left: 3.75 * rem, right: 1 * rem },
      xAxis: {
        type: "category",
        data: dates.length ? dates : ["Chưa có dữ liệu"],
        axisLine: { lineStyle: { color: "#94a3b8" } },
        axisLabel: { color: "#64748b", fontSize: 0.625 * rem },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "#64748b",
          fontSize: 0.625 * rem,
          formatter: (v: number) => (v >= 1_000_000 ? `${v / 1_000_000}M ₫` : v >= 1_000 ? `${v / 1_000}k ₫` : `${v} ₫`),
        },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: [
        {
          data: revenues.length ? revenues : [0],
          type: "line",
          smooth: true,
          symbolSize: 0.4375 * rem,
          itemStyle: { color: "#0a9ea6" },
          lineStyle: { width: 0.1875 * rem },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(10,158,166,0.25)" },
                { offset: 1, color: "rgba(10,158,166,0)" },
              ],
            },
          },
        },
      ],
    };
  }, [payments]);

  const statusDistributionOption = useMemo(() => {
    const rem = getRootFontSizePx();
    const counts: Record<string, number> = {};
    payments.forEach((p) => {
      if (p.status) counts[p.status] = (counts[p.status] || 0) + 1;
    });

    const data = Object.keys(counts).map((k) => ({
      name: k.charAt(0).toUpperCase() + k.slice(1),
      value: counts[k],
    }));

    return {
      tooltip: { trigger: "item", formatter: "{b}: <b>{c} giao dịch</b> ({d}%)" },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 0.5 * rem, borderColor: "#fff", borderWidth: 0.125 * rem },
          label: { show: true, position: "outside", formatter: "{b}: {d}%", color: "#64748b", fontSize: 0.625 * rem },
          data: data.length ? data : [{ name: "Chưa có dữ liệu", value: 0 }],
          color: ["#f59e0b", "#10b981", "#ef4444", "#8b5cf6"],
        },
      ],
    };
  }, [payments]);

  const methodDistributionOption = useMemo(() => {
    const rem = getRootFontSizePx();
    const counts: Record<string, number> = {};
    payments.forEach((p) => {
      if (p.payment_method) {
        const label = PAYMENT_METHODS_LABELS[p.payment_method] || p.payment_method;
        counts[label] = (counts[label] || 0) + 1;
      }
    });

    const data = Object.keys(counts).map((k) => ({ name: k, value: counts[k] }));

    return {
      tooltip: { trigger: "item", formatter: "{b}: <b>{c} giao dịch</b> ({d}%)" },
      series: [
        {
          type: "pie",
          radius: ["35%", "65%"],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 0.5 * rem, borderColor: "#fff", borderWidth: 0.125 * rem },
          label: { show: true, formatter: "{b}: {d}%", color: "#64748b", fontSize: 0.625 * rem },
          data: data.length ? data : [{ name: "Chưa có dữ liệu", value: 0 }],
          color: ["#0ea5e9", "#f472b6", "#a78bfa", "#34d399", "#fb923c"],
        },
      ],
    };
  }, [payments]);

  return {
    loading,
    statsLoading,
    searchQuery,
    setSearchQuery,
    liveStats,
    payments: displayedPayments,
    paymentsPage,
    setPaymentsPage,
    paymentsTotal,
    paymentStatusFilter,
    setPaymentStatusFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    handleUpdatePaymentStatus,
    revenueChartOption,
    statusDistributionOption,
    methodDistributionOption,
    itemsPerPage,
  };
};
