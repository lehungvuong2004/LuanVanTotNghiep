import type { ReverseGeocodeResponse } from "../../types/location";

export const fetchReverseGeocoding = async (lat: number, lon: number): Promise<ReverseGeocodeResponse> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=vi`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: ReverseGeocodeResponse = await response.json();
    return data;
  } catch (err: any) {
    console.warn("Nominatim fetch failed, trying fallback API...", err);
    try {
      const fallbackUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=vi`;
      const fallbackRes = await fetch(fallbackUrl);
      if (!fallbackRes.ok) throw new Error("Fallback failed", { cause: err });
      const bgData = await fallbackRes.json();

      const adminList = bgData.localityInfo?.administrative || [];
      const distObj = adminList.find((a: any) => a.adminLevel === 6 || a.adminLevel === 7) || {};
      const provObj = adminList.find((a: any) => a.adminLevel === 4) || {};

      return {
        place_id: 0,
        licence: "",
        osm_type: "",
        osm_id: 0,
        lat: String(lat),
        lon: String(lon),
        display_name: [bgData.locality, distObj.name, provObj.name || bgData.principalSubdivision].filter(Boolean).join(", "),
        address: {
          road: bgData.locality || "",
          city_district: distObj.name || "",
          county: distObj.name || "",
          city: provObj.name || bgData.principalSubdivision || bgData.city || "",
          state: provObj.name || bgData.principalSubdivision || "",
        },
        boundingbox: [],
      };
    } catch (fallbackErr) {
      throw new Error("Không thể định vị địa chỉ do lỗi kết nối mạng. Vui lòng thử lại.", { cause: fallbackErr });
    }
  }
};
