import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Lighting } from './Lighting';
import { SpaceSky } from './SpaceSky';
import { Earth } from './Earth';
import { LunarTerrain } from '../terrain/LunarTerrain';
import { CorridorsAndRoads } from '../terrain/CorridorsAndRoads';
import { DistrictManager } from '../districts/DistrictManager';
import { AstronautSwarm } from '../astronauts/Astronaut';
import { SolarArrays } from '../buildings/SolarArrays';
import { ColonyRovers } from '../buildings/RoverVehicle';
import { CameraController } from '../camera/CameraController';

export const ColonyScene: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#05070a]">
      <Canvas
        camera={{ position: [0, 140, 200], fov: 42, near: 0.5, far: 1800 }}
        shadows
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false
        }}
      >
        <Suspense fallback={null}>
          <CameraController />
          <Lighting />
          <SpaceSky />
          <Earth />
          <LunarTerrain />
          <CorridorsAndRoads />
          <SolarArrays />
          <ColonyRovers />
          <DistrictManager />
          <AstronautSwarm />
        </Suspense>
      </Canvas>
    </div>
  );
};
