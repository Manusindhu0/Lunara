import React, { useState } from 'react';
import * as THREE from 'three';
import { BuildingData } from '../../types';
import { useColony } from '../../context/ColonyContext';

interface BuildingWrapperProps {
  building: BuildingData;
  children: React.ReactNode;
}

export const BuildingWrapper: React.FC<BuildingWrapperProps> = ({ building, children }) => {
  const { selectedBuilding, selectBuilding, setHoveredBuilding } = useColony();
  const [isHovered, setIsHovered] = useState(false);

  const isSelected = selectedBuilding?.id === building.id;

  const handleClick = (e: any) => {
    e.stopPropagation();
    selectBuilding(building);
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setIsHovered(true);
    setHoveredBuilding(building);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setIsHovered(false);
    setHoveredBuilding(null);
    document.body.style.cursor = 'default';
  };

  return (
    <group
      position={building.position}
      rotation={building.rotation || [0, 0, 0]}
      scale={building.scale || [1, 1, 1]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Visual Building Geometry */}
      {children}

      {/* Subtle Holographic Selection / Hover Ring on Surface */}
      {(isSelected || isHovered) && (
        <group position={[0, 0.12, 0]}>
          {/* Base selection halo */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[11, 12, 32]} />
            <meshBasicMaterial
              color={isSelected ? '#38bdf8' : '#94a3b8'}
              transparent
              opacity={isSelected ? 0.75 : 0.35}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Pulsing indicator marker */}
          {isSelected && (
            <mesh position={[0, 16, 0]}>
              <octahedronGeometry args={[0.9, 0]} />
              <meshBasicMaterial color="#38bdf8" wireframe />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
};
