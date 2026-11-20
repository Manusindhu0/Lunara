import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const BeaconParabolicDishMesh: React.FC = () => {
  const dishRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // Gentle tracking oscillation
    if (dishRef.current) {
      dishRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <group>
      {/* Heavy Concrete Pedestal Base */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4, 5.5, 4, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Azimuth / Elevation Turret Fork */}
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[3, 2.4, 3]} />
        <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Steerable 35m Parabolic Dish Assembly (Aimed towards Earth) */}
      <group ref={dishRef} position={[0, 7.5, 0]} rotation={[-0.45, -0.6, 0]}>
        {/* Parabolic Bowl */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[8.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.92}
            roughness={0.18}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Central Feedhorn Support Tripod & Sub-reflector */}
        <mesh position={[0, 4.2, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 5, 6]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 6.2, 0]}>
          <coneGeometry args={[0.8, 1.2, 12]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
};

export const LaserTransceiverTowerMesh: React.FC = () => {
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    // Pulsing laser communication beam to Earth
    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.45 + Math.sin(state.clock.elapsedTime * 6) * 0.25;
    }
  });

  return (
    <group>
      {/* Structural Spire Mast */}
      <mesh position={[0, 8, 0]} castShadow>
        <cylinderGeometry args={[0.4, 1.6, 16, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.88} roughness={0.2} />
      </mesh>

      {/* Optical Gimbal Head */}
      <mesh position={[0, 16.5, 0]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.95} />
      </mesh>

      {/* Laser Optical Communication Beam projecting towards Earth */}
      {/* Target coordinates roughly towards Earth [-280, 260, -320] */}
      <group position={[0, 17, 0]} rotation={[0.42, 2.1, 0]}>
        <mesh ref={beamRef} position={[0, 100, 0]}>
          <cylinderGeometry args={[0.15, 0.4, 200, 8]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};

export const TelecomRelayMesh: React.FC = () => {
  return (
    <group>
      {/* Mast */}
      <mesh position={[0, 5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.8, 10, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.85} />
      </mesh>

      {/* Phased Array Microwave Panels */}
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((rot, i) => (
        <mesh key={i} position={[0, 8, 0]} rotation={[0, rot, 0]}>
          <boxGeometry args={[0.15, 2.4, 1.2]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
        </mesh>
      ))}

      {/* Beacon Tip Pulse */}
      <mesh position={[0, 10.3, 0]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshBasicMaterial color="#60a5fa" />
      </mesh>
    </group>
  );
};
