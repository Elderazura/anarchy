import { useRef } from "react";
import { motion } from "framer-motion";
import "./works.css";

const WORKS = [
  { id: "squid", file: "Hanumankind – The Game Don't Stop _ Squid Game 2 _ Kalmi, Parimal Shais _ Netflix India.mp4", client: "Netflix India", title: "Hanumankind × Squid Game 2", category: "Music Video" },
  { id: "toast", file: "Once upon a toast…we thought we had it all..mp4", client: "Original", title: "Once Upon A Toast", category: "Short Film" },
  { id: "cult1", file: "cult AD 1.mp4", client: "Cult", title: "Cult — AD 01", category: "Brand" },
  { id: "cult2", file: "cult AD 2.mp4", client: "Cult", title: "Cult — AD 02", category: "Brand" },
  { id: "pubg", file: "pubg.mp4", client: "PUBG", title: "PUBG Cinematic", category: "Game" },
  { id: "ray", file: "ray.mp4", client: "Ray", title: "Ray", category: "Film" },
  { id: "solana", file: "solana.mp4", client: "Solana", title: "Solana", category: "Crypto" },
  { id: "urban", file: "urban animal.mp4", client: "Urban Animal", title: "Urban Animal", category: "Brand" },
];

function formatIndex(n) {
  return String(n + 1).padStart(2, "0");
}

function WorkCard({ work, index }) {
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      className="vault-card"
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.03 }}
      style={{ originX: 0.5, originY: 0.5 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Framer Motion spring for hover scale */}
      <video
        ref={videoRef}
        src={"/video/" + encodeURIComponent(work.file)}
        preload="none"
        muted
        loop
        playsInline
        className="vault-card-video"
      />

      {/* Letterbox bars */}
      <div className="vault-letterbox" aria-hidden="true" />

      {/* Gradient overlay + text */}
      <div className="vault-card-overlay">
        <div className="vault-card-meta">
          <p className="vault-card-category">{work.category}</p>
          <p className="vault-card-client">{work.client}</p>
          <p className="vault-card-title">{work.title}</p>
        </div>
      </div>

      {/* Index number */}
      <span className="vault-card-index" aria-hidden="true">
        {formatIndex(index)}
      </span>
    </motion.div>
  );
}

export default function WorksGrid() {
  return (
    <section className="vault-section">
      <div className="vault-header">
        <p className="vault-header__eyebrow">01 / WORKS</p>
        <h2 className="vault-header__title">The Vault</h2>
        <p className="vault-header__tagline">Eight worlds. One studio.</p>
        <span className="vault-scroll-hint" aria-hidden="true">← scroll →</span>
      </div>

      <div className="vault-ribbon">
        {WORKS.map((work, index) => (
          <WorkCard key={work.id} work={work} index={index} />
        ))}
      </div>
    </section>
  );
}
