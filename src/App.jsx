import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Character from "./components/Character";
import ShowreelBotWalk from "./components/ShowreelBotWalk";
import { generateBotQuip } from "./lib/botQuips";
import World from "./components/World";

export default function App() {
  const [enteredSite, setEnteredSite] = useState(false);
  const [quipText, setQuipText] = useState("");
  const [quipVisible, setQuipVisible] = useState(false);
  const botPositionRef = useRef(new THREE.Vector3(0, -1.2, -2.1));
  const worksRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

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
      {!enteredSite ? (
        <section className="hero-loader">
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
                onIntroReady={() => {}}
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

          <div className="hero-noise-layer" />
          <div className="logo-badge">
            <img src="/branding/anarchy-logo.png" alt="Anarchy Studios" />
          </div>
          <div className="hero-copy">
            <p className="section-kicker">Cinematic Character Worlds</p>
            <h1>Welcome to Anarchy Studios</h1>
            <p>Animation | VFX | AI | Crypto</p>
          </div>
          <div className="hero-actions">
            <button
              type="button"
              className="hero-action-simple hero-action-main"
              onClick={() => enterSiteAndScroll(worksRef)}
            >
              Work
            </button>
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
              onClick={() => enterSiteAndScroll(contactRef)}
            >
              Contact
            </button>
          </div>
        </section>
      ) : null}

      {enteredSite ? <main className="studio-site"> 
        <header className="site-nav">
          <div className="logo-badge">
            <img src="/branding/anarchy-logo.png" alt="Anarchy Studios" />
          </div>
          <nav>
            <button type="button" onClick={() => scrollToSection(worksRef)}>
              Work
            </button>
            <button type="button" onClick={() => scrollToSection(aboutRef)}>
              Studio
            </button>
            <button type="button" onClick={() => scrollToSection(contactRef)}>
              Contact
            </button>
          </nav>
        </header>

        <section ref={worksRef} className="works-section">
          <div className="showreel-card">
            <p className="section-kicker">Main Showreel</p>
            <h1>Stories forged in motion, light, and rebellion.</h1>
            <p>
              This is where Anarchy&apos;s latest visuals drop first. Signature cinematic reels,
              stylized campaigns, and experiments that cut through noise.
            </p>
            <div className="showreel-media">SHOWREEL PLAYBACK SURFACE</div>
          </div>
          <div className="showreel-bot-lane">
            <ShowreelBotWalk mode="section" quipText={quipVisible ? quipText : ""} />
          </div>
        </section>

        <section ref={aboutRef} className="content-section">
          <p className="section-kicker">Know About Studio</p>
          <h2>We design worlds with character-first storytelling.</h2>
        </section>

        <section ref={contactRef} className="content-section">
          <p className="section-kicker">Talk To Us</p>
          <h2>Bring your wildest visual idea. We will build its pulse.</h2>
        </section>
      </main> : null}
    </>
  );
}
