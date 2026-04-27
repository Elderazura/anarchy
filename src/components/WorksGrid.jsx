import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";

const WORKS = [
  {
    file: "Hanumankind – The Game Don't Stop _ Squid Game 2 _ Kalmi, Parimal Shais _ Netflix India.mp4",
    title: "Hanumankind × Squid Game 2",
    client: "Netflix India",
    category: "Music Video",
    tags: ["music", "vfx", "collab"],
    year: 2024,
  },
  {
    file: "Once upon a toast…we thought we had it all..mp4",
    title: "Once Upon a Toast",
    client: "Brand Campaign",
    category: "Brand",
    tags: ["brand", "3d", "animation"],
    year: 2024,
  },
  {
    file: "cult AD 1.mp4",
    title: "Cult — Chapter One",
    client: "Cult",
    category: "Advertising",
    tags: ["ad", "motion", "brand"],
    year: 2024,
  },
  {
    file: "cult AD 2.mp4",
    title: "Cult — Chapter Two",
    client: "Cult",
    category: "Advertising",
    tags: ["ad", "motion", "sequel"],
    year: 2024,
  },
  {
    file: "pubg.mp4",
    title: "PUBG — Drop Zone",
    client: "Krafton",
    category: "Gaming",
    tags: ["gaming", "vfx", "cinematic"],
    year: 2023,
  },
  {
    file: "ray.mp4",
    title: "Ray — Visual Identity",
    client: "Ray",
    category: "VFX",
    tags: ["vfx", "identity", "motion"],
    year: 2024,
  },
  {
    file: "solana.mp4",
    title: "Solana — On-Chain",
    client: "Solana Foundation",
    category: "Crypto",
    tags: ["crypto", "web3", "3d"],
    year: 2024,
  },
  {
    file: "urban animal.mp4",
    title: "Urban Animal",
    client: "Urban Animal",
    category: "Brand",
    tags: ["brand", "animation", "character"],
    year: 2023,
  },
];

const CATEGORIES = ["All", "Music Video", "Advertising", "Gaming", "Crypto", "VFX", "Brand"];

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 40, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

export default function WorksGrid() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredIdx, setHoveredIdx] = useState(null);
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
    <div className="works-archive">
      {/* Search + Filter bar */}
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
              {hoveredIdx === idx && <div className="works-card-play-hint">▶</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
