export interface GeoLocationAddress {
  house_number?: string;
  road?: string;
  suburb?: string;
  quarter?: string;
  city_district?: string;
  town?: string;
  village?: string;
  city?: string;
  municipality?: string;
  county?: string;
  state?: string;
  province?: string;
  postcode?: string;
  country?: string;
}

export interface ReverseGeocodeResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: GeoLocationAddress;
  boundingbox: string[];
}

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  addressDetails: GeoLocationAddress | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export const parseVietnamAddress = (addressDetails?: GeoLocationAddress | null, rawDisplayName?: string | null) => {
  if (!addressDetails && !rawDisplayName) {
    return { specificAddress: "", district: "", city: "" };
  }

  const details = addressDetails || {};

  // User requested: Do NOT auto-fill specificAddress (leave empty for manual user input)
  const specificAddress = "";

  // 1. City / Province (Tỉnh / Thành phố)
  let city = details.city || details.state || details.province || details.municipality || "";

  // 2. District (Quận / Huyện)
  let district = details.city_district || details.county || "";

  // Clean district if it duplicates city or starts with centrally-governed city name
  if (
    district &&
    city &&
    (district.trim().toLowerCase() === city.trim().toLowerCase() || district.trim().toLowerCase().startsWith("thành phố hồ chí minh") || district.trim().toLowerCase().startsWith("thành phố hà nội"))
  ) {
    district = "";
  }

  // Extract District accurately from rawDisplayName
  if (rawDisplayName) {
    const parts = rawDisplayName.split(",").map((p) => p.trim());

    // Search for part starting with District keywords: Quận, Huyện, Thị xã, TP.
    const foundDist = parts.find((p) => {
      const lower = p.toLowerCase();
      return lower.startsWith("quận ") || lower.startsWith("huyện ") || lower.startsWith("thị xã ") || (lower.startsWith("tp.") && !lower.includes("hồ chí minh") && !lower.includes("hà nội"));
    });

    if (foundDist) {
      district = foundDist;
    } else if (!district || district.toLowerCase().startsWith("xã ") || district.toLowerCase().startsWith("phường ") || district.toLowerCase().startsWith("thị trấn ")) {
      // If district is missing or is a Ward (Xã / Phường), take candidate before City in parts
      const cityClean = city.toLowerCase().replace("thành phố", "").replace("tỉnh", "").trim();
      const cityIdx = parts.findIndex((p) => cityClean && p.toLowerCase().includes(cityClean));
      if (cityIdx > 0) {
        district = parts[cityIdx - 1];
      }
    }
  }

  return {
    specificAddress,
    district,
    city,
  };
};
