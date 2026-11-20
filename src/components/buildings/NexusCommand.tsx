import React from 'react';
import * as THREE from 'three';

export const NexusCommandMesh: React.FC = () => {
  return (
    <group>
      {/* Heavy Sub-level Foundation Plinth */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[14, 16, 2.4, 8]} />
        <meshStandardMaterial color="#1e242d" roughness={0.65} metalness={0.7} />
      </mesh>

      {/* Terraced Tier 1 Command Level */}
      <mesh position={[0, 3.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[11, 13.5, 3, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Illuminated Observation Windows Ring */}
      <mesh position={[0, 4.4, 0]}>
        <cylinderGeometry args={[11.1, 11.1, 0.7, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
      </mesh>

      {/* Terraced Tier 2 High Council Deck */}
      <mesh position={[0, 7.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[8.5, 10.5, 3.8, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.35} metalness={0.85} />
      </mesh>

      {/* Tier 2 Cyan Window Band */}
      <mesh position={[0, 7.6, 0]}>
        <cylinderGeometry args={[8.6, 8.6, 0.8, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
      </mesh>

      {/* Central Spire Dome Base */}
      <mesh position={[0, 10.2, 0]} castShadow>
        <sphereGeometry args={[7.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.25} metalness={0.9} />
      </mesh>

      {/* Monumental Orbital Communications & Docking Needle */}
      <mesh position={[0, 19, 0]} castShadow>
        <cylinderGeometry args={[0.35, 1.4, 18, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.2} />
      </mesh>

      {/* Docking Torus Ring suspended on Spire */}
      <mesh position={[0, 15, 0]} castShadow>
        <torusGeometry args={[3.2, 0.45, 12, 24]} />
        <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Blinking Red Aviation Hazard Strobe atop Spire */}
      <mesh position={[0, 28.2, 0]}>
        <sphereGeometry args={[0.32, 12, 12]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    </group>
  );
};

export const TransitHubMesh: React.FC = () => {
  return (
    <group>
      {/* Rectangular Logistics Terminal Base */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[16, 4, 10]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.5} />
      </mesh>

      {/* Pressurized Mag-Tube Junction Dome */}
      <mesh position={[0, 4.5, 0]} castShadow>
        <sphereGeometry args={[4.2, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Cargo Bay Air-Lock Doors */}
      <mesh position={[0, 1.5, 5.05]}>
        <boxGeometry args={[6, 2.6, 0.1]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.6} />
      </mesh>

      {/* Overhead Cargo Gantry Crane Track */}
      <mesh position={[0, 5.5, 0]}>
        <boxGeometry args={[18, 0.4, 0.6]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.8} />
      </mesh>
    </group>
  );
};

export const AtmosDomeMesh: React.FC = () => {
  return (
    <group>
      {/* Heavy Octagonal Base */}
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[7, 8, 2.8, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.65} roughness={0.4} />
      </mesh>

      {/* Atmospheric Scrubbing Hemisphere */}
      <mesh position={[0, 2.8, 0]} castShadow>
        <sphereGeometry args={[6, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0284c7" metalness={0.3} roughness={0.2} transparent opacity={0.75} />
      </mesh>

      {/* Liquid Gas Storage Spheres (Cryogenic tanks) */}
      {[-3.5, 3.5].map((xOffset, i) => (
        <group key={i} position={[xOffset, 2.2, 5.5]}>
          <mesh castShadow>
            <sphereGeometry args={[1.6, 16, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[0, -1.2, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
