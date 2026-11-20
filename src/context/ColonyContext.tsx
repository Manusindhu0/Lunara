import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { BuildingData, CitizenData, Citizen, DistrictId, CameraViewPreset, ColonyState } from '../types';
import { DISTRICTS } from '../data/districts';
import { BUILDINGS } from '../data/buildings';
import { citizenService } from '../lib/citizenService';
import { toCitizenDataArray, citizenToCitizenData } from '../lib/citizenAdapter';

interface ColonyContextType extends ColonyState {
  selectBuilding: (building: BuildingData | null) => void;
  selectCitizen: (citizen: CitizenData | Citizen | null) => void;
  selectDistrict: (districtId: DistrictId | null) => void;
  setHoveredBuilding: (building: BuildingData | null) => void;
  setHoveredCitizen: (citizen: CitizenData | null) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsNotificationsOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setGraphicsQuality: (quality: 'high' | 'medium' | 'performance') => void;
  setCameraPreset: (preset: CameraViewPreset) => void;
  setTimeOfDay: (time: 'cinematic' | 'high-noon' | 'earth-glow') => void;
  
  // Camera specific targets
  targetCameraPosition: [number, number, number];
  targetLookAt: [number, number, number];
  resetCamera: () => void;
  focusDistrict: (districtId: DistrictId) => void;
  focusBuilding: (building: BuildingData) => void;
  focusCitizen: (citizen: CitizenData | Citizen) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  refreshCitizens: () => void;
  
  // Data access
  buildings: BuildingData[];
  citizens: CitizenData[];
  districts: typeof DISTRICTS;
}

const DEFAULT_CAMERA_POS: [number, number, number] = [0, 140, 200];
const DEFAULT_LOOK_AT: [number, number, number] = [0, 0, 0];

const ColonyContext = createContext<ColonyContextType | null>(null);

export const ColonyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedBuilding, setSelectedBuildingState] = useState<BuildingData | null>(null);
  const [selectedCitizen, setSelectedCitizenState] = useState<CitizenData | null>(null);
  const [selectedDistrict, setSelectedDistrictState] = useState<DistrictId | null>(null);
  
  const [hoveredBuilding, setHoveredBuilding] = useState<BuildingData | null>(null);
  const [hoveredCitizen, setHoveredCitizen] = useState<CitizenData | null>(null);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [graphicsQuality, setGraphicsQuality] = useState<'high' | 'medium' | 'performance'>('high');
  const [cameraPreset, setCameraPreset] = useState<CameraViewPreset>('overview');
  const [timeOfDay, setTimeOfDay] = useState<'cinematic' | 'high-noon' | 'earth-glow'>('cinematic');

  const [targetCameraPosition, setTargetCameraPosition] = useState<[number, number, number]>(DEFAULT_CAMERA_POS);
  const [targetLookAt, setTargetLookAt] = useState<[number, number, number]>(DEFAULT_LOOK_AT);

  const [citizens, setCitizens] = useState<CitizenData[]>(() => {
    return toCitizenDataArray(citizenService.getAll());
  });

  const refreshCitizens = useCallback(() => {
    setCitizens(toCitizenDataArray(citizenService.getAll()));
  }, []);

  useEffect(() => {
    const unsubscribe = citizenService.subscribe(() => {
      refreshCitizens();
    });
    return () => {
      unsubscribe();
    };
  }, [refreshCitizens]);

  const resetCamera = useCallback(() => {
    setSelectedBuildingState(null);
    setSelectedCitizenState(null);
    setSelectedDistrictState(null);
    setCameraPreset('overview');
    setTargetCameraPosition(DEFAULT_CAMERA_POS);
    setTargetLookAt(DEFAULT_LOOK_AT);
  }, []);

  const focusDistrict = useCallback((districtId: DistrictId) => {
    setSelectedDistrictState(districtId);
    setSelectedBuildingState(null);
    setSelectedCitizenState(null);
    setCameraPreset('district');

    const dist = DISTRICTS[districtId];
    if (dist) {
      const [cx, cy, cz] = dist.center;
      // Position camera offset to view district beautifully
      const distOffset = districtId === 'NEXUS' ? 75 : 65;
      const angle = Math.atan2(cz, cx) || Math.PI / 4;
      const camX = cx + Math.cos(angle) * distOffset;
      const camZ = cz + Math.sin(angle) * distOffset;
      setTargetCameraPosition([camX, 55, camZ]);
      setTargetLookAt([cx, cy + 2, cz]);
    }
  }, []);

  const focusBuilding = useCallback((building: BuildingData) => {
    setSelectedBuildingState(building);
    setSelectedCitizenState(null);
    setSelectedDistrictState(building.districtId);
    setCameraPreset('inspection');

    const [bx, by, bz] = building.position;
    // Position camera close to building for inspection
    const inspectDistance = 26;
    setTargetCameraPosition([bx + inspectDistance * 0.7, by + 16, bz + inspectDistance * 0.7]);
    setTargetLookAt([bx, by + 4, bz]);
  }, []);

  const focusCitizen = useCallback((citizen: CitizenData | Citizen) => {
    const data: CitizenData = 'citizenId' in citizen ? citizenToCitizenData(citizen) : citizen;
    setSelectedCitizenState(data);
    setSelectedBuildingState(null);
    setSelectedDistrictState(data.districtId);
    setCameraPreset('inspection');

    const [cx, cy, cz] = data.position;
    // Astronaut inspection close-up
    setTargetCameraPosition([cx + 6, cy + 5, cz + 6]);
    setTargetLookAt([cx, cy + 1.2, cz]);
  }, []);

  const selectBuilding = useCallback((building: BuildingData | null) => {
    if (building) {
      focusBuilding(building);
    } else {
      setSelectedBuildingState(null);
    }
  }, [focusBuilding]);

  const selectCitizen = useCallback((citizen: CitizenData | Citizen | null) => {
    if (citizen) {
      focusCitizen(citizen);
    } else {
      setSelectedCitizenState(null);
    }
  }, [focusCitizen]);

  const selectDistrict = useCallback((districtId: DistrictId | null) => {
    if (districtId) {
      focusDistrict(districtId);
    } else {
      setSelectedDistrictState(null);
      resetCamera();
    }
  }, [focusDistrict, resetCamera]);

  const zoomIn = useCallback(() => {
    setTargetCameraPosition(([x, y, z]) => {
      return [x * 0.82, Math.max(12, y * 0.82), z * 0.82];
    });
  }, []);

  const zoomOut = useCallback(() => {
    setTargetCameraPosition(([x, y, z]) => {
      return [x * 1.22, Math.min(260, y * 1.22), z * 1.22];
    });
  }, []);

  const value = useMemo(() => ({
    selectedBuilding,
    selectedCitizen,
    selectedDistrict,
    hoveredBuilding,
    hoveredCitizen,
    isSearchOpen,
    isNotificationsOpen,
    isSettingsOpen,
    graphicsQuality,
    cameraPreset,
    timeOfDay,
    targetCameraPosition,
    targetLookAt,
    selectBuilding,
    selectCitizen,
    selectDistrict,
    setHoveredBuilding,
    setHoveredCitizen,
    setIsSearchOpen,
    setIsNotificationsOpen,
    setIsSettingsOpen,
    setGraphicsQuality,
    setCameraPreset,
    setTimeOfDay,
    resetCamera,
    focusDistrict,
    focusBuilding,
    focusCitizen,
    zoomIn,
    zoomOut,
    refreshCitizens,
    buildings: BUILDINGS,
    citizens,
    districts: DISTRICTS
  }), [
    selectedBuilding,
    selectedCitizen,
    selectedDistrict,
    hoveredBuilding,
    hoveredCitizen,
    isSearchOpen,
    isNotificationsOpen,
    isSettingsOpen,
    graphicsQuality,
    cameraPreset,
    timeOfDay,
    targetCameraPosition,
    targetLookAt,
    selectBuilding,
    selectCitizen,
    selectDistrict,
    resetCamera,
    focusDistrict,
    focusBuilding,
    focusCitizen,
    zoomIn,
    zoomOut,
    refreshCitizens,
    citizens
  ]);

  return <ColonyContext.Provider value={value}>{children}</ColonyContext.Provider>;
};

export const useColony = () => {
  const context = useContext(ColonyContext);
  if (!context) {
    throw new Error('useColony must be used within a ColonyProvider');
  }
  return context;
};
