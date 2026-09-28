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
  const knob = useRef<THREE.Group>(null);
  const slot = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!root.current || !knob.current || !slot.current) return;

    const ease = 1 - Math.exp(-delta * 11);
    const hoverX = pointer.hovering ? pointer.y * 0.11 : 0;
    const hoverY = pointer.hovering ? pointer.x * 0.16 : 0;

    root.current.rotation.x = THREE.MathUtils.lerp(
      root.current.rotation.x,
      (active ? -0.17 : -0.08) + hoverX,
      ease
    );

    root.current.rotation.y = THREE.MathUtils.lerp(
      root.current.rotation.y,
      (active ? -0.50 : -0.14) + hoverY,
      ease
    );

    root.current.rotation.z = THREE.MathUtils.lerp(
      root.current.rotation.z,
      active ? -0.055 : 0.018,
      ease
    );

    root.current.position.z = THREE.MathUtils.lerp(
      root.current.position.z,
      pointer.pressed ? -0.10 : pointer.hovering ? 0.16 : 0,
      ease
    );

    const targetKnobX = active ? 0.69 : -0.69;

    knob.current.position.x = THREE.MathUtils.lerp(
      knob.current.position.x,
      targetKnobX,
      ease
    );

    knob.current.position.z = THREE.MathUtils.lerp(
      knob.current.position.z,
      pointer.pressed ? 0.24 : 0.34,
      ease
    );

    knob.current.rotation.y = THREE.MathUtils.lerp(
      knob.current.rotation.y,
      active ? Math.PI * 0.92 : 0,
      ease
    );

    knob.current.rotation.z = THREE.MathUtils.lerp(
      knob.current.rotation.z,
      active ? 0.10 : -0.04,
      ease
    );

    slot.current.position.z = THREE.MathUtils.lerp(
      slot.current.position.z,
      active ? 0.215 : 0.205,
      ease
    );
  });

  return (
    <group ref={root}>
      <RoundedBox args={[2.6, 1.22, 0.48]} radius={0.57} smoothness={12}>
        <meshPhysicalMaterial
          color={active ? "#050505" : "#f4f4f1"}
          roughness={active ? 0.24 : 0.3}
          metalness={active ? 0.5 : 0.14}
          clearcoat={1}
          clearcoatRoughness={0.12}
        />
      </RoundedBox>

      <RoundedBox
        ref={slot}
        args={[2.16, 0.82, 0.12]}
        radius={0.39}
        smoothness={12}
        position={[0, 0, 0.205]}
      >
        <meshPhysicalMaterial
          color={active ? "#000000" : "#d8d8d4"}
          roughness={0.38}
          metalness={active ? 0.24 : 0.08}
          clearcoat={0.55}
          clearcoatRoughness={0.3}
        />
      </RoundedBox>

      <group ref={knob} position={[-0.69, 0, 0.34]}>
        <RoundedBox args={[0.9, 0.9, 0.46]} radius={0.45} smoothness={14}>
          <meshPhysicalMaterial
            color={active ? "#0a0a0a" : "#ffffff"}
            roughness={active ? 0.16 : 0.18}
            metalness={active ? 0.54 : 0.06}
            clearcoat={1}
            clearcoatRoughness={0.055}
          />
        </RoundedBox>

        <mesh position={[-0.17, 0.16, 0.245]} rotation={[-0.15, 0, -0.55]}>
          <planeGeometry args={[0.30, 0.10]} />
          <meshBasicMaterial
            color={active ? "#5b5b5b" : "#ffffff"}
            transparent
            opacity={active ? 0.22 : 0.5}
            depthWrite={false}
          />
        </mesh>
      </group>

      <mesh position={[0, -0.72, -0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.0, 0.5]} />
        <shadowMaterial transparent opacity={active ? 0.28 : 0.12} />
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
        camera={{ position: [0, 0.12, 5.65], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <ambientLight intensity={active ? 0.42 : 1.2} />

        <directionalLight
          castShadow
          position={[-3.5, 4.2, 5.5]}
          intensity={active ? 2.8 : 3.8}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <directionalLight
          position={[4.5, -1.8, 3.4]}
          intensity={active ? 0.85 : 1.35}
        />

        <pointLight
          position={[1.8, 1.6, 3.8]}
          intensity={active ? 1.2 : 1.55}
          distance={8}
        />

        <SwitchObject active={active} pointer={pointer} />

        <ContactShadows
          position={[0, -0.78, -0.34]}
          opacity={active ? 0.42 : 0.22}
          scale={3.5}
          blur={2.8}
          far={2.3}
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
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />

      <motion.div
        className="scene-dark"
        animate={{ opacity: dark ? 1 : 0 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />

      <div className="switch-wrap">
        <ThreeSwitch active={dark} onToggle={() => setDark((value) => !value)} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={dark ? "dark-flash" : "light-flash"}
          className={`scene-flash ${dark ? "scene-flash--dark" : "scene-flash--light"}`}
          initial={{ opacity: 0.28 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        />
      </AnimatePresence>
    </main>
  );
}
