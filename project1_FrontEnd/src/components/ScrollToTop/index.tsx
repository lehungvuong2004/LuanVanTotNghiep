import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Cuộn lên đầu trang"
      className={`fixed bottom-28 right-10 z-50 w-14 h-14 bg-[#066d72] hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-full shadow-xl hover:shadow-[#066d72]/45 transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0 transform ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-90 pointer-events-none"
      }`}
      title="Cuộn lên đầu trang"
    >
      <Icon icon="ep:top" className="text-2xl" />
    </button>
  );
};
