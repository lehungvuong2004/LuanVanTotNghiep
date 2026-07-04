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

  return (
    <div className="bg-white dark:bg-slate-850 w-full max-w-md rounded-3xl shadow-2xl border border-slate-150 dark:border-slate-700/60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-700/50">
        <div className="text-left">
          <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
            <Icon
              icon={isSuccess ? "material-symbols:receipt-long-outline" : "material-symbols:error-outline"}
              className={`text-2xl ${isSuccess ? "text-[#026E5F] dark:text-teal-400" : "text-red-500"}`}
            />
            {isSuccess ? t("Hóa đơn thanh toán") : t("Thanh toán thất bại")}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{bookingId}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:scale-105 transition cursor-pointer"
          >
            <Icon icon="material-symbols:close" className="text-xl" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-6 space-y-4">
        {/* Status circle and amount */}
        <div className="text-center pb-4 border-b border-dashed border-slate-200 dark:border-slate-700">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2.5 ${isSuccess ? "bg-emerald-50 dark:bg-emerald-900/30" : "bg-red-50 dark:bg-red-900/30"}`}>
            <Icon icon={isSuccess ? "material-symbols:check-circle-outline" : "material-symbols:cancel-outline"} className={`text-4xl ${isSuccess ? "text-emerald-500" : "text-red-500"}`} />
          </div>
          <h4 className={`text-base font-bold ${isSuccess ? "text-slate-800 dark:text-white" : "text-red-650 dark:text-red-400"}`}>
            {isSuccess ? t("Thanh toán thành công") : t("Giao dịch thất bại")}
          </h4>
          {isSuccess ? (
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-450 mt-1">{totalPrice}</p>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">{errorMessage || t("Đã xảy ra lỗi trong quá trình xử lý giao dịch của bạn.")}</p>
          )}
        </div>

        {/* Breakdown details */}
        {isSuccess && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{t("Mã đặt lịch")}</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-right">{bookingId}</span>
            </div>
            {serviceName && (
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{t("Dịch vụ")}</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-right">{t(serviceName)}</span>
              </div>
            )}
            {helperName && (
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{t("Nhân viên")}</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-right">{helperName}</span>
              </div>
            )}
            {bookingDate && (
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{t("Thời gian")}</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-right">
                  {bookingDate} {bookingTime ? `(${bookingTime})` : ""}
                </span>
              </div>
            )}

            {/* Transaction metadata */}
            <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-3 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{t("Phương thức")}</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-right text-slate-650 dark:text-slate-350">
                  {paymentMethod === "vnpay" ? "VNPay" : paymentMethod === "cash" ? t("Tiền mặt") : t("Ví điện tử / Thẻ")}
                </span>
              </div>
              {transactionId && (
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{t("Mã giao dịch")}</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-right break-all">{transactionId}</span>
                </div>
              )}
              {paymentDate && (
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{t("Thời gian thanh toán")}</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-right">
                    {paymentDate.includes("-") || paymentDate.includes("/") ? paymentDate : formatDateTime(paymentDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-450 dark:text-slate-500">
          {t("Hóa đơn này được tạo tự động bởi hệ thống và có giá trị làm bằng chứng thanh toán hợp lệ.")}
        </div>
      </div>

      {/* Actions */}
      {actions && <div className="px-6 pb-6 flex gap-3">{actions}</div>}
    </div>
  );
};
