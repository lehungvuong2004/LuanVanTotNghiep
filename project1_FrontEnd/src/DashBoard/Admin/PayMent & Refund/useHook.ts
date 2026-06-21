import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { Payment, Refund } from "../../../api/payments";
import {
  getPaymentsAdmin,
  updatePaymentStatusAdmin,
  getRefundsAdmin,
  processRefundAdmin,
} from "../../../api/payments";

export const usePaymentsRefunds = (defaultTab: "payments" | "refunds") => {
  const [activeTab, setActiveTab] = useState<"payments" | "refunds">(defaultTab);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination and filter states
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");

  const [refundsPage, setRefundsPage] = useState(1);
  const [refundsTotal, setRefundsTotal] = useState(0);
  const [refundStatusFilter, setRefundStatusFilter] = useState("All");

  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  // Toast state
  const [toast, setToast] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  } | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = useCallback((
    type: "success" | "error" | "warning" | "info",
    title: string,
    message?: string
  ) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ type, title, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = paymentStatusFilter !== "All" ? paymentStatusFilter.toLowerCase() : undefined;

      const response = await getPaymentsAdmin({
        page: paymentsPage,
        limit: itemsPerPage,
        status: statusParam,
      });

      setPayments(response.data.data);
      setPaymentsTotal(response.data.total);
    } catch (error: any) {
      showToast("error", "Error", error.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [paymentsPage, paymentStatusFilter, itemsPerPage, showToast]);

  // Fetch refunds
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
      showToast("error", "Error", error.response?.data?.message || "Failed to load refunds");
    } finally {
      setLoading(false);
    }
  }, [refundsPage, refundStatusFilter, itemsPerPage, showToast]);

  // Sync tab status query
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Load data based on tab selection
  useEffect(() => {
    if (activeTab === "payments") {
      fetchPayments();
    } else {
      fetchRefunds();
    }
  }, [activeTab, fetchPayments, fetchRefunds]);

  // Update payment status
  const handleUpdatePaymentStatus = async (
    id: number,
    status: "pending" | "completed" | "failed" | "refunded"
  ) => {
    try {
      await updatePaymentStatusAdmin(id, status);
      showToast("success", "Success", `Payment status updated to ${status}`);
      fetchPayments();
    } catch (error: any) {
      showToast("error", "Error", error.response?.data?.message || "Failed to update payment status");
    }
  };

  // Process refund status
  const handleProcessRefund = async (
    id: number,
    status: "approved" | "rejected" | "completed"
  ) => {
    try {
      await processRefundAdmin(id, status);
      showToast("success", "Success", `Refund status updated to ${status}`);
      fetchRefunds();
    } catch (error: any) {
      showToast("error", "Error", error.response?.data?.message || "Failed to process refund");
    }
  };

  // Client-side search filtration
  const displayedPayments = useMemo(() => {
    return payments.filter((p) => {
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      return (
        (p.transaction_code || "").toLowerCase().includes(term) ||
        String(p.booking_id || "").includes(term) ||
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

  // Metrics for Dashboard cards (Dynamic based on loaded list or static overview counts)
  const metrics = useMemo(() => {
    const totalPaymentsAmount = payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const pendingRefundsCount = refunds.filter((r) => r.status === "pending").length;
    const completedRefundsAmount = refunds
      .filter((r) => r.status === "completed")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);

    return {
      totalPaymentsAmount,
      pendingRefundsCount,
      completedRefundsAmount,
    };
  }, [payments, refunds]);

  // ECharts Configurations
  const revenueChartOption = useMemo(() => {
    // Group completed payments by creation date
    const dateGroups: { [key: string]: number } = {};
    payments.forEach((p) => {
      if (p.status === "completed" && p.created_at) {
        const date = p.created_at.split("T")[0]; // YYYY-MM-DD
        dateGroups[date] = (dateGroups[date] || 0) + Number(p.amount || 0);
      }
    });

    const dates = Object.keys(dateGroups).sort();
    const revenues = dates.map((d) => dateGroups[d]);

    // Fallback if no data exists
    const chartDates = dates.length ? dates : ["No Data"];
    const chartRevenues = revenues.length ? revenues : [0];

    return {
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const val = params[0].value;
          return `${params[0].name}: <b style="color:#2563eb">${Number(val).toLocaleString("vi-VN")} ₫</b>`;
        },
      },
      grid: {
        top: 25,
        bottom: 25,
        left: 55,
        right: 15,
      },
      xAxis: {
        type: "category",
        data: chartDates,
        axisLine: { lineStyle: { color: "#94a3b8" } },
        axisLabel: { color: "#64748b", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "#64748b",
          fontSize: 10,
          formatter: (value: number) => {
            if (value >= 1000000) return `${value / 1000000}M ₫`;
            if (value >= 1000) return `${value / 1000}k ₫`;
            return `${value} ₫`;
          },
        },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: [
        {
          data: chartRevenues,
          type: "line",
          smooth: true,
          symbolSize: 8,
          itemStyle: { color: "#2563eb" },
          lineStyle: { width: 3 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(37, 99, 235, 0.25)" },
                { offset: 1, color: "rgba(37, 99, 235, 0.0)" },
              ],
            },
          },
        },
      ],
    };
  }, [payments]);

  const statusDistributionOption = useMemo(() => {
    // Count payment statuses
    const statusCounts: { [key: string]: number } = {};
    payments.forEach((p) => {
      if (p.status) {
        const status = p.status.toUpperCase();
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      }
    });

    const data = Object.keys(statusCounts).map((k) => ({
      name: k,
      value: statusCounts[k],
    }));

    const chartData = data.length ? data : [{ name: "No Data", value: 0 }];

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: <b>{c} transactions</b> ({d}%)",
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: true,
            position: "outside",
            formatter: "{b}: {d}%",
            color: "#64748b",
            fontSize: 10,
          },
          data: chartData,
          color: ["#2563eb", "#10b981", "#ef4444", "#64748b"],
        },
      ],
    };
  }, [payments]);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  return {
    activeTab,
    setActiveTab,
    loading,
    toast,
    setToast,
    searchQuery,
    setSearchQuery,
    
    // Payments
    payments: displayedPayments,
    paymentsPage,
    setPaymentsPage,
    paymentsTotal,
    paymentStatusFilter,
    setPaymentStatusFilter,
    handleUpdatePaymentStatus,

    // Refunds
    refunds: displayedRefunds,
    refundsPage,
    setRefundsPage,
    refundsTotal,
    refundStatusFilter,
    setRefundStatusFilter,
    handleProcessRefund,

    // Stats / ECharts
    metrics,
    revenueChartOption,
    statusDistributionOption,
    itemsPerPage,

    
  };
};
