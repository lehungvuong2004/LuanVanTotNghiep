import { useNavigate } from "react-router-dom";

export const useLogout = (onLogout?: () => void) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    onLogout?.();
    sessionStorage.setItem("show_logout_toast", "true");
    navigate("/");
  };

  return { logout };
};
