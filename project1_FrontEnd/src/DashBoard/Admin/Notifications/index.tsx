import { Icon } from "@iconify/react";
import { useNotificationsForm } from "./useHook";
import { useTranslation } from "react-i18next";
import { getRoleBadge } from "../../../utils";

export const Notifications = () => {
  const { t } = useTranslation();
  const { formik, selectedUserIds, usersList, searchQuery, setSearchQuery, fetchingUsers, toggleUserSelection, loading, targetOptions } = useNotificationsForm();

  // 1. Render Header
  const renderHeader = () => (
    <div className="text-left">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-0.5 animate-fade-in">{t("Gửi thông báo hệ thống")}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">{t("Soạn thảo và gửi thông báo, chương trình khuyến mãi hoặc cảnh báo bảo trì tới các nhóm người dùng.")}</p>
    </div>
  );

  // 2. Render Title Input
  const renderTitleInput = () => (
    <div className="space-y-1.5 text-left">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {t("Tiêu đề")} <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="title"
        value={formik.values.title}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        placeholder={t("Nhập tiêu đề thông báo...")}
        disabled={loading}
        className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-855 dark:text-slate-100 focus:outline-hidden focus:ring-2 transition-all text-sm ${
          formik.touched.title && formik.errors.title
            ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
            : "border-slate-250 dark:border-slate-650 focus:ring-[#026E5F]/20 focus:border-[#026E5F]"
        }`}
      />
      {formik.touched.title && formik.errors.title && <span className="text-xs text-red-500 font-medium block mt-0.5">{formik.errors.title}</span>}
    </div>
  );

  // 3. Render Message Textarea
  const renderMessageInput = () => (
    <div className="space-y-1.5 text-left">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {t("Nội dung")} <span className="text-red-500">*</span>
      </label>
      <textarea
        name="message"
        value={formik.values.message}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        placeholder={t("Nhập chi tiết nội dung thông báo...")}
        rows={4}
        disabled={loading}
        className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-855 dark:text-slate-100 focus:outline-hidden focus:ring-2 transition-all text-sm resize-none ${
          formik.touched.message && formik.errors.message
            ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
            : "border-slate-250 dark:border-slate-650 focus:ring-[#026E5F]/20 focus:border-[#026E5F]"
        }`}
      />
      {formik.touched.message && formik.errors.message && <span className="text-xs text-red-500 font-medium block mt-0.5">{formik.errors.message}</span>}
    </div>
  );

  // 4. Render Type Select
  const renderTypeSelect = () => (
    <div className="space-y-1.5 text-left">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{t("Loại thông báo")}</label>
      <div className="relative">
        <select
          name="type"
          value={formik.values.type}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={loading}
          className="w-full appearance-none px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-650 bg-slate-50 dark:bg-slate-900 text-slate-855 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#026E5F]/20 focus:border-[#026E5F] transition-all text-sm"
        >
          <option value="system">{t("Hệ thống")}</option>
          <option value="promotion">{t("Khuyến mãi")}</option>
          <option value="booking">{t("Đặt lịch")}</option>
          <option value="payment">{t("Thanh toán")}</option>
          <option value="report">{t("Báo cáo vi phạm")}</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
          <Icon icon="material-symbols:keyboard-arrow-down-rounded" className="text-xl" />
        </div>
      </div>
      {formik.touched.type && formik.errors.type && <span className="text-xs text-red-500 font-medium block mt-0.5">{formik.errors.type}</span>}
    </div>
  );

  // 5. Render Target Audience Option List
  const renderTargetAudience = () => (
    <div className="space-y-3 text-left">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{t("Gửi đến")}</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {targetOptions.map((opt) => (
          <label
            key={opt.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
              formik.values.targetType === opt.id
                ? "border-[#026E5F] bg-emerald-50/30 dark:bg-teal-950/20 text-[#026E5F] dark:text-teal-400 font-semibold"
                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-855 text-slate-600 dark:text-slate-400"
            }`}
          >
            <input
              type="radio"
              name="targetType"
              value={opt.id}
              checked={formik.values.targetType === opt.id}
              onChange={() => formik.setFieldValue("targetType", opt.id)}
              disabled={loading}
              className="w-4 h-4 text-[#026E5F] border-slate-355 focus:ring-[#026E5F] cursor-pointer"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>
      {formik.touched.targetType && formik.errors.targetType && <span className="text-xs text-red-500 font-medium block mt-0.5">{formik.errors.targetType}</span>}
    </div>
  );

  // 6. Render User Selection Grid (for Specific Recipients)
  const renderUserSelectionGrid = () => {
    if (formik.values.targetType !== "specific") return null;

    return (
      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 border-t border-slate-100 dark:border-slate-700 pt-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t("Chọn người dùng")} <span className="text-red-500">*</span>
          </label>
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">{t("Đã chọn: {{count}} người", { count: selectedUserIds.length })}</span>
        </div>

        {/* User Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("Tìm theo tên hoặc email...")}
            disabled={loading}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-650 bg-slate-50 dark:bg-slate-900 text-slate-855 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#026E5F]/20 focus:border-[#026E5F] transition-all text-sm"
          />
          <Icon icon="material-symbols:search-rounded" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
        </div>

        {/* Users Grid Container */}
        <div className="relative border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 p-2">
          {fetchingUsers && usersList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <Icon icon="line-md:loading-twotone-loop" className="text-3xl text-[#026E5F]" />
              <span className="text-xs text-slate-400">{t("Đang tải danh sách...")}</span>
            </div>
          ) : usersList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Icon icon="material-symbols:person-off-outline-rounded" className="text-3xl mb-1.5" />
              <span className="text-xs">{t("Không tìm thấy người dùng hoạt động.")}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1">
              {usersList.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);

                return (
                  <div
                    key={user.id}
                    onClick={() => !loading && toggleUserSelection(user.id)}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                      isSelected
                        ? "border-[#026E5F] bg-emerald-50/20 dark:bg-teal-950/20"
                        : "border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="mt-0.5">
                      <Icon
                        icon={isSelected ? "material-symbols:check-box-rounded" : "material-symbols:check-box-outline-blank-rounded"}
                        className={`text-xl ${isSelected ? "text-[#026E5F]" : "text-slate-350 dark:text-slate-650"}`}
                      />
                    </div>

                    {/* User Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.full_name}</span>
                        <span className="text-xs font-mono text-slate-400">#{user.id}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      <div className="pt-0.5">{getRoleBadge(user.role)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 7. Render Submit Button
  const renderSubmitButton = () => (
    <div className="pt-2">
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-[#026E5F] hover:bg-[#02564a] active:bg-[#014138] disabled:bg-[#026E5F]/55 dark:disabled:bg-[#026E5F]/30 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all text-sm"
      >
        {loading ? (
          <>
            <Icon icon="line-md:loading-twotone-loop" className="text-xl" />
            <span>{t("Đang gửi...")}</span>
          </>
        ) : (
          <>
            <Icon icon="material-symbols:send-rounded" className="text-xl" />
            <span>{t("Gửi thông báo")}</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="flex-1 p-6 w-full max-w-8xl mx-auto space-y-6">
      {renderHeader()}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 md:p-8 max-w-8xl mx-auto">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {renderTitleInput()}
          {renderMessageInput()}
          {renderTypeSelect()}
          {renderTargetAudience()}
          {renderUserSelectionGrid()}
          {renderSubmitButton()}
        </form>
      </div>
    </div>
  );
};

export default Notifications;
