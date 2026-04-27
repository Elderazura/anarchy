import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import GlitchText from "./ui/GlitchText";
import "./works.css";

const WORKS = [
  {
    file: "Hanumankind – The Game Don't Stop _ Squid Game 2 _ Kalmi, Parimal Shais _ Netflix India.mp4",
    title: "Hanumankind × Squid Game 2",
    client: "Netflix India",
    category: "Music Video",
    tags: ["music", "vfx", "collab"],
    year: 2024,
    description:
      "Full character animation pipeline built for Netflix India's Squid Game 2 collaboration with rapper Hanumankind. 3D character design, rigging, skin simulation, VFX integration, and final composite — delivered in a single cohesive pipeline.",
  },
  {
    file: "Once upon a toast…we thought we had it all..mp4",
    title: "Once Upon a Toast",
    client: "Brand Campaign",
    category: "Brand",
    tags: ["brand", "3d", "animation"],
    year: 2024,
    description:
      "A surreal brand narrative blending photorealistic 3D animation with live-action elements. The spot explores everyday ritual through the lens of speculative visual storytelling.",
  },
  {
    file: "cult AD 1.mp4",
    title: "Cult — Chapter One",
    client: "Cult",
    category: "Advertising",
    tags: ["ad", "motion", "brand"],
    year: 2024,
    description:
      "High-energy advertising campaign for fitness brand Cult. Kinetic typography, 3D motion graphics, and performance-driven visual language built to drive conversion at scale.",
  },
  {
    file: "cult AD 2.mp4",
    title: "Cult — Chapter Two",
    client: "Cult",
    category: "Advertising",
    tags: ["ad", "motion", "sequel"],
    year: 2024,
    description:
      "Sequel campaign continuing Cult's visual language with an evolved motion design system. Deeper character integration, expanded color palette, and a faster editorial pace.",
  },
  {
    file: "pubg.mp4",
    title: "PUBG — Drop Zone",
    client: "Krafton",
    category: "Gaming",
    tags: ["gaming", "vfx", "cinematic"],
    year: 2023,
    description:
      "Cinematic sequence for global gaming franchise PUBG by Krafton. Photoreal character animation, environmental VFX, and a cinematic camera language designed to mirror the tension of in-game combat.",
  },
  {
    file: "ray.mp4",
    title: "Ray — Visual Identity",
    client: "Ray",
    category: "VFX",
    tags: ["vfx", "identity", "motion"],
    year: 2024,
    description:
      "Brand identity film for Ray, built around large-scale fluid simulation and particle systems. Every physical property — viscosity, surface tension, light scatter — was art-directed to align with the brand's core values.",
  },
  {
    file: "solana.mp4",
    title: "Solana — On-Chain",
    client: "Solana Foundation",
    category: "Crypto",
    tags: ["crypto", "web3", "3d"],
    year: 2024,
    description:
      "AI-augmented motion design campaign for the Solana Foundation. Generative visuals, procedural geometry, and AI-assisted concepting combined into a Web3 aesthetic that feels native to the blockchain space.",
  },
  {
    file: "urban animal.mp4",
    title: "Urban Animal",
    client: "Urban Animal",
    category: "Brand",
    tags: ["brand", "animation", "character"],
    year: 2023,
    description:
      "Brand film for Urban Animal featuring stylized character animation and rich environmental storytelling. Character design, rigging, and animation done in-house, delivered with a distinctive hand-crafted aesthetic.",
  },
];

const CATEGORIES = ["All", "Music Video", "Advertising", "Gaming", "Crypto", "VFX", "Brand"];

export default function WorksGrid() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const videoRefs = useRef({});
  const gridRef = useRef(null);

  const filtered = WORKS.filter((w) => {
    const matchCat = activeCategory === "All" || w.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      w.title.toLowerCase().includes(q) ||
      w.client.toLowerCase().includes(q) ||
      w.category.toLowerCase().includes(q) ||
      w.tags.some((t) => t.includes(q));
    return matchCat && matchSearch;
  });

  // GSAP stagger when category/search changes
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".works-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.45,
        stagger: 0.055,
        ease: "power3.out",
        clearProps: "transform",
      }
    );
  }, [activeCategory, searchQuery]);

  // ESC key close lightbox
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setSelectedWork(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = selectedWork ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedWork]);

  const handleMouseEnter = useCallback((idx) => {
    setHoveredIdx(idx);
    const vid = videoRefs.current[idx];
    if (vid) { vid.currentTime = 0; vid.play().catch(() => {}); }
  }, []);

  const handleMouseLeave = useCallback((idx) => {
    setHoveredIdx(null);
    const vid = videoRefs.current[idx];
    if (vid) { vid.pause(); vid.currentTime = 0; }
  }, []);

  return (
    <div className="vault-section">

      {/* ── Section Header ── */}
      <header className="vault-header">
        <p className="vault-header__eyebrow">01 / Works</p>
        <GlitchText as="h2" className="vault-header__title">The Vault</GlitchText>
        <p className="vault-header__tagline">Projects that changed the brief.</p>
        <p className="vault-scroll-hint">← SCROLL →</p>
      </header>

      {/* ── Search + Filter bar ── */}
      <div className="works-controls">
        <div className="works-search-wrap">
          <svg className="works-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="works-search"
            type="text"
            placeholder="Search projects…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search works"
          />
          {searchQuery && (
            <button className="works-search-clear" onClick={() => setSearchQuery("")} aria-label="Clear search">×</button>
          )}
        </div>
        <div className="works-filter-pills" role="tablist">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              className={`works-pill${activeCategory === cat ? " works-pill--active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
              {cat !== "All" && (
                <span className="works-pill-count">
                  {WORKS.filter((w) => w.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="works-meta-bar">
        <span className="works-count">{filtered.length} project{filtered.length !== 1 ? "s" : ""}</span>
        {(activeCategory !== "All" || searchQuery) && (
          <button className="works-reset" onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="works-grid" ref={gridRef}>
        {filtered.length === 0 ? (
          <div className="works-empty">
            <p>No projects match "<strong>{searchQuery}</strong>"</p>
            <button className="section-cta" onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}>
              Clear search
            </button>
          </div>
        ) : (
          filtered.map((work, idx) => (
            <div
              key={work.file}
              className="works-card"
              onMouseEnter={() => handleMouseEnter(idx)}
              onMouseLeave={() => handleMouseLeave(idx)}
              onClick={() => setSelectedWork(work)}
              role="button"
              tabIndex={0}
              aria-label={`Open ${work.title}`}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedWork(work); }}
            >
              <div className="works-card-media">
                <video
                  ref={(el) => { if (el) videoRefs.current[idx] = el; }}
                  src={`/video/${encodeURIComponent(work.file)}`}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
              <div className="works-card-overlay">
                <div className="works-card-top">
                  <span className="works-card-category">{work.category}</span>
                  <span className="works-card-year">{work.year}</span>
                </div>
                <div className="works-card-bottom">
                  <h3 className="works-card-title">{work.title}</h3>
                  <p className="works-card-client">{work.client}</p>
                  <div className="works-card-tags">
                    {work.tags.map((tag) => (
                      <span key={tag} className="works-tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="works-card-open-hint" aria-hidden="true">↗ VIEW</div>
              {hoveredIdx === idx && <div className="works-card-play-hint">▶</div>}
            </div>
          ))
        )}
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {selectedWork && (
          <motion.div
            className="vault-lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSelectedWork(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Case study: ${selectedWork.title}`}
          >
            <motion.div
              className="vault-lightbox"
              initial={{ opacity: 0, scale: 0.95, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Video pane */}
              <div className="vault-lightbox__video-wrap">
                <video
                  key={selectedWork.file}
                  className="vault-lightbox__video"
                  src={`/video/${encodeURIComponent(selectedWork.file)}`}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>

              {/* Info pane */}
              <div className="vault-lightbox__info">
                <button
                  className="vault-lightbox__close"
                  onClick={() => setSelectedWork(null)}
                  aria-label="Close"
                >
                  ✕
                </button>

                <p className="vault-lightbox__meta">
                  {selectedWork.category} · {selectedWork.year}
                </p>
                <h2 className="vault-lightbox__title">{selectedWork.title}</h2>
                <p className="vault-lightbox__client">{selectedWork.client}</p>
                <p className="vault-lightbox__desc">{selectedWork.description}</p>

                <div className="vault-lightbox__tags">
                  {selectedWork.tags.map((tag) => (
                    <span key={tag} className="vault-lightbox__tag">#{tag}</span>
                  ))}
                </div>

                <a
                  href="mailto:hello@anarchystudios.io"
                  className="vault-lightbox__cta"
                >
                  Work with us on something like this →
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
