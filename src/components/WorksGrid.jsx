import { useRef } from "react";
import { motion } from "framer-motion";

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
      className="works-card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={"/video/" + encodeURIComponent(work.file)}
        preload="metadata"
        muted
        loop
        playsInline
        className="works-card-video"
      />
      <div className="works-card-overlay">
        <span className="works-card-category">{work.category}</span>
        <p className="works-card-client">{work.client}</p>
        <p className="works-card-title">{work.title}</p>
      </div>
    </motion.div>
  );
}

export default function WorksGrid() {
  return (
    <>
      <style>{`
        .works-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; width: 100%; }
        .works-card { position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 16/9; background: #070f1a; border: 1px solid rgba(255,255,255,0.07); cursor: pointer; }
        .works-card-video { width: 100%; height: 100%; object-fit: cover; display: block; }
        .works-card-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; padding: 16px; background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 50%); opacity: 0; transition: opacity 220ms ease; }
        .works-card:hover .works-card-overlay { opacity: 1; }
        .works-card-category { font-size: 0.6rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #7ec8e8; margin-bottom: 4px; }
        .works-card-client { font-size: 0.65rem; color: #89a8b8; margin: 0 0 2px; }
        .works-card-title { font-size: 0.85rem; font-weight: 600; color: #e8f4fc; margin: 0; }
      `}</style>
      <div className="works-grid">
        {WORKS.map((work, index) => (
          <WorkCard key={work.id} work={work} index={index} />
        ))}
      </div>
    </>
  );
}
