import { useRef, type PropsWithChildren } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AnimateOnScrollRevealProps extends PropsWithChildren {
  duration?: number;
  delay?: number;
  y?: number;
  x?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  once?: boolean;
  scrub?: boolean | number;
  markers?: boolean;
  scale?: number;     // Tỉ lệ zoom ban đầu (ví dụ: 0.95)
  blur?: number;      // Độ mờ ban đầu (ví dụ: 10px)
}

export default function AnimateOnScrollReveal({
  children,
  duration = 1.2,
  delay = 0,
  y = 30,
  x = 30,
  direction = "up",
  scale = 1,        
  blur = 10,          
  once = false,
  scrub = false,
  markers = false,
}: AnimateOnScrollRevealProps) {
  const ref = useRef(null);
  useGSAP(
    () => {
      if (!ref.current) return;

      const directions = {
        up: { x: 0, y },
        down: { x: 0, y: -y },
        left: { x, y: 0 },
        right: { x: -x, y: 0 },
        none: { x: 0, y: 0 },
      };

      const { x: initialX, y: initialY } = directions[direction] || { x: 0, y: 0 };

      // Cài đặt trạng thái ban đầu (bao gồm cả scale và blur nếu có)
      gsap.set(ref.current, {
        x: initialX,
        y: initialY,
        scale: scale,
        filter: blur > 0 ? `blur(${blur}px)` : "none",
        opacity: 0,
      });

      gsap.to(ref.current, {
        x: 0,
        y: 0,
        scale: 1,
        filter: blur > 0 ? "blur(0px)" : "none",
        opacity: 1,
        duration: duration,
        delay: delay,
        ease: "expo.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%", 
          end: scrub ? "bottom 80%" : "top 15%", 
          scrub: scrub,
          markers: markers,
          toggleActions: scrub ? undefined : (once ? "play none none none" : "play reverse play reverse"),
          once: once,
        },
      });
    },
    { scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}
