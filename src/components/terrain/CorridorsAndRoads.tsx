import React, { useMemo } from 'react';
import * as THREE from 'three';
import { DISTRICTS } from '../../data/districts';

interface CorridorProps {
  start: [number, number, number];
  end: [number, number, number];
  accentColor: string;
}

const PressurizedCorridor: React.FC<CorridorProps> = ({ start, end, accentColor }) => {
  const { pathLength, rotation, midpoint, ribPositions } = useMemo(() => {
    const p1 = new THREE.Vector3(...start);
    const p2 = new THREE.Vector3(...end);

    // Truncate start and end so corridor doesn't clip into the center of the main buildings
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const fullDist = dir.length();
    dir.normalize();

    const startOffset = 18;
    const endOffset = 16;
    const actualLength = Math.max(10, fullDist - startOffset - endOffset);

    const actualStart = p1.clone().add(dir.clone().multiplyScalar(startOffset));
    const actualEnd = p1.clone().add(dir.clone().multiplyScalar(startOffset + actualLength));

    const mid = new THREE.Vector3().addVectors(actualStart, actualEnd).multiplyScalar(0.5);
    mid.y = 1.1; // Corridor height above surface

    // Calculate rotation towards target
    const angleY = Math.atan2(dir.x, dir.z);

    // Rib positions along length
    const ribStep = 8;
    const ribCount = Math.floor(actualLength / ribStep);
    const ribs: number[] = [];
    for (let i = 0; i < ribCount; i++) {
      ribs.push(-actualLength / 2 + (i + 0.5) * ribStep);
    }

    return {
      pathLength: actualLength,
      rotation: [0, angleY, 0] as [number, number, number],
      midpoint: [mid.x, mid.y, mid.z] as [number, number, number],
      ribPositions: ribs
    };
  }, [start, end]);

  return (
    <group position={midpoint} rotation={rotation}>
      {/* Sintered Rover Road / Footpath underneath */}
      <mesh position={[0, -0.9, 0]} receiveShadow>
        <boxGeometry args={[4.8, 0.2, pathLength + 4]} />
        <meshStandardMaterial
          color="#1e232a"
          roughness={0.9}
          metalness={0.2}
        />
      </mesh>

      {/* Sintered Road Edge LED Guidance Beacons */}
      <mesh position={[-2.2, -0.75, 0]}>
        <boxGeometry args={[0.2, 0.08, pathLength]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>
      <mesh position={[2.2, -0.75, 0]}>
        <boxGeometry args={[0.2, 0.08, pathLength]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>

      {/* Pressurized Main Glass/Composite Tube */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.3, 1.3, pathLength, 16]} />
        {/* Rotate cylinder along Z-axis */}
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.8}
          roughness={0.25}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Internal Transit Tube Spine */}
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, pathLength, 8]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.5} />
      </mesh>

      {/* Structural Support Rings & External Micrometeorite Baffles */}
      {ribPositions.map((zOffset, idx) => (
        <group key={idx} position={[0, 0, zOffset]}>
          {/* External heavy titanium collar */}
          <mesh castShadow>
            <torusGeometry args={[1.5, 0.18, 8, 16]} />
            <meshStandardMaterial
              color="#334155"
              metalness={0.85}
              roughness={0.3}
            />
          </mesh>
          {/* Surface anchor pylon down to bedrock */}
          <mesh position={[0, -0.8, 0]}>
            <boxGeometry args={[0.3, 1.4, 0.4]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const CorridorsAndRoads: React.FC = () => {
  const nexusCenter = DISTRICTS.NEXUS.center;

  const peripheralDistricts = [
    DISTRICTS.FORGE,
    DISTRICTS.EDEN,
    DISTRICTS.AETHER,
    DISTRICTS.BEACON,
    DISTRICTS.HAVEN
  ];

  return (
    <group>
      {/* Corridors from NEXUS out to each district */}
      {peripheralDistricts.map((district) => (
        <PressurizedCorridor
          key={district.id}
          start={nexusCenter}
          end={district.center}
          accentColor={district.accentColor}
        />
      ))}

      {/* Secondary perimeter connector corridor between HAVEN and FORGE */}
      <PressurizedCorridor
        start={DISTRICTS.HAVEN.center}
        end={DISTRICTS.FORGE.center}
        accentColor="#eab308"
      />

      {/* Secondary perimeter connector corridor between AETHER and BEACON */}
      <PressurizedCorridor
        start={DISTRICTS.AETHER.center}
        end={DISTRICTS.BEACON.center}
        accentColor="#a855f7"
      />
    </group>
  );
};
