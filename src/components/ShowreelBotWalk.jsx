import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
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

function Walker({ mode, quipText }) {
  const group = useRef(null);
  const mixerRef = useRef(null);
  const character = useGLTF("/models/character.glb");
  const runningFile = resolveAnimationPath("running");
  const runningAnim = useGLTF(runningFile);

  const clip = useMemo(() => {
    return retargetAnimation(runningAnim.animations?.[0], runningAnim.scene, character.scene);
  }, [runningAnim.animations, runningAnim.scene, character.scene]);

  useMemo(() => {
    character.scene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  }, [character.scene]);

  useFrame((_, delta) => {
    if (!group.current) {
      return;
    }

    if (!mixerRef.current) {
      mixerRef.current = new THREE.AnimationMixer(group.current);
      if (clip) {
        mixerRef.current.clipAction(clip).reset().play();
      }
    }

    mixerRef.current?.update(delta);
    const speed = mode === "hero" ? 1.95 : 1.6;
    group.current.position.x += delta * speed;
    if (group.current.position.x > 6.8) {
      group.current.position.x = -6.8;
    }
    group.current.rotation.y = Math.PI / 2;
  });

  return (
    <group ref={group} position={[-6.8, -1.2, 0]} scale={mode === "hero" ? 1.55 : 1.35}>
      <primitive object={character.scene} />
      {quipText ? (
        <Html
          position={[1.1, 2.5, 0.15]}
          transform
          zIndexRange={[6, 0]}
          distanceFactor={12.6}
          style={{ pointerEvents: "none" }}
        >
          <div className="bot-dialogue bot-dialogue-inworld">
            <p className="bot-dialogue-tag">SENTINEL</p>
            <p>{quipText}</p>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

export default function ShowreelBotWalk({ mode = "section", quipText = "" }) {
  return (
    <Canvas camera={{ position: [0, 1.2, mode === "hero" ? 6.6 : 5.8], fov: mode === "hero" ? 34 : 30 }} shadows>
      <ambientLight intensity={mode === "hero" ? 0.45 : 0.35} />
      <directionalLight position={[4, 6, 4]} intensity={mode === "hero" ? 1.35 : 1.2} castShadow />
      <Walker mode={mode} quipText={quipText} />
    </Canvas>
  );
}

