export const ROLES = {
  ADMIN: 1,
  OPERATOR: 2,
  HELPER: 3,
  CUSTOMER: 4,
};

export const getRoleName = (roleId) => {
  if (roleId === ROLES.ADMIN) return "Quản trị viên";
  if (roleId === ROLES.OPERATOR) return "Nhân viên vận hành";
  if (roleId === ROLES.HELPER) return "Người giúp việc";
  if (roleId === ROLES.CUSTOMER) return "Khách hàng";
  return "";
};

export const getRoleDashboard = (roleId)=> {
  if (roleId === ROLES.ADMIN) return "/admin";
  if (roleId === ROLES.OPERATOR) return "/operator";
  if (roleId === ROLES.HELPER) return "/helper";
  return "/";
};
