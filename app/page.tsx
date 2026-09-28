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

  useFrame((_, delta) => {
    if (!root.current || !knob.current) return;

    const ease = 1 - Math.exp(-delta * 12);
    const hoverPitch = pointer.hovering ? pointer.y * 0.085 : 0;
    const hoverYaw = pointer.hovering ? pointer.x * 0.12 : 0;
    const hoverLift = pointer.hovering ? 0.09 : 0;

    root.current.rotation.x = THREE.MathUtils.lerp(
      root.current.rotation.x,
      (active ? -0.14 : -0.095) + hoverPitch,
      ease
    );

    root.current.rotation.y = THREE.MathUtils.lerp(
      root.current.rotation.y,
      (active ? -0.39 : -0.12) + hoverYaw,
      ease
    );

    root.current.rotation.z = THREE.MathUtils.lerp(
      root.current.rotation.z,
      active ? -0.035 : 0.018,
      ease
    );

    root.current.position.x = THREE.MathUtils.lerp(
      root.current.position.x,
      pointer.hovering ? pointer.x * 0.035 : 0,
      ease
    );

    root.current.position.y = THREE.MathUtils.lerp(
      root.current.position.y,
      pointer.hovering ? -pointer.y * 0.025 : 0,
      ease
    );

    root.current.position.z = THREE.MathUtils.lerp(
      root.current.position.z,
      pointer.pressed ? -0.09 : hoverLift,
      ease
    );

    knob.current.position.x = THREE.MathUtils.lerp(
      knob.current.position.x,
      active ? 0.67 : -0.67,
      ease
    );

    knob.current.position.z = THREE.MathUtils.lerp(
      knob.current.position.z,
      pointer.pressed ? 0.31 : 0.39,
      ease
    );

    knob.current.rotation.y = THREE.MathUtils.lerp(
      knob.current.rotation.y,
      active ? Math.PI * 0.12 : -Math.PI * 0.04,
      ease
    );

    knob.current.rotation.z = THREE.MathUtils.lerp(
      knob.current.rotation.z,
      active ? 0.04 : -0.025,
      ease
    );
  });

  return (
    <group ref={root}>
      <RoundedBox
        args={[2.78, 1.34, 0.16]}
        radius={0.28}
        smoothness={6}
        position={[0, 0, -0.29]}
      >
        <meshStandardMaterial
          color={active ? "#121212" : "#d8d8d4"}
          roughness={0.78}
          metalness={0.08}
        />
      </RoundedBox>

      <RoundedBox args={[2.58, 1.16, 0.5]} radius={0.30} smoothness={6}>
        <meshStandardMaterial
          color={active ? "#080808" : "#ecece8"}
          roughness={active ? 0.56 : 0.62}
          metalness={active ? 0.16 : 0.08}
        />
      </RoundedBox>

      <RoundedBox
        args={[2.12, 0.72, 0.16]}
        radius={0.22}
        smoothness={6}
        position={[0, 0, 0.26]}
      >
        <meshStandardMaterial
          color={active ? "#171717" : "#c9c9c4"}
          roughness={0.84}
          metalness={0.04}
        />
      </RoundedBox>

      <RoundedBox
        args={[1.92, 0.56, 0.08]}
        radius={0.16}
        smoothness={5}
        position={[0, 0, 0.36]}
      >
        <meshStandardMaterial
          color={active ? "#030303" : "#b8b8b3"}
          roughness={0.94}
          metalness={0}
        />
      </RoundedBox>

      <group ref={knob} position={[-0.67, 0, 0.39]}>
        <RoundedBox args={[0.84, 0.84, 0.48]} radius={0.19} smoothness={6}>
          <meshStandardMaterial
            color={active ? "#0c0c0c" : "#f3f3ef"}
            roughness={active ? 0.46 : 0.52}
            metalness={active ? 0.22 : 0.06}
          />
        </RoundedBox>

        <RoundedBox
          args={[0.68, 0.68, 0.055]}
          radius={0.14}
          smoothness={5}
          position={[0, 0, 0.268]}
        >
          <meshStandardMaterial
            color={active ? "#171717" : "#ffffff"}
            roughness={0.66}
            metalness={0.02}
          />
        </RoundedBox>

        <mesh position={[-0.2, 0.2, 0.302]} rotation={[0, 0, -0.72]}>
          <planeGeometry args={[0.24, 0.04]} />
          <meshBasicMaterial
            color={active ? "#656565" : "#ffffff"}
            transparent
            opacity={active ? 0.28 : 0.62}
            depthWrite={false}
          />
        </mesh>
      </group>

      <mesh position={[0, -0.79, -0.18]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.35, 0.74]} />
        <shadowMaterial transparent opacity={active ? 0.34 : 0.16} />
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
        camera={{ position: [0, 0.12, 5.6], fov: 29 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <ambientLight intensity={active ? 0.34 : 0.86} />

        <directionalLight
          castShadow
          position={[-4.5, 5.2, 6.2]}
          intensity={active ? 3.5 : 4.3}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <directionalLight
          position={[5.2, -2.8, 2.7]}
          intensity={active ? 0.48 : 0.82}
        />

        <pointLight
          position={[2.8, 1.8, 4.2]}
          intensity={active ? 0.8 : 1.0}
          distance={8}
        />

        <SwitchObject active={active} pointer={pointer} />

        <ContactShadows
          position={[0, -0.84, -0.42]}
          opacity={active ? 0.50 : 0.30}
          scale={3.8}
          blur={1.65}
          far={2.4}
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
          initial={{ opacity: 0.18 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        />
      </AnimatePresence>
    </main>
  );
}
