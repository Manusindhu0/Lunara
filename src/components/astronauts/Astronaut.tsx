import React, { useState } from 'react';
import * as THREE from 'three';
import { CitizenData } from '../../types';
import { useColony } from '../../context/ColonyContext';
import { DISTRICTS } from '../../data/districts';

interface AstronautProps {
  citizen: CitizenData;
}

export const Astronaut: React.FC<AstronautProps> = ({ citizen }) => {
  const { selectedCitizen, selectCitizen, setHoveredCitizen } = useColony();
  const [isHovered, setIsHovered] = useState(false);

  const isSelected = selectedCitizen?.id === citizen.id;
  const districtColor = DISTRICTS[citizen.districtId]?.accentColor || '#38bdf8';

  const handleClick = (e: any) => {
    e.stopPropagation();
    selectCitizen(citizen);
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setIsHovered(true);
    setHoveredCitizen(citizen);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setIsHovered(false);
    setHoveredCitizen(null);
    document.body.style.cursor = 'default';
  };

  return (
    <group
      position={citizen.position}
      rotation={[0, citizen.rotationY || 0, 0]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Astronaut 3D Body Mesh Hierarchy (Scale ~1.85m tall) */}
      <group position={[0, 0, 0]}>
        {/* Heavy Lunar Boots */}
        <mesh position={[-0.22, 0.22, 0.05]} castShadow>
          <boxGeometry args={[0.26, 0.44, 0.52]} />
          <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.4} />
        </mesh>
        <mesh position={[0.22, 0.22, 0.05]} castShadow>
          <boxGeometry args={[0.26, 0.44, 0.52]} />
          <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.4} />
        </mesh>

        {/* Pressurized Legs */}
        <mesh position={[-0.22, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.15, 0.65, 8]} />
          <meshStandardMaterial color={citizen.suitColor} roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[0.22, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.15, 0.65, 8]} />
          <meshStandardMaterial color={citizen.suitColor} roughness={0.5} metalness={0.3} />
        </mesh>

        {/* Heavy Pressurized Torso (EMU Suit) */}
        <mesh position={[0, 1.35, 0]} castShadow>
          <boxGeometry args={[0.62, 0.72, 0.42]} />
          <meshStandardMaterial color={citizen.suitColor} roughness={0.45} metalness={0.35} />
        </mesh>

        {/* Chest Display & Control Unit */}
        <mesh position={[0, 1.45, 0.22]}>
          <boxGeometry args={[0.28, 0.22, 0.06]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 1.45, 0.26]}>
          <planeGeometry args={[0.18, 0.12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* District Arm Badges */}
        <mesh position={[-0.34, 1.5, 0]}>
          <boxGeometry args={[0.04, 0.15, 0.15]} />
          <meshBasicMaterial color={districtColor} />
        </mesh>
        <mesh position={[0.34, 1.5, 0]}>
          <boxGeometry args={[0.04, 0.15, 0.15]} />
          <meshBasicMaterial color={districtColor} />
        </mesh>

        {/* Arms & Heavy Gloves */}
        <mesh position={[-0.38, 1.25, 0.05]} rotation={[0.2, 0, 0.2]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.62, 8]} />
          <meshStandardMaterial color={citizen.suitColor} roughness={0.5} />
        </mesh>
        <mesh position={[0.38, 1.25, 0.05]} rotation={[0.2, 0, -0.2]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.62, 8]} />
          <meshStandardMaterial color={citizen.suitColor} roughness={0.5} />
        </mesh>

        {/* PLSS Backpack (Portable Life Support System) */}
        <mesh position={[0, 1.4, -0.3]} castShadow>
          <boxGeometry args={[0.52, 0.75, 0.28]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Oxygen Tanks atop backpack */}
        <mesh position={[0, 1.78, -0.3]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.44, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
        </mesh>
        {/* Status beacon light on backpack */}
        <mesh position={[0.2, 1.84, -0.28]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={citizen.status === 'ON DUTY' ? '#22c55e' : '#38bdf8'} />
        </mesh>

        {/* Astronaut Helmet (Spherical dome) */}
        <mesh position={[0, 1.95, 0]} castShadow>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.5} />
        </mesh>

        {/* Gold Reflective Visor Shield (Apollo/Artemis gold mirror) */}
        <mesh position={[0, 1.95, 0.14]}>
          <sphereGeometry args={[0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.98}
            roughness={0.05}
          />
        </mesh>
      </group>

      {/* Surface Holographic Selection / Hover Ring */}
      {(isSelected || isHovered) && (
        <group position={[0, 0.04, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.2, 1.45, 32]} />
            <meshBasicMaterial
              color={isSelected ? '#38bdf8' : '#e2e8f0'}
              transparent
              opacity={isSelected ? 0.9 : 0.45}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Floating Vertical Marker Beacon */}
          {isSelected && (
            <mesh position={[0, 3.2, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.25, 0.5, 4]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
};

export const AstronautSwarm: React.FC = () => {
  const { citizens } = useColony();

  return (
    <group>
      {citizens.map((citizen) => (
        <Astronaut key={citizen.id} citizen={citizen} />
      ))}
    </group>
  );
};
