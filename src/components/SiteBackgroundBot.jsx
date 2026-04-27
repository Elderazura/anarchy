import { useCallback, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { resolveAnimationPath } from "../lib/animationMap";

function retargetAnimation(clip, sourceRoot, targetRoot) {
  if (!clip || !sourceRoot || !targetRoot) return null;
  const tracks = clip.tracks
    .map((track) => {
      const [trackName, property] = track.name.split(".");
      const src = sourceRoot.getObjectByName(trackName);
      if (!src) return null;
      const tgt = targetRoot.getObjectByName(src.name);
      if (!tgt) return null;
      const cloned = track.clone();
      cloned.name = `${tgt.name}.${property}`;
      return cloned;
    })
    .filter(Boolean);
  if (!tracks.length) return null;
  return new THREE.AnimationClip(clip.name, clip.duration, tracks);
}

const SCENES = [
  {
    name: "patrol",
    weight: 4,
    beats: [
      { clip: "walking",       duration: 5.5, speed: 0.55, zone: "far" },
      { clip: "idle",          duration: 3.2, speed: 0,    zone: "far" },
      { clip: "agree-gesture", duration: 2.8, speed: 0,    zone: "far" },
      { clip: "walking",       duration: 4.5, speed: 0.55, zone: "far" },
    ],
  },
  {
    name: "workout",
    weight: 2,
    beats: [
      { clip: "run-fast",        duration: 2.6, speed: 1.9, zone: "mid" },
      { clip: "boxing-practice", duration: 6.5, speed: 0,   zone: "mid" },
      { clip: "skill-01",        duration: 3.2, speed: 0,   zone: "mid" },
      { clip: "idle",            duration: 2.4, speed: 0,   zone: "mid" },
    ],
  },
  {
    name: "party",
    weight: 1,
    beats: [
      { clip: "run-fast",        duration: 2.8, speed: 1.8, zone: "mid" },
      { clip: "all-night-dance", duration: 7.0, speed: 0,   zone: "mid" },
      { clip: "idle",            duration: 2.0, speed: 0,   zone: "mid" },
    ],
  },
  {
    name: "incident",
    weight: 1,
    beats: [
      { clip: "unsteady-walk", duration: 4.5, speed: 0.45, zone: "far" },
      { clip: "dead",          duration: 3.6, speed: 0,    zone: "far" },
      { clip: "arise",         duration: 3.2, speed: 0,    zone: "far" },
      { clip: "alert",         duration: 2.0, speed: 0,    zone: "far" },
      { clip: "running",       duration: 3.4, speed: 1.2,  zone: "mid" },
    ],
  },
  {
    name: "scout",
    weight: 2,
    beats: [
      { clip: "alert",      duration: 2.5, speed: 0,    zone: "mid" },
      { clip: "skill-03",   duration: 3.8, speed: 0,    zone: "mid" },
      { clip: "boom-dance", duration: 4.2, speed: 0,    zone: "mid" },
      { clip: "walking",    duration: 4.0, speed: 0.55, zone: "far" },
    ],
  },
  {
    name: "dance-far",
    weight: 1,
    beats: [
      { clip: "skill-01",        duration: 3.2, speed: 0, zone: "far" },
      { clip: "all-night-dance", duration: 7.5, speed: 0, zone: "far" },
      { clip: "idle",            duration: 2.0, speed: 0, zone: "far" },
    ],
  },
  {
    name: "foreground-cross",
    weight: 0,
    isForeground: true,
    beats: [
      { clip: "casual-walk", duration: 9.0, speed: 1.05, zone: "foreground" },
    ],
  },
];

// Which section is in view based on scroll position
function getActiveSection(scrollY) {
  const vh = window.innerHeight;
  if (scrollY < vh * 1.8) return "works";
  if (scrollY < vh * 3.6) return "studio";
  if (scrollY < vh * 5.8) return "services";
  return "contact";
}

// Per-section preferred scene names — shapes the weighted random draw
const SECTION_SCENE_BIAS = {
  works:    ["workout", "party", "scout"],       // energy, celebration, curiosity
  studio:   ["patrol", "dance-far", "scout"],    // deliberate, contemplative
  services: ["workout", "scout", "party"],       // power, performance
  contact:  ["foreground-cross", "workout"],     // dramatic presence
};

function pickScene(previousName, sceneCount, lastFgScene, section = "works") {
  // Contact zone cranks up foreground frequency for drama
  const fgChance = section === "contact" ? 0.52 : 0.28;
  const canDoFg = sceneCount - lastFgScene >= 2;
  if (canDoFg && Math.random() < fgChance) {
    return SCENES.find((s) => s.name === "foreground-cross");
  }

  const preferred = SECTION_SCENE_BIAS[section] ?? [];
  const eligible = SCENES.filter((s) => s.weight > 0 && s.name !== previousName);

  // Preferred scenes get 3× weight — still random, just biased
  const total = eligible.reduce(
    (sum, s) => sum + (preferred.includes(s.name) ? s.weight * 3 : s.weight),
    0,
  );
  let r = Math.random() * total;
  for (const scene of eligible) {
    r -= preferred.includes(scene.name) ? scene.weight * 3 : scene.weight;
    if (r <= 0) return scene;
  }
  return eligible[0];
}

// Zone targets shift per section so the bot migrates across the viewport
function getZoneTarget(zone, section = "works") {
  if (zone === "foreground") return { x: 0, z: -1.9 };

  // Section-biased X offset keeps bot on the interesting side of the screen
  const xBias = { works: 1.4, studio: -1.4, services: 0.6, contact: 0 }[section] ?? 0;

  if (zone === "far") {
    return {
      x: THREE.MathUtils.randFloat(-2.8 + xBias, 2.8 + xBias),
      z: THREE.MathUtils.randFloat(-7.4, -5.2),
    };
  }
  // mid
  return {
    x: THREE.MathUtils.randFloat(-2.0 + xBias, 2.0 + xBias),
    z: THREE.MathUtils.randFloat(-4.5, -3.0),
  };
}

function BotActor({ onForegroundChange, onBotUpdate }) {
  const group = useRef(null);
  const mixerRef = useRef(null);
  const actionRef = useRef(null);
  const beatTimerRef = useRef(0);
  const travelTargetRef = useRef(new THREE.Vector3(0, -1.2, -6.0));
  const sceneRef = useRef(null);
  const beatIndexRef = useRef(0);
  const sceneCountRef = useRef(0);
  const lastFgSceneRef = useRef(-999);
  const fgFromRightRef = useRef(true);
  const speedMultRef = useRef(1.0);

  // Section awareness
  const activeSectionRef = useRef("works");
  const prevSectionRef = useRef("works");

  // Physics refs
  const physicsRef = useRef("scene");
  const fallVelocityRef = useRef(0);
  const fallTriggeredRef = useRef(false);
  const ariseTriggeredRef = useRef(false);
  const ariseQueueRef = useRef(false);
  const fallAnimPlayedRef = useRef(false);
  const clipsRef = useRef({});

  // Load all animations
  const character   = useGLTF("/models/character.glb");
  const gIdle       = useGLTF(resolveAnimationPath("idle"));
  const gWalking    = useGLTF(resolveAnimationPath("walking"));
  const gCasualWalk = useGLTF(resolveAnimationPath("casual-walk"));
  const gRunning    = useGLTF(resolveAnimationPath("running"));
  const gRunFast    = useGLTF(resolveAnimationPath("run-fast"));
  const gBoxing     = useGLTF(resolveAnimationPath("boxing-practice"));
  const gUnsteady   = useGLTF(resolveAnimationPath("unsteady-walk"));
  const gDead       = useGLTF(resolveAnimationPath("dead"));
  const gArise      = useGLTF(resolveAnimationPath("arise"));
  const gAlert      = useGLTF(resolveAnimationPath("alert"));
  const gAgree      = useGLTF(resolveAnimationPath("agree-gesture"));
  const gBoomDance  = useGLTF(resolveAnimationPath("boom-dance"));
  const gAllNight   = useGLTF(resolveAnimationPath("all-night-dance"));
  const gSkill01    = useGLTF(resolveAnimationPath("skill-01"));
  const gSkill03    = useGLTF(resolveAnimationPath("skill-03"));

  const clips = useMemo(() => {
    const raw = {
      idle:              gIdle,
      walking:           gWalking,
      "casual-walk":     gCasualWalk,
      running:           gRunning,
      "run-fast":        gRunFast,
      "boxing-practice": gBoxing,
      "unsteady-walk":   gUnsteady,
      dead:              gDead,
      arise:             gArise,
      alert:             gAlert,
      "agree-gesture":   gAgree,
      "boom-dance":      gBoomDance,
      "all-night-dance": gAllNight,
      "skill-01":        gSkill01,
      "skill-03":        gSkill03,
    };
    return Object.fromEntries(
      Object.entries(raw).map(([key, glb]) => [
        key,
        retargetAnimation(glb.animations?.[0], glb.scene, character.scene),
      ]),
    );
  }, [character.scene, gIdle, gWalking, gCasualWalk, gRunning, gRunFast, gBoxing, gUnsteady, gDead, gArise, gAlert, gAgree, gBoomDance, gAllNight, gSkill01, gSkill03]);

  useEffect(() => { clipsRef.current = clips; }, [clips]);

  useEffect(() => {
    character.scene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  }, [character.scene]);

  const playClip = useCallback((clipName) => {
    const clip = clipsRef.current[clipName] ?? clipsRef.current.idle;
    const mixer = mixerRef.current;
    if (!clip || !mixer) return;
    const action = mixer.clipAction(clip);
    action.reset().fadeIn(0.45).play();
    if (actionRef.current && actionRef.current !== action) {
      actionRef.current.fadeOut(0.35);
    }
    actionRef.current = action;
  }, []);

  const isForegroundRef = useRef(false);

  const startBeat = useCallback((beat) => {
    beatTimerRef.current = 0;
    speedMultRef.current = 0.82 + Math.random() * 0.36;
    playClip(beat.clip);
    const root = group.current;
    const entering = beat.zone === "foreground";
    if (entering !== isForegroundRef.current) {
      isForegroundRef.current = entering;
      onForegroundChange?.(entering);
    }
    if (entering && root) {
      const fromRight = fgFromRightRef.current;
      root.position.set(fromRight ? 5.4 : -5.4, -1.2, -1.9);
      travelTargetRef.current.set(fromRight ? -5.4 : 5.4, -1.2, -1.9);
    } else {
      const t = getZoneTarget(beat.zone, activeSectionRef.current);
      travelTargetRef.current.set(t.x, -1.2, t.z);
    }
  }, [playClip, onForegroundChange]);

  // Boot scene machine on mount (after a short delay so clips are ready)
  useEffect(() => {
    const root = group.current;
    if (!root) return;
    mixerRef.current = new THREE.AnimationMixer(root);
    const t = window.setTimeout(() => {
      const scene = pickScene(null, 0, lastFgSceneRef.current, activeSectionRef.current);
      sceneRef.current = scene;
      beatIndexRef.current = 0;
      sceneCountRef.current = 1;
      startBeat(scene.beats[0]);
    }, 300);
    return () => window.clearTimeout(t);
  }, [startBeat]);

  // Scroll listener — physics + section awareness
  useEffect(() => {
    const onScroll = () => {
      const sy = window.scrollY;
      const vh = window.innerHeight;
      const FALL_SCROLL  = vh * 0.85;
      const ARISE_SCROLL = vh * 1.2;
      const RESET_SCROLL = vh * 0.2;

      // ── Section change detection ────────────────────────────
      const newSection = getActiveSection(sy);
      if (newSection !== prevSectionRef.current) {
        prevSectionRef.current = newSection;
        activeSectionRef.current = newSection;

        // On section boundary: if bot is in a safe stationary beat, nudge it to
        // pick a new section-appropriate scene on its next transition. We do this
        // by reducing the remaining beat timer so it transitions sooner.
        if (physicsRef.current === "scene" && sceneRef.current) {
          const beat = sceneRef.current.beats[beatIndexRef.current];
          // Only interrupt stationary beats (not walking/running)
          if (beat && beat.speed === 0 && beatTimerRef.current > 0.8) {
            beatTimerRef.current = beat.duration - 0.4; // expire in 0.4s
          }
        }
      } else {
        activeSectionRef.current = newSection;
      }

      // ── Physics: scroll-driven fall/arise ──────────────────
      if (sy < RESET_SCROLL && (fallTriggeredRef.current || ariseTriggeredRef.current)) {
        fallTriggeredRef.current = false;
        ariseTriggeredRef.current = false;
        fallVelocityRef.current = 0;
        fallAnimPlayedRef.current = false;
        physicsRef.current = "scene";
        const root = group.current;
        if (root) {
          root.position.y = -1.2;
          root.rotation.z = 0;
          root.rotation.x = 0;
        }
        const scene = pickScene(null, sceneCountRef.current, lastFgSceneRef.current, activeSectionRef.current);
        sceneRef.current = scene;
        beatIndexRef.current = 0;
        sceneCountRef.current++;
        startBeat(scene.beats[0]);
        return;
      }

      if (sy > FALL_SCROLL && !fallTriggeredRef.current && physicsRef.current === "scene") {
        fallTriggeredRef.current = true;
        fallVelocityRef.current = 0;
        fallAnimPlayedRef.current = false;
        physicsRef.current = "falling";
        const root = group.current;
        if (root) root.position.z = -2.5;
      }

      if (
        sy > ARISE_SCROLL &&
        fallTriggeredRef.current &&
        !ariseTriggeredRef.current &&
        (physicsRef.current === "fallen" || physicsRef.current === "falling")
      ) {
        ariseTriggeredRef.current = true;
        ariseQueueRef.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [startBeat]);

  useFrame((state, delta) => {
    const root = group.current;
    if (!root) return;
    mixerRef.current?.update(delta);

    // --- ARISE QUEUE ---
    if (ariseQueueRef.current) {
      ariseQueueRef.current = false;
      root.position.set(THREE.MathUtils.randFloat(-1.5, 1.5), -4.2, -3.0);
      root.rotation.z = 0;
      root.rotation.x = 0;
      playClip("arise");
      physicsRef.current = "arising";
    }

    // --- FALLING ---
    if (physicsRef.current === "falling") {
      if (!fallAnimPlayedRef.current) {
        fallAnimPlayedRef.current = true;
        playClip("unsteady-walk");
        // After 1.4s switch to dead
        window.setTimeout(() => {
          if (physicsRef.current === "falling" || physicsRef.current === "fallen") {
            playClip("dead");
          }
        }, 1400);
      }

      fallVelocityRef.current = Math.min(fallVelocityRef.current + 11 * delta, 9);
      root.position.y -= fallVelocityRef.current * delta;
      root.position.z = THREE.MathUtils.lerp(root.position.z, -2.2, 0.04);
      root.rotation.z = THREE.MathUtils.lerp(root.rotation.z, -0.45, 0.06);
      root.rotation.x = THREE.MathUtils.lerp(root.rotation.x, 0.18, 0.04);

      if (root.position.y < -4.5) {
        root.position.y = -4.5;
        physicsRef.current = "fallen";
        if (window.scrollY > window.innerHeight * 1.2 && !ariseTriggeredRef.current) {
          ariseTriggeredRef.current = true;
          ariseQueueRef.current = true;
        }
      }
      return;
    }

    // --- FALLEN ---
    if (physicsRef.current === "fallen") {
      return;
    }

    // --- ARISING ---
    if (physicsRef.current === "arising") {
      root.position.y = THREE.MathUtils.lerp(root.position.y, -1.2, 0.022);
      root.rotation.z = THREE.MathUtils.lerp(root.rotation.z, 0, 0.08);
      root.rotation.x = THREE.MathUtils.lerp(root.rotation.x, 0, 0.08);

      if (Math.abs(root.position.y - (-1.2)) < 0.06) {
        root.position.y = -1.2;
        root.rotation.z = 0;
        root.rotation.x = 0;
        physicsRef.current = "scene";
        // Post-arise: always play scout scene (bot reacts to the fall)
        const recovery = SCENES.find((s) => s.name === "scout") ?? pickScene(null, sceneCountRef.current + 1, lastFgSceneRef.current);
        sceneRef.current = recovery;
        beatIndexRef.current = 0;
        sceneCountRef.current++;
        startBeat(recovery.beats[0]);
      }
      return;
    }

    // --- SCENE MACHINE ---
    if (!sceneRef.current) return;
    beatTimerRef.current += delta;

    const scene = sceneRef.current;
    const beat = scene.beats[beatIndexRef.current];

    if (beatTimerRef.current >= beat.duration) {
      const nextIdx = beatIndexRef.current + 1;
      if (nextIdx < scene.beats.length) {
        beatIndexRef.current = nextIdx;
        startBeat(scene.beats[nextIdx]);
      } else {
        if (scene.isForeground) fgFromRightRef.current = !fgFromRightRef.current;
        const prevName = scene.name;
        sceneCountRef.current++;
        const next = pickScene(prevName, sceneCountRef.current, lastFgSceneRef.current, activeSectionRef.current);
        if (next.isForeground) lastFgSceneRef.current = sceneCountRef.current;
        sceneRef.current = next;
        beatIndexRef.current = 0;
        startBeat(next.beats[0]);
      }
      return;
    }

    // Broadcast screen position + current clip for DOM physics
    if (onBotUpdate && root) {
      const pos = root.position.clone();
      pos.project(state.camera);
      const sx = (pos.x * 0.5 + 0.5) * window.innerWidth;
      const sy = (-pos.y * 0.5 + 0.5) * window.innerHeight + window.scrollY;
      const currentClip = sceneRef.current?.beats[beatIndexRef.current]?.clip ?? "idle";
      onBotUpdate(sx, sy, currentClip);
    }

    // Movement
    if (beat.speed > 0) {
      const effectiveSpeed = beat.speed * speedMultRef.current;
      const toTarget = travelTargetRef.current.clone().sub(root.position);
      toTarget.y = 0;
      const dist = toTarget.length();
      if (dist > 0.05) {
        root.position.addScaledVector(toTarget.normalize(), Math.min(dist, effectiveSpeed * delta));
        const yaw = Math.atan2(toTarget.x, toTarget.z);
        root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, yaw, 0.09);
      }
    } else {
      // Stationary: face slightly toward section's focal side, not dead-center
      const facingBias = { works: -0.18, studio: 0.18, services: -0.08, contact: 0 }[activeSectionRef.current] ?? 0;
      root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, facingBias, 0.04);
      root.position.y = -1.2 + Math.sin(state.clock.elapsedTime * 0.7) * 0.018;
    }
  });

  return (
    <group ref={group} position={[0, -1.2, -5.6]} scale={1.35}>
      <primitive object={character.scene} />
    </group>
  );
}

export default function SiteBackgroundBot({ onForegroundChange, onBotUpdate }) {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 7.8], fov: 36 }}
      shadows
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <ambientLight intensity={0.28} />
      <hemisphereLight intensity={0.24} groundColor="#0a1216" />
      <directionalLight position={[5, 7, 5]} intensity={0.78} castShadow />
      <BotActor onForegroundChange={onForegroundChange} onBotUpdate={onBotUpdate} />
    </Canvas>
  );
}

useGLTF.preload("/models/character.glb");
useGLTF.preload(resolveAnimationPath("idle"));
useGLTF.preload(resolveAnimationPath("walking"));
useGLTF.preload(resolveAnimationPath("casual-walk"));
useGLTF.preload(resolveAnimationPath("running"));
useGLTF.preload(resolveAnimationPath("run-fast"));
useGLTF.preload(resolveAnimationPath("boxing-practice"));
useGLTF.preload(resolveAnimationPath("unsteady-walk"));
useGLTF.preload(resolveAnimationPath("dead"));
useGLTF.preload(resolveAnimationPath("arise"));
useGLTF.preload(resolveAnimationPath("alert"));
useGLTF.preload(resolveAnimationPath("agree-gesture"));
useGLTF.preload(resolveAnimationPath("boom-dance"));
useGLTF.preload(resolveAnimationPath("all-night-dance"));
useGLTF.preload(resolveAnimationPath("skill-01"));
useGLTF.preload(resolveAnimationPath("skill-03"));
