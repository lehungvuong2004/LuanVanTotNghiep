import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import { useHistory } from "./useHook";
import type { Booking, StatusFilter } from "./useHook";
import { Pagination } from "../../components/Pagination";
import { Toast } from "../../components/Toast";

export const HistoryPage = () => {
  const { t } = useTranslation();
  const { statusFilter, setStatusFilter, currentPage, setCurrentPage, paginatedBookings, totalItems, itemsPerPage, handleCancelBooking, toast, setToast } = useHistory();

  const tabs: { label: string; value: StatusFilter }[] = [
    { label: "Tất cả", value: "all" },
    { label: "Sắp tới", value: "upcoming" },
    { label: "Đã hoàn thành", value: "completed" },
    { label: "Đã hủy", value: "cancelled" },
  ];

  // Helper: Get icon for specific service
  const getServiceIcon = (serviceName: string) => {
    switch (serviceName) {
      case "Dọn dẹp nhà cửa":
        return "material-symbols:home-outline";
      case "Vệ sinh máy lạnh":
        return "material-symbols:ac-unit";
      case "Tổng vệ sinh nhà cửa":
        return "material-symbols:cleaning-services-outline";
      case "Nấu ăn gia đình":
        return "material-symbols:restaurant";
      case "Giặt ủi":
        return "material-symbols:local-laundry-service-outline";
      case "Chăm sóc người già":
        return "material-symbols:medical-services-outline";
      case "Trông trẻ em":
        return "material-symbols:child-care";
      default:
        return "material-symbols:cleaning-services-outline";
    }
  };

  // Helper: Get diverse color configurations for service badges
  const getServiceColorConfig = (serviceName: string) => {
    switch (serviceName) {
      case "Dọn dẹp nhà cửa":
      case "Vệ sinh máy lạnh":
      case "Tổng vệ sinh nhà cửa":
        return {
          bg: "bg-teal-100/80 dark:bg-teal-950/45",
          text: "text-teal-800 dark:text-teal-300",
          border: "border-teal-200 dark:border-teal-900/60",
        };
      case "Nấu ăn gia đình":
        return {
          bg: "bg-amber-100/80 dark:bg-amber-950/45",
          text: "text-amber-850 dark:text-amber-300",
          border: "border-amber-200 dark:border-amber-900/60",
        };
      case "Giặt ủi":
        return {
          bg: "bg-purple-100/80 dark:bg-purple-950/45",
          text: "text-purple-850 dark:text-purple-300",
          border: "border-purple-200 dark:border-purple-900/60",
        };
      case "Chăm sóc người già":
        return {
          bg: "bg-sky-100/80 dark:bg-sky-950/45",
          text: "text-sky-850 dark:text-sky-300",
          border: "border-sky-200 dark:border-sky-900/60",
        };
      case "Trông trẻ em":
        return {
          bg: "bg-rose-100/80 dark:bg-rose-950/45",
          text: "text-rose-850 dark:text-rose-300",
          border: "border-rose-200 dark:border-rose-900/60",
        };
      default:
        return {
          bg: "bg-slate-50/70 dark:bg-slate-800/40",
          text: "text-slate-700 dark:text-slate-400",
          border: "border-slate-100 dark:border-slate-700/50",
        };
    }
  };

  const renderHeader = () => (
    <div className="text-left mb-2">
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">{t("Lịch sử đặt lịch")}</h1>
      <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">{t("Quản lý và xem lại các dịch vụ bạn đã sử dụng.")}</p>
    </div>
  );

  const renderTabs = () => (
    <div className="flex border-b border-gray-200 dark:border-gray-700/60 overflow-x-auto pb-px scrollbar-none">
      {tabs.map((tab) => {
        const isActive = statusFilter === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`py-3.5 px-6 text-sm font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              isActive ? "border-[#026E5F] text-[#026E5F] dark:border-teal-400 dark:text-teal-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            {t(tab.label)}
          </button>
        );
      })}
    </div>
  );

  const renderTableHead = () => (
    <thead>
      <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
        <th className="px-6 py-4.5 text-sm font-bold text-slate-750 dark:text-white border-r last:border-r-0 border-slate-200 dark:border-slate-700 text-left">{t("Mã đặt lịch")}</th>
        <th className="px-6 py-4.5 text-sm font-bold text-slate-750 dark:text-white border-r last:border-r-0 border-slate-200 dark:border-slate-700 text-left">{t("Dịch vụ")}</th>
        <th className="px-6 py-4.5 text-sm font-bold text-slate-750 dark:text-white border-r last:border-r-0 border-slate-200 dark:border-slate-700 text-left">{t("Nhân viên")}</th>
        <th className="px-6 py-4.5 text-sm font-bold text-slate-750 dark:text-white border-r last:border-r-0 border-slate-200 dark:border-slate-700 text-left">{t("Ngày / Giờ")}</th>
        <th className="px-6 py-4.5 text-sm font-bold text-slate-750 dark:text-white border-r last:border-r-0 border-slate-200 dark:border-slate-700 text-left">{t("Tổng tiền")}</th>
        <th className="px-6 py-4.5 text-sm font-bold text-slate-750 dark:text-white border-r last:border-r-0 border-slate-200 dark:border-slate-700 text-left">{t("Trạng thái")}</th>
        <th className="px-6 py-4.5 text-sm font-bold text-slate-750 dark:text-white border-r last:border-r-0 border-slate-200 dark:border-slate-700 text-center">{t("Thao tác")}</th>
      </tr>
    </thead>
  );

  const renderTableRow = (booking: Booking) => {
    const config = getServiceColorConfig(booking.serviceName);

    return (
      <tr key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors duration-200">
        {/* Booking ID */}
        <td className="px-6 py-4.5 whitespace-nowrap border-r last:border-r-0 border-slate-200 dark:border-slate-750">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{booking.id}</span>
        </td>

        {/* Service Name */}
        <td className="px-6 py-4.5 whitespace-nowrap border-r last:border-r-0 border-slate-200 dark:border-slate-750">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${config.bg} ${config.text} border ${config.border}`}>
              <Icon icon={getServiceIcon(booking.serviceName)} className="text-base" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-250">{t(booking.serviceName)}</span>
          </div>
        </td>

        {/* Employee */}
        <td className="px-6 py-4.5 whitespace-nowrap border-r last:border-r-0 border-slate-200 dark:border-slate-750">
          <div className="flex items-center gap-3">
            <img src={booking.helper.avatar} alt={booking.helper.name} className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-slate-700" />
            <span className="text-sm font-semibold text-slate-750 dark:text-slate-300">{booking.helper.name}</span>
          </div>
        </td>

        {/* Date / Time */}
        <td className="px-6 py-4.5 whitespace-nowrap border-r last:border-r-0 border-slate-200 dark:border-slate-750">
          <div className="flex flex-col text-sm text-left">
            <span className="font-semibold text-slate-750 dark:text-slate-300">{booking.date}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{booking.time}</span>
          </div>
        </td>

        {/* Price */}
        <td className="px-6 py-4.5 whitespace-nowrap border-r last:border-r-0 border-slate-200 dark:border-slate-750">
          <span className="text-sm font-extrabold text-[#026E5F] dark:text-teal-400">{booking.totalPrice}</span>
        </td>

        {/* Status */}
        <td className="px-6 py-4.5 whitespace-nowrap border-r last:border-r-0 border-slate-200 dark:border-slate-750">
          {booking.status === "upcoming" && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100/90 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900/30">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5 animate-pulse" />
              {t("Sắp tới")}
            </span>
          )}
          {booking.status === "completed" && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100/90 text-green-800 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-900/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1.5" />
              {t("Hoàn thành")}
            </span>
          )}
          {booking.status === "cancelled" && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100/90 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-655 mr-1.5" />
              {t("Đã hủy")}
            </span>
          )}
        </td>

        {/* Action buttons */}
        <td className="px-6 py-4.5 whitespace-nowrap border-r last:border-r-0 border-slate-200 dark:border-slate-750 text-center">
          <div className="flex items-center justify-center gap-2">
            {booking.status === "upcoming" ? (
              <button
                onClick={() => handleCancelBooking(booking)}
                title={t("Hủy lịch")}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-650 transition-colors cursor-pointer dark:bg-red-950/30 dark:hover:bg-red-900/40 dark:text-red-400 hover:scale-105"
              >
                <Icon icon="material-symbols:cancel-outline" className="text-lg" />
              </button>
            ) : (
              <button
                onClick={() => handleCancelBooking(booking)}
                title={t("Không thể hủy")}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 dark:bg-slate-900/50 dark:hover:bg-slate-700/50 dark:text-slate-500 transition-colors cursor-pointer hover:scale-105"
              >
                <Icon icon="material-symbols:cancel-outline" className="text-lg" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const renderTable = () => (
    <div className="bg-white dark:bg-slate-850 rounded-3xl border border-slate-200 dark:border-slate-750 shadow-md overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          {renderTableHead()}
          <tbody className="divide-y divide-slate-200 dark:divide-slate-750">
            {paginatedBookings.map((booking) => renderTableRow(booking))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-750 px-6 py-4">
        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
      </div>
    </div>
  );

  const renderEmpty = () => (
    <div className="py-16 px-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900/40 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 border border-slate-100 dark:border-slate-700/30">
        <Icon icon="material-symbols:calendar-today-outline-rounded" className="text-3xl" />
      </div>
      <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">{t("Không tìm thấy lịch sử đặt lịch nào")}</h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs leading-normal">{t("Vui lòng thử lại với các tiêu chí hoặc bộ lọc trạng thái khác.")}</p>
    </div>
  );

  return (
    <div className="w-full min-h-screen dark:bg-slate-900 transition-colors duration-300 py-12">
      <div className="flex flex-col gap-8">
        {renderHeader()}
        {renderTabs()}

        {/* Content Section */}
        {totalItems > 0 ? (
          renderTable()
        ) : (
          renderEmpty()
        )}
      </div>

      {toast && <Toast type={toast.type} title={t(toast.title)} message={t(toast.message)} onClose={() => setToast(null)} />}
    </div>
  );
};
