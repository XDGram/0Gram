"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { faces, vertices } from "./modelData";

type PointerState = {
  x: number;
  y: number;
  hovering: boolean;
  pressed: boolean;
};

function buildGeometry(kind: "body" | "slider", dark: boolean) {
  const positions: number[] = [];
  const colors: number[] = [];
  const index: number[] = [];

  const cream = new THREE.Color(dark ? "#090909" : "#ded9cd");
  const creamLight = new THREE.Color(dark ? "#161616" : "#eee9de");
  const taupe = new THREE.Color(dark ? "#050505" : "#7f7a6b");
  const orange = new THREE.Color("#ec7423");
  const edge = new THREE.Color(dark ? "#101010" : "#c4beb0");

  let cursor = 0;

  for (const face of faces) {
    const a = vertices[face[0]];
    const b = vertices[face[1]];
    const c = vertices[face[2]];

    const cx = (a[0] + b[0] + c[0]) / 3;
    const cy = (a[1] + b[1] + c[1]) / 3;
    const cz = (a[2] + b[2] + c[2]) / 3;

    const isSlider =
      cy > -0.015 &&
      cx < 0.04 &&
      Math.abs(cz) < 0.31;

    if ((kind === "slider") !== isSlider) continue;

    let color = cream;

    if (kind === "slider") {
      color = cx < -0.36 ? creamLight : taupe;
    } else {
      const innerRight =
        cx > -0.02 &&
        Math.abs(cz) < 0.29 &&
        cy > -0.165;

      const deepEdge = cy < -0.205;

      if (innerRight) color = orange;
      else if (deepEdge) color = edge;
    }

    for (const v of [a, b, c]) {
      // STL's front axis is Y. Rotate to Three's front-facing Z axis.
      positions.push(v[0] * 2.05, v[2] * 2.05, -v[1] * 2.05);
      colors.push(color.r, color.g, color.b);
    }

    index.push(cursor, cursor + 1, cursor + 2);
    cursor += 3;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3)
  );
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.center();

  return geometry;
}

function PhysicalSwitch({
  active,
  pointer,
}: {
  active: boolean;
  pointer: PointerState;
}) {
  const root = useRef<THREE.Group>(null);
  const slider = useRef<THREE.Group>(null);

  const bodyGeometry = useMemo(
    () => buildGeometry("body", active),
    [active]
  );

  const sliderGeometry = useMemo(
    () => buildGeometry("slider", active),
    [active]
  );

  useFrame((_, delta) => {
    if (!root.current || !slider.current) return;

    const ease = 1 - Math.exp(-delta * 12);

    const hoverPitch = pointer.hovering ? pointer.y * 0.07 : 0;
    const hoverYaw = pointer.hovering ? pointer.x * 0.11 : 0;

    root.current.rotation.x = THREE.MathUtils.lerp(
      root.current.rotation.x,
      -0.11 + hoverPitch,
      ease
    );

    root.current.rotation.y = THREE.MathUtils.lerp(
      root.current.rotation.y,
      -0.10 + hoverYaw,
      ease
    );

    root.current.rotation.z = THREE.MathUtils.lerp(
      root.current.rotation.z,
      pointer.hovering ? pointer.x * 0.018 : 0,
      ease
    );

    root.current.position.z = THREE.MathUtils.lerp(
      root.current.position.z,
      pointer.pressed ? -0.10 : pointer.hovering ? 0.10 : 0,
      ease
    );

    slider.current.position.x = THREE.MathUtils.lerp(
      slider.current.position.x,
      active ? 1.12 : 0,
      ease
    );

    slider.current.position.z = THREE.MathUtils.lerp(
      slider.current.position.z,
      pointer.pressed ? 0.015 : 0.07,
      ease
    );

    slider.current.rotation.y = THREE.MathUtils.lerp(
      slider.current.rotation.y,
      active ? -0.055 : 0,
      ease
    );
  });

  return (
    <group ref={root} scale={0.96}>
      <mesh
        geometry={bodyGeometry}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          vertexColors
          roughness={0.76}
          metalness={0.025}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group ref={slider} position={[0, 0, 0.07]}>
        <mesh
          geometry={sliderGeometry}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            vertexColors
            roughness={0.68}
            metalness={0.02}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      <RoundedBox
        args={[1.42, 0.73, 0.10]}
        radius={0.27}
        smoothness={8}
        position={[active ? -0.55 : 0.58, 0, -0.12]}
        castShadow
      >
        <meshStandardMaterial
          color="#f07829"
          emissive="#9f3107"
          emissiveIntensity={active ? 0.38 : 0.62}
          roughness={0.62}
          metalness={0}
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
      aria-label={active ? "Switch to light mode" : "Switch to dark mode"}
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
        camera={{ position: [0, 0.05, 6.1], fov: 30 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: active ? 0.82 : 1.05,
        }}
        shadows
      >
        <ambientLight intensity={active ? 0.30 : 0.82} />

        <directionalLight
          castShadow
          position={[-4.5, 5.8, 6.5]}
          intensity={active ? 2.8 : 4.0}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <directionalLight
          position={[4.8, -2.5, 3.0]}
          intensity={active ? 0.32 : 0.62}
        />

        <pointLight
          position={[2.4, 1.6, 3.6]}
          intensity={active ? 0.38 : 0.62}
          distance={8}
          color="#f4eee4"
        />

        <PhysicalSwitch active={active} pointer={pointer} />

        <ContactShadows
          position={[0, -0.97, -0.56]}
          opacity={active ? 0.52 : 0.36}
          scale={4.3}
          blur={1.5}
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
        <ThreeSwitch
          active={dark}
          onToggle={() => setDark((value) => !value)}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={dark ? "dark-flash" : "light-flash"}
          className={`scene-flash ${dark ? "scene-flash--dark" : "scene-flash--light"}`}
          initial={{ opacity: 0.14 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        />
      </AnimatePresence>
    </main>
  );
}
