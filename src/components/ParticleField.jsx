import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 420;
const BOUNDS = {
  x: 12,
  yMin: -0.6,
  yMax: 4.8,
  zMin: -12,
  zMax: 3,
};

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

export default function ParticleField({ botPositionRef }) {
  const pointsRef = useRef(null);
  const velocityRef = useRef(new Float32Array(PARTICLE_COUNT * 3));
  const mouseWorldRef = useRef(new THREE.Vector3());
  const raycasterRef = useRef(new THREE.Raycaster());
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 2));
  const { camera, pointer } = useThree();

  const { positions, colors } = useMemo(() => {
    const p = new Float32Array(PARTICLE_COUNT * 3);
    const c = new Float32Array(PARTICLE_COUNT * 3);
    const color = new THREE.Color();

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const idx = i * 3;
      p[idx] = randomRange(-BOUNDS.x, BOUNDS.x);
      p[idx + 1] = randomRange(BOUNDS.yMin, BOUNDS.yMax);
      p[idx + 2] = randomRange(BOUNDS.zMin, BOUNDS.zMax);

      const hue = randomRange(0.46, 0.62);
      const sat = randomRange(0.4, 0.8);
      const light = randomRange(0.5, 0.86);
      color.setHSL(hue, sat, light);
      c[idx] = color.r;
      c[idx + 1] = color.g;
      c[idx + 2] = color.b;
    }

    return { positions: p, colors: c };
  }, []);

  useFrame(({ clock }, delta) => {
    const points = pointsRef.current;
    if (!points) {
      return;
    }

    const positionAttr = points.geometry.attributes.position;
    const pos = positionAttr.array;
    const vel = velocityRef.current;
    const t = clock.getElapsedTime();

    raycasterRef.current.setFromCamera(pointer, camera);
    raycasterRef.current.ray.intersectPlane(planeRef.current, mouseWorldRef.current);

    const botPos = botPositionRef?.current;
    const mouseX = mouseWorldRef.current.x;
    const mouseY = mouseWorldRef.current.y;
    const mouseZ = mouseWorldRef.current.z;

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const idx = i * 3;
      const px = pos[idx];
      const py = pos[idx + 1];
      const pz = pos[idx + 2];

      let vx = vel[idx];
      let vy = vel[idx + 1];
      let vz = vel[idx + 2];

      vx += Math.sin(t * 0.46 + i * 0.13) * 0.00033;
      vy += Math.cos(t * 0.38 + i * 0.09) * 0.00028;
      vz += Math.sin(t * 0.31 + i * 0.11) * 0.00033;

      const mdx = px - mouseX;
      const mdy = py - mouseY;
      const mdz = pz - mouseZ;
      const mouseDistSq = mdx * mdx + mdy * mdy + mdz * mdz;
      if (mouseDistSq < 3.8) {
        const mouseForce = (1.0 / (mouseDistSq + 0.3)) * 0.0032;
        vx += mdx * mouseForce;
        vy += mdy * mouseForce;
        vz += mdz * mouseForce;
      }

      if (botPos) {
        const bdx = px - botPos.x;
        const bdy = py - (botPos.y + 1.0);
        const bdz = pz - botPos.z;
        const botDistSq = bdx * bdx + bdy * bdy + bdz * bdz;
        if (botDistSq < 9.5) {
          const repel = (1.0 / (botDistSq + 0.4)) * 0.0052;
          vx += bdx * repel;
          vy += bdy * repel * 0.8;
          vz += bdz * repel;
        }
      }

      vx *= 0.974;
      vy *= 0.974;
      vz *= 0.974;

      const nx = px + vx * delta * 28;
      const ny = py + vy * delta * 28;
      const nz = pz + vz * delta * 28;

      pos[idx] = nx > BOUNDS.x ? -BOUNDS.x : nx < -BOUNDS.x ? BOUNDS.x : nx;
      pos[idx + 1] =
        ny > BOUNDS.yMax ? BOUNDS.yMin : ny < BOUNDS.yMin ? BOUNDS.yMax : ny;
      pos[idx + 2] =
        nz > BOUNDS.zMax ? BOUNDS.zMin : nz < BOUNDS.zMin ? BOUNDS.zMax : nz;

      vel[idx] = vx;
      vel[idx + 1] = vy;
      vel[idx + 2] = vz;
    }

    positionAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </points>
  );
}

