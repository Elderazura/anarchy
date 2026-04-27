import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 50, suffix: "+", label: "Projects Delivered" },
  { value: 12, suffix: "+", label: "Global Clients" },
  { value: 4,  suffix: " yrs", label: "Of Pure Craft" },
  { value: 3,  suffix: "M+", label: "Views Generated" },
];

export default function StatsBanner() {
  const bannerRef = useRef(null);
  const numRefs = useRef([]);

  useEffect(() => {
    const els = numRefs.current;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: bannerRef.current,
        start: "top 82%",
        once: true,
      },
    });

    STATS.forEach((stat, i) => {
      const obj = { val: 0 };
      tl.to(
        obj,
        {
          val: stat.value,
          duration: 1.6,
          ease: "power2.out",
          onUpdate() {
            if (els[i]) {
              els[i].textContent = Math.round(obj.val) + stat.suffix;
            }
          },
        },
        i * 0.12
      );
    });

    // Fade in the whole banner
    gsap.fromTo(
      bannerRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: bannerRef.current,
          start: "top 85%",
          once: true,
        },
      }
    );

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <div className="stats-banner" ref={bannerRef}>
      {STATS.map((stat, i) => (
        <div className="stat-item" key={stat.label}>
          <span
            className="stat-value"
            ref={(el) => { numRefs.current[i] = el; }}
          >
            0{stat.suffix}
          </span>
          <span className="stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
