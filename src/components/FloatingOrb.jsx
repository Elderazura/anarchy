import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function FloatingOrb({ size = 280 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 3.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // Outer wireframe icosahedron
    const geo1 = new THREE.IcosahedronGeometry(1.1, 1);
    const mat1 = new THREE.MeshBasicMaterial({
      color: 0x7ec8e8,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const mesh1 = new THREE.Mesh(geo1, mat1);
    scene.add(mesh1);

    // Inner solid icosahedron with custom shader
    const geo2 = new THREE.IcosahedronGeometry(0.72, 2);
    const mat2 = new THREE.MeshStandardMaterial({
      color: 0x0a2030,
      emissive: 0x0d4060,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.8,
    });
    const mesh2 = new THREE.Mesh(geo2, mat2);
    scene.add(mesh2);

    // Outer glow ring (torus)
    const geo3 = new THREE.TorusGeometry(1.45, 0.008, 8, 64);
    const mat3 = new THREE.MeshBasicMaterial({
      color: 0x7ee8c0,
      transparent: true,
      opacity: 0.35,
    });
    const ring = new THREE.Mesh(geo3, mat3);
    ring.rotation.x = Math.PI * 0.35;
    scene.add(ring);

    // Lights
    const ambient = new THREE.AmbientLight(0x112233, 1.2);
    scene.add(ambient);
    const point = new THREE.PointLight(0x7ec8e8, 2.5, 8);
    point.position.set(2, 2, 2);
    scene.add(point);
    const point2 = new THREE.PointLight(0x7ee8c0, 1.5, 6);
    point2.position.set(-2, -1, 1);
    scene.add(point2);

    // Floating particles inside
    const pGeo = new THREE.BufferGeometry();
    const pCount = 60;
    const positions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.4 + Math.random() * 0.6;
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x7ec8e8, size: 0.025, transparent: true, opacity: 0.6 });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // Animation loop
    let rafId;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      mesh1.rotation.x = t * 0.18;
      mesh1.rotation.y = t * 0.26;
      mesh2.rotation.x = -t * 0.12;
      mesh2.rotation.y = t * 0.2;
      ring.rotation.z = t * 0.08;
      points.rotation.y = t * 0.14;

      // Float camera slightly
      camera.position.y = Math.sin(t * 0.4) * 0.06;

      // Pulse glow
      point.intensity = 2.2 + Math.sin(t * 1.4) * 0.5;
      mat1.opacity = 0.18 + Math.sin(t * 0.8) * 0.06;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      renderer.dispose();
      geo1.dispose(); mat1.dispose();
      geo2.dispose(); mat2.dispose();
      geo3.dispose(); mat3.dispose();
      pGeo.dispose(); pMat.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [size]);

  return (
    <div
      ref={mountRef}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        filter: "drop-shadow(0 0 40px rgba(126, 200, 232, 0.18))",
      }}
    />
  );
}
