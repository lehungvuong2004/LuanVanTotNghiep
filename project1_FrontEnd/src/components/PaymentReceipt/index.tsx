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
}: PaymentReceiptProps) => {
  const { t } = useTranslation();

  // Function render từng dòng thông tin hóa đơn (1 cột rộng rãi, không bị ngắt dòng)
  const renderDetailRow = (
    icon: string,
    label: string,
    value: React.ReactNode
  ) => {
    if (!value) return null;
    return (
      <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-200/40 dark:hover:bg-slate-800/40 transition-colors gap-4">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#026E5F] dark:text-teal-400 flex items-center justify-center text-sm font-bold">
            <Icon icon={icon} />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>
        </div>
        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 text-right whitespace-nowrap overflow-hidden text-ellipsis">
          {value}
        </span>
      </div>
    );
  };

  // Function render danh sách chi tiết hóa đơn
  const renderReceiptDetails = () => {
    if (!isSuccess) return null;

    const formattedPaymentDate = paymentDate
      ? paymentDate.includes("-") || paymentDate.includes("/")
        ? paymentDate
        : formatDateTime(paymentDate)
      : null;

    const formattedMethod =
      paymentMethod === "vnpay"
        ? "Cổng VNPay"
        : paymentMethod === "cash"
        ? t("Tiền mặt")
        : t("Ví điện tử / Thẻ");

    return (
      <div className="bg-slate-50/70 dark:bg-slate-900/50 p-3.5 sm:p-4 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800/60">
        <div className="pb-1.5 space-y-0.5">
          {renderDetailRow("solar:document-text-bold-duotone", t("Mã đặt lịch"), bookingId)}
          {renderDetailRow("solar:card-transfer-bold-duotone", t("Phương thức"), formattedMethod)}
        </div>
        {(serviceName || helperName) && (
          <div className="py-1.5 space-y-0.5">
            {serviceName && renderDetailRow("solar:broom-bold-duotone", t("Dịch vụ"), t(serviceName))}
            {helperName && renderDetailRow("solar:user-handshake-bold-duotone", t("Nhân viên"), helperName)}
          </div>
        )}
        <div className="pt-1.5 space-y-0.5">
          {bookingDate &&
            renderDetailRow(
              "solar:calendar-date-bold-duotone",
              t("Thời gian dịch vụ"),
              `${bookingDate} ${bookingTime ? `(${bookingTime})` : ""}`
            )}
          {transactionId && renderDetailRow("solar:bill-check-bold-duotone", t("Mã giao dịch"), transactionId)}
          {formattedPaymentDate &&
            renderDetailRow("solar:clock-circle-bold-duotone", t("Thời gian thanh toán"), formattedPaymentDate)}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-850 w-full max-w-xl rounded-3xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40 border border-slate-150 dark:border-slate-700/60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="relative flex items-center justify-between px-6 py-4.5 bg-linear-to from-slate-50 via-white to-slate-50 dark:from-slate-900/50 dark:via-slate-850 dark:to-slate-900/50 border-b border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-3 text-left">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isSuccess
                ? "bg-emerald-500/10 text-[#026E5F] dark:text-teal-400"
                : "bg-red-500/10 text-red-500"
            }`}
          >
            <Icon
              icon={isSuccess ? "solar:verified-check-bold-duotone" : "solar:close-circle-bold-duotone"}
              className="text-2xl"
            />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-850 dark:text-white">
              {isSuccess ? t("Hóa đơn thanh toán") : t("Thanh toán thất bại")}
            </h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 mt-0.5">{bookingId}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8.5 h-8.5 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:scale-105 transition cursor-pointer"
          >
            <Icon icon="material-symbols:close" className="text-lg" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 space-y-5">
        {/* Status Circle & Hero Amount */}
        <div className="text-center pb-1">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ${
              isSuccess
                ? "bg-emerald-500 text-white shadow-emerald-500/25 ring-8 ring-emerald-500/10 dark:ring-emerald-500/20"
                : "bg-red-500 text-white shadow-red-500/25 ring-8 ring-red-500/10 dark:ring-red-500/20"
            }`}
          >
            <Icon
              icon={isSuccess ? "solar:check-read-linear" : "solar:close-circle-linear"}
              className="text-3xl"
            />
          </div>
          <h4
            className={`text-base font-bold ${
              isSuccess ? "text-slate-700 dark:text-slate-200" : "text-red-650 dark:text-red-400"
            }`}
          >
            {isSuccess ? t("Thanh toán thành công") : t("Giao dịch thất bại")}
          </h4>
          {isSuccess ? (
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">
              {totalPrice}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {errorMessage || t("Đã xảy ra lỗi trong quá trình xử lý giao dịch của bạn.")}
            </p>
          )}
        </div>

        {/* Detailed Breakdown List */}
        {renderReceiptDetails()}

        {/* Legal Disclaimer Footer */}
        <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl text-center text-xs font-semibold text-[#026E5F] dark:text-teal-400">
          <Icon icon="solar:shield-check-bold-duotone" className="text-base shrink-0" />
          <span>{t("Hóa đơn được xác thực tự động và có giá trị hợp lệ.")}</span>
        </div>
      </div>

      {/* Action Buttons */}
      {actions && (
        <div className="px-6 pb-6 pt-1 flex gap-2.5 sm:gap-3 justify-end bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800/40 [&_button]:whitespace-nowrap [&_a]:whitespace-nowrap">
          {actions}
        </div>
      )}
    </div>
  );
};
