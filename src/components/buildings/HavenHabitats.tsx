import React from 'react';
import * as THREE from 'three';

export const HavenHabRingMesh: React.FC = () => {
  return (
    <group>
      {/* Central Courtyard Hub */}
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4.5, 5, 3.6, 12]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Outer Toroidal Pressurized Hab Ring */}
      <mesh position={[0, 2.2, 0]} castShadow rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[8.5, 1.8, 16, 24]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Radial Pressurized Spokes connecting Hub to Ring */}
      {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map((rot, i) => (
        <group key={i} rotation={[0, rot, 0]}>
          <mesh position={[4.5, 2.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.9, 0.9, 4, 12]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
          {/* Individual Living Pod Portlights (Warm Amber Residential Glow) */}
          <mesh position={[8.5, 2.2, 1.6]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>
      ))}

      {/* Central Garden Skylight Dome */}
      <mesh position={[0, 3.6, 0]}>
        <sphereGeometry args={[3.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#38bdf8"
          metalness={0.2}
          roughness={0.1}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
};

export const HavenCivicCenterMesh: React.FC = () => {
  return (
    <group>
      {/* Step-terraced amphitheater plinth */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[8, 9.5, 2, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Main Agora Atrium Pavilion */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <cylinderGeometry args={[6.5, 7.5, 3, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Warm Ambient Glass Ribbon */}
      <mesh position={[0, 3.8, 0]}>
        <cylinderGeometry args={[6.6, 6.6, 0.9, 16]} />
        <meshBasicMaterial color="#fef08a" transparent opacity={0.75} />
      </mesh>

      {/* Monumental Over-Dome */}
      <mesh position={[0, 5, 0]} castShadow>
        <sphereGeometry args={[5.5, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
      </mesh>
    </group>
  );
};

export const HavenMedicalMesh: React.FC = () => {
  return (
    <group>
      {/* Cruciform / Medical Layout Hub */}
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[12, 3.6, 5]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 3.6, 12]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Medical Cross Symbol (Cyan/White Glow) */}
      <mesh position={[0, 3.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 0.8]} />
        <meshBasicMaterial color="#0ea5e9" />
      </mesh>
      <mesh position={[0, 3.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, 2.5]} />
        <meshBasicMaterial color="#0ea5e9" />
      </mesh>

      {/* Decontamination Airlock Ports */}
      <mesh position={[0, 1.5, 6.1]}>
        <boxGeometry args={[2.6, 2.2, 0.2]} />
        <meshStandardMaterial color="#0284c7" metalness={0.8} />
      </mesh>
    </group>
  );
};
