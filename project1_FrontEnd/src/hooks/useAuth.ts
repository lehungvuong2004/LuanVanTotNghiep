import { useSelector } from "react-redux";

export const useAuth = () => {
  const auth = useSelector((state: any) => state.auth);

  const hasPermission = (permissionName: string): boolean => {
    if (!auth.user) return false;

    // Check flat permissions array at user root level first
    if (Array.isArray(auth.user.permissions) && auth.user.permissions.includes(permissionName)) {
      return true;
    }

    // Check nested role.permissions as fallback
    const permissions = auth.user.role?.permissions || [];
    return permissions.some((p: any) => {
      if (typeof p === "string") return p === permissionName;
      return p?.name === permissionName;
    });
  };

  return { token: auth.token, user: auth.user, isLoggedIn: !!auth.token, hasPermission };
};
