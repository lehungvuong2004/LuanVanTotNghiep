import axiosInstance from "./axios";

export interface KPICardData {
  type: string;
  title?: string;
  value: number | string;
  change: string | number;
  isPositive: boolean;
  icon?: string;
  bgColor?: string;
  textColor?: string;
}

export interface BookingActivity {
  day: number | string;
  count: number;
}

export interface ServiceShare {
  name: string;
  value: number;
}

export interface RecentBooking {
  customer: string;
  service: string;
  date: string;
  price: number;
  status: "Completed" | "Confirmed" | "Pending" | "Cancelled";
}

export interface DashboardOverviewResponse {
  kpis: KPICardData[];
  weeklyBookings: BookingActivity[];
  serviceShares: ServiceShare[];
  recentBookings: RecentBooking[];
}

export const getDashboardOverview = async (): Promise<DashboardOverviewResponse> => {
  const response = await axiosInstance.get<DashboardOverviewResponse>("/orders/admin/dashboard-overview");
  // console.log(response.data);
  return response.data;
};
