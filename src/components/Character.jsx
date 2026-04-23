import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { resolveAnimationPath } from "../lib/animationMap";

function retargetAnimation(clip, sourceRoot, targetRoot) {
  if (!clip || !sourceRoot || !targetRoot) {
    return clip;
  }

  // Retarget the animation file's tracks to the loaded character hierarchy.
  const renamedTracks = clip.tracks.map((track) => {
    const [trackName, property] = track.name.split(".");
    const sourceNode = sourceRoot.getObjectByName(trackName);
    if (!sourceNode) {
      return null;
    }

    const targetNode = targetRoot.getObjectByName(sourceNode.name);
    if (!targetNode) {
      return null;
    }

    const clonedTrack = track.clone();
    clonedTrack.name = `${targetNode.name}.${property}`;
    return clonedTrack;
  });

  const filteredTracks = renamedTracks.filter(Boolean);
  if (!filteredTracks.length) {
    return null;
  }

  return new THREE.AnimationClip(clip.name, clip.duration, filteredTracks);
}

const INTRO_START = new THREE.Vector3(0, -1.2, -7.4);
const INTRO_END = new THREE.Vector3(0, -1.2, -2.1);
const RUN_SPEED = 2.1;
const IDLE_BEFORE_AGREE_SECONDS = 2.4;
const LONG_IDLE_SECONDS = 10.5;
const BOXING_SECONDS = 7.8;
const IDLE_ANCHOR = new THREE.Vector3(0, -1.2, -2.1);
const ATTACK_DURATION = 1.2;
const BOOM_DURATION = 2.8;
const ATTACK_COOLDOWN = 2.4;
const MOUSE_ATTACK_DISTANCE = 0.06;

export default function Character({
  onSpeak,
  botLine,
  isSpeaking,
  onIntroReady = () => {},
  botPositionRef,
}) {
  const group = useRef(null);
  const mixerRef = useRef(null);
  const currentActionRef = useRef(null);
  const phaseTimerRef = useRef(0);
  const spokeRef = useRef(false);
  const speechDurationRef = useRef(3.2);
  const movementTimeRef = useRef(0);
  const introReadySentRef = useRef(false);
  const interactionRef = useRef({ type: null, elapsed: 0, cooldown: 0 });
  const lookTargetRef = useRef(new THREE.Vector3());
  const toCameraRef = useRef(new THREE.Vector3());
  const toEndRef = useRef(new THREE.Vector3());
  const botNdcRef = useRef(new THREE.Vector3());
  const [phase, setPhase] = useState("intro-run");
  const [overrideClip, setOverrideClip] = useState(null);

  const character = useGLTF("/models/character.glb");
  const resolvedClip =
    overrideClip ??
    (phase === "intro-run"
      ? "running"
      : phase === "agree"
        ? "agree-gesture"
        : phase === "boxing-active"
          ? "boxing-practice"
          : "idle");
  const animationFile = resolveAnimationPath(resolvedClip);
  const animation = useGLTF(animationFile);

  const clip = useMemo(() => {
    const srcClip = animation.animations?.[0];
    const sourceScene = animation.scene;
    const targetScene = character.scene;
    return retargetAnimation(srcClip, sourceScene, targetScene);
  }, [animation.animations, animation.scene, character.scene]);

  useEffect(() => {
    const root = group.current;
    if (!root) {
      return;
    }
    if (botPositionRef?.current) {
      botPositionRef.current.copy(root.position);
    }

    if (!mixerRef.current) {
      mixerRef.current = new THREE.AnimationMixer(root);
    }

    if (!clip) {
      console.warn(`Could not retarget animation: ${resolvedClip}`);
      return;
    }

    const mixer = mixerRef.current;
    const nextAction = mixer.clipAction(clip);
    nextAction.reset().fadeIn(0.72).play();

    if (currentActionRef.current && currentActionRef.current !== nextAction) {
      currentActionRef.current.fadeOut(0.62);
    }

    currentActionRef.current = nextAction;

    return () => {
      if (nextAction) {
        nextAction.fadeOut(0.5);
      }
    };
  }, [clip, resolvedClip]);

  useEffect(() => {
    if (!group.current) {
      return;
    }

    group.current.position.copy(INTRO_START);
    phaseTimerRef.current = 0;
    spokeRef.current = false;
    movementTimeRef.current = 0;
    introReadySentRef.current = false;
    interactionRef.current = { type: null, elapsed: 0, cooldown: 0 };
    setOverrideClip(null);
  }, []);

  useEffect(() => {
    // Ensure imported mesh participates in lighting and shadows.
    character.scene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  }, [character.scene]);

  useFrame(({ camera, pointer }, delta) => {
    const mixer = mixerRef.current;
    if (mixer) {
      mixer.update(delta);
    }

    if (!group.current) {
      return;
    }

    const root = group.current;
    const interaction = interactionRef.current;
    if (interaction.cooldown > 0) {
      interaction.cooldown = Math.max(0, interaction.cooldown - delta);
    }
    if (interaction.type) {
      interaction.elapsed += delta;
      const duration = interaction.type === "boom-dance" ? BOOM_DURATION : ATTACK_DURATION;
      if (interaction.elapsed >= duration) {
        interaction.type = null;
        interaction.elapsed = 0;
        setOverrideClip(null);
      }
    }

    if (phase === "intro-run") {
      const toEnd = toEndRef.current.copy(INTRO_END).sub(root.position);
      const distance = toEnd.length();
      if (distance <= 0.05) {
        root.position.copy(INTRO_END);
        setPhase("idle-focus");
        phaseTimerRef.current = 0;
        if (!introReadySentRef.current) {
          introReadySentRef.current = true;
          onIntroReady();
        }
        return;
      }

      const direction = toEnd.normalize();
      const speedFactor = THREE.MathUtils.clamp(distance / 2.6, 0.32, 1);
      const step = Math.min(distance, RUN_SPEED * speedFactor * delta);
      root.position.addScaledVector(direction, step);
      const yaw = Math.atan2(direction.x, direction.z);
      root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, yaw, 0.085);
      return;
    }

    if (interaction.type) {
      // Pause default behavior timeline while an interaction animation is active.
      lookTargetRef.current.set(camera.position.x, 0, camera.position.z);
      const toCamera = toCameraRef.current.copy(lookTargetRef.current).sub(root.position);
      const yawToCamera = Math.atan2(toCamera.x, toCamera.z);
      root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, yawToCamera, 0.04);
      return;
    }

    if (!interaction.type && phase !== "agree") {
      botNdcRef.current.copy(root.position);
      botNdcRef.current.y += 2;
      botNdcRef.current.project(camera);
      const pointerDistance = Math.hypot(pointer.x - botNdcRef.current.x, pointer.y - botNdcRef.current.y);
      if (pointerDistance <= MOUSE_ATTACK_DISTANCE && interaction.cooldown <= 0) {
        interaction.type = "attack";
        interaction.elapsed = 0;
        interaction.cooldown = ATTACK_COOLDOWN;
        setOverrideClip("attack");
      }
    }

    if (phase === "idle-focus") {
      phaseTimerRef.current += delta;
      if (phaseTimerRef.current >= IDLE_BEFORE_AGREE_SECONDS) {
        setPhase("agree");
        phaseTimerRef.current = 0;
      }
    }

    if (phase === "agree" && !spokeRef.current) {
      spokeRef.current = true;
      const spokenSeconds = onSpeak(
        "Hello, welcome to Anarchy Studios. I am your Emerald Sentinel, standing by to guide your journey.",
      );
      if (Number.isFinite(spokenSeconds) && spokenSeconds > 0) {
        speechDurationRef.current = spokenSeconds;
      }
    }

    if (phase === "agree") {
      phaseTimerRef.current += delta;
      if (phaseTimerRef.current >= speechDurationRef.current + 0.45) {
        setPhase("idle-final");
        phaseTimerRef.current = 0;
        movementTimeRef.current = 0;
      }
    }

    if (phase === "idle-final") {
      phaseTimerRef.current += delta;
      if (phaseTimerRef.current >= LONG_IDLE_SECONDS) {
        setPhase("boxing-active");
        phaseTimerRef.current = 0;
        movementTimeRef.current = 0;
      }
    }

    if (phase === "boxing-active") {
      phaseTimerRef.current += delta;
      movementTimeRef.current += delta;

      // Longer, softer boxing drift that still stays in-frame.
      const swayX = Math.sin(movementTimeRef.current * 1.35) * 0.2;
      const swayZ = Math.sin(movementTimeRef.current * 0.95) * 0.12;
      root.position.x = IDLE_ANCHOR.x + swayX;
      root.position.z = IDLE_ANCHOR.z + swayZ;

      if (phaseTimerRef.current >= BOXING_SECONDS) {
        setPhase("idle-final");
        phaseTimerRef.current = 0;
        root.position.copy(IDLE_ANCHOR);
      }
    }

    lookTargetRef.current.set(camera.position.x, 0, camera.position.z);
    const toCamera = toCameraRef.current.copy(lookTargetRef.current).sub(root.position);
    const yawToCamera = Math.atan2(toCamera.x, toCamera.z);
    const turnRate = phase === "idle-final" ? 0.008 : phase === "boxing-active" ? 0.024 : 0.05;
    root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, yawToCamera, turnRate);
  });

  const handleBotClick = () => {
    if (phase === "intro-run" || phase === "agree") {
      return;
    }
    interactionRef.current.type = "boom-dance";
    interactionRef.current.elapsed = 0;
    interactionRef.current.cooldown = ATTACK_COOLDOWN;
    setOverrideClip("boom-dance");
  };

  return (
    <group ref={group} position={[0, -1.2, -7.4]} scale={1.5} onPointerDown={handleBotClick}>
      <primitive object={character.scene} />
      {botLine ? (
        <Html
          position={[1.2, 2.8, 0.2]}
          transform
          zIndexRange={[6, 0]}
          distanceFactor={11.8}
          style={{ pointerEvents: "none" }}
        >
          <div className="bot-dialogue bot-dialogue-inworld">
            <p className="bot-dialogue-tag">EMERALD SENTINEL</p>
            <p>
              {botLine}
              {isSpeaking ? <span className="bot-caret">|</span> : null}
            </p>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

useGLTF.preload("/models/character.glb");
useGLTF.preload("/models/running.glb");
useGLTF.preload("/models/idle.glb");
useGLTF.preload("/models/agree-gesture.glb");
useGLTF.preload("/models/boxing-practice.glb");
useGLTF.preload("/models/attack.glb");
useGLTF.preload("/models/boom-dance.glb");
