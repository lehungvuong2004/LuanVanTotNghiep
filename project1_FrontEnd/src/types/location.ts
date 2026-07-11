export interface GeoLocationAddress {
  house_number?: string;
  road?: string;
  highway?: string;
  neighbourhood?: string;
  suburb?: string;
  quarter?: string;
  city_district?: string;
  town?: string;
  village?: string;
  city?: string;
  municipality?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
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
