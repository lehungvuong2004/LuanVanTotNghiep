import { useState } from "react";

export interface ServiceItem {
  id: number;
  title: string;
  category: string;
  rating: number;
  reviewsCount: number;
  price: number;
  priceType: string;
  area: string;
  helpersCount: number;
  description: string;
  image?: string;
  isFavorite?: boolean;
}

export interface HelperItem {
  id: number;
  name: string;
  rating: number;
  experienceYears: number;
  area: string;
  tags: string[];
  avatar?: string;
  isOnline?: boolean;
}

export const useService = () => {
  // Mock Services Data
  const [services] = useState<ServiceItem[]>([
    {
      id: 1,
      title: "Vệ sinh nhà cửa định kỳ",
      category: "Làm sạch",
      rating: 4.9,
      reviewsCount: 120,
      price: 150000,
      priceType: "Theo giờ",
      area: "TP.HCM",
      helpersCount: 15,
      description: "Dịch vụ quét dọn, lau chùi toàn diện ngôi nhà theo yêu cầu của quý khách hàng.",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop",
      isFavorite: false,
    },
    {
      id: 2,
      title: "Nấu ăn tại nhà chuyên nghiệp",
      category: "Nấu ăn",
      rating: 4.8,
      reviewsCount: 85,
      price: 250000,
      priceType: "Theo buổi",
      area: "TP.HCM",
      helpersCount: 8,
      description: "Chuẩn bị bữa cơm gia đình đầm ấm với các món ăn theo khẩu vị riêng của bạn.",
      image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",
      isFavorite: true,
    },
    {
      id: 3,
      title: "Chăm sóc người già & Người bệnh",
      category: "Người già",
      rating: 5.0,
      reviewsCount: 42,
      price: 500000,
      priceType: "Theo ngày",
      area: "Hà Nội",
      helpersCount: 5,
      description: "Đội ngũ điều dưỡng viên giàu kinh nghiệm, tận tâm chăm sóc sức khỏe người thân.",
      image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=600&auto=format&fit=crop",
      isFavorite: false,
    },
    {
      id: 4,
      title: "Sửa chữa điện nước gia đình",
      category: "Sửa chữa",
      rating: 4.7,
      reviewsCount: 64,
      price: 200000,
      priceType: "Theo giờ",
      area: "TP.HCM",
      helpersCount: 12,
      description: "Khắc phục nhanh chóng sự cố điện nước, chập cháy, rò rỉ đường ống thiết bị.",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop",
      isFavorite: false,
    },
    {
      id: 5,
      title: "Giặt là & Ủi quần áo cao cấp",
      category: "Giặt ủi",
      rating: 4.6,
      reviewsCount: 39,
      price: 120000,
      priceType: "Theo buổi",
      area: "TP.HCM",
      helpersCount: 6,
      description: "Giặt ủi, chăm sóc các loại trang phục cao cấp, vest, váy cưới, lụa tơ tằm chu đáo.",
      image: "https://images.unsplash.com/photo-1545130853-a5c0f13d7449?q=80&w=600&auto=format&fit=crop",
      isFavorite: false,
    },
    {
      id: 6,
      title: "Trông trẻ tại nhà theo giờ",
      category: "Người già",
      rating: 4.9,
      reviewsCount: 55,
      price: 180000,
      priceType: "Theo giờ",
      area: "Hà Nội",
      helpersCount: 9,
      description: "Người chăm sóc trẻ em tận tâm, có chứng chỉ sơ cứu và kỹ năng chơi cùng bé.",
      image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop",
      isFavorite: false,
    },
    {
      id: 7,
      title: "Dọn dẹp vệ sinh công nghiệp",
      category: "Làm sạch",
      rating: 4.8,
      reviewsCount: 78,
      price: 800000,
      priceType: "Theo ngày",
      area: "Hà Nội",
      helpersCount: 20,
      description: "Vệ sinh nhà mới xây, tổng vệ sinh văn phòng, nhà xưởng chuyên nghiệp với máy móc hiện đại.",
      image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=600&auto=format&fit=crop",
      isFavorite: false,
    },
  ]);

  // Mock Helpers Data
  const [helpers] = useState<HelperItem[]>([
    {
      id: 1,
      name: "Nguyễn Thị Hoa",
      rating: 4.9,
      experienceYears: 5,
      area: "TP.HCM",
      tags: ["Nấu ăn", "Dọn dẹp"],
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop",
      isOnline: true,
    },
    {
      id: 2,
      name: "Lê Văn Hùng",
      rating: 4.8,
      experienceYears: 3,
      area: "TP.HCM",
      tags: ["Điện nước", "Bảo trì"],
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop",
      isOnline: true,
    },
    {
      id: 3,
      name: "Phạm Thanh Tâm",
      rating: 5.0,
      experienceYears: 8,
      area: "Hà Nội",
      tags: ["Chăm sóc trẻ", "Sơ cứu"],
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop",
      isOnline: true,
    },
    {
      id: 4,
      name: "Trần Minh Tú",
      rating: 4.7,
      experienceYears: 4,
      area: "TP.HCM",
      tags: ["Dọn dẹp", "Giặt ủi"],
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
      isOnline: false,
    },
  ]);

  return {
    services,
    helpers,
  };
};
