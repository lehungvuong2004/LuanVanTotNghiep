import { useState, useEffect } from "react";

export const useAuth = () => {
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [user, setUser] = useState(() => {
    const userString = localStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("access_token"));
      const userString = localStorage.getItem("user");
      setUser(userString ? JSON.parse(userString) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const hasPermission = (permissionName: string): boolean => {
    if (!user) return false;

    // Remove hardcoded Admin bypass so RBAC is strictly driven by the database

    // Check flat permissions array at user root level first
    if (Array.isArray(user.permissions) && user.permissions.includes(permissionName)) {
      return true;
    }

    // Check nested role.permissions as fallback
    const permissions = user.role?.permissions || [];
    return permissions.some((p: any) => {
      if (typeof p === "string") return p === permissionName;
      return p?.name === permissionName;
    });
  };

  return { token, user, isLoggedIn: !!token, hasPermission };
};
