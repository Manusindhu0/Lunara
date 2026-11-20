import React, { useRef } from 'react';
import * as THREE from 'three';
import { useColony } from '../../context/ColonyContext';

export const Lighting: React.FC = () => {
  const { timeOfDay, graphicsQuality } = useColony();
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  const shadowMapSize = graphicsQuality === 'high' ? 2048 : graphicsQuality === 'medium' ? 1024 : 512;
  const enableShadows = graphicsQuality !== 'performance';

  // Sunlight angles & colors according to preset
  const lightConfig = {
    'cinematic': {
      sunPos: [-140, 110, -90] as [number, number, number],
      sunColor: '#fff9ea',
      sunIntensity: 3.2,
      earthshineColor: '#38bdf8',
      earthshineIntensity: 0.45,
      ambientColor: '#111827',
      ambientIntensity: 0.55
    },
    'high-noon': {
      sunPos: [-40, 190, 30] as [number, number, number],
      sunColor: '#ffffff',
      sunIntensity: 3.8,
      earthshineColor: '#60a5fa',
      earthshineIntensity: 0.3,
      ambientColor: '#1e293b',
      ambientIntensity: 0.65
    },
    'earth-glow': {
      sunPos: [-220, 45, -160] as [number, number, number],
      sunColor: '#fed7aa',
      sunIntensity: 2.1,
      earthshineColor: '#0ea5e9',
      earthshineIntensity: 0.85,
      ambientColor: '#0f172a',
      ambientIntensity: 0.5
    }
  }[timeOfDay];

  return (
    <>
      {/* Deep Space Ambient Foundation */}
      <ambientLight color={lightConfig.ambientColor} intensity={lightConfig.ambientIntensity} />

      {/* Primary Harsh Directional Sunlight (Lunar vacuum lighting) */}
      <directionalLight
        ref={dirLightRef}
        position={lightConfig.sunPos}
        color={lightConfig.sunColor}
        intensity={lightConfig.sunIntensity}
        castShadow={enableShadows}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-near={10}
        shadow-camera-far={420}
        shadow-camera-left={-160}
        shadow-camera-right={160}
        shadow-camera-top={160}
        shadow-camera-bottom={-160}
        shadow-bias={-0.0003}
      />

      {/* Earthshine Fill Light (Simulating bluish light reflected off Earth) */}
      <directionalLight
        position={[-120, 90, -140]}
        color={lightConfig.earthshineColor}
        intensity={lightConfig.earthshineIntensity}
      />

      {/* Subtle under-surface bounce fill */}
      <hemisphereLight
        args={['#1f2937', '#030712', 0.4]}
      />
    </>
  );
};
