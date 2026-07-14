import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { verifyVnpayReturnApi } from "../../api/payments";
import { PaymentReceipt } from "../../components/PaymentReceipt";

const VNPAY_CODES = {
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
  "99": "Lỗi không xác định." };

const fmt = (n) => (n == null ? "" : Number(n).toLocaleString("vi-VN") + " đ");

export const PaymentReturn = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const [params] = useState(() => {
    const hashPart = window.location.hash;
    const hashSearch = hashPart.includes("?") ? hashPart.slice(hashPart.indexOf("?")) : "";
    return new URLSearchParams(hashSearch || location.search);
  });

  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const responseCode = params.get("vnp_ResponseCode") ?? "";
  const txnRef = params.get("vnp_TxnRef") ?? "";
  const amount = params.get("vnp_Amount") ?? null;
  // const bankCode     = params.get("vnp_BankCode") ?? "";
  // const orderInfo    = params.get("vnp_OrderInfo") ?? "";
  const transactionNo = params.get("vnp_TransactionNo") ?? "";
  const payDate = params.get("vnp_PayDate") ?? null;

  const isSuccess = responseCode === "00" && !verificationError;
  const message = verificationError || VNPAY_CODES[responseCode] || `Mã lỗi: ${responseCode}`;

  const displayAmount = amount ? fmt(String(parseInt(amount) / 100)) : "";

  const fmtVnDate = (s: string | null) => {
    if (!s || s.length < 14) return "";
    const y = s.slice(0, 4),
      mo = s.slice(4, 6),
      d = s.slice(6, 8);
    const h = s.slice(8, 10),
      mi = s.slice(10, 12),
      se = s.slice(12, 14);
    return `${h}:${mi}:${se} ${d}/${mo}/${y}`;
  };

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
        setVerificationError(err.response?.data?.message || "Không thể xác thực chữ ký hoặc trạng thái thanh toán từ VNPay.");
      } finally {
        setIsVerifying(false);
      }
    };

    verify();
  }, [params]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-850 rounded-3xl border border-slate-150 dark:border-slate-700/60 shadow-2xl overflow-hidden p-8 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto size-20 rounded-full flex items-center justify-center mb-5 bg-teal-50 dark:bg-teal-900/30">
            <Icon icon="svg-spinners:3-dots-fade" className="text-4xl text-[#026E5F] dark:text-teal-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-850 dark:text-white mb-2">{t("Đang xác thực thanh toán")}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("Vui lòng không tắt hoặc tải lại trang này...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 p-4">
      <PaymentReceipt
        bookingId={txnRef}
        totalPrice={displayAmount}
        paymentMethod="vnpay"
        transactionId={transactionNo}
        paymentDate={fmtVnDate(payDate)}
        isSuccess={isSuccess}
        errorMessage={message}
        actions={
          <>
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Icon icon="material-symbols:home-outline" className="text-lg" />
              {t("Về trang chủ")}
            </Link>
            {isSuccess && (
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-350 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer"
              >
                <Icon icon="material-symbols:print-outline" className="text-sm" />
                {t("In hóa đơn")}
              </button>
            )}
            <Link to="/lich-su-dat-lich" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#026E5F] hover:bg-[#01564a] text-white text-xs font-bold transition-all">
              <Icon icon="material-symbols:calendar-today-outline" className="text-lg" />
              {t("Lịch đặt của tôi")}
            </Link>
          </>
        }
      />

      <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-5">
        <Icon icon="material-symbols:lock-outline" className="inline mr-1" />
        {t("Giao dịch được bảo mật bởi VNPay")}
      </p>
    </div>
  );
};
