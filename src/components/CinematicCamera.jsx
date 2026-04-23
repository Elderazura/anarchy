import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

export default function CinematicCamera({
  enabled,
  speed,
  radius,
  baseHeight,
  swayAmount,
  targetHeight,
}) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, targetHeight, 0), [targetHeight]);

  useFrame(({ clock }) => {
    if (!enabled) {
      return;
    }

    const t = clock.getElapsedTime();
    camera.position.x = Math.cos(t * speed) * radius;
    camera.position.z = Math.sin(t * speed) * radius;
    camera.position.y = baseHeight + Math.sin(t * (speed * 1.95)) * swayAmount;
    camera.lookAt(target);
  });

  return null;
}
