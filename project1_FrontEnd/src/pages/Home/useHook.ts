import { useEffect, useRef, useCallback, useState } from "react";
import gsap from "gsap";
import { useTranslation } from "react-i18next";
import careImg from "../../assets/images/home_produce/care.webp";
import cleaningImg from "../../assets/images/home_produce/cleaning.webp";
import cookingImg from "../../assets/images/home_produce/cooking.webp";
import designerImg from "../../assets/images/home_produce/designer.webp";
import gradenImg from "../../assets/images/home_produce/graden.webp";
import { useNavigate } from "react-router-dom";
import { getBannersPublic } from "../../api/bannersApi/banners";
import type { Banner } from "../../api/bannersApi/banners";
import { useGeolocation } from "../../hooks/useGeolocation";
import { parseVietnamAddress } from "../../types/location";
import { getImageUrl } from "../../utils/images";

export const useHome = () => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const cubeRef = useRef(null);

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState<boolean>(true);

  const [searchVal, setSearchVal] = useState("");
  const [locationVal, setLocationVal] = useState("");
  const navigate = useNavigate();

  const { address, addressDetails } = useGeolocation();
  useEffect(() => {
    if (address) {
      const parsed = parseVietnamAddress(addressDetails, address);
      if (parsed.district) {
        // eslint-disable-next-line
        setLocationVal(parsed.district);
      } else {
        setLocationVal(address);
      }
    }
  }, [address, addressDetails]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchVal.trim()) {
      params.append("search", searchVal.trim());
    }
    if (locationVal.trim()) {
      params.append("district", locationVal.trim());
    }
    navigate(`/dich-vu?${params.toString()}`);
  };

  const fetchBanners = useCallback(async () => {
    await Promise.resolve();
    setLoadingBanners(true);
    try {
      const res = await getBannersPublic();
      setBanners(res.data);
      if (res.data && res.data.length > 0 && res.data[0].image) {
        const firstUrl = getImageUrl(res.data[0].image);
        if (firstUrl) {
          localStorage.setItem("lcp_banner", firstUrl);
        }
      }
    } catch {
      // console.error("Lỗi khi tải danh sách banner công khai:", err);
    } finally {
      setLoadingBanners(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBanners();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchBanners]);

  const bannerData = {
    title: t("home.banner.title"),
    highlightTitle: t("home.banner.highlightTitle"),
    searchPlaceholders: {
      service: t("home.banner.placeholderService"),
      location: t("home.banner.placeholderLocation"),
    },
  };

  const produceData = [
    {
      id: 1,
      image: careImg,
      title: t("home.produce.care.title"),
      description: t("home.produce.care.description"),
    },
    {
      id: 2,
      image: cleaningImg,
      title: t("home.produce.cleaning.title"),
      description: t("home.produce.cleaning.description"),
    },
    {
      id: 3,
      image: cookingImg,
      title: t("home.produce.cooking.title"),
      description: t("home.produce.cooking.description"),
    },
    {
      id: 4,
      image: designerImg,
      title: t("home.produce.interior.title"),
      description: t("home.produce.interior.description"),
    },
    {
      id: 5,
      image: gradenImg,
      title: t("home.produce.garden.title"),
      description: t("home.produce.garden.description"),
    },
  ];

  const serviceData = {
    title: t("home.services.title"),
    description: t("home.services.description"),
    features: [t("home.services.feature1"), t("home.services.feature2"), t("home.services.feature3")],
  };

  const reviewData = [
    {
      id: 1,
      name: "Nguyễn Thùy Linh",
      location: t("home.reviews.r1.location"),
      avatar: "https://i.pravatar.cc/150?img=5",
      service: t("home.reviews.r1.service"),
      rating: 5,
      comment: t("home.reviews.r1.comment"),
      workerName: t("home.reviews.r1.workerName"),
      date: "20/10/2023",
    },
    {
      id: 2,
      name: "Trần Minh Hoàng",
      location: t("home.reviews.r2.location"),
      avatar: "https://i.pravatar.cc/150?img=11",
      service: t("home.reviews.r2.service"),
      rating: 5,
      comment: t("home.reviews.r2.comment"),
      workerName: t("home.reviews.r2.workerName"),
      date: "15/11/2023",
    },
    {
      id: 3,
      name: "Lê Phương Thảo",
      location: t("home.reviews.r3.location"),
      avatar: "https://i.pravatar.cc/150?img=9",
      service: t("home.reviews.r3.service"),
      rating: 5,
      comment: t("home.reviews.r3.comment"),
      workerName: t("home.reviews.r3.workerName"),
      date: "02/12/2023",
    },
    {
      id: 4,
      name: "Phạm Văn Đức",
      location: t("home.reviews.r4.location"),
      avatar: "https://i.pravatar.cc/150?img=8",
      service: t("home.reviews.r4.service"),
      rating: 5,
      comment: t("home.reviews.r4.comment"),
      workerName: t("home.reviews.r4.workerName"),
      date: "10/12/2023",
    },
    {
      id: 5,
      name: "Hoàng Mai Anh",
      location: t("home.reviews.r5.location"),
      avatar: "https://i.pravatar.cc/150?img=16",
      service: t("home.reviews.r5.service"),
      rating: 5,
      comment: t("home.reviews.r5.comment"),
      workerName: t("home.reviews.r5.workerName"),
      date: "05/01/2024",
    },
  ];

  useEffect(() => {
    const cube = cubeRef.current;
    if (cube) {
      gsap.set(cube, { rotationX: -16, rotationY: 0 });
      const anim = gsap.to(cube, {
        rotationY: -360,
        duration: 20,
        ease: "none",
        repeat: -1,
      });
      return () => {
        anim.kill();
      };
    }
  }, []);

  return {
    bannerData,
    serviceData,
    containerRef,
    imageRef,
    contentRef,
    cubeRef,
    produceData,
    reviewData,
    banners,
    loadingBanners,
    searchVal,
    setSearchVal,
    locationVal,
    setLocationVal,
    handleSearch,
  };
};
