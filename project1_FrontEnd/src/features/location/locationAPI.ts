import axios from "axios";
import type { ReverseGeocodeResponse } from "../../types/location";

export const fetchReverseGeocoding = async (lat: number, lon: number): Promise<ReverseGeocodeResponse> => {
  const response = await axios.get<ReverseGeocodeResponse>(
    `https://nominatim.openstreetmap.org/reverse`,
    {
      params: {
        lat,
        lon,
        format: "json",
        "accept-language": "vi,en",
      },
      headers: {
        "User-Agent": "GiaDinhViet-App",
      }
    }
  );
  return response.data;
};
