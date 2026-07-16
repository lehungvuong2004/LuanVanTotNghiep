import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hook";
import { setLocation, setLocationError, reverseGeocode, clearLocation } from "../features/location/locationSlice";

export const useGeolocation = () => {
  const dispatch = useAppDispatch();
  const { latitude, longitude, address, addressDetails, status, error } = useAppSelector((state) => state.location);

  const getCurrentLocation = useCallback(
    (options?: PositionOptions) => {
      if (!navigator.geolocation) {
        dispatch(setLocationError("Trình duyệt không hỗ trợ Geolocation"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          dispatch(setLocation({ latitude: lat, longitude: lon }));
          dispatch(reverseGeocode({ lat, lon }));
        },
        (err) => {
          let msg = "Lỗi khi định vị vị trí";
          switch (err.code) {
            case err.PERMISSION_DENIED:
              msg = "Người dùng từ chối quyền truy cập Vị trí";
              break;
            case err.POSITION_UNAVAILABLE:
              msg = "Thông tin vị trí không khả dụng";
              break;
            case err.TIMEOUT:
              msg = "Yêu cầu định vị vị trí đã quá thời gian";
              break;
          }
          dispatch(setLocationError(msg));
        },
        options,
      );
    },
    [dispatch],
  );

  return {
    latitude,
    longitude,
    address,
    addressDetails,
    loading: status === "loading",
    error,
    getCurrentLocation,
    clearLocation: () => dispatch(clearLocation()),
  };
};
