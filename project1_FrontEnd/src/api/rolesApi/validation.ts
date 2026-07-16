import * as Yup from "yup";

export const roleValidationSchema = Yup.object().shape({
  name: Yup.string().required("Vui lòng nhập tên vai trò").max(50, "Không quá 50 ký tự"),
  description: Yup.string().max(191, "Không quá 191 ký tự").nullable(),
  permissions: Yup.array().of(Yup.number()),
});
