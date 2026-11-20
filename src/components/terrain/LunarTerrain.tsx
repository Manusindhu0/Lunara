import React, { useMemo } from 'react';
import * as THREE from 'three';
import { DISTRICTS } from '../../data/districts';

export const LunarTerrain: React.FC = () => {
  // Generate procedural lunar terrain with craters, rolling hills, and flattened district zones
  const { geometry } = useMemo(() => {
    const width = 500;
    const height = 500;
    const segments = 120; // Good fidelity while remaining 60fps fast

    const geo = new THREE.PlaneGeometry(width, height, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const districtPositions = Object.values(DISTRICTS).map(d => d.center);

    // Procedural noise & crater algorithm
    // Defined craters: [centerX, centerZ, radius, depth]
    const majorCraters: [number, number, number, number][] = [
      [-170, -140, 55, 9],
      [160, 140, 48, 8],
      [-160, 130, 42, 7],
      [140, -130, 38, 6.5],
      [10, -180, 50, 8.5],
      [-130, -30, 32, 5],
      [180, 20, 36, 5.5],
      [30, 180, 45, 7.5],
      // Micro craters
      [-40, 60, 14, 2.5],
      [60, 40, 16, 2.8],
      [-40, -40, 12, 2.2],
      [-15, 70, 10, 1.8],
      [80, 45, 12, 2.0],
    ];

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Low frequency rolling lunar topography
      let y = Math.sin(x * 0.015) * Math.cos(z * 0.015) * 4.5
            + Math.sin(x * 0.035 + 1.2) * Math.cos(z * 0.03 + 0.8) * 2.2
            + Math.sin(x * 0.08) * Math.sin(z * 0.08) * 0.8;

      // Outer mountain rim (crater basin edge far away)
      const distFromCenter = Math.sqrt(x * x + z * z);
      if (distFromCenter > 170) {
        const rimFactor = (distFromCenter - 170) / 80;
        y += Math.pow(rimFactor, 2.2) * 22;
        y += Math.sin(x * 0.12) * 3;
      }

      // Apply major craters
      for (const [cx, cz, r, depth] of majorCraters) {
        const d = Math.sqrt((x - cx) ** 2 + (z - cz) ** 2);
        if (d < r) {
          // Inside crater bowl
          const normalized = d / r;
          // Crater profile: steep rim, bowl floor, central rebound peak
          const rimHeight = Math.sin(normalized * Math.PI) * (depth * 0.35);
          const bowl = Math.cos(normalized * (Math.PI / 2)) * depth;
          y -= bowl;
          y += rimHeight;
          if (d < r * 0.2) {
            // Central peak
            y += (1 - d / (r * 0.2)) * (depth * 0.25);
          }
        } else if (d < r * 1.35) {
          // Raised ejecta rim outside crater
          const ejectaFactor = 1 - (d - r) / (r * 0.35);
          y += ejectaFactor * (depth * 0.4);
        }
      }

      // Flatten terrain smoothly under districts so buildings and corridors rest solidly
      for (const [dx, , dz] of districtPositions) {
        const distToDistrict = Math.sqrt((x - dx) ** 2 + (z - dz) ** 2);
        const padRadius = 38;
        if (distToDistrict < padRadius) {
          const blend = Math.cos((distToDistrict / padRadius) * (Math.PI / 2));
          y = y * (1 - blend * 0.95);
        }
      }

      pos.setY(i, y);
    }

    geo.computeVertexNormals();
    return { geometry: geo };
  }, []);

  return (
    <group>
      {/* Primary Lunar Regolith Surface */}
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial
          color="#373c44"
          roughness={0.92}
          metalness={0.12}
          flatShading={false}
        />
      </mesh>

      {/* District Foundation Sintered Basalt Platforms */}
      {Object.values(DISTRICTS).map((district) => {
        const [cx, , cz] = district.center;
        const radius = district.id === 'NEXUS' ? 32 : 26;
        return (
          <group key={district.id} position={[cx, 0.05, cz]}>
            {/* Hexagonal sintered foundation slab */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0, radius, 6]} />
              <meshStandardMaterial
                color="#20242c"
                roughness={0.7}
                metalness={0.35}
              />
            </mesh>

            {/* Subtle perimeter warning/guidance ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
              <ringGeometry args={[radius - 0.6, radius, 32]} />
              <meshBasicMaterial
                color={district.accentColor}
                transparent
                opacity={0.35}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
