import { usePostAJobHook } from "./useHook";
import { Icon } from "@iconify/react";

import { useTranslation } from "react-i18next";
import { formatMoneyInput } from "../../utils";
import { Link } from "react-router-dom";

const formatWorkingTime = (timeStr: string | null, t?: any) => {
  if (!timeStr) return "";
  const isoRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;
  const match = timeStr.match(isoRegex);
  if (match) {
    const [, year, month, day, hours, minutes] = match;
    const label = t ? t("job.day_unit") : "ngày";
    return `${hours}:${minutes} ${label} ${day}/${month}/${year}`;
  }
  return timeStr;
};

export const PostAJob = () => {
  const { formik, addresses, isNewAddress, selectedAddressId, handleAddressChange, isLoading, errorMsg, computedUrgency, geoLoading, geoError, handleGeoLocation, handlePreSubmit } = usePostAJobHook();
  const { t } = useTranslation();

  const renderAddressForm = () => (
    <div className="flex-1 w-full">
      <form
        onSubmit={(e) => {
          if (handlePreSubmit(e)) {
            formik.handleSubmit(e);
          }
        }}
        className="space-y-6"
      >
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-[#0d5c63] dark:text-teal-400 flex items-center gap-2 mb-6">
            <Icon icon="mdi:briefcase-outline" className="w-5 h-5" />
            {t("job.info")}
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1.5 text-sm">
                {t("job.title")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="jobTitle"
                placeholder={t("job.title_placeholder")}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all"
                value={formik.values.jobTitle}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.jobTitle && formik.errors.jobTitle && <p className="text-red-500 text-sm mt-1">{formik.errors.jobTitle}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1.5 text-sm">
                  {t("job.category")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customCategory"
                  placeholder={t("job.category_placeholder")}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all"
                  value={formik.values.customCategory}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.customCategory && formik.errors.customCategory && <p className="text-red-500 text-sm mt-1">{formik.errors.customCategory}</p>}
              </div>
              <div>
                <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1.5 text-sm">
                  {t("job.salary")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="salary"
                  placeholder={t("job.salary_placeholder")}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all"
                  value={formik.values.salary}
                  onChange={(e) => {
                    const formatted = formatMoneyInput(e.target.value);
                    formik.setFieldValue("salary", formatted);
                  }}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.salary && formik.errors.salary && <p className="text-red-500 text-sm mt-1">{formik.errors.salary}</p>}
              </div>
            </div>

            <div>
              <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1.5 text-sm">
                {t("job.required_services")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customServices"
                placeholder={t("job.required_services_placeholder")}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all text-gray-700"
                value={formik.values.customServices}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.customServices && formik.errors.customServices && <p className="text-red-500 text-sm mt-1">{formik.errors.customServices}</p>}
            </div>

            {/* Thời gian làm việc (ngày bắt đầu) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1.5 text-sm">
                  {t("job.working_time")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="workingTime"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all"
                  value={formik.values.workingTime}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.workingTime && formik.errors.workingTime && <p className="text-red-500 text-sm mt-1">{formik.errors.workingTime}</p>}
              </div>

              {/* Ngày hết hạn — người dùng tự chọn */}
              <div>
                <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1.5 text-sm">
                  {t("job.expiration_date")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="expirationDate"
                  min={formik.values.workingTime || undefined}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all"
                  value={formik.values.expirationDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.expirationDate && formik.errors.expirationDate && <p className="text-red-500 text-sm mt-1">{formik.errors.expirationDate}</p>}
              </div>
            </div>

            {/* Computed urgency badge + salary preview */}
            {(computedUrgency || formik.values.salary) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {computedUrgency && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${computedUrgency.bg}`}>
                    <Icon
                      icon={computedUrgency.level === "urgent" ? "material-symbols:bolt" : computedUrgency.level === "normal" ? "material-symbols:timer-outline" : "material-symbols:hourglass-bottom"}
                      className={`text-lg ${computedUrgency.color}`}
                    />
                    <span className={computedUrgency.color}>{t(computedUrgency.label)}</span>
                  </div>
                )}
                {formik.values.salary && computedUrgency && (
                  <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                      {t("job.salary_markup").replace("{pct}", Math.round((computedUrgency.multiplier - 1) * 100).toString())}
                    </span>
                    <span className="text-lg font-bold text-[#0d5c63] dark:text-teal-400">
                      {Math.round((Number(formik.values.salary.replace(/\D/g, "")) || 0) * computedUrgency.multiplier).toLocaleString("vi-VN")} VND
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Địa điểm làm việc */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-[#0d5c63] dark:text-teal-400 flex items-center gap-2 mb-6">
            <Icon icon="mdi:map-marker-outline" className="w-5 h-5" />
            {t("job.work_location")}
          </h2>

          {addresses.length > 0 && (
            <div className="mb-5">
              <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1.5 text-sm">{t("job.saved_addresses")}</label>
              <div className="relative">
                <select
                  value={selectedAddressId}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all appearance-none bg-white cursor-pointer"
                >
                  {addresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {`${addr.address}, ${addr.district ? (typeof addr.district === "object" ? (addr.district as any).name : addr.district) : ""}, ${addr.city ? (typeof addr.city === "object" ? (addr.city as any).name : addr.city) : ""}`}
                    </option>
                  ))}
                  <option value="new">{t("job.new_address_option")}</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
                  <Icon icon="mdi:chevron-down" className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          {/* Geolocation Autocomplete Button */}
          {isNewAddress && (
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGeoLocation}
                disabled={geoLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/80 rounded-xl text-sm sm:text-base font-bold transition-all duration-200 cursor-pointer shadow-xs hover:scale-[1.01] disabled:opacity-50"
              >
                {geoLoading ? <Icon icon="line-md:loading-twotone-loop" className="text-lg animate-spin" /> : <Icon icon="solar:gps-bold" className="text-lg" />}
                {t("job.locate_me")}
              </button>
              {geoError && <p className="text-red-500 text-xs font-semibold mt-1.5 text-center">{geoError}</p>}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1.5 text-sm">
                {t("job.specific_address")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="specificAddress"
                placeholder={t("job.specific_address_placeholder")}
                disabled={!isNewAddress}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all disabled:bg-gray-100 dark:disabled:bg-slate-600 disabled:text-gray-500"
                value={formik.values.specificAddress}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.specificAddress && formik.errors.specificAddress && <p className="text-red-500 text-sm mt-1">{formik.errors.specificAddress}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1.5 text-sm">
                  {t("job.district")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  placeholder={t("job.district_placeholder")}
                  disabled={!isNewAddress}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all disabled:bg-gray-100 dark:disabled:bg-slate-600 disabled:text-gray-500"
                  value={formik.values.district}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.district && formik.errors.district && <p className="text-red-500 text-sm mt-1">{formik.errors.district}</p>}
              </div>
              <div>
                <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1.5 text-sm">
                  {t("job.city")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder={t("job.city_placeholder")}
                  disabled={!isNewAddress}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all disabled:bg-gray-100 dark:disabled:bg-slate-600 disabled:text-gray-500"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.city && formik.errors.city && <p className="text-red-500 text-sm mt-1">{formik.errors.city}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Mô tả công việc */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-[#0d5c63] dark:text-teal-400 flex items-center gap-2 mb-6">
            <Icon icon="mdi:file-document-outline" className="w-5 h-5" />
            {t("job.description")}
          </h2>

          <div>
            <textarea
              name="jobDescription"
              rows={5}
              placeholder={t("job.description_placeholder")}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all resize-none"
              value={formik.values.jobDescription}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            ></textarea>
            {formik.touched.jobDescription && formik.errors.jobDescription && <p className="text-red-500 text-sm mt-1">{formik.errors.jobDescription}</p>}
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 text-sm text-red-800 rounded-xl bg-red-50 dark:bg-slate-800 dark:text-red-400 border border-red-200 dark:border-red-900 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <span>{errorMsg}</span>
            {errorMsg.includes("hoàn thiện hồ sơ") && (
              <Link
                to="/ho-so"
                className="px-4 py-1.5 bg-[#0d5c63] dark:bg-teal-500 hover:bg-[#0a4d52] dark:hover:bg-teal-600 text-white dark:text-slate-900 text-xs font-bold rounded-lg transition-colors whitespace-nowrap text-center"
              >
                {t("job.update_now")}
              </Link>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center md:justify-end gap-4 mt-8">
          <button
            type="button"
            disabled={isLoading}
            className="px-8 py-2.5 border border-[#0d5c63] dark:border-teal-400 text-[#0d5c63] dark:text-teal-400 rounded-full font-medium hover:bg-[#0d5c63]/5 dark:hover:bg-teal-500/10 transition-all text-sm cursor-pointer disabled:opacity-50"
            onClick={() => formik.resetForm()}
          >
            {t("job.cancel")}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-2.5 bg-[#1ab9bf] hover:bg-[#189ca0] text-white rounded-full cursor-pointer font-medium shadow-sm transition-all text-sm disabled:opacity-70 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Icon icon="line-md:loading-twotone-loop" className="w-4 h-4 animate-spin" />
                {t("job.posting")}
              </>
            ) : (
              t("job.post_button")
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderInformationForm = () => (
    <div className=" w-full sticky top-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-gray-700 overflow-hidden mb-5">
        <div className="h-32 bg-[#0d5c63] dark:bg-slate-700 relative">
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-[#0d5c63]/60 dark:bg-slate-900/60 mix-blend-multiply"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="px-5 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-full font-medium border border-white/30 text-sm tracking-wide">{t("job.preview")}</span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-sm border border-gray-200 dark:border-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f6a053]"></span>
              {t("job.pending")}
            </span>
            <span className="text-xs text-gray-400 font-medium">{t("Hôm nay")}</span>
          </div>

          <h3 className="text-lg font-bold text-[#0d5c63] dark:text-teal-400 mb-1 line-clamp-2 min-h-12 leading-snug">{formik.values.jobTitle || t("job.preview_title_placeholder")}</h3>
          <p className="text-[#0d5c63] dark:text-teal-400 text-sm font-medium mb-6">{formik.values.customCategory || t("job.preview_category_placeholder")}</p>

          <div className="space-y-3.5 text-sm text-gray-600 dark:text-gray-300 font-medium">
            <div className="flex items-center gap-3">
              <Icon icon="mdi:cash" className="w-5 h-5 text-[#0d5c63] dark:text-teal-400 shrink-0" />
              <span className="truncate">
                {formik.values.salary ? `${Math.round((Number(formik.values.salary.replace(/\D/g, "")) || 0) * (computedUrgency?.multiplier ?? 1.0)).toLocaleString()} VNĐ` : t("job.salary")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Icon icon="mdi:map-marker-outline" className="w-5 h-5 text-[#0d5c63] dark:text-teal-400 shrink-0" />
              <span className="truncate">{formik.values.district || formik.values.city ? [formik.values.district, formik.values.city].filter(Boolean).join(", ") : t("job.work_location")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Icon icon="mdi:clock-outline" className="w-5 h-5 text-[#0d5c63] dark:text-teal-400 shrink-0" />
              <span className="truncate">{formatWorkingTime(formik.values.workingTime, t) || t("job.working_time")}</span>
            </div>
            {formik.values.expirationDate && (
              <div className="flex items-center gap-3">
                <Icon icon="mdi:calendar-end" className="w-5 h-5 text-rose-500 shrink-0" />
                <span className="truncate text-rose-600 dark:text-rose-400 font-semibold">
                  {t("job.expire")}: {formatWorkingTime(formik.values.expirationDate, t)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Icon icon="mdi:calendar-plus-outline" className="w-5 h-5 text-[#0d5c63] dark:text-teal-400 shrink-0" />
              <span className="truncate">
                {t("job.posted_on")}: {new Date().toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-300/50 dark:bg-slate-800/50 border border-amber-200/60 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
        <div className="flex gap-3">
          <Icon icon="mdi:information-outline" className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-1.5 text-sm">{t("job.notice")}</h4>
            <p className="text-sm text-amber-700 dark:text-gray-300 leading-relaxed">{t("job.checking_note")}</p>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="w-full py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d5c63] dark:text-teal-400">{t("job.post_button")}</h1>
        <p className="text-gray-700 dark:text-gray-300 mt-2">{t("job.create_post_desc")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="col-span-7">{renderAddressForm()}</div>
        <div className="col-span-5">{renderInformationForm()}</div>
      </div>
    </div>
  );
};

export default PostAJob;
