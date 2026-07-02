import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { verifyVnpayReturnApi } from "../../api/payments";


const VNPAY_CODES= {
  "00": "Giao dịch thành công.",
  "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
  "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking.",
  "10": "Xác thực thẻ/tài khoản sai quá 3 lần.",
  "11": "Đã hết hạn chờ thanh toán. Vui lòng thử lại.",
  "12": "Thẻ/Tài khoản bị khóa.",
  "13": "Mã OTP không đúng. Vui lòng thử lại.",
  "24": "Khách hàng hủy giao dịch.",
  "51": "Tài khoản không đủ số dư.",
  "65": "Tài khoản vượt quá hạn mức giao dịch trong ngày.",
  "75": "Ngân hàng thanh toán đang bảo trì.",
  "79": "Xác thực sai quá số lần quy định.",
  "97": "Chữ ký không hợp lệ.",
  "99": "Lỗi không xác định.",
};

const fmt = (n: string | null) =>
  n == null ? "—" : Number(n).toLocaleString("vi-VN") + " ₫";

export const PaymentReturn = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Parse query string — VNPay appends params to the hash URL
  // e.g. /#/thanh-toan/ket-qua?vnp_ResponseCode=00&...
  const [params] = useState<URLSearchParams>(() => {
    // Try both location.search and the search embedded in the hash
    const hashPart = window.location.hash; // e.g. "#/thanh-toan/ket-qua?foo=bar"
    const hashSearch = hashPart.includes("?") ? hashPart.slice(hashPart.indexOf("?")) : "";
    return new URLSearchParams(hashSearch || location.search);
  });

  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const responseCode = params.get("vnp_ResponseCode") ?? "";
  const txnRef       = params.get("vnp_TxnRef") ?? "";
  const amount       = params.get("vnp_Amount") ?? null;  // ×100 from VNPay
  const bankCode     = params.get("vnp_BankCode") ?? "—";
  const orderInfo    = params.get("vnp_OrderInfo") ?? "—";
  const transactionNo= params.get("vnp_TransactionNo") ?? "—";
  const payDate      = params.get("vnp_PayDate") ?? null;

  const isSuccess = responseCode === "00" && !verificationError;
  const message   = verificationError || VNPAY_CODES[responseCode] || `Mã lỗi: ${responseCode}`;

  // Amount: VNPay sends amount × 100
  const displayAmount = amount ? fmt(String(parseInt(amount) / 100)) : "—";

  // Format VNPay date (YYYYMMDDHHmmss)
  const fmtVnDate = (s: string | null) => {
    if (!s || s.length < 14) return "—";
    const y = s.slice(0, 4), mo = s.slice(4, 6), d = s.slice(6, 8);
    const h = s.slice(8, 10), mi = s.slice(10, 12), se = s.slice(12, 14);
    return `${h}:${mi}:${se} ${d}/${mo}/${y}`;
  };

  // Auto-scroll to top and verify payment via backend API
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const verify = async () => {
      try {
        const queryObj: Record<string, string> = {};
        params.forEach((value, key) => {
          queryObj[key] = value;
        });
        await verifyVnpayReturnApi(queryObj);
      } catch (err: any) {
        console.error("Payment verification failed:", err);
        setVerificationError(
          err.response?.data?.message || "Không thể xác thực chữ ký hoặc trạng thái thanh toán từ VNPay."
        );
      } finally {
        setIsVerifying(false);
      }
    };

    verify();
  }, [params]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xl overflow-hidden p-8 text-center">
          <div className="mx-auto size-20 rounded-full flex items-center justify-center mb-5 bg-teal-50 dark:bg-teal-900/30">
            <Icon icon="svg-spinners:3-dots-fade" className="text-4xl text-teal-600 dark:text-teal-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t("Đang xác thực thanh toán")}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("Vui lòng không tắt hoặc tải lại trang này...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 p-4">
      <div className="w-full max-w-md">
        {/* ── Result card ─────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xl overflow-hidden">

          {/* Top accent */}
          <div className={`h-1.5 w-full ${isSuccess ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-red-400 to-rose-500"}`} />

          <div className="p-8 text-center">
            {/* Icon */}
            <div className={`mx-auto size-20 rounded-full flex items-center justify-center mb-5 ${
              isSuccess
                ? "bg-emerald-50 dark:bg-emerald-900/30"
                : "bg-red-50 dark:bg-red-900/30"
            }`}>
              <Icon
                icon={isSuccess ? "material-symbols:check-circle-outline" : "material-symbols:cancel-outline"}
                className={`text-5xl ${isSuccess ? "text-emerald-500" : "text-red-500"}`}
              />
            </div>

            {/* VNPay badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
              <Icon icon="logos:visa" className="text-base" />
              VNPay
            </div>

            <h1 className={`text-2xl font-bold mb-2 ${isSuccess ? "text-slate-800 dark:text-white" : "text-slate-800 dark:text-white"}`}>
              {isSuccess ? t("Thanh toán thành công!") : t("Thanh toán thất bại")}
            </h1>

            {isSuccess && (
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-1">
                {displayAmount}
              </p>
            )}

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{message}</p>
          </div>

          {/* Details */}
          {txnRef && (
            <div className="border-t border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700/60">
              {[
                { label: t("Mã giao dịch VNPay"), value: transactionNo },
                { label: t("Mã tham chiếu"),      value: txnRef },
                { label: t("Ngân hàng"),           value: bankCode },
                { label: t("Nội dung"),            value: decodeURIComponent(orderInfo.replace(/\+/g, " ")) },
                { label: t("Số tiền"),             value: displayAmount },
                { label: t("Thời gian"),           value: fmtVnDate(payDate) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-6 py-3 gap-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{label}</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 text-right break-all">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="p-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Icon icon="material-symbols:home-outline" className="text-lg" />
              {t("Về trang chủ")}
            </Link>
            {isSuccess && (
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-650 hover:bg-teal-700 text-white text-sm font-semibold transition-all cursor-pointer border border-transparent"
              >
                <Icon icon="material-symbols:print-outline" className="text-lg" />
                {t("In hóa đơn")}
              </button>
            )}
            <Link
              to="/lich-su-dat-lich"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#066d72] hover:bg-[#055a5f] text-white text-sm font-semibold transition-all"
            >
              <Icon icon="material-symbols:calendar-today-outline" className="text-lg" />
              {t("Lịch đặt của tôi")}
            </Link>
          </div>
        </div>

        {/* Security note */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-5">
          <Icon icon="material-symbols:lock-outline" className="inline mr-1" />
          {t("Giao dịch được bảo mật bởi VNPay")}
        </p>
      </div>
    </div>
  );
};
