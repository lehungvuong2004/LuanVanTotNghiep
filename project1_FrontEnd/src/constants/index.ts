export const ROLES = {
  ADMIN: 1,
  OPERATOR: 2,
  HELPER: 3,
  CUSTOMER: 4,
} as const;

export const getRoleName = (roleId: number): string => {
  if (roleId === ROLES.ADMIN) return "Quản trị viên";
  if (roleId === ROLES.OPERATOR) return "Nhân viên vận hành";
  if (roleId === ROLES.HELPER) return "Người giúp việc";
  if (roleId === ROLES.CUSTOMER) return "Khách hàng";
  return "";
};

export const getRoleDashboard = (roleId: number): string => {
  if (roleId === ROLES.ADMIN) return "/admin";
  if (roleId === ROLES.OPERATOR) return "/operator";
  if (roleId === ROLES.HELPER) return "/helper";
  return "/";
};
