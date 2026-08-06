import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import { formatDateTime } from "../../utils";

interface PaymentReceiptProps {
  bookingId: string;
  serviceName?: string;
  helperName?: string;
  bookingDate?: string;
  bookingTime?: string;
  totalPrice: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentDate?: string;
  isSuccess?: boolean;
  errorMessage?: string | null;
  onClose?: () => void;
  actions?: React.ReactNode;
  isHelper?: boolean;
  grossAmount?: number | string | null;
  commissionRate?: number | null;
  commissionAmount?: number | string | null;
  earnedAmount?: number | string | null;
  releasedAt?: string | null;
}

export const PaymentReceipt = ({
  bookingId,
  serviceName = "",
  helperName = "",
  bookingDate = "",
  bookingTime = "",
  totalPrice,
  paymentMethod = "vnpay",
  transactionId = "",
  paymentDate = "",
  isSuccess = true,
  errorMessage = null,
  onClose,
  actions,
  isHelper = false,
  grossAmount = null,
  commissionRate = null,
  commissionAmount = null,
  earnedAmount = null,
  releasedAt = null,
}: PaymentReceiptProps) => {
  const { t } = useTranslation();

  // Function render từng dòng thông tin hóa đơn (1 cột rộng rãi, không bị ngắt dòng)
  const renderDetailRow = (icon: string, label: string, value) => {
    if (!value) return null;
    return (
      <div className="flex items-center justify-between py-1.5 px-2.5 rounded-xl hover:bg-slate-205/40 dark:hover:bg-slate-800/40 transition-colors gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6.5 h-6.5 rounded-lg bg-teal-550/10 text-[#026E5F] dark:text-teal-400 flex items-center justify-center text-xs font-bold">
            <Icon icon={icon} />
          </div>
          <span className="text-xs font-semibold text-slate-550 dark:text-slate-400">{label}</span>
        </div>
        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 text-right whitespace-nowrap overflow-hidden text-ellipsis">{value}</span>
      </div>
    );
  };

  // Function render danh sách chi tiết hóa đơn
  const renderReceiptDetails = () => {
    if (!isSuccess) return null;

    const formattedPaymentDate = paymentDate ? (paymentDate.includes("-") || paymentDate.includes("/") ? paymentDate : formatDateTime(paymentDate)) : null;
    const formattedMethod = paymentMethod === "vnpay" ? t("Cổng VNPay") : paymentMethod === "cash" ? t("Tiền mặt") : t("Ví điện tử / Thẻ");

    const formatCurrency = (val: number | string | null) => {
      if (val === null || val === undefined) return "";
      const num = typeof val === "string" ? parseFloat(val) : val;
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
    };

    return (
      <div className="bg-slate-50/70 dark:bg-slate-900/50 p-2.5 sm:p-3 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800/60">
        <div className="pb-1 space-y-0.5">
          {renderDetailRow("solar:document-text-bold-duotone", t("Mã đặt lịch"), bookingId)}
          {renderDetailRow("solar:card-transfer-bold-duotone", t("Phương thức"), formattedMethod)}
        </div>
        {(serviceName || helperName) && (
          <div className="py-1 space-y-0.5">
            {serviceName && renderDetailRow("solar:broom-bold-duotone", t("Dịch vụ"), t(serviceName))}
            {helperName && renderDetailRow("solar:user-handshake-bold-duotone", isHelper ? t("Khách hàng") : t("Nhân viên"), helperName)}
          </div>
        )}

        {isHelper && (grossAmount || earnedAmount) && (
          <div className="py-1.5 space-y-0.5 bg-teal-50/30 dark:bg-teal-950/10 p-2.5 rounded-xl border border-teal-100/40 dark:border-teal-900/20 my-1">
            {renderDetailRow("solar:wallet-money-bold-duotone", t("Khách thanh toán (Gross)"), formatCurrency(grossAmount))}
            {commissionRate && renderDetailRow("solar:ticket-percent-bold-duotone", t("Tỷ lệ vận hành"), `${commissionRate}%`)}
            {commissionAmount && renderDetailRow("solar:hand-money-bold-duotone", t("Khấu trừ hoa hồng"), formatCurrency(commissionAmount))}
            {earnedAmount && (
              <div className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-teal-500/10 text-[#026E5F] dark:text-teal-400 font-bold transition-colors gap-3 ring-1 ring-teal-550/20 my-1">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-5 h-5 rounded-md bg-[#026E5F] dark:bg-teal-500 text-white flex items-center justify-center text-xs font-bold animate-pulse">
                    <Icon icon="solar:round-transfer-horizontal-bold-duotone" />
                  </div>
                  <span className="text-xs font-bold text-[#026E5F] dark:text-teal-400">{t("Bạn thực nhận (Earned)")}</span>
                </div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 text-right whitespace-nowrap overflow-hidden text-ellipsis">{formatCurrency(earnedAmount)}</span>
              </div>
            )}
            {releasedAt && renderDetailRow("solar:clock-circle-bold-duotone", t("Thời gian giải ngân"), formatDateTime(releasedAt))}
          </div>
        )}

        <div className="pt-1 space-y-0.5">
          {bookingDate && renderDetailRow("solar:calendar-date-bold-duotone", t("Thời gian dịch vụ"), `${bookingDate} ${bookingTime ? `(${bookingTime})` : ""}`)}
          {transactionId && renderDetailRow("solar:bill-check-bold-duotone", t("Mã giao dịch"), transactionId)}
          {formattedPaymentDate && renderDetailRow("solar:clock-circle-bold-duotone", t("Thời gian thanh toán"), formattedPaymentDate)}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-850 w-full max-w-xl max-h-[92vh] rounded-3xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40 border border-slate-150 dark:border-slate-700/60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="relative flex items-center justify-between px-6 py-3.5 bg-linear-to from-slate-50 via-white to-slate-50 dark:from-slate-900/50 dark:via-slate-850 dark:to-slate-900/50 border-b border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-3 text-left">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSuccess ? "bg-emerald-500/10 text-[#026E5F] dark:text-teal-400" : "bg-red-500/10 text-red-500"}`}>
            <Icon icon={isSuccess ? "solar:verified-check-bold-duotone" : "solar:close-circle-bold-duotone"} className="text-xl" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-850 dark:text-white">{isSuccess ? t("Hóa đơn thanh toán") : t("Thanh toán thất bại")}</h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 mt-0.5">{bookingId}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:scale-105 transition cursor-pointer"
          >
            <Icon icon="material-symbols:close" className="text-base" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="px-6 py-4 flex-1 overflow-y-auto space-y-4">
        {/* Status Circle & Hero Amount */}
        <div className="text-center pb-1">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg ${
              isSuccess
                ? "bg-emerald-500 text-white shadow-emerald-500/25 ring-6 ring-emerald-500/10 dark:ring-emerald-500/20"
                : "bg-red-500 text-white shadow-red-500/25 ring-6 ring-red-500/10 dark:ring-red-500/20"
            }`}
          >
            <Icon icon={isSuccess ? "solar:check-read-linear" : "solar:close-circle-linear"} className="text-2xl" />
          </div>
          <h4 className={`text-sm sm:text-base font-bold ${isSuccess ? "text-slate-700 dark:text-slate-200" : "text-red-650 dark:text-red-400"}`}>
            {isSuccess ? t("Thanh toán thành công") : t("Giao dịch thất bại")}
          </h4>
          {isSuccess ? (
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 tracking-tight">{totalPrice}</div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">{errorMessage || t("Đã xảy ra lỗi trong quá trình xử lý giao dịch của bạn.")}</p>
          )}
        </div>

        {/* Detailed Breakdown List */}
        {renderReceiptDetails()}

        {/* Legal Disclaimer Footer */}
        <div className="flex items-center justify-center gap-1.5 p-2 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl text-center text-xs font-semibold text-[#026E5F] dark:text-teal-400">
          <Icon icon="solar:shield-check-bold-duotone" className="text-sm shrink-0" />
          <span>{t("Hóa đơn được xác thực tự động và có giá trị hợp lệ.")}</span>
        </div>
      </div>

      {/* Action Buttons */}
      {actions && (
        <div className="px-6 py-3 flex gap-2.5 sm:gap-3 justify-end bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800/40 [&_button]:whitespace-nowrap [&_a]:whitespace-nowrap">
          {actions}
        </div>
      )}
    </div>
  );
};
