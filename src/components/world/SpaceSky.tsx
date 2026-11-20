import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const SpaceSky: React.FC = () => {
  const starsRef = useRef<THREE.Points>(null);
  const nebulaRef = useRef<THREE.Group>(null);

  // Generate high-density star field with varying magnitudes and cosmic color tints
  const [starPositions, starColors, starSizes] = useMemo(() => {
    const count = 4500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const colorChoices = [
      new THREE.Color('#ffffff'), // Pure white
      new THREE.Color('#f8fafc'), // Bright off-white
      new THREE.Color('#dbeafe'), // Soft blue
      new THREE.Color('#bfdbfe'), // Deep blue tint
      new THREE.Color('#fef08a'), // Muted yellow
      new THREE.Color('#fed7aa')  // Amber star
    ];

    for (let i = 0; i < count; i++) {
      // Distribute stars on a large outer celestial hemisphere/sphere (radius 600 - 950)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const radius = 650 + Math.random() * 250;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      // Bias upward so deep space looks rich above the lunar horizon
      const y = Math.abs(radius * Math.cos(phi)) * 0.9 + 50;
      const z = radius * Math.sin(phi) * Math.sin(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const col = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      // Magnitude variation
      sizes[i] = Math.random() < 0.05 ? 2.6 : Math.random() < 0.2 ? 1.8 : 1.1;
    }

    return [positions, colors, sizes];
  }, []);

  useFrame((_, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.0004;
    }
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y += delta * 0.0002;
    }
  });

  return (
    <group>
      {/* Starfield points */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[starColors, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[starSizes, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.5}
          vertexColors
          transparent
          opacity={0.95}
          sizeAttenuation
        />
      </points>

      {/* Deep Space Milky Way Dust Plane & Nebulae Glow */}
      <group ref={nebulaRef} position={[0, 400, -500]} rotation={[0.4, 0.6, 0.2]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[900, 320]} />
          <meshBasicMaterial
            color="#1e1b4b"
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[50, -40, 20]}>
          <planeGeometry args={[700, 180]} />
          <meshBasicMaterial
            color="#0c4a6e"
            transparent
            opacity={0.09}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};
