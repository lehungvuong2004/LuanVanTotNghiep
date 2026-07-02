import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { Payment, Refund } from "../../../api/payments";
import {
  getPaymentsAdmin,
  updatePaymentStatusAdmin,
  getRefundsAdmin,
  processRefundAdmin,
  getPaymentStatsAdmin,
} from "../../../api/payments";

// ─────────────────────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────────────────────

export const PAYMENT_METHODS_LABELS: Record<string, string> = {
  cash:          "Tiền mặt",
  vnpay:         "VNPay",
};

export const PAYMENT_METHODS_ICONS: Record<string, string> = {
  cash:          "material-symbols:payments-outline",
  vnpay:         "material-symbols:credit-score-outline",
};

// ─────────────────────────────────────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────────────────────────────────────

export const usePaymentsRefunds = (defaultTab: "payments" | "refunds") => {
  const [activeTab, setActiveTab] = useState<"payments" | "refunds">(defaultTab);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Real stats from payment-service ──────────────────────────────────────
  const [liveStats, setLiveStats] = useState<{
    total_revenue: number;
    this_month_revenue: number;
    last_month_revenue: number;
    change_percent: number;
  } | null>(null);

  // ── Pagination + filters ──────────────────────────────────────────────────
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");

  const [refundsPage, setRefundsPage] = useState(1);
  const [refundsTotal, setRefundsTotal] = useState(0);
  const [refundStatusFilter, setRefundStatusFilter] = useState("All");

  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((
    type: "success" | "error" | "warning" | "info",
    title: string,
    message?: string
  ) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ type, title, message });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Fetch real stats from GET /payments/admin/stats ────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getPaymentStatsAdmin();
      setLiveStats(res.data);
    } catch {
      // silently fallback — computed metrics will still show
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch payments ────────────────────────────────────────────────────────
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

  // ── Fetch refunds ─────────────────────────────────────────────────────────
  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = refundStatusFilter !== "All" ? refundStatusFilter.toLowerCase() : undefined;

      const response = await getRefundsAdmin({
        page: refundsPage,
        limit: itemsPerPage,
        status: statusParam,
      });

      setRefunds(response.data.data);
      setRefundsTotal(response.data.total);
    } catch (error: any) {
      showToast("error", "Lỗi", error.response?.data?.message || "Không thể tải danh sách hoàn tiền.");
    } finally {
      setLoading(false);
    }
  }, [refundsPage, refundStatusFilter, itemsPerPage, showToast]);

  // ── Sync tab ──────────────────────────────────────────────────────────────
  useEffect(() => { setActiveTab(defaultTab); }, [defaultTab]);

  // ── Load on tab/filter change ──────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "payments") fetchPayments();
    else fetchRefunds();
  }, [activeTab, fetchPayments, fetchRefunds]);

  // ── Load real stats on mount ──────────────────────────────────────────────
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── Update payment status ─────────────────────────────────────────────────
  const handleUpdatePaymentStatus = async (
    id: number,
    status: "pending" | "completed" | "failed" | "refunded"
  ) => {
    try {
      await updatePaymentStatusAdmin(id, status);
      showToast("success", "Cập nhật thành công", `Trạng thái thanh toán đã chuyển thành ${status}`);
      fetchPayments();
      fetchStats(); // refresh revenue numbers
    } catch (error: any) {
      showToast("error", "Lỗi", error.response?.data?.message || "Không thể cập nhật trạng thái.");
    }
  };

  // ── Process refund ────────────────────────────────────────────────────────
  const handleProcessRefund = async (
    id: number,
    status: "approved" | "rejected" | "completed"
  ) => {
    try {
      await processRefundAdmin(id, status);
      showToast("success", "Xử lý thành công", `Trạng thái hoàn tiền đã chuyển thành ${status}`);
      fetchRefunds();
      fetchStats();
    } catch (error: any) {
      showToast("error", "Lỗi", error.response?.data?.message || "Không thể xử lý hoàn tiền.");
    }
  };

  // ── Client-side search ────────────────────────────────────────────────────
  const displayedPayments = useMemo(() => {
    return payments.filter((p) => {
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      return (
        (p.transaction_code || "").toLowerCase().includes(term) ||
        String(p.booking_id || "").includes(term) ||
        String(p.job_post_id || "").includes(term) ||
        String(p.id).includes(term)
      );
    });
  }, [payments, searchQuery]);

  const displayedRefunds = useMemo(() => {
    return refunds.filter((r) => {
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      return (
        String(r.id).includes(term) ||
        String(r.payment_id).includes(term) ||
        (r.reason || "").toLowerCase().includes(term)
      );
    });
  }, [refunds, searchQuery]);

  // ── Computed metrics (fallback if liveStats not loaded yet) ───────────────
  const computedMetrics = useMemo(() => {
    const pendingRefundsCount = refunds.filter((r) => r.status === "pending").length;
    const completedRefundsAmount = refunds
      .filter((r) => r.status === "completed")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
    return { pendingRefundsCount, completedRefundsAmount };
  }, [refunds]);

  // ── Revenue line chart ────────────────────────────────────────────────────
  const revenueChartOption = useMemo(() => {
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
        formatter: (params: any) =>
          `${params[0].name}: <b style="color:#0a9ea6">${Number(params[0].value).toLocaleString("vi-VN")} ₫</b>`,
      },
      grid: { top: 25, bottom: 25, left: 60, right: 15 },
      xAxis: {
        type: "category",
        data: dates.length ? dates : ["Chưa có dữ liệu"],
        axisLine: { lineStyle: { color: "#94a3b8" } },
        axisLabel: { color: "#64748b", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "#64748b",
          fontSize: 10,
          formatter: (v: number) =>
            v >= 1_000_000 ? `${v / 1_000_000}M ₫` : v >= 1_000 ? `${v / 1_000}k ₫` : `${v} ₫`,
        },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: [{
        data: revenues.length ? revenues : [0],
        type: "line",
        smooth: true,
        symbolSize: 7,
        itemStyle: { color: "#0a9ea6" },
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: "linear", x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(10,158,166,0.25)" },
              { offset: 1, color: "rgba(10,158,166,0)" },
            ],
          },
        },
      }],
    };
  }, [payments]);

  // ── Payment status distribution chart ────────────────────────────────────
  const statusDistributionOption = useMemo(() => {
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
      series: [{
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 2 },
        label: { show: true, position: "outside", formatter: "{b}: {d}%", color: "#64748b", fontSize: 10 },
        data: data.length ? data : [{ name: "Chưa có dữ liệu", value: 0 }],
        color: ["#f59e0b", "#10b981", "#ef4444", "#8b5cf6"],
      }],
    };
  }, [payments]);

  // ── Payment method distribution chart ────────────────────────────────────
  const methodDistributionOption = useMemo(() => {
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
      series: [{
        type: "pie",
        radius: ["35%", "65%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 2 },
        label: { show: true, formatter: "{b}: {d}%", color: "#64748b", fontSize: 10 },
        data: data.length ? data : [{ name: "Chưa có dữ liệu", value: 0 }],
        color: ["#0ea5e9", "#f472b6", "#a78bfa", "#34d399", "#fb923c"],
      }],
    };
  }, [payments]);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => { if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current); };
  }, []);

  return {
    activeTab, setActiveTab,
    loading, statsLoading,
    toast, setToast,
    searchQuery, setSearchQuery,

    // Live stats
    liveStats,

    // Payments
    payments: displayedPayments,
    paymentsPage, setPaymentsPage,
    paymentsTotal,
    paymentStatusFilter, setPaymentStatusFilter,
    paymentMethodFilter, setPaymentMethodFilter,
    handleUpdatePaymentStatus,

    // Refunds
    refunds: displayedRefunds,
    refundsPage, setRefundsPage,
    refundsTotal,
    refundStatusFilter, setRefundStatusFilter,
    handleProcessRefund,

    // Charts
    computedMetrics,
    revenueChartOption,
    statusDistributionOption,
    methodDistributionOption,
    itemsPerPage,
  };
};
