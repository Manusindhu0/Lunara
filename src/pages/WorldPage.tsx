import React, { useEffect, useRef } from 'react';
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
import { useCitizen } from '../context/CitizenContext';

export const WorldPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { focusCitizen, citizens } = useColony();
  const { getCitizenById, fetchCitizenById } = useCitizen();
  const focusedIdRef = useRef<string | null>(null);

  // If redirected with ?focus=LUN-XXXXX or SIM-XXXXX, focus on that citizen in 3D world
  useEffect(() => {
    const focusId = searchParams.get('focus')?.trim();
    if (!focusId) {
      focusedIdRef.current = null;
      return;
    }

    if (focusedIdRef.current === focusId) {
      return;
    }

    let cancelled = false;

    const focusWithDelay = (target: Parameters<typeof focusCitizen>[0]) => {
      focusedIdRef.current = focusId;
      window.setTimeout(() => {
        if (!cancelled) {
          focusCitizen(target);
        }
      }, 300);
    };

    const match = citizens.find(
      (c) => c.id.toLowerCase() === focusId.toLowerCase()
    );
    if (match) {
      focusWithDelay(match);
      return () => {
        cancelled = true;
      };
    }

    const contextCitizen = getCitizenById(focusId);
    if (contextCitizen) {
      focusWithDelay(contextCitizen);
      return () => {
        cancelled = true;
      };
    }

    void fetchCitizenById(focusId).then((remote) => {
      if (!cancelled && remote) {
        focusWithDelay(remote);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [searchParams, citizens, focusCitizen, getCitizenById, fetchCitizenById]);

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
