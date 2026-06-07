import { usePostAJobHook } from "./useHook";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

export default function PostAJob() {
  const { formik, serviceCategories, requiredServicesOptions, handleRequiredServiceToggle } = usePostAJobHook();
  const { t } = useTranslation();

  const renderAddressForm = () => (
    <div className="flex-1 w-full">
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-[#0d5c63] dark:text-teal-400 flex items-center gap-2 mb-6">
            <Icon icon="mdi:briefcase-outline" className="w-5 h-5" />
            {t("Thông tin công việc")}
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1.5 text-sm">
                {t("Tiêu đề bài tuyển")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="jobTitle"
                placeholder={t("Ví dụ: Cần người giúp việc nhà theo giờ")}
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
                  {t("Danh mục dịch vụ")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="serviceCategory"
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all appearance-none bg-white"
                    value={formik.values.serviceCategory}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    {serviceCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {t(cat.label)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
                    <Icon icon="mdi:chevron-down" className="w-5 h-5" />
                  </div>
                </div>
                {formik.touched.serviceCategory && formik.errors.serviceCategory && <p className="text-red-500 text-sm mt-1">{formik.errors.serviceCategory}</p>}
              </div>
              <div>
                <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1.5 text-sm">
                  {t("Mức lương")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="salary"
                  placeholder={t("Ví dụ: 5.000.000 VNĐ/tháng")}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all"
                  value={formik.values.salary}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.salary && formik.errors.salary && <p className="text-red-500 text-sm mt-1">{formik.errors.salary}</p>}
              </div>
            </div>

            <div>
              <label className="block text-gray-800 dark:text-gray-200 font-medium mb-2 text-sm">{t("Dịch vụ cần tuyển")}</label>
              <div className="flex flex-wrap gap-2.5">
                {requiredServicesOptions.map((service) => {
                  const isSelected = formik.values.requiredServices.includes(service.value as never);
                  return (
                    <button
                      key={service.value}
                      type="button"
                      onClick={() => handleRequiredServiceToggle(service.value)}
                      className={`px-5 py-1.5 rounded-full border text-sm transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#0d5c63]/10 border-[#0d5c63] dark:bg-teal-500/20 dark:border-teal-400 dark:text-teal-400 text-[#0d5c63] font-medium"
                          : "bg-white dark:bg-slate-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                    >
                      {t(service.label)}
                    </button>
                  );
                })}
              </div>
              {formik.touched.requiredServices && formik.errors.requiredServices && <p className="text-red-500 text-sm mt-1">{formik.errors.requiredServices as string}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1.5 text-sm">
                  {t("Thời gian làm việc")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="workingTime"
                  placeholder={t("Ví dụ: Thứ 2 - Thứ 6, 8:00 - 17:00")}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all"
                  value={formik.values.workingTime}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.workingTime && formik.errors.workingTime && <p className="text-red-500 text-sm mt-1">{formik.errors.workingTime}</p>}
              </div>
              <div>
                <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1.5 text-sm">{t("Ngày hết hạn tuyển dụng")}</label>
                <div className="relative">
                  <input
                    type="date"
                    name="expirationDate"
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all text-gray-700 dark:text-gray-200"
                    value={formik.values.expirationDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {formik.touched.expirationDate && formik.errors.expirationDate && <p className="text-red-500 text-sm mt-1">{formik.errors.expirationDate}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Địa điểm làm việc */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-[#0d5c63] dark:text-teal-400 flex items-center gap-2 mb-6">
            <Icon icon="mdi:map-marker-outline" className="w-5 h-5" />
            {t("Địa điểm làm việc")}
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1.5 text-sm">
                {t("Địa chỉ cụ thể")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="specificAddress"
                placeholder={t("Số nhà, tên đường...")}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all"
                value={formik.values.specificAddress}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.specificAddress && formik.errors.specificAddress && <p className="text-red-500 text-sm mt-1">{formik.errors.specificAddress}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1.5 text-sm">
                  {t("Quận/Huyện")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  placeholder={t("VD: Quận 1")}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all"
                  value={formik.values.district}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.district && formik.errors.district && <p className="text-red-500 text-sm mt-1">{formik.errors.district}</p>}
              </div>
              <div>
                <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1.5 text-sm">
                  {t("Thành phố")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder={t("VD: TP. Hồ Chí Minh")}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all"
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
            {t("Mô tả công việc")}
          </h2>

          <div>
            <textarea
              name="jobDescription"
              rows={4}
              placeholder={t("Mô tả công việc, yêu cầu, quyền lợi...")}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-1 focus:ring-[#0d5c63] dark:focus:ring-teal-500 focus:border-[#0d5c63] outline-none transition-all resize-none"
              value={formik.values.jobDescription}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            ></textarea>
            {formik.touched.jobDescription && formik.errors.jobDescription && <p className="text-red-500 text-sm mt-1">{formik.errors.jobDescription}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center md:justify-end gap-4 mt-8">
          <button
            type="button"
            className="px-8 py-2.5 border border-[#0d5c63] dark:border-teal-400 text-[#0d5c63] dark:text-teal-400 rounded-full font-medium hover:bg-[#0d5c63]/5 dark:hover:bg-teal-500/10 transition-all text-sm cursor-pointer"
            onClick={() => formik.resetForm()}
          >
            {t("Hủy")}
          </button>
          <button type="submit" className="px-8 py-2.5 bg-amber-600 hover:bg-[#e5934a] text-white rounded-full cursor-pointer font-medium shadow-sm transition-all text-sm">
            {t("Đăng bài tuyển dụng")}
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
            <span className="px-5 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-full font-medium border border-white/30 text-sm tracking-wide">{t("Bản xem trước")}</span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-sm border border-gray-200 dark:border-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f6a053]"></span>
              {t("Chờ duyệt")}
            </span>
            <span className="text-xs text-gray-400 font-medium">{t("Hôm nay, 30/5")}</span>
          </div>

          <h3 className="text-[17px] font-bold text-[#0d5c63] dark:text-teal-400 mb-1 line-clamp-2 min-h-[50px] leading-snug">{formik.values.jobTitle || t("Tiêu đề bài đăng của bạn")}</h3>
          <p className="text-[#0d5c63] dark:text-teal-400 text-sm font-medium mb-6">{t(serviceCategories.find((c) => c.value === formik.values.serviceCategory)?.label || "Dọn dẹp nhà cửa")}</p>

          <div className="space-y-3.5 text-[13px] text-gray-600 dark:text-gray-300 font-medium">
            <div className="flex items-center gap-3">
              <Icon icon="mdi:cash" className="w-5 h-5 text-[#0d5c63] dark:text-teal-400 shrink-0" />
              <span className="truncate">{formik.values.salary || t("Mức lương")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Icon icon="mdi:map-marker-outline" className="w-5 h-5 text-[#0d5c63] dark:text-teal-400 shrink-0" />
              <span className="truncate">{formik.values.district || formik.values.city ? [formik.values.district, formik.values.city].filter(Boolean).join(", ") : t("Địa điểm làm việc")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Icon icon="mdi:clock-outline" className="w-5 h-5 text-[#0d5c63] dark:text-teal-400 shrink-0" />
              <span className="truncate">{formik.values.workingTime || t("Thời gian làm việc")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#fcfaf8] dark:bg-slate-800 border border-[#f5e6da] dark:border-gray-700 rounded-2xl p-5 shadow-sm">
        <div className="flex gap-3">
          <Icon icon="mdi:information-outline" className="w-5 h-5 text-[#f6a053] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1.5 text-sm">{t("Lưu ý")}</h4>
            <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed">{t("Bài đăng sẽ được kiểm duyệt trước khi hiển thị để đảm bảo an toàn cho cộng đồng.")}</p>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="w-full px-4 md:px-16 mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d5c63] dark:text-teal-400">{t("Đăng bài tuyển dụng")}</h1>
        <p className="text-gray-700 dark:text-gray-300 mt-2">{t("Tạo bài tuyển dụng để tìm người giúp việc phù hợp cho gia đình bạn.")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="col-span-7">{renderAddressForm()}</div>
        <div className="col-span-5">{renderInformationForm()}</div>
        {/* Preview Section */}
      </div>
    </div>
  );
}
