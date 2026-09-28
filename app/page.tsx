"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import * as THREE from "three";

type PointerState = {
  x: number;
  y: number;
  hovering: boolean;
  pressed: boolean;
};

function SwitchObject({
  active,
  pointer,
}: {
  active: boolean;
  pointer: PointerState;
}) {
  const root = useRef<THREE.Group>(null);
  const slider = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!root.current || !slider.current || !glow.current) return;

    const ease = 1 - Math.exp(-delta * 12);
    const hoverPitch = pointer.hovering ? pointer.y * 0.065 : 0;
    const hoverYaw = pointer.hovering ? pointer.x * 0.095 : 0;

    root.current.rotation.x = THREE.MathUtils.lerp(
      root.current.rotation.x,
      -0.105 + hoverPitch,
      ease
    );

    root.current.rotation.y = THREE.MathUtils.lerp(
      root.current.rotation.y,
      -0.13 + hoverYaw,
      ease
    );

    root.current.rotation.z = THREE.MathUtils.lerp(
      root.current.rotation.z,
      pointer.hovering ? pointer.x * 0.018 : 0,
      ease
    );

    root.current.position.z = THREE.MathUtils.lerp(
      root.current.position.z,
      pointer.pressed ? -0.08 : pointer.hovering ? 0.10 : 0,
      ease
    );

    slider.current.position.x = THREE.MathUtils.lerp(
      slider.current.position.x,
      active ? 0.57 : -0.57,
      ease
    );

    slider.current.position.z = THREE.MathUtils.lerp(
      slider.current.position.z,
      pointer.pressed ? 0.34 : 0.43,
      ease
    );

    slider.current.rotation.y = THREE.MathUtils.lerp(
      slider.current.rotation.y,
      active ? 0.055 : -0.035,
      ease
    );

    glow.current.position.x = THREE.MathUtils.lerp(
      glow.current.position.x,
      active ? -0.63 : 0.63,
      ease
    );
  });

  const shell = active ? "#0b0b0b" : "#e5e1d6";
  const shellBack = active ? "#020202" : "#cbc6b9";
  const recess = active ? "#141414" : "#aaa596";
  const sliderBody = active ? "#111111" : "#d7d3c8";
  const paleFace = active ? "#171717" : "#f0ece3";
  const taupeFace = active ? "#050505" : "#8d8879";
  const edge = active ? "#252525" : "#b8b2a4";

  return (
    <group ref={root}>
      <RoundedBox
        args={[3.52, 1.58, 0.20]}
        radius={0.46}
        smoothness={7}
        position={[0, 0, -0.36]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={shellBack}
          roughness={0.88}
          metalness={0.02}
        />
      </RoundedBox>

      <RoundedBox
        args={[3.34, 1.42, 0.48]}
        radius={0.44}
        smoothness={7}
        position={[0, 0, -0.14]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={shell}
          roughness={0.72}
          metalness={0.025}
        />
      </RoundedBox>

      <RoundedBox
        args={[2.93, 1.02, 0.18]}
        radius={0.35}
        smoothness={7}
        position={[0, 0, 0.16]}
        receiveShadow
      >
        <meshStandardMaterial
          color={recess}
          roughness={0.92}
          metalness={0}
        />
      </RoundedBox>

      <group ref={glow} position={[0.63, 0, 0.275]}>
        <RoundedBox
          args={[1.56, 0.82, 0.19]}
          radius={0.31}
          smoothness={7}
          castShadow
        >
          <meshStandardMaterial
            color="#ef7f2c"
            emissive="#c94d0b"
            emissiveIntensity={active ? 0.95 : 1.18}
            roughness={0.64}
            metalness={0}
          />
        </RoundedBox>

        <pointLight
          position={[0, 0, 0.62]}
          intensity={active ? 0.45 : 0.7}
          distance={2.7}
          color="#ff8a34"
        />
      </group>

      <group ref={slider} position={[-0.57, 0, 0.43]}>
        <RoundedBox
          args={[1.72, 1.01, 0.40]}
          radius={0.32}
          smoothness={7}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={sliderBody}
            roughness={0.72}
            metalness={0.025}
          />
        </RoundedBox>

        <RoundedBox
          args={[1.56, 0.88, 0.11]}
          radius={0.27}
          smoothness={6}
          position={[0, 0, 0.235]}
          castShadow
        >
          <meshStandardMaterial
            color={edge}
            roughness={0.82}
            metalness={0}
          />
        </RoundedBox>

        <RoundedBox
          args={[0.74, 0.80, 0.27]}
          radius={0.29}
          smoothness={7}
          position={[-0.38, 0, 0.34]}
          castShadow
        >
          <meshStandardMaterial
            color={paleFace}
            roughness={0.66}
            metalness={0.015}
          />
        </RoundedBox>

        <RoundedBox
          args={[0.78, 0.82, 0.31]}
          radius={0.34}
          smoothness={8}
          position={[0.38, 0, 0.36]}
          castShadow
        >
          <meshStandardMaterial
            color={taupeFace}
            roughness={0.74}
            metalness={0.02}
          />
        </RoundedBox>

        <mesh position={[-0.52, 0.20, 0.49]} rotation={[0, 0, -0.58]}>
          <planeGeometry args={[0.24, 0.045]} />
          <meshBasicMaterial
            color={active ? "#3c3c3c" : "#ffffff"}
            transparent
            opacity={active ? 0.16 : 0.36}
            depthWrite={false}
          />
        </mesh>
      </group>

      <mesh position={[0, -0.88, -0.30]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.9, 0.92]} />
        <shadowMaterial transparent opacity={active ? 0.38 : 0.20} />
      </mesh>
    </group>
  );
}

function ThreeSwitch({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  const [pointer, setPointer] = useState<PointerState>({
    x: 0,
    y: 0,
    hovering: false,
    pressed: false,
  });

  return (
    <button
      type="button"
      className="switch-hit"
      aria-label={active ? "Switch back to light mode" : "Switch to dark mode"}
      aria-pressed={active}
      onClick={onToggle}
      onPointerEnter={() =>
        setPointer((value) => ({ ...value, hovering: true }))
      }
      onPointerLeave={() =>
        setPointer({ x: 0, y: 0, hovering: false, pressed: false })
      }
      onPointerDown={() =>
        setPointer((value) => ({ ...value, pressed: true }))
      }
      onPointerUp={() =>
        setPointer((value) => ({ ...value, pressed: false }))
      }
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;

        setPointer((value) => ({
          ...value,
          x: THREE.MathUtils.clamp(x, -1, 1),
          y: THREE.MathUtils.clamp(y, -1, 1),
        }));
      }}
    >
      <Canvas
        className="switch-canvas"
        dpr={[1, 2]}
        camera={{ position: [0, 0.08, 6.0], fov: 28 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <ambientLight intensity={active ? 0.28 : 0.72} />

        <directionalLight
          castShadow
          position={[-4.4, 5.7, 6.6]}
          intensity={active ? 3.1 : 4.2}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <directionalLight
          position={[5.0, -2.5, 3.0]}
          intensity={active ? 0.42 : 0.72}
        />

        <pointLight
          position={[-2.1, 1.7, 4.0]}
          intensity={active ? 0.42 : 0.75}
          distance={8}
          color={active ? "#ffffff" : "#f6f0e4"}
        />

        <SwitchObject active={active} pointer={pointer} />

        <ContactShadows
          position={[0, -0.90, -0.52]}
          opacity={active ? 0.58 : 0.34}
          scale={4.4}
          blur={1.45}
          far={2.8}
        />
      </Canvas>
    </button>
  );
}

export default function Home() {
  const [dark, setDark] = useState(false);

  return (
    <main className={`scene ${dark ? "scene--dark" : "scene--light"}`}>
      <motion.div
        className="scene-light"
        animate={{ opacity: dark ? 0 : 1 }}
        transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />

      <motion.div
        className="scene-dark"
        animate={{ opacity: dark ? 1 : 0 }}
        transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />

      <div className="scene-grain" aria-hidden="true" />

      <div className="switch-wrap">
        <ThreeSwitch active={dark} onToggle={() => setDark((value) => !value)} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={dark ? "dark-flash" : "light-flash"}
          className={`scene-flash ${dark ? "scene-flash--dark" : "scene-flash--light"}`}
          initial={{ opacity: 0.16 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        />
      </AnimatePresence>
    </main>
  );
}
