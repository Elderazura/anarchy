import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Character from "./components/Character";
import ShowreelBotWalk from "./components/ShowreelBotWalk";
import SiteBackgroundBot from "./components/SiteBackgroundBot";
import { generateBotQuip } from "./lib/botQuips";
import World from "./components/World";

export default function App() {
  const [enteredSite, setEnteredSite] = useState(false);
  const [sitePage, setSitePage] = useState("home");
  const [quipText, setQuipText] = useState("");
  const [quipVisible, setQuipVisible] = useState(false);
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
            <h1>
              Welcome to
              <br />
              Anarchy Studios
            </h1>
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
              onClick={() => enterSiteAndScroll(servicesRef)}
            >
              Services
            </button>
          </div>
        </section>
      ) : null}

      {enteredSite ? <main className="studio-site">
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
            <section ref={worksRef} className="works-section">
          <div className="showreel-card">
            <p className="section-kicker">Watch The Showreel</p>
            <h1>We have worked across diverse clients and visual worlds.</h1>
            <p>
              Start with our reel to feel our range: campaigns, stylized worlds, and high-impact
              motion stories built for brands that want to stand out.
            </p>
            <button
              type="button"
              className="section-cta"
              onClick={() => setSitePage("works")}
            >
              Explore all works
            </button>
            <div className="showreel-media">SHOWREEL PLAYBACK SURFACE</div>
          </div>
          <div className="showreel-bot-lane">
            <ShowreelBotWalk mode="section" quipText={quipVisible ? quipText : ""} />
          </div>
        </section>

        <section ref={aboutRef} className="content-section">
          <p className="section-kicker">About The Studio</p>
          <h2>We are intentionally crazy about craft, story, and bold visual risk.</h2>
          <p>
            Anarchy Studio is a small high-intensity crew shaping animation, VFX, and AI-assisted
            visuals with a rebellious design voice.
          </p>
          <button
            type="button"
            className="section-cta"
            onClick={() => setSitePage("studio")}
          >
            Meet the studio + team
          </button>
        </section>

        <section ref={servicesRef} className="content-section">
          <p className="section-kicker">What We Do</p>
          <h2>From concept to cinematic delivery, we build complete visual pipelines.</h2>
          <p>
            Creative development, 3D worlds, character animation, VFX sequences, and AI-powered
            production workflows.
          </p>
        </section>
          </>
        ) : (
          <section className="inside-page-placeholder content-section">
            <p className="section-kicker">
              {sitePage === "works" ? "Works Page" : "Studio Page"}
            </p>
            <h2>
              {sitePage === "works"
                ? "All client projects and case studies will live here next."
                : "Studio story, team profiles, and process breakdown will live here next."}
            </h2>
            <p>
              This inside page shell is now wired. Next step can be building the full content layout.
            </p>
            <button type="button" className="section-cta" onClick={() => setSitePage("home")}>
              Back to home sections
            </button>
          </section>
        )}
      </main> : null}
    </>
  );
}
