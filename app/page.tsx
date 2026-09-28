"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

type PointerState = {
  x: number;
  y: number;
  hovering: boolean;
  pressed: boolean;
};

function splitGeometry(source: THREE.BufferGeometry, dark: boolean) {
  const pos = source.getAttribute("position") as THREE.BufferAttribute;

  const bodyPositions: number[] = [];
  const bodyColors: number[] = [];
  const sliderPositions: number[] = [];
  const sliderColors: number[] = [];

  const cream = new THREE.Color(dark ? "#070707" : "#ded8cb");
  const creamLight = new THREE.Color(dark ? "#171717" : "#f1ede3");
  const taupe = new THREE.Color(dark ? "#030303" : "#827c6d");
  const orange = new THREE.Color("#ed7827");
  const darkEdge = new THREE.Color(dark ? "#101010" : "#c3bcad");

  for (let i = 0; i < pos.count; i += 3) {
    const tri = [
      [pos.getX(i), pos.getY(i), pos.getZ(i)],
      [pos.getX(i + 1), pos.getY(i + 1), pos.getZ(i + 1)],
      [pos.getX(i + 2), pos.getY(i + 2), pos.getZ(i + 2)],
    ];

    const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3;
    const cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
    const cz = (tri[0][2] + tri[1][2] + tri[2][2]) / 3;

    const isSlider =
      cy > -0.012 &&
      cx < 0.05 &&
      Math.abs(cz) < 0.32;

    let color = cream;

    if (isSlider) {
      color = cx < -0.35 ? creamLight : taupe;
    } else {
      const inner =
        Math.abs(cz) < 0.30 &&
        cy > -0.17 &&
        (dark ? cx < -0.02 : cx > -0.02);

      const deepEdge = cy < -0.205;

      if (inner) color = orange;
      else if (deepEdge) color = darkEdge;
    }

    const positions = isSlider ? sliderPositions : bodyPositions;
    const colors = isSlider ? sliderColors : bodyColors;

    for (const v of tri) {
      positions.push(v[0] * 2.08, v[2] * 2.08, -v[1] * 2.08);
      colors.push(color.r, color.g, color.b);
    }
  }

  const make = (positions: number[], colors: number[]) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  };

  return {
    body: make(bodyPositions, bodyColors),
    slider: make(sliderPositions, sliderColors),
  };
}

function SwitchMesh({
  active,
  pointer,
}: {
  active: boolean;
  pointer: PointerState;
}) {
  const source = useLoader(STLLoader, "/models/switch.stl");
  const root = useRef<THREE.Group>(null);
  const slider = useRef<THREE.Group>(null);

  const geometry = useMemo(
    () => splitGeometry(source, active),
    [source, active]
  );

  useFrame((_, delta) => {
    if (!root.current || !slider.current) return;

    const ease = 1 - Math.exp(-delta * 12);

    root.current.rotation.x = THREE.MathUtils.lerp(
      root.current.rotation.x,
      -0.10 + (pointer.hovering ? pointer.y * 0.065 : 0),
      ease
    );

    root.current.rotation.y = THREE.MathUtils.lerp(
      root.current.rotation.y,
      -0.10 + (pointer.hovering ? pointer.x * 0.095 : 0),
      ease
    );

    root.current.rotation.z = THREE.MathUtils.lerp(
      root.current.rotation.z,
      pointer.hovering ? pointer.x * 0.014 : 0,
      ease
    );

    root.current.position.z = THREE.MathUtils.lerp(
      root.current.position.z,
      pointer.pressed ? -0.08 : pointer.hovering ? 0.10 : 0,
      ease
    );

    slider.current.position.x = THREE.MathUtils.lerp(
      slider.current.position.x,
      active ? 1.54 : 0,
      ease
    );

    slider.current.position.z = THREE.MathUtils.lerp(
      slider.current.position.z,
      pointer.pressed ? -0.03 : 0.045,
      ease
    );
  });

  return (
    <group ref={root} scale={0.97}>
      <mesh geometry={geometry.body} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.78}
          metalness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group ref={slider} position={[0, 0, 0.045]}>
        <mesh geometry={geometry.slider} castShadow receiveShadow>
          <meshStandardMaterial
            vertexColors
            roughness={0.68}
            metalness={0.025}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
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
        camera={{ position: [0, 0.02, 5.8], fov: 29 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: active ? 0.82 : 1.03,
        }}
        shadows
      >
        <ambientLight intensity={active ? 0.27 : 0.76} />

        <directionalLight
          castShadow
          position={[-4.7, 5.6, 6.4]}
          intensity={active ? 2.9 : 4.1}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <directionalLight
          position={[4.8, -2.4, 2.8]}
          intensity={active ? 0.30 : 0.56}
        />

        <pointLight
          position={[2.2, 1.4, 3.5]}
          intensity={active ? 0.34 : 0.58}
          distance={8}
          color="#f4eee4"
        />

        <SwitchMesh active={active} pointer={pointer} />

        <ContactShadows
          position={[0, -0.96, -0.56]}
          opacity={active ? 0.54 : 0.36}
          scale={4.3}
          blur={1.4}
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
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />

      <motion.div
        className="scene-dark"
        animate={{ opacity: dark ? 1 : 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
          initial={{ opacity: 0.12 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        />
      </AnimatePresence>
    </main>
  );
}
