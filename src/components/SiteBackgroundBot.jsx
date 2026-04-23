import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { resolveAnimationPath } from "../lib/animationMap";

function retargetAnimation(clip, sourceRoot, targetRoot) {
  if (!clip || !sourceRoot || !targetRoot) {
    return null;
  }

  const tracks = clip.tracks
    .map((track) => {
      const [trackName, property] = track.name.split(".");
      const sourceNode = sourceRoot.getObjectByName(trackName);
      if (!sourceNode) {
        return null;
      }
      const targetNode = targetRoot.getObjectByName(sourceNode.name);
      if (!targetNode) {
        return null;
      }
      const cloned = track.clone();
      cloned.name = `${targetNode.name}.${property}`;
      return cloned;
    })
    .filter(Boolean);

  if (!tracks.length) {
    return null;
  }

  return new THREE.AnimationClip(clip.name, clip.duration, tracks);
}

function pickNextBehavior(previous) {
  const pool = [
    { clip: "idle", duration: 4.8, speed: 0.2, near: false },
    { clip: "boxing-practice", duration: 7.4, speed: 0.45, near: true },
    { clip: "running", duration: 4.2, speed: 1.2, near: false },
    { clip: "casual-walk", duration: 5.8, speed: 0.78, near: true },
    { clip: "unsteady-walk", duration: 5.2, speed: 0.66, near: false },
    { clip: "dead", duration: 3.9, speed: 0.02, near: false, forcedNext: "arise" },
    { clip: "arise", duration: 3.4, speed: 0.04, near: true },
  ];

  if (previous?.forcedNext) {
    return pool.find((item) => item.clip === previous.forcedNext) ?? pool[0];
  }

  let choice = pool[Math.floor(Math.random() * pool.length)];
  if (choice.clip === previous?.clip) {
    choice = pool[(pool.indexOf(choice) + 1) % pool.length];
  }
  return choice;
}

function BotActor() {
  const group = useRef(null);
  const mixerRef = useRef(null);
  const actionRef = useRef(null);
  const behaviorTimerRef = useRef(0);
  const travelTargetRef = useRef(new THREE.Vector3(0, -1.2, -5.2));
  const [behavior, setBehavior] = useState(() => pickNextBehavior(null));
  const character = useGLTF("/models/character.glb");
  const idle = useGLTF(resolveAnimationPath("idle"));
  const boxing = useGLTF(resolveAnimationPath("boxing-practice"));
  const running = useGLTF(resolveAnimationPath("running"));
  const casualWalk = useGLTF(resolveAnimationPath("casual-walk"));
  const unsteadyWalk = useGLTF(resolveAnimationPath("unsteady-walk"));
  const dead = useGLTF(resolveAnimationPath("dead"));
  const arise = useGLTF(resolveAnimationPath("arise"));

  const clips = useMemo(() => {
    const map = {
      idle,
      "boxing-practice": boxing,
      running,
      "casual-walk": casualWalk,
      "unsteady-walk": unsteadyWalk,
      dead,
      arise,
    };

    return Object.fromEntries(
      Object.entries(map).map(([key, value]) => [
        key,
        retargetAnimation(value.animations?.[0], value.scene, character.scene),
      ]),
    );
  }, [arise, boxing, casualWalk, character.scene, dead, idle, running, unsteadyWalk]);

  useEffect(() => {
    character.scene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  }, [character.scene]);

  useEffect(() => {
    if (!group.current) {
      return;
    }
    if (!mixerRef.current) {
      mixerRef.current = new THREE.AnimationMixer(group.current);
    }

    const clip = clips[behavior.clip] ?? clips.idle;
    if (!clip) {
      return;
    }
    const action = mixerRef.current.clipAction(clip);
    action.reset().fadeIn(0.55).play();
    if (actionRef.current && actionRef.current !== action) {
      actionRef.current.fadeOut(0.42);
    }
    actionRef.current = action;
    behaviorTimerRef.current = 0;

    // Keep the bot moving in depth to create near/far presence.
    const targetZ = behavior.near
      ? THREE.MathUtils.randFloat(-3.7, -2.2)
      : THREE.MathUtils.randFloat(-7.4, -4.8);
    const targetX = THREE.MathUtils.randFloat(-3.4, 3.4);
    travelTargetRef.current.set(targetX, -1.2, targetZ);
  }, [behavior, clips]);

  useFrame((state, delta) => {
    if (!group.current) {
      return;
    }
    mixerRef.current?.update(delta);
    behaviorTimerRef.current += delta;

    if (behaviorTimerRef.current >= behavior.duration) {
      setBehavior((prev) => pickNextBehavior(prev));
      return;
    }

    const root = group.current;
    const toTarget = travelTargetRef.current.clone().sub(root.position);
    const distance = toTarget.length();
    if (distance > 0.05) {
      const speed = behavior.speed * (behavior.clip === "running" ? 1.25 : 1);
      root.position.addScaledVector(toTarget.normalize(), Math.min(distance, speed * delta));
      const yaw = Math.atan2(toTarget.x, toTarget.z);
      root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, yaw, 0.07);
    }

    // Soft drift keeps motion alive, especially during idle/dead states.
    const t = state.clock.elapsedTime;
    root.position.y = -1.2 + Math.sin(t * 0.7) * 0.02;
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
useGLTF.preload(resolveAnimationPath("boxing-practice"));
useGLTF.preload(resolveAnimationPath("running"));
useGLTF.preload(resolveAnimationPath("casual-walk"));
useGLTF.preload(resolveAnimationPath("unsteady-walk"));
useGLTF.preload(resolveAnimationPath("dead"));
useGLTF.preload(resolveAnimationPath("arise"));
