/**
 * HorizontalShowcase — GSAP ScrollTrigger pinned horizontal reel
 *
 * Desktop: section is pinned while user scrolls through 4 featured panels
 * horizontally. Each panel is 100vw × 100vh with a full-bleed video background.
 *
 * Mobile (<768px): falls back to a normal vertical stack of panels.
 */
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./horizontal-showcase.css";

gsap.registerPlugin(ScrollTrigger);

const PANELS = [
  {
    num: "01",
    category: "Music Video · Netflix India",
    title: ["Hanumankind", "× Squid Game 2"],
    tagline: "Full character animation pipeline for a viral music video.",
    video: "/video/hanumankind.mp4",
    accent: "#7ec8e8",
    year: "2024",
  },
  {
    num: "02",
    category: "VFX · Film",
    title: ["Ray"],
    tagline: "Fluid simulation, destruction, and compositing at scale.",
    video: "/video/ray.mp4",
    accent: "#ff6b35",
    year: "2024",
  },
  {
    num: "03",
    category: "Game Cinematic · PUBG",
    title: ["PUBG", "Drop Zone"],
    tagline: "Photoreal character work for a global gaming franchise.",
    video: "/video/pubg.mp4",
    accent: "#7ee8c0",
    year: "2023",
  },
  {
    num: "04",
    category: "Crypto · Brand",
    title: ["Solana", "On-Chain"],
    tagline: "AI-augmented motion design for a Web3 ecosystem.",
    video: "/video/solana.mp4",
    accent: "#b388ff",
    year: "2024",
  },
];

export default function HorizontalShowcase() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);
  const videoRefs = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // Skip GSAP pin on mobile — CSS handles the fallback
    if (window.innerWidth < 768) return;

    const ctx = gsap.context(() => {
      // Translate the track left by (totalWidth − viewport) over scroll distance = totalWidth
      const tween = gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + (track.scrollWidth - window.innerWidth),
          pin: sticky,
          scrub: 1.2,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Animate progress bar
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        },
      });

      // Fade each panel's text in as it enters viewport
      PANELS.forEach((_, i) => {
        const content = track.querySelectorAll(".hscroll-panel__content")[i];
        if (!content) return;
        gsap.fromTo(
          content,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: () => `+=${i * (window.innerWidth * 0.88)}`,
              end: () => `+=${i * (window.innerWidth * 0.88) + window.innerWidth * 0.4}`,
              scrub: false,
              toggleActions: "play none none reverse",
              invalidateOnRefresh: true,
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hscroll-section"
      aria-label="Featured work reel"
      style={{ height: `${PANELS.length * 100}vh` }}
    >
      {/* Section label above the sticky pane */}
      <div className="hscroll-intro">
        <p className="hscroll-intro__label">02b / Featured</p>
        <h2 className="hscroll-intro__title">Selected Work</h2>
        <p className="hscroll-intro__hint">Scroll to explore →</p>
      </div>

      {/* Pinned viewport */}
      <div ref={stickyRef} className="hscroll-sticky">
        {/* Horizontal track */}
        <div ref={trackRef} className="hscroll-track">
          {PANELS.map((panel, index) => (
            <div key={panel.num} className="hscroll-panel">
              {/* Full-bleed video */}
              <video
                ref={(el) => { videoRefs.current[index] = el; }}
                className="hscroll-panel__video"
                src={panel.video}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />

              {/* Dark gradient overlay */}
              <div className="hscroll-panel__overlay" />

              {/* Content */}
              <div className="hscroll-panel__content">
                <p className="hscroll-panel__num" style={{ color: `${panel.accent}55` }}>
                  {panel.num}
                </p>
                <span
                  className="hscroll-panel__category"
                  style={{ color: panel.accent }}
                >
                  {panel.category}
                </span>
                <h3 className="hscroll-panel__title">
                  {panel.title.map((line, i) => (
                    <span key={i} style={{ display: "block" }}>{line}</span>
                  ))}
                </h3>
                <p className="hscroll-panel__tagline">{panel.tagline}</p>
                <div className="hscroll-panel__footer">
                  <span
                    className="hscroll-panel__bar"
                    style={{ background: panel.accent }}
                  />
                  <span className="hscroll-panel__year">{panel.year}</span>
                </div>
              </div>

              {/* Panel index dot */}
              <span className="hscroll-panel__dot">
                {String(index + 1).padStart(2, "0")} / {String(PANELS.length).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>

        {/* Scrub progress bar */}
        <div className="hscroll-progress-bar" aria-hidden="true">
          <div ref={progressRef} className="hscroll-progress-fill" />
        </div>
      </div>
    </section>
  );
}
