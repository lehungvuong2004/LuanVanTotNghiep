import * as Yup from "yup";

export const getProfileInfoSchema = (t: any) =>
  Yup.object({
    full_name: Yup.string()
      .required(t("Vui lòng nhập họ và tên"))
      .min(2, t("Họ và tên phải có ít nhất 2 ký tự"))
      .max(100, t("Họ và tên không vượt quá 100 ký tự")),
    phone: Yup.string()
      .nullable()
      .test("is-phone", t("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09)"), (value) => {
        if (!value) return true; 
        const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
        return phoneRegex.test(value);
      }),
    avatar: Yup.string().nullable().max(191, t("Đường dẫn ảnh quá dài")),
    gender: Yup.string().oneOf(["male", "female", "other"]).nullable(),
    birthday: Yup.date()
      .nullable()
      .test("is-18", t("Bạn phải từ 18 tuổi trở lên"), (value) => {
        if (!value) return true;
        const cutoff = new Date();
        cutoff.setFullYear(cutoff.getFullYear() - 18);
        return new Date(value) <= cutoff;
      }),
    note: Yup.string().max(191, t("Ghi chú không quá 191 ký tự")).nullable(),
    bio: Yup.string().nullable().max(1000, t("Giới thiệu không quá 1000 ký tự")),
    experience_year: Yup.number().nullable().min(0, t("Kinh nghiệm phải lớn hơn hoặc bằng 0")),
    address: Yup.string().nullable().max(255, t("Địa chỉ không quá 255 ký tự"))
  });

export const getProfilePasswordSchema = (t: any) =>
  Yup.object({
    currentPassword: Yup.string()
      .required(t("Vui lòng nhập mật khẩu hiện tại")),
    password: Yup.string()
      .required(t("Vui lòng nhập mật khẩu mới"))
      .notOneOf([Yup.ref("currentPassword")], t("Mật khẩu mới không được trùng với mật khẩu hiện tại"))
      .min(6, t("Mật khẩu phải có ít nhất 6 ký tự"))
      .max(32, t("Mật khẩu không được vượt quá 32 ký tự"))
      .test("no-space", t("Mật khẩu không được chứa khoảng trắng"), (val) => !/\s/.test(val || ""))
      .test("has-upper", t("Mật khẩu phải chứa ít nhất 1 chữ in hoa"), (val) => /[A-Z]/.test(val || ""))
      .test("has-lower", t("Mật khẩu phải chứa ít nhất 1 chữ in thường"), (val) => /[a-z]/.test(val || ""))
      .test("has-digit", t("Mật khẩu phải chứa ít nhất 1 chữ số"), (val) => /[0-9]/.test(val || "")),
    confirmPassword: Yup.string()
      .required(t("Vui lòng xác nhận mật khẩu mới"))
      .oneOf([Yup.ref("password")], t("Mật khẩu xác nhận không khớp"))
  });

export const getProfileAddressSchema = (t: any) =>
  Yup.object({
    address: Yup.string().required(t("Vui lòng nhập địa chỉ cụ thể")).max(255, t("Địa chỉ không vượt quá 255 ký tự")),
    district: Yup.string().required(t("Vui lòng nhập quận/huyện")).max(100, t("Quận/huyện không vượt quá 100 ký tự")),
    city: Yup.string().required(t("Vui lòng nhập tỉnh/thành phố")).max(100, t("Tỉnh/thành phố không vượt quá 100 ký tự")),
    is_default: Yup.boolean()
  });
