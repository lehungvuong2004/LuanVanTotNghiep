export const ROLES = {
  ADMIN: 1,
  OPERATOR: 2,
  HELPER: 3,
  CUSTOMER: 4,
} as const;

export interface UserRolePayload {
  role_id?: number | string;
  role?: {
    id?: number;
    name?: string;
  };
}

export const getUserRole = (user: UserRolePayload | null | undefined): number | undefined => {
  if (!user) return undefined;

  const roleName = user.role?.name?.toLowerCase();
  if (roleName) {
    if (roleName === "admin") return ROLES.ADMIN;
    if (roleName === "operator") return ROLES.OPERATOR;
    if (roleName === "helper") return ROLES.HELPER;
    if (roleName === "customer") return ROLES.CUSTOMER;
  }

  const roleId = Number(user.role_id);
  if (roleId === ROLES.ADMIN) return ROLES.ADMIN;
  if (roleId === ROLES.OPERATOR) return ROLES.OPERATOR;
  if (roleId === ROLES.HELPER) return ROLES.HELPER;
  if (roleId === ROLES.CUSTOMER) return ROLES.CUSTOMER;

  return undefined;
};

export const getRoleName = (roleId: number | undefined): string => {
  if (!roleId) return "";
  if (roleId === ROLES.ADMIN) return "Quản trị viên";
  if (roleId === ROLES.OPERATOR) return "Nhân viên vận hành";
  if (roleId === ROLES.HELPER) return "Người giúp việc";
  if (roleId === ROLES.CUSTOMER) return "Khách hàng";
  return "";
};

export const getRoleDashboard = (roleId: number | undefined): string => {
  if (!roleId) return "/";
  if (roleId === ROLES.ADMIN) return "/admin";
  if (roleId === ROLES.OPERATOR) return "/operator";
  if (roleId === ROLES.HELPER) return "/helper";
  return "/";
};
