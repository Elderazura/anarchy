import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import Character from "./components/Character";
import SiteBackgroundBot from "./components/SiteBackgroundBot";
import World from "./components/World";
import LoadingScreen from "./components/LoadingScreen";
import WorksGrid from "./components/WorksGrid";
import ServicesGrid from "./components/ServicesGrid";
import StudioSection from "./components/StudioSection";
import ReelStrip from "./components/ReelStrip";
import ContactSection from "./components/ContactSection";
import ShimmerButton from "./components/ui/ShimmerButton";
import PhysicsParticles from "./components/PhysicsParticles";
import ShaderBackground from "./components/ui/ShaderBackground";
import GlitchText from "./components/ui/GlitchText";
import { animationMap } from "./lib/animationMap";
import { useBotPhysics } from "./lib/useBotPhysics";
import StatsBanner from "./components/StatsBanner";
import CtaBanner from "./components/CtaBanner";
import StickyContact from "./components/StickyContact";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SITE_BOT_ANIMS = [
  "idle","walking","casual-walk","running","run-fast",
  "boxing-practice","unsteady-walk","dead","arise","alert",
  "agree-gesture","boom-dance","all-night-dance","skill-01","skill-03",
];

export default function App() {
  gsap.registerPlugin(ScrollTrigger);

  const [enteredSite, setEnteredSite] = useState(false);
  const [sitePage, setSitePage] = useState("home");
  const [sceneReady, setSceneReady] = useState(false);
  const [botForeground, setBotForeground] = useState(false);
  const botPositionRef = useRef(new THREE.Vector3(0, -1.2, -2.1));
  const worksRef = useRef(null);
  const aboutRef = useRef(null);
  const servicesRef = useRef(null);
  const { onBotUpdate, registerTarget } = useBotPhysics();

  // Preload site bot animations during hero phase so transition is instant
  useEffect(() => {
    if (!sceneReady) return;
    let i = 0;
    const next = () => {
      if (i >= SITE_BOT_ANIMS.length) return;
      useGLTF.preload(animationMap[SITE_BOT_ANIMS[i++]]);
      setTimeout(next, 200);
    };
    const t = setTimeout(next, 1500);
    return () => clearTimeout(t);
  }, [sceneReady]);

  const scrollToSection = useCallback((ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const enterSiteAndScroll = useCallback(
    (ref) => {
      setEnteredSite(true);
      requestAnimationFrame(() => {
        window.setTimeout(() => scrollToSection(ref), 160);
      });
    },
    [scrollToSection],
  );

  return (
    <>
      <ShaderBackground />
      <LoadingScreen isReady={sceneReady} />

      <AnimatePresence mode="wait">
        {!enteredSite ? (
          <motion.section
            key="hero"
            className="hero-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6 } }}
            exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.4, ease: [0.4, 0, 1, 1] } }}
          >
            <Canvas
              className="hero-canvas"
              camera={{ position: [0, 1.8, 6.2], fov: 42 }}
              shadows={{ type: THREE.PCFShadowMap }}
            >
              <Suspense fallback={null}>
                <World botPositionRef={botPositionRef} />
                <Character
                  onSpeak={() => 3.2}
                  botLine=""
                  isSpeaking={false}
                  onIntroReady={() => setSceneReady(true)}
                  botPositionRef={botPositionRef}
                />
                <OrbitControls
                  target={[0, 1.2, 0]}
                  enablePan
                  minDistance={2.5}
                  maxDistance={10}
                  maxPolarAngle={Math.PI * 0.49}
                />
              </Suspense>
            </Canvas>

            <PhysicsParticles />
            <div className="hero-noise-layer" />
            <div className="logo-badge">
              <img src="/branding/anarchy-logo.png" alt="Anarchy Studios" />
            </div>
            <div className="hero-copy">
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                Welcome to
                <br />
                Anarchy Studios
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                Animation | VFX | AI | Crypto
              </motion.p>
            </div>
            <div className="hero-actions">
              <ShimmerButton onClick={() => enterSiteAndScroll(worksRef)}>Work</ShimmerButton>
              <button
                type="button"
                className="hero-action-simple"
                onClick={() => enterSiteAndScroll(aboutRef)}
              >
                Studio
              </button>
              <button
                type="button"
                className="hero-action-simple"
                onClick={() => enterSiteAndScroll(servicesRef)}
              >
                Services
              </button>
            </div>

            <div className="marquee-band" style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 44 }}>
              <div className="marquee-track">
                {["Animation", "VFX", "AI Production", "Crypto", "3D Worlds", "Character Animation", "Motion Design", "Generative Art"].flatMap((item, i) => [
                  <span key={`a-${i}`} className="marquee-item">{item}</span>,
                  <span key={`d-${i}`} className="marquee-item"><span className="marquee-dot">◆</span></span>,
                ]).concat(
                  ["Animation", "VFX", "AI Production", "Crypto", "3D Worlds", "Character Animation", "Motion Design", "Generative Art"].flatMap((item, i) => [
                    <span key={`b-${i}`} className="marquee-item">{item}</span>,
                    <span key={`e-${i}`} className="marquee-item"><span className="marquee-dot">◆</span></span>,
                  ])
                )}
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.main
            key="site"
            className="studio-site"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] } }}
          >
            <PhysicsParticles />

            {/* Bot canvas — always above content (canvas is alpha-transparent) */}
            <motion.div
              className="site-background-layer"
              animate={{
                opacity: botForeground ? 1 : 0.82,
                scale: botForeground ? 1.04 : 1,
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ zIndex: 15 }}
            >
              <SiteBackgroundBot onForegroundChange={setBotForeground} onBotUpdate={onBotUpdate} />
            </motion.div>

            <header className="site-nav">
              <div className="logo-badge">
                <img src="/branding/anarchy-logo.png" alt="Anarchy Studios" />
              </div>
              <nav>
                <button type="button" onClick={() => { setSitePage("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                  Home
                </button>
                <button type="button" onClick={() => { setSitePage("home"); setTimeout(() => scrollToSection(worksRef), 80); }}>
                  Work
                </button>
                <button type="button" onClick={() => { setSitePage("home"); setTimeout(() => scrollToSection(aboutRef), 80); }}>
                  Studio
                </button>
                <button type="button" onClick={() => { setSitePage("home"); setTimeout(() => scrollToSection(servicesRef), 80); }}>
                  Services
                </button>
              </nav>
            </header>

            <AnimatePresence mode="wait">
              {sitePage === "home" ? (
                <motion.div
                  key="home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* 01 — Works: The Vault */}
                  <section ref={(el) => { worksRef.current = el; registerTarget(el); }} className="section-shell">
                    <WorksGrid />
                  </section>

                  <div className="section-divider" />
                  <StatsBanner />
                  <div className="section-divider" />

                  {/* 02 — Studio: The Mind */}
                  <section ref={(el) => { aboutRef.current = el; registerTarget(el); }} className="section-shell">
                    <StudioSection />
                  </section>

                  <div className="section-divider" />

                  {/* 02b — Featured Reels (per-service project showcase) */}
                  <ReelStrip />

                  {/* 03 — Services: The Arsenal */}
                  <section ref={(el) => { servicesRef.current = el; registerTarget(el); }} className="section-shell">
                    <ServicesGrid />
                  </section>

                  <CtaBanner />

                  {/* 04 — Contact: The Signal */}
                  <ContactSection />
                </motion.div>
              ) : (
                <motion.div
                  key="works-archive"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ paddingTop: "80px" }}
                >
                  <div style={{ padding: "0 clamp(24px,8vw,120px) 40px", display: "flex", alignItems: "center", gap: 16 }}>
                    <button
                      type="button"
                      className="section-cta"
                      onClick={() => setSitePage("home")}
                      style={{ marginTop: 0 }}
                    >
                      ← Back
                    </button>
                    <p className="section-kicker" style={{ margin: 0 }}>Full Works Archive</p>
                  </div>
                  <WorksGrid />
                  <ContactSection />
                </motion.div>
              )}
            </AnimatePresence>

            <StickyContact />
          </motion.main>
        )}
      </AnimatePresence>
    </>
  );
}
