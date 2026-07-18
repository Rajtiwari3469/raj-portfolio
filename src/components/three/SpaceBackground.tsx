"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";
import * as THREE from "three";

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 3000;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    /* eslint-disable react-hooks/purity */
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 60;
      pos[i + 1] = (Math.random() - 0.5) * 60;
      pos[i + 2] = (Math.random() - 0.5) * 60;

      const color = new THREE.Color();
      const hue = Math.random() > 0.5
        ? 0.55 + Math.random() * 0.15
        : 0.7 + Math.random() * 0.1;
      color.setHSL(hue, 0.9, 0.6 + Math.random() * 0.3);
      col[i] = color.r;
      col[i + 1] = color.g;
      col[i + 2] = color.b;
    }
    /* eslint-enable react-hooks/purity */

    return [pos, col];
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.015;
      particlesRef.current.rotation.x = state.clock.getElapsedTime() * 0.008;
    }
  });

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

function NebulaCloud({ color, position, scale }: { color: string; position: [number, number, number]; scale: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.02;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.01) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[12, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.08}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function EnergySphere({ position, color, size }: { position: [number, number, number]; color: string; size: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

function DigitalRing({ position, color, size }: { position: [number, number, number]; color: string; size: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[size, 0.02, 16, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.4}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#00d4ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#8b5cf6" />
      <pointLight position={[5, -5, 5]} intensity={0.4} color="#a855f7" />

      <Stars
        radius={120}
        depth={60}
        count={8000}
        factor={4}
        saturation={0.3}
        fade
        speed={0.8}
      />

      <ParticleField />

      <NebulaCloud color="#00d4ff" position={[-15, 8, -20]} scale={2} />
      <NebulaCloud color="#8b5cf6" position={[20, -5, -25]} scale={2.5} />
      <NebulaCloud color="#06b6d4" position={[0, -10, -30]} scale={3} />
      <NebulaCloud color="#a855f7" position={[-10, 12, -15]} scale={1.5} />

      <EnergySphere position={[-12, 5, -18]} color="#00d4ff" size={0.8} />
      <EnergySphere position={[15, -3, -22]} color="#06b6d4" size={1.2} />
      <EnergySphere position={[-8, -6, -28]} color="#8b5cf6" size={0.6} />
      <EnergySphere position={[10, 8, -32]} color="#a855f7" size={1} />

      <DigitalRing position={[-6, 3, -12]} color="#00d4ff" size={2} />
      <DigitalRing position={[8, -4, -16]} color="#8b5cf6" size={1.5} />
      <DigitalRing position={[0, 0, -10]} color="#06b6d4" size={3} />

      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.5}>
        <mesh position={[-20, 10, -35]}>
          <dodecahedronGeometry args={[2, 0]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00d4ff"
            emissiveIntensity={0.15}
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>
      </Float>

      <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.8}>
        <mesh position={[18, -8, -30]}>
          <icosahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.15}
            wireframe
            transparent
            opacity={0.25}
          />
        </mesh>
      </Float>
    </>
  );
}

export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#0a0a2e] to-[#050510]" />
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
