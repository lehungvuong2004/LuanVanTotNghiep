import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutSuccess } from "../redux/authSlice";

export const useLogout = (onLogout?: () => void) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    dispatch(logoutSuccess());
    onLogout?.();
    sessionStorage.setItem("show_logout_toast", "true");
    navigate("/");
  };

  return { logout };
};
