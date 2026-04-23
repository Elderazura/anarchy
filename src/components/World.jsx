import { Environment, Grid } from "@react-three/drei";
import ParticleField from "./ParticleField";

export default function World({ botPositionRef }) {
  return (
    <>
      <ParticleField botPositionRef={botPositionRef} />
      <color attach="background" args={["#05080e"]} />
      <fog attach="fog" args={["#081018", 5, 20]} />
      <hemisphereLight intensity={0.35} groundColor="#071015" />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[4, 8, 4]}
        intensity={1.65}
        castShadow
        shadow-mapSize-width={1536}
        shadow-mapSize-height={1536}
        shadow-camera-near={1}
        shadow-camera-far={24}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.00025}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[-6, 4, -5]} intensity={0.35} color="#7cc7cf" />
      <spotLight
        position={[-5, 7, -3]}
        intensity={0.72}
        angle={0.4}
        penumbra={0.55}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial opacity={0.32} />
      </mesh>
      <Grid
        position={[0, -1.2, 0]}
        args={[16, 16]}
        cellSize={0.5}
        cellThickness={0.4}
        cellColor="#1c2b35"
        sectionSize={2}
        sectionThickness={0.9}
        sectionColor="#2f7f78"
        fadeDistance={20}
        fadeStrength={1}
        infiniteGrid
      />
      <Environment preset="sunset" />
    </>
  );
}
