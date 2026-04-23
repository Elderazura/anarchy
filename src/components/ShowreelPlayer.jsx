import { useRef, useState } from "react";
import { motion } from "framer-motion";

export default function ShowreelPlayer() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  const toggle = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <style>{`
        .showreel-player { width: 100%; max-width: 900px; margin-top: 20px; }
        .showreel-player-inner { position: relative; border-radius: 14px; overflow: hidden; border: 1px solid rgba(110,199,194,0.3); cursor: pointer; aspect-ratio: 16/9; background: #050d18; }
        .showreel-video { width: 100%; height: 100%; object-fit: cover; display: block; }
        .showreel-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0); transition: background 220ms ease; }
        .showreel-overlay.paused { background: rgba(0,0,0,0.4); }
        .showreel-overlay:hover { background: rgba(0,0,0,0.28); }
        .showreel-play-icon { color: #fff; font-size: 1.4rem; opacity: 0; transition: opacity 180ms ease; font-style: normal; }
        .showreel-overlay:hover .showreel-play-icon, .showreel-overlay.paused .showreel-play-icon { opacity: 1; }
      `}</style>
      <motion.aside
        className="showreel-player"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="showreel-player-inner" onClick={toggle}>
          <video
            ref={videoRef}
            src="/video/pubg.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="showreel-video"
          />
          <div className={`showreel-overlay ${playing ? "playing" : "paused"}`}>
            <span className="showreel-play-icon">{playing ? "❙❙" : "▶"}</span>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
