import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  type Payment,
  type Refund,
  type CreatePaymentPayload,
  type CreateRefundPayload,
  type CreateVnpayPayload,
  createPaymentApi,
  createVnpayUrlApi,
  getMyPaymentApi,
  getMyPaymentsApi,
  simulatePaymentCallbackApi,
  requestRefundApi,
  getMyPaymentRefundsApi,
} from "../../api/payments";
import type { ToastProps } from "../../types/Toast";

type ToastState = Omit<ToastProps, "onClose"> | null;

// ── Payment modal form state ──────────────────────────────
export interface PaymentFormState {
  booking_id: string;
  job_post_id: string;
  payment_method: string;
  amount: string;
}

const DEFAULT_FORM: PaymentFormState = {
  booking_id: "",
  job_post_id: "",
  payment_method: "cash",
  amount: "",
};

// ── Refund modal form state ──────────────────────────────
export interface RefundFormState {
  amount: string;
  reason: string;
}

const DEFAULT_REFUND_FORM: RefundFormState = { amount: "", reason: "" };

export const PAYMENT_METHODS = [
  { value: "cash", label: "Tiền mặt", icon: "material-symbols:payments-outline" },
  { value: "vnpay", label: "VNPay", icon: "simple-icons:vnpay" },
];

export const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "Chờ thanh toán", cls: "bg-amber-100   text-amber-700   dark:bg-amber-900/30   dark:text-amber-400" },
  completed: { label: "Hoàn thành", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  failed: { label: "Thất bại", cls: "bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400" },
  refunded: { label: "Đã hoàn tiền", cls: "bg-violet-100  text-violet-700  dark:bg-violet-900/30  dark:text-violet-400" },
};

export const REFUND_STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "Đang chờ", cls: "bg-amber-100   text-amber-700   dark:bg-amber-900/30   dark:text-amber-400" },
  approved: { label: "Đã duyệt", cls: "bg-sky-100     text-sky-700     dark:bg-sky-900/30     dark:text-sky-400" },
  rejected: { label: "Từ chối", cls: "bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400" },
  completed: { label: "Hoàn tất", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

export const usePayment = () => {
  // ── UI State ──────────────────────────────────────────────
  const [toast, setToast] = useState<ToastState>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [isVnpayLoading, setIsVnpayLoading] = useState(false);

  // ── Payment form ──────────────────────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<PaymentFormState>(DEFAULT_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const bookingId = searchParams.get("booking_id");
    const jobPostId = searchParams.get("job_post_id");
    const amount = searchParams.get("amount");
    if (bookingId || jobPostId) {
      setForm({
        booking_id: bookingId || "",
        job_post_id: jobPostId || "",
        payment_method: "vnpay",
        amount: amount || "",
      });
      setShowCreateModal(true);
    }
  }, [searchParams]);

  // ── Created / loaded payment ──────────────────────────────
  const [payment, setPayment] = useState<Payment | null>(null);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [lookupId, setLookupId] = useState("");
  const [isLooking, setIsLooking] = useState(false);

  // ── Customer's own payments list ──────────────────────────
  const [myPayments, setMyPayments] = useState<Payment[]>([]);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(false);

  const fetchMyPayments = useCallback(async (page: number = 1) => {
    setIsPaymentsLoading(true);
    try {
      const res = await getMyPaymentsApi({ page, limit: 5 });
      const paginator = res.data;
      setMyPayments(paginator.data || []);
      setPaymentsPage(paginator.current_page || 1);
      setTotalPayments(paginator.total || 0);
      setLastPage(paginator.last_page || 1);
    } catch (err) {
      console.error("Failed to load customer payments:", err);
    } finally {
      setIsPaymentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyPayments(paymentsPage);
  }, [paymentsPage, fetchMyPayments]);

  // ── Refund form ───────────────────────────────────────────
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundForm, setRefundForm] = useState<RefundFormState>(DEFAULT_REFUND_FORM);
  const [refundError, setRefundError] = useState<string | null>(null);

  // ── Helpers ───────────────────────────────────────────────
  const notify = (type: ToastProps["type"], title: string, message?: string) => setToast({ type, title, message });

  // ── Load payment by ID ────────────────────────────────────
  const loadPayment = useCallback(async (id: number) => {
    setIsLooking(true);
    try {
      const res = await getMyPaymentApi(id);
      setPayment(res.data);
      // also fetch refunds
      const refRes = await getMyPaymentRefundsApi(id);
      setRefunds(refRes.data);
    } catch {
      notify("error", "Không tìm thấy", "Mã thanh toán không tồn tại hoặc bạn không có quyền truy cập.");
      setPayment(null);
      setRefunds([]);
    } finally {
      setIsLooking(false);
    }
  }, []);

  const handleLookup = () => {
    const id = parseInt(lookupId);
    if (isNaN(id) || id <= 0) {
      notify("error", "ID không hợp lệ", "Vui lòng nhập mã thanh toán hợp lệ.");
      return;
    }
    loadPayment(id);
  };

  // ── Create payment ────────────────────────────────────────
  const handleCreateOpen = () => {
    setForm(DEFAULT_FORM);
    setFormError(null);
    setShowCreateModal(true);
  };

  const handleFormChange = (key: keyof PaymentFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  };

  const handleCreateSubmit = async () => {
    if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
      setFormError("Số tiền thanh toán phải lớn hơn 0.");
      return;
    }
    if (form.payment_method === "vnpay") {
      const amountVal = parseFloat(form.amount);
      if (amountVal < 10000) {
        setFormError("Số tiền thanh toán tối thiểu qua VNPay là 10.000 đ.");
        return;
      }
      if (amountVal > 1000000000) {
        setFormError("Số tiền thanh toán tối đa qua VNPay là 1.000.000.000 đ.");
        return;
      }
    }
    if (!form.booking_id && !form.job_post_id) {
      setFormError("Vui lòng nhập Mã đặt lịch hoặc Mã bài đăng tuyển.");
      return;
    }

    setIsCreating(true);
    try {
      const payload: CreatePaymentPayload = {
        payment_method: form.payment_method,
        amount: parseFloat(form.amount),
        booking_id: form.booking_id ? parseInt(form.booking_id) : null,
        job_post_id: form.job_post_id ? parseInt(form.job_post_id) : null,
      };

      // ── VNPay: redirect instead of creating locally ──────────────
      if (form.payment_method === "vnpay") {
        const vnpayPayload: CreateVnpayPayload = {
          amount: parseFloat(form.amount),
          booking_id: form.booking_id ? parseInt(form.booking_id) : null,
          job_post_id: form.job_post_id ? parseInt(form.job_post_id) : null,
        };
        setIsVnpayLoading(true);
        const res = await createVnpayUrlApi(vnpayPayload);
        setShowCreateModal(false);
        // Redirect to VNPay gateway
        window.location.href = res.payment_url;
        return;
      }

      const res = await createPaymentApi(payload);
      setPayment(res.data);
      setRefunds([]);
      setShowCreateModal(false);
      setLookupId(String(res.data.id));
      notify("success", "Tạo thành công", res.message);
      fetchMyPayments(1); // Refresh list
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Không thể tạo thanh toán. Vui lòng thử lại.");
    } finally {
      setIsCreating(false);
      setIsVnpayLoading(false);
    }
  };

  // ── Simulate payment ──────────────────────────────────────
  const handleSimulate = async () => {
    if (!payment) return;
    setIsSimulating(true);
    try {
      const res = await simulatePaymentCallbackApi(payment.id);
      setPayment(res.data);
      notify("success", "Thanh toán thành công", "Giao dịch đã được xác nhận.");
      fetchMyPayments(paymentsPage); // Refresh list
    } catch (err: any) {
      notify("error", "Thất bại", err.response?.data?.message || "Không thể xác nhận thanh toán.");
    } finally {
      setIsSimulating(false);
    }
  };

  // ── Request refund ────────────────────────────────────────
  const handleRefundOpen = () => {
    setRefundForm(DEFAULT_REFUND_FORM);
    setRefundError(null);
    setShowRefundModal(true);
  };

  const handleRefundChange = (key: keyof RefundFormState, value: string) => {
    setRefundForm((prev) => ({ ...prev, [key]: value }));
    setRefundError(null);
  };

  const handleRefundSubmit = async () => {
    if (!payment) return;
    const amt = parseFloat(refundForm.amount);
    if (isNaN(amt) || amt <= 0) {
      setRefundError("Số tiền hoàn phải lớn hơn 0.");
      return;
    }
    if (amt > parseFloat(String(payment.amount ?? 0))) {
      setRefundError("Số tiền hoàn không được vượt quá tổng thanh toán.");
      return;
    }

    setIsRefunding(true);
    try {
      const payload: CreateRefundPayload = {
        payment_id: payment.id,
        amount: amt,
        reason: refundForm.reason || undefined,
      };
      const res = await requestRefundApi(payload);
      setRefunds((prev) => [res.data, ...prev]);
      setShowRefundModal(false);
      notify("success", "Yêu cầu gửi thành công", "Yêu cầu hoàn tiền của bạn đang được xử lý.");
      fetchMyPayments(paymentsPage); // Refresh list
    } catch (err: any) {
      setRefundError(err.response?.data?.message || "Không thể gửi yêu cầu hoàn tiền.");
    } finally {
      setIsRefunding(false);
    }
  };

  return {
    toast,
    setToast,
    // create
    showCreateModal,
    setShowCreateModal,
    form,
    formError,
    handleCreateOpen,
    handleFormChange,
    handleCreateSubmit,
    isCreating,
    // lookup
    payment,
    refunds,
    lookupId,
    setLookupId,
    isLooking,
    handleLookup,
    loadPayment,
    // simulate
    handleSimulate,
    isSimulating,
    // vnpay
    isVnpayLoading,
    // refund
    showRefundModal,
    setShowRefundModal,
    refundForm,
    refundError,
    handleRefundOpen,
    handleRefundChange,
    handleRefundSubmit,
    isRefunding,
    // payments list
    myPayments,
    paymentsPage,
    setPaymentsPage,
    totalPayments,
    lastPage,
    isPaymentsLoading,
  };
};
