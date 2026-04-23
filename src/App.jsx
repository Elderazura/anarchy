import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import Character from "./components/Character";
import SiteBackgroundBot from "./components/SiteBackgroundBot";
import { generateBotQuip } from "./lib/botQuips";
import World from "./components/World";
import LoadingScreen from "./components/LoadingScreen";
import ShowreelPlayer from "./components/ShowreelPlayer";
import WorksGrid from "./components/WorksGrid";
import ServicesGrid from "./components/ServicesGrid";
import ContactSection from "./components/ContactSection";
import ShimmerButton from "./components/ui/ShimmerButton";
import AnimatedGradientText from "./components/ui/AnimatedGradientText";
import PhysicsParticles from "./components/PhysicsParticles";

export default function App() {
  const [enteredSite, setEnteredSite] = useState(false);
  const [sitePage, setSitePage] = useState("home");
  const [quipText, setQuipText] = useState("");
  const [quipVisible, setQuipVisible] = useState(false);
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

  useEffect(() => {
    let active = true;
    let intervalId;
    let hideTimer;

    const showQuip = async () => {
      const text = await generateBotQuip(enteredSite ? "site" : "hero");
      if (!active) {
        return;
      }
      setQuipText(text);
      setQuipVisible(true);
      hideTimer = window.setTimeout(() => {
        if (active) {
          setQuipVisible(false);
        }
      }, 5600);
    };

    const start = window.setTimeout(showQuip, 2600);
    intervalId = window.setInterval(showQuip, 24000);

    return () => {
      active = false;
      window.clearTimeout(start);
      window.clearTimeout(hideTimer);
      window.clearInterval(intervalId);
    };
  }, [enteredSite]);

  return (
    <>
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
                  botLine={quipVisible ? quipText : ""}
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
              <h1>
                Welcome to
                <br />
                Anarchy Studios
              </h1>
              <p>Animation | VFX | AI | Crypto</p>
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
                      <p className="section-kicker">Watch The Showreel</p>
                      <h1>Work across diverse clients, genres, and cinematic styles.</h1>
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

                <section ref={aboutRef} className="content-section section-shell">
                  <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <article className="content-panel">
                      <p className="section-kicker">About The Studio</p>
                      <h2>We are obsessively crazy about craft, timing, and visual rebellion.</h2>
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

                <section ref={servicesRef} className="content-section section-shell">
                  <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <article className="content-panel">
                      <p className="section-kicker">What We Do</p>
                      <h2>End-to-end visual pipelines from concept frames to final delivery.</h2>
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
