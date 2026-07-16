import * as Yup from "yup";

export const getServiceValidationSchema = (t: (key: string) => string = (key) => key) =>
  Yup.object().shape({
    category_id: Yup.number().required(t("Vui lòng chọn danh mục")).min(1, t("Vui lòng chọn danh mục")),
    name: Yup.string().required(t("Vui lòng nhập tên dịch vụ")).max(100, t("Không quá 100 ký tự")),
    description: Yup.string().nullable(),
    base_price: Yup.number()
      .required(t("Vui lòng nhập giá"))
      .test("price-range", t("Giá không hợp lệ"), function (value) {
        if (value === undefined || value === null) return false;
        const { price_type } = this.parent;
        if (price_type === "hourly") {
          if (value < 30000) {
            return this.createError({ message: t("Giá theo giờ tối thiểu là 30.000 VNĐ/giờ") });
          }
          if (value > 1000000) {
            return this.createError({ message: t("Giá theo giờ tối đa là 1.000.000 VNĐ/giờ") });
          }
        } else if (price_type === "daily") {
          if (value < 100000) {
            return this.createError({ message: t("Giá theo ngày tối thiểu là 100.000 VNĐ/ngày") });
          }
          if (value > 10000000) {
            return this.createError({ message: t("Giá theo ngày tối đa là 10.000.000 VNĐ/ngày") });
          }
        } else {
          if (value < 10000) {
            return this.createError({ message: t("Giá cố định tối thiểu là 10.000 VNĐ") });
          }
          if (value > 50000000) {
            return this.createError({ message: t("Giá cố định tối đa là 50.000.000 VNĐ") });
          }
        }
        return true;
      }),
    price_type: Yup.string().oneOf(["hourly", "fixed", "daily"]).required(),
    status: Yup.string().oneOf(["active", "inactive"]).required(),
  });

export const getCategoryValidationSchema = (t: (key: string) => string = (key) => key) =>
  Yup.object().shape({
    name: Yup.string().required(t("Vui lòng nhập tên danh mục")).max(100, t("Không quá 100 ký tự")),
    description: Yup.string().max(500, t("Không quá 500 ký tự")).nullable(),
    icon: Yup.string().max(255, t("Không quá 255 ký tự")).nullable(),
    type: Yup.string().oneOf(["booking", "job", "both"]).required(),
    status: Yup.string().oneOf(["active", "inactive"]).required(),
  });
