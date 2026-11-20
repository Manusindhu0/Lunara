import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useColony } from '../../context/ColonyContext';

export const CameraController: React.FC = () => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const { targetCameraPosition, targetLookAt, resetCamera } = useColony();

  // Smooth lerping destination vectors
  const desiredCamPos = useRef(new THREE.Vector3(...targetCameraPosition));
  const desiredLookAt = useRef(new THREE.Vector3(...targetLookAt));

  useEffect(() => {
    desiredCamPos.current.set(...targetCameraPosition);
    desiredLookAt.current.set(...targetLookAt);
  }, [targetCameraPosition, targetLookAt]);

  // Handle double click to reset camera or inspect
  useEffect(() => {
    const handleDoubleClick = (e: MouseEvent) => {
      // If user double clicks on background, return to overview
      if ((e.target as HTMLElement).tagName === 'CANVAS') {
        // e.preventDefault();
      }
    };
    window.addEventListener('dblclick', handleDoubleClick);
    return () => window.removeEventListener('dblclick', handleDoubleClick);
  }, [resetCamera]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    // Smooth lerp camera position and orbit target
    const lerpSpeed = Math.min(1, delta * 3.5);

    camera.position.lerp(desiredCamPos.current, lerpSpeed);
    controlsRef.current.target.lerp(desiredLookAt.current, lerpSpeed);
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableDamping
      dampingFactor={0.06}
      minDistance={6}
      maxDistance={340}
      // Strictly prevent dipping below the lunar surface
      maxPolarAngle={Math.PI / 2 - 0.05}
      minPolarAngle={0.05}
      rotateSpeed={0.7}
      zoomSpeed={0.85}
      panSpeed={0.8}
      screenSpacePanning={false}
    />
  );
};
