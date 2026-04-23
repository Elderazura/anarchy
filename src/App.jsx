import { Suspense, useCallback, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import Character from "./components/Character";
import SiteBackgroundBot from "./components/SiteBackgroundBot";
import World from "./components/World";
import LoadingScreen from "./components/LoadingScreen";
import ShowreelPlayer from "./components/ShowreelPlayer";
import WorksGrid from "./components/WorksGrid";
import ServicesGrid from "./components/ServicesGrid";
import ContactSection from "./components/ContactSection";
import ShimmerButton from "./components/ui/ShimmerButton";
import AnimatedGradientText from "./components/ui/AnimatedGradientText";
import PhysicsParticles from "./components/PhysicsParticles";
import ShaderBackground from "./components/ui/ShaderBackground";
import GlitchText from "./components/ui/GlitchText";
import ScrollRevealText from "./components/ui/ScrollRevealText";

export default function App() {
  const [enteredSite, setEnteredSite] = useState(false);
  const [sitePage, setSitePage] = useState("home");
  const [sceneReady, setSceneReady] = useState(false);
  const botPositionRef = useRef(new THREE.Vector3(0, -1.2, -2.1));
  const worksRef = useRef(null);
  const aboutRef = useRef(null);
  const servicesRef = useRef(null);

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
            <div className="site-background-layer">
              <SiteBackgroundBot />
            </div>
            <header className="site-nav">
              <div className="logo-badge">
                <img src="/branding/anarchy-logo.png" alt="Anarchy Studios" />
              </div>
              <nav>
                <button type="button" onClick={() => setSitePage("home")}>
                  Home
                </button>
                <button type="button" onClick={() => sitePage === "home" ? scrollToSection(worksRef) : setSitePage("home")}>
                  Work
                </button>
                <button type="button" onClick={() => sitePage === "home" ? scrollToSection(aboutRef) : setSitePage("home")}>
                  Studio
                </button>
                <button type="button" onClick={() => sitePage === "home" ? scrollToSection(servicesRef) : setSitePage("home")}>
                  Services
                </button>
              </nav>
            </header>

            {sitePage === "home" ? (
              <>
                <section ref={worksRef} className="works-section section-shell">
                  <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <article className="content-panel panel-hero">
                      <span className="editorial-number">01 / Works</span>
                      <p className="section-kicker">Watch The Showreel</p>
                      <h1><GlitchText>Work across diverse clients, genres, and cinematic styles.</GlitchText></h1>
                      <p>
                        Explore campaigns, branded worlds, and experimental motion crafted for clients
                        who want visual identity with edge.
                      </p>
                      <div className="panel-actions">
                        <button
                          type="button"
                          className="section-cta"
                          onClick={() => setSitePage("works")}
                        >
                          Enter works archive
                        </button>
                      </div>
                    </article>
                  </motion.div>
                  <ShowreelPlayer />
                </section>

                <div className="section-divider" />

                <section ref={aboutRef} className="content-section section-shell">
                  <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <article className="content-panel">
                      <span className="editorial-number">02 / Studio</span>
                      <p className="section-kicker">About The Studio</p>
                      <h2><ScrollRevealText text="We are obsessively crazy about craft, timing, and visual rebellion." stagger={0.04} /></h2>
                      <p>
                        Small team. Heavy intent. We combine animation, VFX, and AI production to create
                        work that feels alive, risky, and unmistakably original.
                      </p>
                      <div className="panel-actions">
                        <button
                          type="button"
                          className="section-cta"
                          onClick={() => setSitePage("studio")}
                        >
                          Meet the team
                        </button>
                      </div>
                    </article>
                  </motion.div>
                </section>

                <div className="section-divider" />

                <section ref={servicesRef} className="content-section section-shell">
                  <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <article className="content-panel">
                      <span className="editorial-number">03 / Services</span>
                      <p className="section-kicker">What We Do</p>
                      <h2><GlitchText>End-to-end visual pipelines from concept frames to final delivery.</GlitchText></h2>
                      <p>
                        Creative strategy, design direction, 3D environments, character animation, VFX,
                        and AI-assisted workflows designed for speed without losing artistic quality.
                      </p>
                      <ServicesGrid />
                    </article>
                  </motion.div>
                </section>

                <ContactSection />
              </>
            ) : sitePage === "works" ? (
              <section className="inside-page-placeholder content-section">
                <p className="section-kicker">Works Archive</p>
                <h2>All client projects</h2>
                <WorksGrid />
                <button type="button" className="section-cta" onClick={() => setSitePage("home")}>
                  Back to home
                </button>
                <ContactSection />
              </section>
            ) : (
              <section className="inside-page-placeholder content-section">
                <p className="section-kicker">Studio Page</p>
                <h2>
                  Studio story, team profiles, and process breakdown will live here next.
                </h2>
                <p>
                  This inside page shell is now wired. Next step can be building the full content layout.
                </p>
                <ContactSection />
                <button type="button" className="section-cta" onClick={() => setSitePage("home")}>
                  Back to home sections
                </button>
              </section>
            )}
          </motion.main>
        )}
      </AnimatePresence>
    </>
  );
}
