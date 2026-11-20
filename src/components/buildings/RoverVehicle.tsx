import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RoverProps {
  position: [number, number, number];
  rotationY?: number;
  isPatrolling?: boolean;
}

export const RoverModel: React.FC<RoverProps> = ({ position, rotationY = 0, isPatrolling = false }) => {
  const roverGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (isPatrolling && roverGroupRef.current) {
      // Gentle patrol drift along road
      const t = state.clock.elapsedTime * 0.4;
      roverGroupRef.current.position.x = position[0] + Math.sin(t) * 8;
      roverGroupRef.current.position.z = position[2] + Math.cos(t) * 6;
      roverGroupRef.current.rotation.y = rotationY + Math.sin(t) * 0.3;
    }
  });

  return (
    <group ref={roverGroupRef} position={position} rotation={[0, rotationY, 0]}>
      {/* Rover Main Chassis */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[2.2, 1.1, 3.4]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Pressurized Cockpit Canopy (Gold tint) */}
      <mesh position={[0, 1.7, 0.4]}>
        <sphereGeometry args={[0.9, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* High-Gain Dish Antenna */}
      <mesh position={[0.7, 2.2, -1.1]} rotation={[-0.4, 0.3, 0]}>
        <coneGeometry args={[0.45, 0.25, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>

      {/* LED High-Beam Headlights */}
      <mesh position={[-0.7, 1.1, 1.75]}>
        <boxGeometry args={[0.3, 0.2, 0.1]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <mesh position={[0.7, 1.1, 1.75]}>
        <boxGeometry args={[0.3, 0.2, 0.1]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* 6 Lunar Mesh Wheels with Rocker-Bogie Suspension */}
      {[-1.3, 1.3].map((xOff, sideIdx) =>
        [-1.2, 0, 1.2].map((zOff, wheelIdx) => (
          <group key={`${sideIdx}-${wheelIdx}`} position={[xOff, 0.45, zOff]}>
            <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.45, 0.45, 0.35, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} wireframe />
            </mesh>
            {/* Wheel rim hub */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.2, 0.2, 0.38, 8]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.8} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
};

export const ColonyRovers: React.FC = () => {
  return (
    <group>
      {/* Exploration rover parked near Forge */}
      <RoverModel position={[-62, 0, 52]} rotationY={1.2} />

      {/* Survey rover along Nexus-Beacon highway */}
      <RoverModel position={[-35, 0, -32]} rotationY={-0.6} isPatrolling={true} />

      {/* Logistics rover parked near Artemis Transit Hub */}
      <RoverModel position={[-20, 0, 22]} rotationY={2.1} />

      {/* Science rover near Aether Quantum Lab */}
      <RoverModel position={[38, 0, -78]} rotationY={-1.5} />

      {/* Haven civilian rover */}
      <RoverModel position={[25, 0, 72]} rotationY={0.5} />
    </group>
  );
};
