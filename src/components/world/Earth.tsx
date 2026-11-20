import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Earth: React.FC = () => {
  const earthRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.015;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.022;
    }
  });

  // Earth located majestically in the high lunar sky
  const earthPosition: [number, number, number] = [-280, 260, -320];

  return (
    <group position={earthPosition}>
      {/* Soft atmospheric backlight glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[44, 32, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Atmospheric Rim Fresnel Shell */}
      <mesh>
        <sphereGeometry args={[41.5, 32, 32]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.22}
          side={THREE.FrontSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Earth Body */}
      <group ref={earthRef} rotation={[0.4, 0.2, 0.4]}>
        {/* Ocean base */}
        <mesh>
          <sphereGeometry args={[39.6, 48, 48]} />
          <meshStandardMaterial
            color="#0f2b5c"
            roughness={0.25}
            metalness={0.1}
          />
        </mesh>

        {/* Continents & Landmasses - stylized procedural procedural meshes */}
        <mesh>
          <sphereGeometry args={[39.8, 36, 36]} />
          <meshStandardMaterial
            color="#2d5a3c"
            roughness={0.7}
            metalness={0.05}
            transparent
            opacity={0.88}
            wireframe={false}
          />
        </mesh>

        {/* Cloud Layer */}
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[40.4, 40, 40]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.42}
            roughness={0.9}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};
