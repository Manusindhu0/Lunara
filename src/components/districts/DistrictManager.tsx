import React from 'react';
import { useColony } from '../../context/ColonyContext';
import { BuildingWrapper } from '../buildings/BuildingWrapper';
import { NexusCommandMesh, TransitHubMesh, AtmosDomeMesh } from '../buildings/NexusCommand';
import { ForgeSmelterMesh, TokamakReactorMesh, AssemblyHangarMesh } from '../buildings/ForgeComplex';
import { EdenBiodomeMesh, HydroponicsBioreactorMesh, SeedVaultMesh } from '../buildings/EdenBiodome';
import { AetherObservatoryMesh, QuantumLabMesh, SeismicPostMesh } from '../buildings/AetherObservatory';
import { BeaconParabolicDishMesh, LaserTransceiverTowerMesh, TelecomRelayMesh } from '../buildings/BeaconRelay';
import { HavenHabRingMesh, HavenCivicCenterMesh, HavenMedicalMesh } from '../buildings/HavenHabitats';
import { BuildingData } from '../../types';

export const DistrictManager: React.FC = () => {
  const { buildings } = useColony();

  const renderBuildingMesh = (building: BuildingData) => {
    switch (building.id) {
      // NEXUS
      case 'nexus-core':
        return <NexusCommandMesh />;
      case 'nexus-transit-hub':
        return <TransitHubMesh />;
      case 'nexus-atmos-dome':
        return <AtmosDomeMesh />;

      // FORGE
      case 'forge-smelter-alpha':
        return <ForgeSmelterMesh />;
      case 'forge-fusion-reactor':
        return <TokamakReactorMesh />;
      case 'forge-assembly-hangar':
        return <AssemblyHangarMesh />;

      // EDEN
      case 'eden-biodome-main':
        return <EdenBiodomeMesh />;
      case 'eden-hydroponics-west':
        return <HydroponicsBioreactorMesh />;
      case 'eden-seed-vault':
        return <SeedVaultMesh />;

      // AETHER
      case 'aether-optics-dome':
        return <AetherObservatoryMesh />;
      case 'aether-quantum-lab':
        return <QuantumLabMesh />;
      case 'aether-seismic-post':
        return <SeismicPostMesh />;

      // BEACON
      case 'beacon-main-dish':
        return <BeaconParabolicDishMesh />;
      case 'beacon-laser-tower':
        return <LaserTransceiverTowerMesh />;
      case 'beacon-telecom-relay':
        return <TelecomRelayMesh />;

      // HAVEN
      case 'haven-hab-ring-a':
        return <HavenHabRingMesh />;
      case 'haven-civic-center':
        return <HavenCivicCenterMesh />;
      case 'haven-medical-center':
        return <HavenMedicalMesh />;

      default:
        return <NexusCommandMesh />;
    }
  };

  return (
    <group>
      {buildings.map((building) => (
        <BuildingWrapper key={building.id} building={building}>
          {renderBuildingMesh(building)}
        </BuildingWrapper>
      ))}
    </group>
  );
};
