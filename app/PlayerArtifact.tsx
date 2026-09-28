"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { PLAYER_MESH_B64 } from "./playerMeshData";
import styles from "./PlayerArtifact.module.css";

function decodePlayerGeometry() {
  const bytes = Uint8Array.from(atob(PLAYER_MESH_B64), c => c.charCodeAt(0));
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  const min = [view.getFloat32(0, true), view.getFloat32(4, true), view.getFloat32(8, true)];
  const max = [view.getFloat32(12, true), view.getFloat32(16, true), view.getFloat32(20, true)];
  const vertexCount = view.getUint32(24, true);
  const faceCount = view.getUint32(28, true);

  const positions = new Float32Array(vertexCount * 3);
  let offset = 32;

  for (let i = 0; i < vertexCount; i++) {
    for (let axis = 0; axis < 3; axis++) {
      const q = view.getUint16(offset, true);
      offset += 2;
      positions[i * 3 + axis] = min[axis] + (q / 65535) * (max[axis] - min[axis]);
    }
  }

  const indices = new Uint16Array(faceCount * 3);
  for (let i = 0; i < indices.length; i++) {
    indices[i] = view.getUint16(offset, true);
    offset += 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function Knob({
  position,
  radius = 0.105,
  value,
  onChange,
  active,
}: {
  position: [number, number, number];
  radius?: number;
  value: number;
  onChange: (next: number) => void;
  active: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!group.current) return;
    const ease = 1 - Math.exp(-delta * 13);
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      THREE.MathUtils.lerp(-2.2, 2.2, value),
      ease
    );
    group.current.position.z = THREE.MathUtils.lerp(
      group.current.position.z,
      hovered ? position[2] + 0.018 : position[2],
      ease
    );
  });

  return (
    <group ref={group} position={position}>
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={(event) => {
          event.stopPropagation();
          onChange((value + 0.14) % 1.001);
        }}
      >
        <cylinderGeometry args={[radius, radius * 0.96, 0.065, 48]} />
        <meshStandardMaterial
          color={active ? "#111111" : "#d9d8d3"}
          roughness={0.46}
          metalness={0.16}
        />
      </mesh>
      <mesh position={[0, radius * 0.56, 0.038]}>
        <boxGeometry args={[radius * 0.09, radius * 0.5, 0.014]} />
        <meshStandardMaterial color={active ? "#ece9e1" : "#55544f"} roughness={0.6} />
      </mesh>
    </group>
  );
}

function Slider({
  x,
  value,
  onChange,
  active,
}: {
  x: number;
  value: number;
  onChange: (next: number) => void;
  active: boolean;
}) {
  const y = THREE.MathUtils.lerp(-0.28, -0.03, value);
  return (
    <group position={[x, 0, 0.236]}>
      <RoundedBox args={[0.052, 0.33, 0.024]} radius={0.02} smoothness={5}>
        <meshStandardMaterial color={active ? "#1b1b1b" : "#b7b6b0"} roughness={0.8} />
      </RoundedBox>
      <RoundedBox
        args={[0.09, 0.115, 0.075]}
        radius={0.025}
        smoothness={5}
        position={[0, y, 0.055]}
        castShadow
        onClick={(event) => {
          event.stopPropagation();
          onChange(value > 0.65 ? 0.2 : value + 0.25);
        }}
      >
        <meshStandardMaterial color={active ? "#0d0d0d" : "#54544f"} roughness={0.58} />
      </RoundedBox>
    </group>
  );
}

function Waveform({ playing }: { playing: boolean }) {
  const root = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!root.current) return;
    root.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const base = 0.04 + ((i * 7) % 5) * 0.012;
      const pulse = playing ? Math.abs(Math.sin(clock.elapsedTime * 5 + i * 0.72)) * 0.065 : 0.016;
      mesh.scale.y = base + pulse;
    });
  });

  return (
    <group ref={root} position={[0.31, 0.19, 0.276]}>
      {Array.from({ length: 17 }).map((_, i) => (
        <mesh key={i} position={[(i - 8) * 0.022, 0, 0]}>
          <boxGeometry args={[0.009, 1, 0.012]} />
          <meshBasicMaterial color="#f3f3ee" />
        </mesh>
      ))}
    </group>
  );
}

function TransportButton({
  x,
  label,
  onClick,
  active = false,
}: {
  x: number;
  label: "prev" | "play" | "next";
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <group position={[x, 0.055, 0.305]}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
      >
        <circleGeometry args={[label === "play" ? 0.055 : 0.043, 32]} />
        <meshStandardMaterial color={active ? "#f4f1ea" : "#deddd7"} roughness={0.5} />
      </mesh>
      {label === "play" ? (
        <mesh position={[0.007, 0, 0.012]}>
          <circleGeometry args={[0.018, 24]} />
          <meshBasicMaterial color="#222222" />
        </mesh>
      ) : (
        <mesh position={[0, 0, 0.012]}>
          <boxGeometry args={[0.025, 0.028, 0.012]} />
          <meshBasicMaterial color="#222222" />
        </mesh>
      )}
    </group>
  );
}

function PlayerScene({ dark }: { dark: boolean }) {
  const geometry = useMemo(() => decodePlayerGeometry(), []);
  const player = useRef<THREE.Group>(null);

  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState(0);
  const [volume, setVolume] = useState(0.56);
  const [tune, setTune] = useState(0.42);
  const [loudness, setLoudness] = useState(0.48);
  const [tuner, setTuner] = useState(0.52);
  const [eq, setEq] = useState([0.45, 0.6, 0.38, 0.54]);

  useFrame(({ pointer }, delta) => {
    if (!player.current) return;
    const ease = 1 - Math.exp(-delta * 8);
    const targetX = hovered ? -0.08 + pointer.y * 0.055 : -0.08;
    const targetY = hovered ? pointer.x * 0.07 : 0;
    player.current.rotation.x = THREE.MathUtils.lerp(player.current.rotation.x, targetX, ease);
    player.current.rotation.y = THREE.MathUtils.lerp(player.current.rotation.y, targetY, ease);
  });

  const setEqValue = (index: number, value: number) => {
    setEq((current) => current.map((item, i) => (i === index ? value : item)));
  };

  const artColors = [
    ["#f0c400", "#e54022", "#2d9e8b", "#0d4c67"],
    ["#f4efe6", "#c45435", "#4b6379", "#201f22"],
    ["#cce8e1", "#6b6cb4", "#f0a469", "#2a2d36"],
  ];

  return (
    <group
      ref={player}
      scale={2.22}
      position={[0, -0.02, 0]}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={dark ? "#181818" : "#dededb"}
          roughness={0.72}
          metalness={0.08}
        />
      </mesh>

      <RoundedBox args={[0.74, 0.37, 0.025]} radius={0.09} smoothness={7} position={[0.45, 0.20, 0.226]}>
        <meshStandardMaterial color={dark ? "#030303" : "#111616"} roughness={0.74} />
      </RoundedBox>

      <Waveform playing={playing} />

      <group position={[0.69, 0.20, 0.252]}>
        {artColors[track].map((color, i) => (
          <mesh key={color} position={[0, 0.075 - i * 0.05, i * 0.0005]}>
            <planeGeometry args={[0.18, 0.05]} />
            <meshBasicMaterial color={color} />
          </mesh>
        ))}
      </group>

      <TransportButton
        x={0.34}
        label="prev"
        onClick={() => setTrack((track + 2) % 3)}
      />
      <TransportButton
        x={0.45}
        label="play"
        active={playing}
        onClick={() => setPlaying((value) => !value)}
      />
      <TransportButton
        x={0.56}
        label="next"
        onClick={() => setTrack((track + 1) % 3)}
      />

      <Knob position={[-0.66, -0.17, 0.245]} radius={0.205} value={volume} onChange={setVolume} active={dark} />
      <Knob position={[-0.31, -0.17, 0.245]} radius={0.205} value={tune} onChange={setTune} active={dark} />

      <Slider x={0.08} value={loudness} onChange={setLoudness} active={dark} />
      <Slider x={0.22} value={tuner} onChange={setTuner} active={dark} />

      <Knob position={[0.60, -0.10, 0.248]} value={eq[0]} onChange={(v) => setEqValue(0, v)} active={dark} />
      <Knob position={[0.78, -0.10, 0.248]} value={eq[1]} onChange={(v) => setEqValue(1, v)} active={dark} />
      <Knob position={[0.60, -0.31, 0.248]} value={eq[2]} onChange={(v) => setEqValue(2, v)} active={dark} />
      <Knob position={[0.78, -0.31, 0.248]} value={eq[3]} onChange={(v) => setEqValue(3, v)} active={dark} />

      <ContactShadows
        position={[0, -0.58, -0.18]}
        opacity={dark ? 0.48 : 0.28}
        scale={2.7}
        blur={1.7}
        far={1.3}
      />
    </group>
  );
}

export default function PlayerArtifact() {
  return (
    <div className={styles.wrap}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.08, 4.8], fov: 31 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <ambientLight intensity={1.0} />
        <directionalLight castShadow position={[-3.5, 5, 5]} intensity={3.4} />
        <directionalLight position={[4, -1.5, 3]} intensity={1.05} />
        <PlayerScene dark={false} />
      </Canvas>
    </div>
  );
}
