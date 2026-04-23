import { useEffect, useMemo, useRef, useState } from "react";
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

// ---------------------------------------------------------------------------
// Scene definitions — each scene is a named sequence of beats.
// A beat: { clip, duration (s), speed (units/s), zone }
// Zones: "far" (deep bg), "mid" (middle ground), "foreground" (walks past camera)
// ---------------------------------------------------------------------------
const SCENES = [
  {
    // Casual patrol: walk → observe → nod → walk on
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
    // Training: sprint in → box → pull off a skill → rest
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
    // Full send: sprint → big dance
    name: "party",
    weight: 1,
    beats: [
      { clip: "run-fast",        duration: 2.8, speed: 1.8, zone: "mid" },
      { clip: "all-night-dance", duration: 7.0, speed: 0,   zone: "mid" },
      { clip: "idle",            duration: 2.0, speed: 0,   zone: "mid" },
    ],
  },
  {
    // Drama: stumble → collapse → rise → alert → flee
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
    // Alert scout: startle → show skill → boom → slink away
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
    // Far-bg showcase: skill → all-night-dance → idle
    name: "dance-far",
    weight: 1,
    beats: [
      { clip: "skill-01",        duration: 3.2, speed: 0, zone: "far" },
      { clip: "all-night-dance", duration: 7.5, speed: 0, zone: "far" },
      { clip: "idle",            duration: 2.0, speed: 0, zone: "far" },
    ],
  },
  {
    // THE MONEY SHOT — casual walk right past the camera in the foreground
    name: "foreground-cross",
    weight: 0,   // only triggered by scene counter, never random
    isForeground: true,
    beats: [
      { clip: "casual-walk", duration: 9.0, speed: 1.05, zone: "foreground" },
    ],
  },
];

// Weighted random, excludes foreground-cross and previous scene
function pickScene(previousName, sceneCount) {
  if (sceneCount > 0 && sceneCount % 4 === 0) {
    return SCENES.find((s) => s.name === "foreground-cross");
  }
  const eligible = SCENES.filter(
    (s) => s.weight > 0 && s.name !== previousName,
  );
  const total = eligible.reduce((sum, s) => sum + s.weight, 0);
  let r = Math.random() * total;
  for (const scene of eligible) {
    r -= scene.weight;
    if (r <= 0) return scene;
  }
  return eligible[0];
}

function getZoneTarget(zone) {
  if (zone === "far") {
    return {
      x: THREE.MathUtils.randFloat(-3.2, 3.2),
      z: THREE.MathUtils.randFloat(-7.4, -5.2),
    };
  }
  if (zone === "mid") {
    return {
      x: THREE.MathUtils.randFloat(-2.4, 2.4),
      z: THREE.MathUtils.randFloat(-4.5, -3.0),
    };
  }
  // foreground: target is the far side (start pos set separately)
  return { x: 0, z: -1.9 }; // overridden per-direction in effect
}

// ---------------------------------------------------------------------------
// BotActor
// ---------------------------------------------------------------------------
function BotActor() {
  const group = useRef(null);
  const mixerRef = useRef(null);
  const actionRef = useRef(null);
  const beatTimerRef = useRef(0);
  const travelTargetRef = useRef(new THREE.Vector3(0, -1.2, -6.0));
  const sceneRef = useRef(null);
  const beatIndexRef = useRef(0);
  const sceneCountRef = useRef(0);
  const fgFromRightRef = useRef(true); // alternates foreground cross direction

  // --- Scroll physics refs ---
  const physicsRef = useRef('scene'); // 'scene' | 'falling' | 'fallen' | 'arising'
  const fallVelocityRef = useRef(0);
  const fallTriggeredRef = useRef(false);
  const ariseTriggeredRef = useRef(false);
  const ariseQueueRef = useRef(false); // set from scroll listener, consumed in useFrame
  const clipsRef = useRef({});        // mirror of clips for use in scroll listener

  const [activeBeat, setActiveBeat] = useState(null);

  // Load all animations
  const character    = useGLTF("/models/character.glb");
  const gIdle        = useGLTF(resolveAnimationPath("idle"));
  const gWalking     = useGLTF(resolveAnimationPath("walking"));
  const gCasualWalk  = useGLTF(resolveAnimationPath("casual-walk"));
  const gRunning     = useGLTF(resolveAnimationPath("running"));
  const gRunFast     = useGLTF(resolveAnimationPath("run-fast"));
  const gBoxing      = useGLTF(resolveAnimationPath("boxing-practice"));
  const gUnsteady    = useGLTF(resolveAnimationPath("unsteady-walk"));
  const gDead        = useGLTF(resolveAnimationPath("dead"));
  const gArise       = useGLTF(resolveAnimationPath("arise"));
  const gAlert       = useGLTF(resolveAnimationPath("alert"));
  const gAgree       = useGLTF(resolveAnimationPath("agree-gesture"));
  const gBoomDance   = useGLTF(resolveAnimationPath("boom-dance"));
  const gAllNight    = useGLTF(resolveAnimationPath("all-night-dance"));
  const gSkill01     = useGLTF(resolveAnimationPath("skill-01"));
  const gSkill03     = useGLTF(resolveAnimationPath("skill-03"));

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

  // Keep clipsRef in sync for use inside scroll listener (closure-safe)
  useEffect(() => { clipsRef.current = clips; }, [clips]);

  useEffect(() => {
    character.scene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  }, [character.scene]);

  // Boot the scene machine on mount
  useEffect(() => {
    const scene = pickScene(null, 0);
    sceneRef.current = scene;
    beatIndexRef.current = 0;
    sceneCountRef.current = 1;
    setActiveBeat(scene.beats[0]);
  }, []);

  // Scroll-driven physics listener — runs once on mount
  useEffect(() => {
    const FALL_SCROLL  = window.innerHeight * 0.85;
    const ARISE_SCROLL = window.innerHeight * 1.4;
    const RESET_SCROLL = window.innerHeight * 0.3;

    const onScroll = () => {
      const sy = window.scrollY;

      // User scrolled back up — reset the whole cycle so it can happen again
      if (sy < RESET_SCROLL && (fallTriggeredRef.current || ariseTriggeredRef.current)) {
        fallTriggeredRef.current = false;
        ariseTriggeredRef.current = false;
        fallVelocityRef.current = 0;
        physicsRef.current = 'scene';
        if (group.current) {
          group.current.position.y = -1.2;
          group.current.rotation.z = 0;
        }
        return;
      }

      // Trigger fall when scroll crosses first section gap
      if (sy > FALL_SCROLL && !fallTriggeredRef.current && physicsRef.current === 'scene') {
        fallTriggeredRef.current = true;
        fallVelocityRef.current = 0;
        physicsRef.current = 'falling';
        // Bring bot into mid-foreground so the fall is visible
        if (group.current) {
          group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, -2.5, 1);
        }
      }

      // Trigger arise when user is into the next section
      if (
        sy > ARISE_SCROLL &&
        fallTriggeredRef.current &&
        !ariseTriggeredRef.current &&
        (physicsRef.current === 'fallen' || physicsRef.current === 'falling')
      ) {
        ariseTriggeredRef.current = true;
        ariseQueueRef.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // When beat changes: swap animation + set travel target
  useEffect(() => {
    if (!activeBeat) return;

    const root = group.current;
    if (!mixerRef.current && root) {
      mixerRef.current = new THREE.AnimationMixer(root);
    }

    const clip = clips[activeBeat.clip] ?? clips.idle;
    if (clip && mixerRef.current) {
      const action = mixerRef.current.clipAction(clip);
      action.reset().fadeIn(0.55).play();
      if (actionRef.current && actionRef.current !== action) {
        actionRef.current.fadeOut(0.42);
      }
      actionRef.current = action;
    }

    beatTimerRef.current = 0;

    // Position + travel target
    if (activeBeat.zone === "foreground" && root) {
      const fromRight = fgFromRightRef.current;
      const startX = fromRight ? 5.4 : -5.4;
      const endX   = fromRight ? -5.4 : 5.4;
      root.position.set(startX, -1.2, -1.9);
      travelTargetRef.current.set(endX, -1.2, -1.9);
    } else {
      const t = getZoneTarget(activeBeat.zone);
      travelTargetRef.current.set(t.x, -1.2, t.z);
    }
  }, [activeBeat, clips]);

  useFrame((state, delta) => {
    const root = group.current;
    if (!root) return;
    mixerRef.current?.update(delta);

    // --- ARISE QUEUE (from scroll listener) ---
    if (ariseQueueRef.current) {
      ariseQueueRef.current = false;
      // Place bot just below the camera's visible floor
      root.position.set(THREE.MathUtils.randFloat(-1.5, 1.5), -4.2, -3.0);
      root.rotation.z = 0;
      root.rotation.x = 0;
      // Play arise animation
      const ariseClip = clipsRef.current['arise'];
      if (ariseClip && mixerRef.current) {
        const action = mixerRef.current.clipAction(ariseClip);
        action.reset().fadeIn(0.3).play();
        if (actionRef.current && actionRef.current !== action) {
          actionRef.current.fadeOut(0.3);
        }
        actionRef.current = action;
      }
      physicsRef.current = 'arising';
    }

    // --- FALLING ---
    if (physicsRef.current === 'falling') {
      fallVelocityRef.current = Math.min(fallVelocityRef.current + 11 * delta, 9);
      root.position.y -= fallVelocityRef.current * delta;
      // Drift toward camera and tilt during fall — makes it dramatic
      root.position.z = THREE.MathUtils.lerp(root.position.z, -2.2, 0.04);
      root.rotation.z = THREE.MathUtils.lerp(root.rotation.z, -0.45, 0.06);

      if (root.position.y < -4.5) {
        root.position.y = -4.5;
        physicsRef.current = 'fallen';
        // Edge case: if user scrolled fast past arise threshold, queue arise now
        if (window.scrollY > window.innerHeight * 1.4 && !ariseTriggeredRef.current) {
          ariseTriggeredRef.current = true;
          ariseQueueRef.current = true;
        }
      }
      return; // skip scene machine during fall
    }

    // --- FALLEN (parked below screen, waiting) ---
    if (physicsRef.current === 'fallen') {
      return; // scene machine paused
    }

    // --- ARISING (rising from below with arise animation) ---
    if (physicsRef.current === 'arising') {
      root.position.y = THREE.MathUtils.lerp(root.position.y, -1.2, 0.022);
      root.rotation.z = THREE.MathUtils.lerp(root.rotation.z, 0, 0.07);

      if (Math.abs(root.position.y - (-1.2)) < 0.06) {
        root.position.y = -1.2;
        root.rotation.z = 0;
        physicsRef.current = 'scene';
        // Resume scene machine with a fresh scene
        const next = pickScene(null, sceneCountRef.current + 1);
        sceneRef.current = next;
        beatIndexRef.current = 0;
        sceneCountRef.current += 1;
        setActiveBeat(next.beats[0]);
      }
      return; // skip scene machine while arising
    }

    // --- NORMAL SCENE MACHINE (only runs when physicsRef === 'scene') ---
    if (!activeBeat) return;
    beatTimerRef.current += delta;

    // Advance beat when duration expires
    if (beatTimerRef.current >= activeBeat.duration) {
      const scene = sceneRef.current;
      const nextIdx = beatIndexRef.current + 1;

      if (nextIdx < scene.beats.length) {
        beatIndexRef.current = nextIdx;
        setActiveBeat(scene.beats[nextIdx]);
      } else {
        // Scene complete — pick next
        const prevName = scene.name;
        const count = sceneCountRef.current + 1;
        sceneCountRef.current = count;
        if (scene.isForeground) {
          fgFromRightRef.current = !fgFromRightRef.current;
        }
        const next = pickScene(prevName, count);
        sceneRef.current = next;
        beatIndexRef.current = 0;
        setActiveBeat(next.beats[0]);
      }
      return;
    }

    // Move toward target
    if (activeBeat.speed > 0) {
      const toTarget = travelTargetRef.current.clone().sub(root.position);
      toTarget.y = 0;
      const dist = toTarget.length();
      if (dist > 0.05) {
        root.position.addScaledVector(
          toTarget.normalize(),
          Math.min(dist, activeBeat.speed * delta),
        );
        const yaw = Math.atan2(toTarget.x, toTarget.z);
        root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, yaw, 0.08);
      }
    }

    // Subtle Y float — stills feel alive
    root.position.y = -1.2 + Math.sin(state.clock.elapsedTime * 0.7) * 0.018;
  });

  return (
    <group ref={group} position={[0, -1.2, -5.6]} scale={1.35}>
      <primitive object={character.scene} />
    </group>
  );
}

export default function SiteBackgroundBot() {
  return (
    <Canvas camera={{ position: [0, 1.5, 7.8], fov: 36 }} shadows>
      <ambientLight intensity={0.28} />
      <hemisphereLight intensity={0.24} groundColor="#0a1216" />
      <directionalLight position={[5, 7, 5]} intensity={0.78} castShadow />
      <BotActor />
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
