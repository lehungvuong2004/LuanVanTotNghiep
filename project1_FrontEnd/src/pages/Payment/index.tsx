import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

import { usePayment, PAYMENT_METHODS, STATUS_META, REFUND_STATUS_META } from "./useHook";

const fmt = (n: number | string | null | undefined) => (n == null ? "—" : Number(n).toLocaleString("vi-VN") + " ₫");

const fmtDate = (s: string | null | undefined) => {
  if (!s) return "—";
  return new Date(s.includes("T") ? s : s + "Z").toLocaleString("vi-VN");
};

export const Payment = () => {
  const { t } = useTranslation();
  const {
    showCreateModal,
    setShowCreateModal,
    form,
    formError,
    handleCreateOpen,
    handleFormChange,
    handleCreateSubmit,
    isCreating,
    payment,
    refunds,
    lookupId,
    setLookupId,
    isLooking,
    handleLookup,
    loadPayment,
    handleSimulate,
    isSimulating,
    isVnpayLoading,
    showRefundModal,
    setShowRefundModal,
    refundForm,
    refundError,
    handleRefundOpen,
    handleRefundChange,
    handleRefundSubmit,
    isRefunding,
    myPayments,
    paymentsPage,
    setPaymentsPage,
    totalPayments,
    lastPage,
    isPaymentsLoading,
  } = usePayment();

  const statusMeta = payment ? (STATUS_META[payment.status] ?? { label: payment.status, cls: "bg-slate-100 text-slate-600" }) : null;

  const paymentMethodLabel = payment?.payment_method ? (PAYMENT_METHODS.find((m) => m.value === payment.payment_method)?.label ?? payment.payment_method) : "—";

  // ─── Render Sub-Sections ──────────────────────────────────────────────────

  const renderHeader = () => {
    return (
      <div className="bg-linear-to-r from-[#066d72] to-[#0a9ea6] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0 shadow-lg">
              <Icon icon="material-symbols:payments-outline" className="text-3xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("Thanh toán")}</h1>
              <p className="mt-1 text-white/70 text-sm">{t("Tạo & quản lý giao dịch thanh toán của bạn")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderActionBar = () => {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Lookup */}
        <div className="flex flex-1 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <div className="flex items-center px-3 border-r border-slate-200 dark:border-slate-700 text-slate-400">
            <Icon icon="material-symbols:search" className="text-lg" />
          </div>
          <input
            type="number"
            min={1}
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            placeholder={t("Tra cứu mã thanh toán...")}
            className="flex-1 px-3 py-3 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
          />
          <button
            onClick={handleLookup}
            disabled={isLooking}
            className="px-4 text-sm font-semibold text-[#066d72] dark:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLooking ? <Icon icon="svg-spinners:3-dots-fade" className="text-xl" /> : t("Tìm")}
          </button>
        </div>

        {/* Create payment */}
        <button
          onClick={handleCreateOpen}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#066d72] hover:bg-[#055a5f] text-white font-semibold text-sm rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Icon icon="material-symbols:add" className="text-xl" />
          {t("Tạo thanh toán")}
        </button>
      </div>
    );
  };

  const renderPaymentDetail = () => {
    if (!payment) return null;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
              <Icon icon="material-symbols:receipt-long-outline" className="text-xl text-[#066d72] dark:text-teal-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t("Giao dịch")}</p>
              <p className="text-base font-bold text-slate-800 dark:text-white">
                #{payment.id} — {payment.transaction_code ?? "—"}
              </p>
            </div>
          </div>
          {statusMeta && <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusMeta.cls}`}>{statusMeta.label}</span>}
        </div>

        {/* Card body */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t("Phương thức")}</span>
            <span className="sm:col-span-3 text-sm font-semibold text-slate-800 dark:text-white">{paymentMethodLabel}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t("Số tiền")}</span>
            <span className="sm:col-span-3 text-lg font-bold text-[#066d72] dark:text-teal-400">{fmt(payment.amount)}</span>
          </div>
          {payment.user && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t("Người thanh toán")}</span>
              <span className="sm:col-span-3 text-sm font-semibold text-slate-800 dark:text-white">
                {payment.user.full_name} ({payment.user.phone} · {payment.user.email})
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t("Đặt lịch #")}</span>
            <span className="sm:col-span-3 text-sm font-semibold text-slate-800 dark:text-white">{payment.booking_id ?? "—"}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t("Bài tuyển #")}</span>
            <span className="sm:col-span-3 text-sm font-semibold text-slate-800 dark:text-white">{payment.job_post_id ?? "—"}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t("Thanh toán lúc")}</span>
            <span className="sm:col-span-3 text-sm font-semibold text-slate-800 dark:text-white">{fmtDate(payment.paid_at)}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t("Tạo lúc")}</span>
            <span className="sm:col-span-3 text-sm font-semibold text-slate-800 dark:text-white">{fmtDate(payment.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        {payment.status === "pending" && payment.payment_method === "vnpay" && (
          <div className="px-6 pb-5 flex gap-3 flex-wrap">
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all active:scale-95 cursor-pointer disabled:opacity-60"
            >
              {isSimulating ? <Icon icon="svg-spinners:3-dots-fade" className="text-lg" /> : <Icon icon="material-symbols:check-circle-outline" className="text-lg" />}
              {t("Xác nhận thanh toán")}
            </button>
          </div>
        )}
        {payment.status === "completed" && (
          <div className="px-6 pb-5 flex gap-3 flex-wrap">
            <button
              onClick={handleRefundOpen}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              <Icon icon="material-symbols:undo" className="text-lg" />
              {t("Yêu cầu hoàn tiền")}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderRefundsList = () => {
    if (!payment || refunds.length === 0) return null;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <Icon icon="material-symbols:currency-exchange" className="text-xl text-violet-500" />
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">
            {t("Lịch sử hoàn tiền")} ({refunds.length})
          </h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {refunds.map((r) => {
            const rm = REFUND_STATUS_META[r.status] ?? { label: r.status, cls: "bg-slate-100 text-slate-600" };
            return (
              <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 py-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{fmt(r.amount)}</p>
                  <p className="text-xs text-slate-400">
                    {r.reason ?? t("(Không có lý do)")} · {fmtDate(r.created_at)}
                  </p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${rm.cls}`}>{rm.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPlaceholder = () => {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5">
          <Icon icon="material-symbols:payments-outline" className="text-4xl text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-base font-semibold text-slate-500 dark:text-slate-400">{t("Tra cứu hoặc tạo thanh toán mới")}</p>
        <p className="text-sm mt-1">{t('Nhập mã thanh toán để xem chi tiết hoặc bấm "Tạo thanh toán".')}</p>
      </div>
    );
  };

  const renderCreateModal = () => {
    if (!showCreateModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t("Tạo thanh toán mới")}</h2>
            <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <Icon icon="material-symbols:close" className="text-xl text-slate-500" />
            </button>
          </div>
          <div className="px-6 py-5 overflow-y-auto max-h-[75vh] space-y-4">
            {/* Method selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t("Phương thức thanh toán")} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => handleFormChange("payment_method", m.value)}
                    disabled={isVnpayLoading}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer disabled:opacity-50
                      ${
                        form.payment_method === m.value
                          ? "border-[#066d72] bg-teal-50 dark:bg-teal-900/20 text-[#066d72] dark:text-teal-400 shadow-sm"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                  >
                    <Icon icon={m.icon} className="text-lg shrink-0" />
                    {m.label}
                    {m.value === "vnpay" && form.payment_method === "vnpay" && <span className="ml-auto text-xs font-bold bg-[#006eed] text-white px-1.5 py-0.5 rounded">{t("Cổng trực tiếp")}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("Số tiền (VNĐ)")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={form.amount}
                readOnly
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-sm text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed select-none"
              />
            </div>

            {/* Booking / Job post */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t("Mã đặt lịch")}</label>
                <input
                  type="number"
                  min={1}
                  value={form.booking_id}
                  readOnly
                  placeholder={t("Mã đặt lịch")}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-855 text-sm text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed select-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t("Mã bài tuyển")}</label>
                <input
                  type="number"
                  min={1}
                  value={form.job_post_id}
                  readOnly
                  placeholder={t("Mã bài tuyển")}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-855 text-sm text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed select-none"
                />
              </div>
            </div>
            <p className="text-xs text-slate-400">{t("Thông tin thanh toán được trích xuất tự động từ hệ thống.")}</p>

            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                <Icon icon="material-symbols:error-outline" className="shrink-0 text-lg" />
                {formError}
              </div>
            )}

            {/* VNPay redirect notice */}
            {form.payment_method === "vnpay" && !isVnpayLoading && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm">
                <Icon icon="material-symbols:open-in-new" className="shrink-0 text-lg mt-0.5" />
                <span>
                  {t("Bạn sẽ được chuyển đến cổng thanh toán")} <strong>VNPay</strong> {t("để hoàn tất giao dịch an toàn.")}
                </span>
              </div>
            )}

            {isVnpayLoading && (
              <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <Icon icon="svg-spinners:3-dots-fade" className="text-2xl text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{t("Đang tạo liên kết VNPay...")}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {t("Hủy")}
              </button>
              <button
                onClick={handleCreateSubmit}
                disabled={isCreating || isVnpayLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#066d72] hover:bg-[#055a5f] text-white text-sm font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {isCreating || isVnpayLoading ? (
                  <Icon icon="svg-spinners:3-dots-fade" className="text-lg" />
                ) : form.payment_method === "vnpay" ? (
                  <Icon icon="material-symbols:open-in-new" className="text-lg" />
                ) : (
                  <Icon icon="material-symbols:add" className="text-lg" />
                )}
                {form.payment_method === "vnpay" ? t("Thanh toán qua VNPay") : t("Tạo thanh toán")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRefundModal = () => {
    if (!showRefundModal || !payment) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t("Yêu cầu hoàn tiền")}</h2>
            <button onClick={() => setShowRefundModal(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <Icon icon="material-symbols:close" className="text-xl text-slate-500" />
            </button>
          </div>
          <div className="px-6 py-5 overflow-y-auto max-h-[75vh] space-y-4">
            <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-sm">
              <p className="font-semibold text-violet-700 dark:text-violet-300">
                {t("Thanh toán #")}
                {payment.id}
              </p>
              <p className="text-violet-600 dark:text-violet-400 mt-0.5">
                {t("Tổng thanh toán:")} <strong>{fmt(payment.amount)}</strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("Số tiền hoàn (VNĐ)")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={refundForm.amount}
                onChange={(e) => handleRefundChange("amount", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t("Lý do")}</label>
              <textarea
                rows={3}
                value={refundForm.reason}
                onChange={(e) => handleRefundChange("reason", e.target.value)}
                placeholder={t("Mô tả lý do yêu cầu hoàn tiền...")}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-white outline-none focus:border-violet-500 transition-colors resize-none"
              />
            </div>

            {refundError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                <Icon icon="material-symbols:error-outline" className="shrink-0 text-lg" />
                {refundError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowRefundModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {t("Hủy")}
              </button>
              <button
                onClick={handleRefundSubmit}
                disabled={isRefunding}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {isRefunding ? <Icon icon="svg-spinners:3-dots-fade" className="text-lg" /> : <Icon icon="material-symbols:undo" className="text-lg" />}
                {t("Gửi yêu cầu")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMyPaymentsList = () => {
    if (myPayments.length === 0) return null;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Icon icon="material-symbols:history-edu-outline" className="text-xl text-[#066d72] dark:text-teal-400" />
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">{t("Lịch sử giao dịch của bạn")}</h3>
          </div>
          <span className="text-xs text-slate-400">
            {t("Tổng số:")} {totalPayments}
          </span>
        </div>

        {isPaymentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Icon icon="svg-spinners:3-dots-fade" className="text-2xl text-slate-400" />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {myPayments.map((item) => {
              const meta = STATUS_META[item.status] ?? { label: item.status, cls: "bg-slate-100 text-slate-600" };
              const method = PAYMENT_METHODS.find((m) => m.value === item.payment_method)?.label ?? item.payment_method;
              const isCurrent = payment?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => loadPayment(item.id)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors ${
                    isCurrent ? "bg-teal-50/40 dark:bg-teal-950/10 border-l-4 border-[#066d72]" : ""
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800 dark:text-white">#{item.id}</span>
                      <span className="text-xs text-slate-400 font-medium">({method})</span>
                      {item.booking_id && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                          {t("Đặt lịch:")} #{item.booking_id}
                        </span>
                      )}
                      {item.job_post_id && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                          {t("Bài tuyển:")} #{item.job_post_id}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{fmtDate(item.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <span className="text-sm font-extrabold text-[#066d72] dark:text-teal-400">{fmt(item.amount)}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.cls}`}>{meta.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination controls */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
            <button
              disabled={paymentsPage <= 1}
              onClick={() => setPaymentsPage(paymentsPage - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-150 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {t("Trước")}
            </button>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t("Trang")} {paymentsPage} / {lastPage}
            </span>
            <button
              disabled={paymentsPage >= lastPage}
              onClick={() => setPaymentsPage(paymentsPage + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-150 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {t("Sau")}
            </button>
          </div>
        )}
      </div>
    );
  };

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20">
      {renderHeader()}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {renderActionBar()}

        {payment ? renderPaymentDetail() : renderPlaceholder()}

        {renderRefundsList()}

        {renderMyPaymentsList()}
      </div>

      {renderCreateModal()}
      {renderRefundModal()}
    </div>
  );
};
