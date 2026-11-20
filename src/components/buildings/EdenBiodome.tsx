import React from 'react';
import * as THREE from 'three';

export const EdenBiodomeMesh: React.FC = () => {
  return (
    <group>
      {/* Heavy Regolith Containment Berm Rim */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[11, 13, 2.4, 24]} />
        <meshStandardMaterial color="#1f2937" roughness={0.7} metalness={0.5} />
      </mesh>

      {/* Internal Lush Green Biome Terrain */}
      <mesh position={[0, 1.8, 0]} receiveShadow>
        <cylinderGeometry args={[10, 10, 0.4, 24]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} />
      </mesh>

      {/* Internal Botanical Canopy / Trees */}
      {[-3, 0, 3].map((xOff, i) =>
        [-2.5, 2.5].map((zOff, j) => (
          <group key={`${i}-${j}`} position={[xOff, 2.2, zOff]}>
            <mesh position={[0, 1.8, 0]}>
              <sphereGeometry args={[1.5, 12, 12]} />
              <meshStandardMaterial color="#22c55e" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.2, 0.3, 1.6, 6]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
          </group>
        ))
      )}

      {/* Central Terraced Hydroponic Tower with Artificial Sunlight Lamp */}
      <mesh position={[0, 4.5, 0]}>
        <cylinderGeometry args={[0.8, 1.2, 5.5, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
      </mesh>
      <pointLight position={[0, 6.5, 0]} color="#fef08a" intensity={1.8} distance={18} />

      {/* Transparent Geodesic Biodome Glass Shell */}
      <mesh position={[0, 2.4, 0]} castShadow>
        <sphereGeometry args={[10.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#a7f3d0"
          metalness={0.15}
          roughness={0.1}
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Geodesic Structural Lattice Frame */}
      <mesh position={[0, 2.4, 0]}>
        <sphereGeometry args={[10.55, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#334155" wireframe transparent opacity={0.65} />
      </mesh>
    </group>
  );
};

export const HydroponicsBioreactorMesh: React.FC = () => {
  return (
    <group>
      {/* Base Platform */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 1.6, 6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Vertical Algae Photo-Bioreactor Glass Columns (Cyan-Green) */}
      {[-3, -1, 1, 3].map((xOff, i) => (
        <group key={i} position={[xOff, 3.8, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.7, 0.7, 4.5, 16]} />
            <meshStandardMaterial
              color="#10b981"
              metalness={0.2}
              roughness={0.1}
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* Top & bottom chrome manifold caps */}
          <mesh position={[0, 2.4, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 0.4, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
          </mesh>
          <mesh position={[0, -2.4, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 0.4, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const SeedVaultMesh: React.FC = () => {
  return (
    <group>
      {/* Subterranean Vault Blast Hatch Collar */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[5, 6, 1.2, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Circular Heavy Titanium Vault Door */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[4, 4, 0.3, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Emergency Pressure Valve Wheel */}
      <mesh position={[0, 1.5, 0]}>
        <torusGeometry args={[0.9, 0.15, 8, 16]} />
        <meshStandardMaterial color="#ef4444" metalness={0.6} />
      </mesh>
    </group>
  );
};
