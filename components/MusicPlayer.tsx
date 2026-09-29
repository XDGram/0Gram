"use client";

import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { ContactShadows, RoundedBox, Text } from "@react-three/drei";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PLAYER_GEOM_B64 } from "./playerData";

type Point = { x: number; y: number };

async function decodePlayerGeometry() {
  const compressed = Uint8Array.from(atob(PLAYER_GEOM_B64), (char) =>
    char.charCodeAt(0)
  );

  const stream = new Blob([compressed])
    .stream()
    .pipeThrough(new DecompressionStream("deflate"));

  const buffer = await new Response(stream).arrayBuffer();
  const view = new DataView(buffer);

  const min = [
    view.getFloat32(0, true),
    view.getFloat32(4, true),
    view.getFloat32(8, true),
  ];

  const max = [
    view.getFloat32(12, true),
    view.getFloat32(16, true),
    view.getFloat32(20, true),
  ];

  const vertexCount = view.getUint32(24, true);
  const faceCount = view.getUint32(28, true);
  const vertexOffset = 32;
  const indexOffset = vertexOffset + vertexCount * 3 * 2;

  const quantized = new Uint16Array(buffer, vertexOffset, vertexCount * 3);
  const positions = new Float32Array(vertexCount * 3);

  for (let i = 0; i < vertexCount; i += 1) {
    for (let axis = 0; axis < 3; axis += 1) {
      const q = quantized[i * 3 + axis] / 65535;
      positions[i * 3 + axis] = min[axis] + q * (max[axis] - min[axis]);
    }
  }

  const indices = new Uint16Array(buffer, indexOffset, faceCount * 3).slice();
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  return geometry;
}

function Chassis({ dark }: { dark: boolean }) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let mounted = true;

    decodePlayerGeometry().then((nextGeometry) => {
      if (mounted) setGeometry(nextGeometry);
      else nextGeometry.dispose();
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!geometry) {
    return (
      <RoundedBox args={[1.9, 0.92, 0.34]} radius={0.07} smoothness={6}>
        <meshStandardMaterial
          color={dark ? "#bcbab4" : "#deddd7"}
          roughness={0.76}
          metalness={0.025}
        />
      </RoundedBox>
    );
  }

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={dark ? "#c6c4bd" : "#e4e2dc"}
        roughness={0.72}
        metalness={0.035}
      />
    </mesh>
  );
}

function Dial({
  position,
  radius,
  value,
  onChange,
  dark,
}: {
  position: [number, number, number];
  radius: number;
  value: number;
  onChange: (value: number) => void;
  dark: boolean;
}) {
  const drag = useRef<{ y: number; value: number } | null>(null);
  const angle = THREE.MathUtils.lerp(-2.15, 2.15, value);

  const down = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    drag.current = { y: event.nativeEvent.clientY, value };
    const target = event.nativeEvent.target as HTMLElement;
    target.setPointerCapture?.(event.pointerId);
  };

  const move = (event: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return;
    event.stopPropagation();
    const delta = (drag.current.y - event.nativeEvent.clientY) * 0.008;
    onChange(THREE.MathUtils.clamp(drag.current.value + delta, 0, 1));
  };

  const up = (event: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return;
    event.stopPropagation();
    drag.current = null;
    const target = event.nativeEvent.target as HTMLElement;
    target.releasePointerCapture?.(event.pointerId);
  };

  return (
    <group position={position} rotation={[0, 0, angle]}>
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
      >
        <cylinderGeometry args={[radius, radius * 1.02, 0.09, 48]} />
        <meshStandardMaterial
          color={dark ? "#232323" : "#9e9e9a"}
          roughness={0.46}
          metalness={0.16}
        />
      </mesh>

      <RoundedBox
        args={[radius * 0.16, radius * 1.25, 0.035]}
        radius={radius * 0.05}
        smoothness={4}
        position={[0, radius * 0.12, 0.062]}
      >
        <meshStandardMaterial
          color={dark ? "#b3b3ad" : "#e8e7e2"}
          roughness={0.55}
          metalness={0.05}
        />
      </RoundedBox>
    </group>
  );
}

function Slider({
  position,
  value,
  onChange,
  dark,
}: {
  position: [number, number, number];
  value: number;
  onChange: (value: number) => void;
  dark: boolean;
}) {
  const drag = useRef<{ y: number; value: number } | null>(null);
  const travel = 0.16;
  const y = THREE.MathUtils.lerp(-travel / 2, travel / 2, value);

  return (
    <group position={position}>
      <RoundedBox args={[0.055, 0.23, 0.035]} radius={0.018} smoothness={4}>
        <meshStandardMaterial
          color={dark ? "#0a0a0a" : "#b8b7b1"}
          roughness={0.88}
        />
      </RoundedBox>

      <RoundedBox
        args={[0.072, 0.105, 0.07]}
        radius={0.025}
        smoothness={5}
        position={[0, y, 0.048]}
        castShadow
        onPointerDown={(event) => {
          event.stopPropagation();
          drag.current = { y: event.nativeEvent.clientY, value };
          (event.nativeEvent.target as HTMLElement).setPointerCapture?.(
            event.pointerId
          );
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;
          event.stopPropagation();
          const delta = (drag.current.y - event.nativeEvent.clientY) * 0.007;
          onChange(
            THREE.MathUtils.clamp(drag.current.value + delta, 0, 1)
          );
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
          drag.current = null;
          (event.nativeEvent.target as HTMLElement).releasePointerCapture?.(
            event.pointerId
          );
        }}
      >
        <meshStandardMaterial
          color={dark ? "#30302f" : "#72736f"}
          roughness={0.52}
          metalness={0.08}
        />
      </RoundedBox>
    </group>
  );
}

function TransportButton({
  position,
  onPress,
  kind,
  active,
}: {
  position: [number, number, number];
  onPress: () => void;
  kind: "prev" | "play" | "next";
  active?: boolean;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <group position={position}>
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, pressed ? -0.008 : 0]}
        onPointerDown={(event) => {
          event.stopPropagation();
          setPressed(true);
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
          setPressed(false);
          onPress();
        }}
        onPointerLeave={() => setPressed(false)}
      >
        <cylinderGeometry
          args={[kind === "play" ? 0.048 : 0.037, kind === "play" ? 0.048 : 0.037, 0.035, 32]}
        />
        <meshStandardMaterial
          color={active ? "#f3f3ef" : "#d4d4cf"}
          roughness={0.48}
        />
      </mesh>

      {kind === "play" ? (
        active ? (
          <>
            <RoundedBox args={[0.011, 0.033, 0.009]} radius={0.003} position={[-0.011, 0, 0.022]}>
              <meshBasicMaterial color="#111" />
            </RoundedBox>
            <RoundedBox args={[0.011, 0.033, 0.009]} radius={0.003} position={[0.011, 0, 0.022]}>
              <meshBasicMaterial color="#111" />
            </RoundedBox>
          </>
        ) : (
          <mesh position={[0.006, 0, 0.022]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.019, 0.036, 3]} />
            <meshBasicMaterial color="#111" />
          </mesh>
        )
      ) : (
        <group rotation={[0, 0, kind === "prev" ? Math.PI : 0]}>
          <mesh position={[0.005, 0, 0.022]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.013, 0.026, 3]} />
            <meshBasicMaterial color="#111" />
          </mesh>
          <mesh position={[-0.014, 0, 0.022]}>
            <boxGeometry args={[0.006, 0.027, 0.008]} />
            <meshBasicMaterial color="#111" />
          </mesh>
        </group>
      )}
    </group>
  );
}

function Waveform({ playing, seed }: { playing: boolean; seed: number }) {
  const bars = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    bars.current.forEach((bar, index) => {
      if (!bar) return;
      const idle = 0.025 + ((index * 7 + seed * 3) % 5) * 0.008;
      const animated =
        0.035 +
        (0.035 + 0.035 * Math.sin(time * 6 + index * 1.7 + seed)) *
          (0.5 + ((index + seed) % 3) * 0.18);
      const next = playing ? animated : idle;
      bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, next / 0.05, 0.18);
    });
  });

  return (
    <group position={[-0.17, 0.025, 0.044]}>
      {Array.from({ length: 13 }).map((_, index) => (
        <mesh
          key={index}
          ref={(node) => {
            if (node) bars.current[index] = node;
          }}
          position={[index * 0.026, 0, 0]}
        >
          <boxGeometry args={[0.012, 0.05, 0.008]} />
          <meshBasicMaterial color="#f2f2ed" />
        </mesh>
      ))}
    </group>
  );
}

const TRACKS = [
  { title: "PIERCING LIGHT", artist: "LEAGUE OF LEGENDS / MAKO", src: "/audio/piercing-light-slowed.mp3" },
  { title: "SAINT PABLO", artist: "KANYE WEST / SAMPHA", src: "/audio/saint-pablo.mp3" },
  { title: "DARK MOTIONS", artist: "MIRAJ", src: "/audio/dark-motions.mp3" },
  { title: "KILLERS FROM THE NORTHSIDE", artist: "KORDHELL", src: "/audio/killers-northside-sped-up.mp3" },
];

const palettes = [
  ["#f6c619", "#ef3440", "#157a65", "#26345d"],
  ["#e7a736", "#c15735", "#5b6f58", "#202c45"],
  ["#e5ddd2", "#a75549", "#384d54", "#161b23"],
];

function Display({
  playing,
  track,
  onPlay,
  onPrev,
  onNext,
}: {
  playing: boolean;
  track: number;
  onPlay: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <group position={[0.455, 0.225, 0.242]}>
      <RoundedBox args={[0.84, 0.34, 0.055]} radius={0.065} smoothness={6}>
        <meshStandardMaterial color="#101516" roughness={0.62} metalness={0.04} />
      </RoundedBox>

      <Waveform playing={playing} seed={track} />

      <Text
        position={[-0.31, 0.125, 0.048]}
        fontSize={0.034}
        color="#f4f4ed"
        anchorX="left"
        anchorY="middle"
        maxWidth={0.48}
      >
        {TRACKS[track].title}
      </Text>
      <Text
        position={[-0.31, 0.083, 0.048]}
        fontSize={0.021}
        color="#929b97"
        anchorX="left"
        anchorY="middle"
        maxWidth={0.48}
      >
        {TRACKS[track].artist}
      </Text>
      <Text
        position={[-0.31, -0.025, 0.048]}
        fontSize={0.019}
        color={playing ? "#dce8df" : "#7e8884"}
        anchorX="left"
        anchorY="middle"
      >
        {playing ? "PLAYING" : "READY"}
      </Text>

      <mesh position={[-0.005, -0.07, 0.034]}>
        <boxGeometry args={[0.31, 0.006, 0.008]} />
        <meshBasicMaterial color="#979b98" />
      </mesh>

      <TransportButton
        position={[-0.115, -0.125, 0.045]}
        kind="prev"
        onPress={onPrev}
      />
      <TransportButton
        position={[0, -0.125, 0.045]}
        kind="play"
        active={playing}
        onPress={onPlay}
      />
      <TransportButton
        position={[0.115, -0.125, 0.045]}
        kind="next"
        onPress={onNext}
      />

      <group position={[0.275, 0.025, 0.043]}>
        {palettes[track % palettes.length].map((color, index) => (
          <RoundedBox
            key={color}
            args={[0.18, 0.045, 0.012]}
            radius={0.006}
            smoothness={3}
            position={[0, 0.067 - index * 0.045, 0]}
          >
            <meshBasicMaterial color={color} />
          </RoundedBox>
        ))}
      </group>
    </group>
  );
}

function PlayerScene({
  dark,
  pointer,
}: {
  dark: boolean;
  pointer: Point;
}) {
  const root = useRef<THREE.Group>(null);
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState(0);
  const [dialA, setDialA] = useState(0.22);
  const [dialB, setDialB] = useState(0.56);
  const [loudness, setLoudness] = useState(0.45);
  const [tuner, setTuner] = useState(0.58);
  const [smallA, setSmallA] = useState(0.32);
  const [smallB, setSmallB] = useState(0.64);
  const [smallC, setSmallC] = useState(0.46);
  const [smallD, setSmallD] = useState(0.72);

  useFrame((_, delta) => {
    if (!root.current) return;
    const ease = 1 - Math.exp(-delta * 7);
    root.current.rotation.x = THREE.MathUtils.lerp(
      root.current.rotation.x,
      -0.055 + pointer.y * 0.035,
      ease
    );
    root.current.rotation.y = THREE.MathUtils.lerp(
      root.current.rotation.y,
      -0.08 + pointer.x * 0.075,
      ease
    );
  });

  const nextTrack = (step: number) =>
    setTrack((current) => (current + step + TRACKS.length) % TRACKS.length);

  return (
    <group ref={root} scale={1.22}>
      <Chassis dark={dark} />

      <Display
        playing={playing}
        track={track}
        onPlay={() => setPlaying((value) => !value)}
        onPrev={() => nextTrack(-1)}
        onNext={() => nextTrack(1)}
      />

      <Dial
        position={[-0.60, -0.19, 0.235]}
        radius={0.185}
        value={dialA}
        onChange={setDialA}
        dark={dark}
      />
      <Dial
        position={[-0.20, -0.19, 0.235]}
        radius={0.175}
        value={dialB}
        onChange={setDialB}
        dark={dark}
      />

      <Slider
        position={[0.10, -0.22, 0.235]}
        value={loudness}
        onChange={setLoudness}
        dark={dark}
      />
      <Slider
        position={[0.27, -0.22, 0.235]}
        value={tuner}
        onChange={setTuner}
        dark={dark}
      />

      <Dial
        position={[0.55, -0.16, 0.242]}
        radius={0.082}
        value={smallA}
        onChange={setSmallA}
        dark={dark}
      />
      <Dial
        position={[0.76, -0.16, 0.242]}
        radius={0.082}
        value={smallB}
        onChange={setSmallB}
        dark={dark}
      />
      <Dial
        position={[0.55, -0.36, 0.242]}
        radius={0.082}
        value={smallC}
        onChange={setSmallC}
        dark={dark}
      />
      <Dial
        position={[0.76, -0.36, 0.242]}
        radius={0.082}
        value={smallD}
        onChange={setSmallD}
        dark={dark}
      />

      <ContactShadows
        position={[0, -0.57, -0.17]}
        opacity={dark ? 0.48 : 0.26}
        scale={2.6}
        blur={1.55}
        far={1.7}
      />
    </group>
  );
}

export default function MusicPlayer({ dark }: { dark: boolean }) {
  const [pointer, setPointer] = useState<Point>({ x: 0, y: 0 });

  return (
    <motion.div
      className="music-player"
      initial={{ opacity: 0, y: 28, scale: 0.965 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPointer({
          x: THREE.MathUtils.clamp(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -1,
            1
          ),
          y: THREE.MathUtils.clamp(
            -(((event.clientY - rect.top) / rect.height) * 2 - 1),
            -1,
            1
          ),
        });
      }}
      onPointerLeave={() => setPointer({ x: 0, y: 0 })}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.02, 3.25], fov: 31 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <ambientLight intensity={dark ? 0.54 : 1.05} />
        <directionalLight
          castShadow
          position={[-3.8, 4.4, 5.8]}
          intensity={dark ? 3.1 : 3.8}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight
          position={[4.2, -2.2, 3.1]}
          intensity={dark ? 0.7 : 1.05}
        />
        <pointLight
          position={[1.2, 1.2, 3.5]}
          intensity={dark ? 0.6 : 0.9}
          color={dark ? "#d8d8d0" : "#fff7ea"}
          distance={7}
        />
        <PlayerScene dark={dark} pointer={pointer} />
      </Canvas>
    </motion.div>
  );
}
