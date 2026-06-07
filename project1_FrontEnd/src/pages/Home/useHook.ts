import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import careImg from "../../assets/images/home_produce/care.png";
import cleaningImg from "../../assets/images/home_produce/cleaning.png";
import cookingImg from "../../assets/images/home_produce/cooking.png";
import designerImg from "../../assets/images/home_produce/designer.png";
import gradenImg from "../../assets/images/home_produce/graden.png";

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
  const produceData = [
    {
      id: 1,
      image: careImg,
      title: "Chăm Sóc Y Tế",
      description: "Dịch vụ chăm sóc sức khỏe chuyên nghiệp",
    },
    {
      id: 2,
      image: cleaningImg,
      title: "Vệ Sinh Nhà Cửa",
      description: "Làm sạch không gian sống của bạn",
    },
    {
      id: 3,
      image: cookingImg,
      title: "Nấu Ăn Tận Nhà",
      description: "Bữa ăn ngon miệng, đảm bảo dinh dưỡng",
    },
    {
      id: 4,
      image: designerImg,
      title: "Thiết Kế Nội Thất",
      description: "Không gian sống hiện đại, tiện nghi",
    },
    {
      id: 5,
      image: gradenImg,
      title: "Chăm Sóc Sân Vườn",
      description: "Không gian xanh mát, thư giãn",
    },
  ];

  const serviceData = {
    title: "Dịch vụ chuyên nghiệp, tận tâm",
    description:
      "Đội ngũ chuyên gia của chúng tôi được tuyển chọn kỹ lưỡng, đào tạo bài bản và luôn đặt sự hài lòng của khách hàng lên hàng đầu. Với HomeHelper, mọi vấn đề trong ngôi nhà của bạn đều được giải quyết một cách nhanh chóng, hiệu quả và an toàn nhất.",
    features: ["Đội ngũ giàu kinh nghiệm và chuyên môn cao", "Phục vụ tận tâm 24/7, luôn có mặt khi bạn cần", "Chất lượng dịch vụ được đảm bảo 100%"],
    buttonText: "Khám phá ngay",
  };

  const reviewData = [
    {
      id: 1,
      name: "Nguyễn Thùy Linh",
      location: "Phường Thảo Điền, Q.2",
      avatar: "https://i.pravatar.cc/150?img=5",
      service: "Dọn dẹp nhà",
      rating: 5,
      comment: "Dịch vụ rất chuyên nghiệp. Chị giúp việc tên Lan dọn dẹp rất kỹ các ngóc ngách, thái độ lại vô cùng nhã nhặn. Tôi sẽ tiếp tục sử dụng Gia Đình Việt cho căn hộ của mình.",
      workerName: "Giúp việc: Chị Lan",
      date: "20/10/2023"
    },
    {
      id: 2,
      name: "Trần Minh Hoàng",
      location: "Quận 7, TP.HCM",
      avatar: "https://i.pravatar.cc/150?img=11",
      service: "Sửa chữa điện",
      rating: 5,
      comment: "Anh thợ sửa điện đến rất đúng giờ và xử lý sự cố rò rỉ điện nhanh chóng. Chi phí minh bạch, không phát sinh thêm. Rất yên tâm khi giao nhà cho đội ngũ Gia Đình Việt.",
      workerName: "Kỹ thuật: Anh Hùng",
      date: "15/11/2023"
    },
    {
      id: 3,
      name: "Lê Phương Thảo",
      location: "Quận Cầu Giấy, HN",
      avatar: "https://i.pravatar.cc/150?img=9",
      service: "Nấu ăn tại gia",
      rating: 5,
      comment: "Món ăn rất hợp khẩu vị gia đình, chị giúp việc rất sạch sẽ và ngăn nắp. Bữa tối của gia đình tôi trở nên ấm cúng hơn rất nhiều nhờ sự hỗ trợ của các bạn.",
      workerName: "Đầu bếp: Chị Nga",
      date: "02/12/2023"
    },
    {
      id: 4,
      name: "Phạm Văn Đức",
      location: "Quận 1, TP.HCM",
      avatar: "https://i.pravatar.cc/150?img=8",
      service: "Vệ sinh máy lạnh",
      rating: 5,
      comment: "Nhân viên nhiệt tình, tư vấn rõ ràng và làm việc rất cẩn thận. Máy lạnh nhà tôi sau khi vệ sinh hoạt động tốt và không còn tiếng ồn.",
      workerName: "Kỹ thuật: Anh Tuấn",
      date: "10/12/2023"
    },
    {
      id: 5,
      name: "Hoàng Mai Anh",
      location: "Quận 3, TP.HCM",
      avatar: "https://i.pravatar.cc/150?img=16",
      service: "Chăm sóc sân vườn",
      rating: 5,
      comment: "Khu vườn nhà tôi được cắt tỉa rất gọn gàng và đẹp mắt. Nhân viên có kiến thức tốt về các loại cây cảnh và đã hướng dẫn tôi cách chăm sóc rất tận tình.",
      workerName: "Thợ vườn: Chú Bình",
      date: "05/01/2024"
    }
  ];

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
    produceData,
    reviewData,
  };
};
