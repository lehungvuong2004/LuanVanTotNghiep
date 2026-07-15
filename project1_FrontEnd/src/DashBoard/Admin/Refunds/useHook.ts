import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "../../../contexts/ToastContext";
import type { Refund } from "../../../api/payments";
import {
  getRefundsAdmin,
  processRefundAdmin,
  getPaymentStatsAdmin
} from "../../../api/payments";

export const useRefundsHook = () => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const [liveStats, setLiveStats] = useState<{
    total_revenue: number;
    this_month_revenue: number;
    last_month_revenue: number;
    change_percent: number;
  } | null>(null);

  const [refundsPage, setRefundsPage] = useState(1);
  const [refundsTotal, setRefundsTotal] = useState(0);
  const [refundStatusFilter, setRefundStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  const { showToast } = useToast();

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

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = refundStatusFilter !== "All" ? refundStatusFilter.toLowerCase() : undefined;

      const response = await getRefundsAdmin({
        page: refundsPage,
        limit: itemsPerPage,
        status: statusParam
      });

      setRefunds(response.data.data);
      setRefundsTotal(response.data.total);
    } catch (error: any) {
      showToast("error", "Lỗi", error.response?.data?.message || "Không thể tải danh sách hoàn tiền.");
    } finally {
      setLoading(false);
    }
  }, [refundsPage, refundStatusFilter, itemsPerPage, showToast]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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

  const computedMetrics = useMemo(() => {
    const pendingRefundsCount = refunds.filter((r) => r.status === "pending").length;
    const completedRefundsAmount = refunds
      .filter((r) => r.status === "completed")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
    return { pendingRefundsCount, completedRefundsAmount };
  }, [refunds]);

  return {
    loading,
    statsLoading,
    searchQuery,
    setSearchQuery,
    liveStats,
    refunds: displayedRefunds,
    refundsPage,
    setRefundsPage,
    refundsTotal,
    refundStatusFilter,
    setRefundStatusFilter,
    handleProcessRefund,
    computedMetrics,
    itemsPerPage
  };
};
