import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

export const useHome = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);

  const bannerData = {
    title: "bình tĩnh",
    highlightTitle: "tận tâm & uy tín.",
    description: "Gia đình",
    searchPlaceholders: {
      service: "Bạn cần dịch vụ gì?",
      location: "Khu vực của bạn",
    },
  };

  const serviceData = {
    title: "Dịch vụ chuyên nghiệp, tận tâm",
    description: "Đội ngũ chuyên gia của chúng tôi được tuyển chọn kỹ lưỡng, đào tạo bài bản và luôn đặt sự hài lòng của khách hàng lên hàng đầu. Với HomeHelper, mọi vấn đề trong ngôi nhà của bạn đều được giải quyết một cách nhanh chóng, hiệu quả và an toàn nhất.",
    features: [
      "Đội ngũ giàu kinh nghiệm và chuyên môn cao",
      "Phục vụ tận tâm 24/7, luôn có mặt khi bạn cần",
      "Chất lượng dịch vụ được đảm bảo 100%"
    ],
    buttonText: "Khám phá ngay"
  };

  const rafRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    mouseRef.current = {
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    const content = contentRef.current;
    const cube = cubeRef.current;
    if (!container || !image || !content) return;

    // Entry animation for banner
    const ctx = gsap.context(() => {
      gsap.fromTo(image, { scale: 1.15, opacity: 0 }, { scale: 1.05, opacity: 1, duration: 1.2, ease: "power3.out" });
      gsap.fromTo(content, { y: 45, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.2, ease: "power3.out" });

      // 3D Carousel Y-axis infinite rotation with X-tilt
      if (cube) {
        gsap.set(cube, { rotationX: -16, rotationY: 0 });
        
        gsap.to(cube, {
          rotationY: -360,
          duration: 20,
          ease: "none",
          repeat: -1,
        });
      }
    }, container);

    const tick = () => {
      gsap.to(image, {
        x: mouseRef.current.x * -20,
        y: mouseRef.current.y * -15,
        duration: 1.2,
        ease: "power2.out",
        overwrite: "auto",
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    container.addEventListener("mousemove", handleMouseMove);

    // Reset position when mouse leaves the banner
    const handleMouseLeave = () => {
      mouseRef.current = { x: 0, y: 0 };
    };
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      ctx.revert();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove]);

  return {
    bannerData,
    serviceData,
    containerRef,
    imageRef,
    contentRef,
    cubeRef,
  };
};
