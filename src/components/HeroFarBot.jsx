import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { resolveAnimationPath } from "../lib/animationMap";

const LOOP_CLIPS = [
  "idle",
  "running",
  "walking",
  "alert",
  "agree-gesture",
  "boxing-practice",
  "arise",
];

function pickRandomClip(previousClip) {
  const choices = LOOP_CLIPS.filter((clip) => clip !== previousClip);
  return choices[Math.floor(Math.random() * choices.length)];
}

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

export default function HeroFarBot() {
  const group = useRef(null);
  const mixerRef = useRef(null);
  const phaseTimerRef = useRef(0);
  const [clipKey, setClipKey] = useState("idle");

  const character = useGLTF("/models/character.glb");
  const animFile = resolveAnimationPath(clipKey);
  const animAsset = useGLTF(animFile);

  const clip = useMemo(
    () => retargetAnimation(animAsset.animations?.[0], animAsset.scene, character.scene),
    [animAsset.animations, animAsset.scene, character.scene],
  );

  useEffect(() => {
    character.scene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  }, [character.scene]);

  useEffect(() => {
    if (!group.current || !clip) {
      return;
    }
    if (!mixerRef.current) {
      mixerRef.current = new THREE.AnimationMixer(group.current);
    }
    const action = mixerRef.current.clipAction(clip);
    action.reset().fadeIn(0.35).play();
    return () => action.fadeOut(0.25);
  }, [clip]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
    if (!group.current) {
      return;
    }

    phaseTimerRef.current += delta;
    if (phaseTimerRef.current >= 4.4) {
      phaseTimerRef.current = 0;
      setClipKey((prev) => pickRandomClip(prev));
    }

    const t = performance.now() * 0.001;
    group.current.position.x = Math.sin(t * 0.22) * 1.3;
    group.current.position.z = -8.2 + Math.sin(t * 0.16) * 0.4;
    group.current.rotation.y = Math.PI + Math.sin(t * 0.2) * 0.2;
  });

  return (
    <group ref={group} position={[0, -1.2, -8.2]} scale={1.45}>
      <primitive object={character.scene} />
    </group>
  );
}

LOOP_CLIPS.forEach((name) => {
  useGLTF.preload(resolveAnimationPath(name));
});
useGLTF.preload("/models/character.glb");

