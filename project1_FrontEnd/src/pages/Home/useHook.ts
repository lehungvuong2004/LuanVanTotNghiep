import { useEffect, useRef, useCallback, useState } from "react";
import gsap from "gsap";
import { useTranslation } from "react-i18next";
import careImg from "../../assets/images/home_produce/care.webp";
import cleaningImg from "../../assets/images/home_produce/cleaning.webp";
import cookingImg from "../../assets/images/home_produce/cooking.webp";
import designerImg from "../../assets/images/home_produce/designer.webp";
import gradenImg from "../../assets/images/home_produce/graden.webp";
import { getBannersPublic } from "../../api/bannersApi/banners";
import type { Banner } from "../../api/bannersApi/banners";

export const useHome = () => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const cubeRef = useRef(null);
  
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState<boolean>(true);

  const fetchBanners = useCallback(async () => {
    await Promise.resolve();
    setLoadingBanners(true);
    try {
      const res = await getBannersPublic();
      setBanners(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách banner công khai:", err);
    } finally {
      setLoadingBanners(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const bannerData = {
    title: t("home.banner.title"),
    highlightTitle: t("home.banner.highlightTitle"),
    searchPlaceholders: {
      service: t("home.banner.placeholderService"),
      location: t("home.banner.placeholderLocation")
    }
  };

  const produceData = [
    {
      id: 1,
      image: careImg,
      title: t("home.produce.care.title"),
      description: t("home.produce.care.description")
    },
    {
      id: 2,
      image: cleaningImg,
      title: t("home.produce.cleaning.title"),
      description: t("home.produce.cleaning.description")
    },
    {
      id: 3,
      image: cookingImg,
      title: t("home.produce.cooking.title"),
      description: t("home.produce.cooking.description")
    },
    {
      id: 4,
      image: designerImg,
      title: t("home.produce.interior.title"),
      description: t("home.produce.interior.description")
    },
    {
      id: 5,
      image: gradenImg,
      title: t("home.produce.garden.title"),
      description: t("home.produce.garden.description")
    },
  ];

  const serviceData = {
    title: t("home.services.title"),
    description: t("home.services.description"),
    features: [
      t("home.services.feature1"),
      t("home.services.feature2"),
      t("home.services.feature3")
    ]
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
      date: "20/10/2023"
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
      date: "15/11/2023"
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
      date: "02/12/2023"
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
      date: "10/12/2023"
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
      date: "05/01/2024"
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
        repeat: -1
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
    loadingBanners };
};
