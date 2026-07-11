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

  return { token, user, isLoggedIn: !!token };
};
