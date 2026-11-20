import React from 'react';
import * as THREE from 'three';

export const ForgeSmelterMesh: React.FC = () => {
  return (
    <group>
      {/* Heavy Foundry Core Base */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[14, 5, 12]} />
        <meshStandardMaterial color="#27272a" roughness={0.7} metalness={0.8} />
      </mesh>

      {/* Plasma Arc Furnace Cylinder */}
      <mesh position={[0, 6.5, 0]} castShadow>
        <cylinderGeometry args={[4.2, 4.8, 4, 16]} />
        <meshStandardMaterial color="#3f3f46" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Super-heated Molten Titanium Slag Chamber (Glowing Orange) */}
      <mesh position={[0, 4.8, 6.05]}>
        <boxGeometry args={[4, 1.8, 0.2]} />
        <meshBasicMaterial color="#ea580c" />
      </mesh>

      {/* Dual Exhaust / Thermal Dissipation Chimneys */}
      {[-3.2, 3.2].map((xOffset, i) => (
        <group key={i} position={[xOffset, 9, -2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.9, 1.2, 7, 12]} />
            <meshStandardMaterial color="#52525b" metalness={0.8} />
          </mesh>
          {/* Heat Radiator Fin Rings */}
          {[1, 2.2, 3.4].map((yOff, j) => (
            <mesh key={j} position={[0, yOff, 0]}>
              <torusGeometry args={[1.3, 0.1, 8, 16]} />
              <meshStandardMaterial color="#f97316" metalness={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Titanium Ingot Storage Stack outside */}
      <mesh position={[7.5, 0.8, 2]} castShadow>
        <boxGeometry args={[3.2, 1.6, 4]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};

export const TokamakReactorMesh: React.FC = () => {
  return (
    <group>
      {/* Superconducting Torus Outer Encasement */}
      <mesh position={[0, 3.5, 0]} castShadow rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[6.2, 2.2, 16, 32]} />
        <meshStandardMaterial color="#3f3f46" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Poloidal & Toroidal Magnetic Coils (Yellow/Orange banding) */}
      {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((rot, i) => (
        <mesh key={i} position={[0, 3.5, 0]} rotation={[0, rot, 0]}>
          <boxGeometry args={[15, 0.5, 0.5]} />
          <meshStandardMaterial color="#eab308" metalness={0.7} />
        </mesh>
      ))}

      {/* Glowing Central Fusion Core (Helium-3 Plasma Core) */}
      <mesh position={[0, 3.5, 0]}>
        <sphereGeometry args={[2.5, 24, 24]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* Cryogenic Coolant Feed Pipes */}
      {[-4, 4].map((xOff, i) => (
        <mesh key={i} position={[xOff, 1.8, 4]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 3.6, 12]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

export const AssemblyHangarMesh: React.FC = () => {
  return (
    <group>
      {/* Quonset / Barrel-Vaulted Curved Hangar */}
      <mesh position={[0, 3.5, 0]} castShadow receiveShadow rotation={[0, 0, 0]}>
        <cylinderGeometry args={[6.5, 6.5, 14, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#27272a" metalness={0.75} roughness={0.35} />
      </mesh>

      {/* Hangar Floor Slab */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[14, 0.4, 14]} />
        <meshStandardMaterial color="#18181b" metalness={0.5} roughness={0.8} />
      </mesh>

      {/* Roll-up Heavy Airlock Doors */}
      <mesh position={[0, 2.8, 7.02]}>
        <boxGeometry args={[7, 4.8, 0.2]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Exterior Service Crane Arm */}
      <mesh position={[7.5, 4, 3]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 7, 8]} />
        <meshStandardMaterial color="#eab308" metalness={0.8} />
      </mesh>
      <mesh position={[5.5, 7.3, 3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 5, 8]} />
        <meshStandardMaterial color="#eab308" metalness={0.8} />
      </mesh>
    </group>
  );
};
