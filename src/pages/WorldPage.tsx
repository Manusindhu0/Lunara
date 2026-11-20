import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ColonyScene } from '../components/world/ColonyScene';
import { TopBar } from '../components/ui/TopBar';
import { DistrictHUD } from '../components/ui/DistrictHUD';
import { CameraControlsHUD } from '../components/ui/CameraControlsHUD';
import { BuildingInfoPanel } from '../components/ui/BuildingInfoPanel';
import { CitizenProfileModal } from '../components/ui/CitizenProfileModal';
import { CitizenSearchModal } from '../components/ui/CitizenSearchModal';
import { NotificationsModal } from '../components/ui/NotificationsModal';
import { SettingsModal } from '../components/ui/SettingsModal';
import { useColony } from '../context/ColonyContext';
import { citizenService } from '../lib/citizenService';

export const WorldPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { focusCitizen, citizens } = useColony();

  // If redirected with ?focus=LUN-XXXXX, focus on that citizen in 3D world
  useEffect(() => {
    const focusId = searchParams.get('focus');
    if (focusId) {
      const match = citizens.find((c) => c.id === focusId);
      if (match) {
        setTimeout(() => {
          focusCitizen(match);
        }, 300);
      } else {
        const fullCitizen = citizenService.getById(focusId);
        if (fullCitizen) {
          setTimeout(() => {
            focusCitizen(fullCitizen);
          }, 300);
        }
      }
    }
  }, [searchParams, citizens, focusCitizen]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#05070a]">
      {/* 3D Lunar Colony Interactive Canvas */}
      <ColonyScene />

      {/* Cinematic HUD Overlays */}
      <TopBar />
      <DistrictHUD />
      <CameraControlsHUD />

      {/* Interactive Context Modals & Panels */}
      <BuildingInfoPanel />
      <CitizenProfileModal />
      <CitizenSearchModal />
      <NotificationsModal />
      <SettingsModal />
    </main>
  );
};

export default WorldPage;
