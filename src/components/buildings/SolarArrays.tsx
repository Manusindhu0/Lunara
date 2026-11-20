import React from 'react';
import * as THREE from 'three';

interface SolarArrayProps {
  position: [number, number, number];
  rotationY?: number;
}

export const SolarPanelCluster: React.FC<SolarArrayProps> = ({ position, rotationY = 0 }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Central Support Pylon */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.45, 3.6, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>

      {/* Crossbar Gimbal Mount */}
      <mesh position={[0, 3.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 8, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.85} />
      </mesh>

      {/* Angled High-Efficiency Solar Panel Wings (Blue Crystalline PV Cells) */}
      {[-2.2, 2.2].map((xOff, i) => (
        <group key={i} position={[xOff, 3.4, 0]} rotation={[0.55, 0, 0]}>
          {/* Panel Backing Frame */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3.8, 0.15, 6]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Photovoltaic Cells (Deep Iridescent Blue) */}
          <mesh position={[0, 0.1, 0]}>
            <planeGeometry args={[3.6, 5.8]} />
            <meshStandardMaterial
              color="#1d4ed8"
              metalness={0.88}
              roughness={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const SolarArrays: React.FC = () => {
  // Scatter solar farms strategically along the colony perimeter & near Forge/Haven
  const arrays: SolarArrayProps[] = [
    { position: [-125, 0, 15], rotationY: 0.3 },
    { position: [-135, 0, 30], rotationY: 0.3 },
    { position: [-120, 0, 50], rotationY: 0.3 },
    { position: [-110, 0, 75], rotationY: 0.4 },
    { position: [85, 0, 55], rotationY: -0.2 },
    { position: [98, 0, 70], rotationY: -0.2 },
    { position: [110, 0, 85], rotationY: -0.2 },
    { position: [-25, 0, -115], rotationY: 0.8 },
    { position: [-40, 0, -125], rotationY: 0.8 },
    { position: [100, 0, -65], rotationY: -0.6 },
    { position: [115, 0, -78], rotationY: -0.6 }
  ];

  return (
    <group>
      {arrays.map((arr, idx) => (
        <SolarPanelCluster key={idx} {...arr} />
      ))}
    </group>
  );
};
