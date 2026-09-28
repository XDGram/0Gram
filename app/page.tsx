"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import * as THREE from "three";

function SwitchObject({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  const root = useRef<THREE.Group>(null);
  const knob = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!root.current || !knob.current) return;

    const ease = 1 - Math.exp(-delta * 10);

    root.current.rotation.x = THREE.MathUtils.lerp(
      root.current.rotation.x,
      active ? -0.16 : -0.08,
      ease
    );

    root.current.rotation.y = THREE.MathUtils.lerp(
      root.current.rotation.y,
      active ? -0.72 : -0.18,
      ease
    );

    root.current.rotation.z = THREE.MathUtils.lerp(
      root.current.rotation.z,
      active ? -0.08 : 0.025,
      ease
    );

    root.current.position.z = THREE.MathUtils.lerp(
      root.current.position.z,
      active ? 0.2 : 0,
      ease
    );

    knob.current.position.x = THREE.MathUtils.lerp(
      knob.current.position.x,
      active ? 0.72 : -0.72,
      ease
    );

    knob.current.rotation.y = THREE.MathUtils.lerp(
      knob.current.rotation.y,
      active ? Math.PI * 0.85 : 0,
      ease
    );
  });

  return (
    <group
      ref={root}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      <RoundedBox args={[2.6, 1.2, 0.44]} radius={0.56} smoothness={10}>
        <meshPhysicalMaterial
          color={active ? "#050505" : "#f1f1ee"}
          roughness={active ? 0.28 : 0.34}
          metalness={active ? 0.42 : 0.16}
          clearcoat={1}
          clearcoatRoughness={0.16}
        />
      </RoundedBox>

      <RoundedBox
        ref={knob}
        args={[0.96, 0.96, 0.54]}
        radius={0.48}
        smoothness={10}
        position={[-0.72, 0, 0.28]}
      >
        <meshPhysicalMaterial
          color={active ? "#101010" : "#ffffff"}
          roughness={0.2}
          metalness={active ? 0.5 : 0.08}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </RoundedBox>
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
  return (
    <button
      type="button"
      className="switch-hit"
      aria-label="Toggle light"
      aria-pressed={active}
      onClick={onToggle}
    >
      <Canvas
        className="switch-canvas"
        dpr={[1, 2]}
        camera={{ position: [0, 0.15, 5.8], fov: 32 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={active ? 0.55 : 1.45} />
        <directionalLight
          position={[-3, 4, 6]}
          intensity={active ? 2.1 : 3.6}
        />
        <directionalLight
          position={[4, -2, 3]}
          intensity={active ? 0.55 : 1.2}
        />
        <pointLight
          position={[1.8, 1.4, 3]}
          intensity={active ? 1.4 : 1.9}
          distance={8}
        />
        <SwitchObject active={active} onToggle={onToggle} />
      </Canvas>
    </button>
  );
}

export default function Home() {
  const [dark, setDark] = useState(false);

  return (
    <main className={`scene ${dark ? "scene--dark" : ""}`}>
      <div className="switch-wrap">
        <ThreeSwitch active={dark} onToggle={() => setDark((value) => !value)} />
      </div>

      <AnimatePresence>
        <motion.div
          key={dark ? "dark" : "light"}
          className="scene-fade"
          initial={{ opacity: 0.24 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        />
      </AnimatePresence>
    </main>
  );
}
