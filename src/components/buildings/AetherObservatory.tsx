import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const AetherObservatoryMesh: React.FC = () => {
  const domeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (domeRef.current) {
      domeRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group>
      {/* Cylindrical Observatory Base */}
      <mesh position={[0, 3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[6.5, 7.5, 6, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Rotating Upper Optical Dome */}
      <group ref={domeRef} position={[0, 6, 0]}>
        {/* Hemisphere Dome */}
        <mesh castShadow>
          <sphereGeometry args={[6.4, 24, 16, 0, Math.PI * 1.7, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Telescope Optical Barrel pointing outward at 45 degree elevation */}
        <group position={[0, 1.5, 0]} rotation={[0.7, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[1.6, 1.8, 7.5, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Segmented Beryllium Mirror (Gold reflective face) */}
          <mesh position={[0, -2.8, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 0.2, 12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.05} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export const QuantumLabMesh: React.FC = () => {
  return (
    <group>
      {/* Sub-surface reinforced bunker */}
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[11, 2.8, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Cryogenic Dilution Refrigerator Cylinders (Purple-glowing quantum cores) */}
      {[-3, 0, 3].map((xOff, i) => (
        <group key={i} position={[xOff, 3.8, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[1.1, 1.1, 2.6, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Quantum coherence indicator band */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[1.15, 1.15, 0.4, 16]} />
            <meshBasicMaterial color="#a855f7" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const SeismicPostMesh: React.FC = () => {
  return (
    <group>
      {/* Triangular Bedrock Anchor */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3, 4, 1.2, 3]} />
        <meshStandardMaterial color="#475569" metalness={0.7} />
      </mesh>

      {/* Laser Interferometer Tower */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.5, 5, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>

      {/* Seismic Sensor Head */}
      <mesh position={[0, 6.2, 0]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshBasicMaterial color="#c084fc" wireframe />
      </mesh>
    </group>
  );
};
