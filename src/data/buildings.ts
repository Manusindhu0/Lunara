import { BuildingData } from '../types';

export const BUILDINGS: BuildingData[] = [
  // --- NEXUS (Central Command) ---
  {
    id: 'nexus-core',
    name: 'Citadel Spire & High Command',
    districtId: 'NEXUS',
    type: 'Command Spire',
    purpose: 'Central administrative core, navigation uplink, and lunar civil executive headquarters.',
    status: 'OPTIMAL',
    population: 142,
    capacity: 250,
    position: [0, 0, 0],
    primaryActivity: 'Coordinating colony-wide orbital sync and life-support telemetry',
    features: ['Orbital Transit Spire', 'Council Chambers', 'Pressurized Central Plaza', 'Emergency Life Crypts'],
    metrics: {
      powerUsage: '4.8 MW',
      structuralIntegrity: '99.9%',
      temperature: '21.5°C',
      radiationShielding: 'Class-5 Titanium Boride'
    }
  },
  {
    id: 'nexus-transit-hub',
    name: 'Artemis Transit & Docking Ring',
    districtId: 'NEXUS',
    type: 'Logistics Terminal',
    purpose: 'High-speed mag-shuttle interchange connecting all peripheral districts with Central Spire.',
    status: 'OPERATIONAL',
    population: 68,
    capacity: 150,
    position: [-16, 0, 14],
    primaryActivity: 'Automated freight pod dispatch to FORGE and EDEN districts',
    features: ['6 Mag-Tube Bays', 'Heavy Airlock Bay 01', 'Autonomous Cargo Crane'],
    metrics: {
      powerUsage: '2.1 MW',
      structuralIntegrity: '98.7%',
      temperature: '19.8°C',
      radiationShielding: 'Class-4 Composite'
    }
  },
  {
    id: 'nexus-atmos-dome',
    name: 'Primary Atmosphere Synthesis Hub',
    districtId: 'NEXUS',
    type: 'Atmospheric Facility',
    purpose: 'Oxygen/Nitrogen buffer regulation and micro-particulate lunar dust filtration.',
    status: 'OPTIMAL',
    population: 44,
    capacity: 80,
    position: [18, 0, -12],
    primaryActivity: 'Catalytic scrub cycles for Haven residential loops',
    features: ['Cryogenic Gas Tanks', 'Regolith Electrostatic Filter', 'Pneumatic Pressure Regulators'],
    metrics: {
      powerUsage: '3.4 MW',
      structuralIntegrity: '99.4%',
      temperature: '18.2°C',
      radiationShielding: 'Class-5 Reinforced'
    }
  },

  // --- FORGE (Industrial & Energy) ---
  {
    id: 'forge-smelter-alpha',
    name: 'Regolith Smelter & Titanium Foundry',
    districtId: 'FORGE',
    type: 'Heavy Industrial Foundry',
    purpose: 'High-temperature solar-concentrator and plasma furnace refining raw lunar soil into structural metals.',
    status: 'HIGH LOAD',
    population: 58,
    capacity: 90,
    position: [-85, 0, 45],
    primaryActivity: 'Extruding titanium-grade beam trusses for Haven Expansion Phase IV',
    features: ['Concentrated Solar Arc', 'Continuous Slag Extruder', 'Robotic Ingot Stacker'],
    metrics: {
      powerUsage: '14.2 MW',
      structuralIntegrity: '97.2%',
      temperature: '840.0°C (Core)',
      radiationShielding: 'Heavy Basalt Encasement'
    }
  },
  {
    id: 'forge-fusion-reactor',
    name: 'Helium-3 Tokamak Generator 01',
    districtId: 'FORGE',
    type: 'Fusion Power Plant',
    purpose: 'Clean aneutronic fusion power generation harvesting Helium-3 extracted from lunar regolith.',
    status: 'OPTIMAL',
    population: 32,
    capacity: 50,
    position: [-105, 0, 30],
    primaryActivity: 'Plasma magnetic confinement at 99.8% stability',
    features: ['Superconducting Torus', 'Liquid Helium Coolant Circuit', 'Heavy Flux Absorber'],
    metrics: {
      powerUsage: 'Generates +38.5 MW',
      structuralIntegrity: '99.8%',
      temperature: '4.2K (Cryo) / 100M°C (Plasma)',
      radiationShielding: 'Tritium-Safe Magnetic Wall'
    }
  },
  {
    id: 'forge-assembly-hangar',
    name: 'Autonomous Rover Fabrication Hangar',
    districtId: 'FORGE',
    type: 'Robotics Workshop',
    purpose: 'Assembly, maintenance, and autonomous AI calibration of lunar surface rovers and heavy haulers.',
    status: 'OPERATIONAL',
    population: 42,
    capacity: 70,
    position: [-72, 0, 68],
    primaryActivity: 'Chassis retrofit on Survey Rover SR-19',
    features: ['Gantry Overhead Cranes', 'Sintering 3D Print Arm', 'Depressurized Test Bay'],
    metrics: {
      powerUsage: '3.1 MW',
      structuralIntegrity: '98.9%',
      temperature: '20.0°C',
      radiationShielding: 'Class-4 Multi-Layer'
    }
  },

  // --- EDEN (Bioscience & Greenhouses) ---
  {
    id: 'eden-biodome-main',
    name: 'The Great Biosphere Dome Alfa',
    districtId: 'EDEN',
    type: 'Geodesic Biome',
    purpose: 'Pressurized multi-tier greenhouse housing terraced food production, dwarf fruit trees, and botanical oxygen cycles.',
    status: 'OPTIMAL',
    population: 74,
    capacity: 120,
    position: [75, 0, -20],
    primaryActivity: 'Photosynthetic light cycling and automated nutrient misting',
    features: ['Geodesic Fluoropolymer Lattice', 'Closed Hydrologic Circuit', 'Sunlight Concentrator Mirrors'],
    metrics: {
      powerUsage: '2.9 MW',
      structuralIntegrity: '99.6%',
      temperature: '23.0°C',
      radiationShielding: 'UV/Rad Multi-layer Glass'
    }
  },
  {
    id: 'eden-hydroponics-west',
    name: 'Algaculture & Spirulina Bioreactors',
    districtId: 'EDEN',
    type: 'Biochemical Facility',
    purpose: 'Dense vertical photo-bioreactors cultivating nutrient-dense algae strains and rapid carbon scrubbing.',
    status: 'OPTIMAL',
    population: 36,
    capacity: 60,
    position: [92, 0, -38],
    primaryActivity: 'Harvesting Batch C-4 protein biomass',
    features: ['Tubular Glass Photo-Columns', 'Automated Centrifuges', 'CO2 Enrichment Loops'],
    metrics: {
      powerUsage: '1.8 MW',
      structuralIntegrity: '99.1%',
      temperature: '24.5°C',
      radiationShielding: 'Class-4 Composite'
    }
  },
  {
    id: 'eden-seed-vault',
    name: 'Lunar Cryogenic Gene & Seed Vault',
    districtId: 'EDEN',
    type: 'Cryo Repository',
    purpose: 'Deep subterranean preservation vault safeguarding 2.4 million terrestrial flora and fauna genomes.',
    status: 'OPTIMAL',
    population: 18,
    capacity: 35,
    position: [62, 0, -42],
    primaryActivity: 'Liquid nitrogen monitoring and cryogenic sample sequencing',
    features: ['Triple Sub-Surface Vault', 'Autonomous Robotic Retrieval', 'Self-Powering Stirling Cells'],
    metrics: {
      powerUsage: '0.8 MW',
      structuralIntegrity: '100.0%',
      temperature: '-196.0°C',
      radiationShielding: '30m Regolith Overburden'
    }
  },

  // --- AETHER (Research & Observatory) ---
  {
    id: 'aether-optics-dome',
    name: 'Far-Side Optical Deep Space Array',
    districtId: 'AETHER',
    type: 'Astronomical Dome',
    purpose: 'Cryo-cooled 16-meter segmented beryllium mirror observing exo-planetary atmospheres and early universe cosmic dawn.',
    status: 'OPTIMAL',
    population: 38,
    capacity: 65,
    position: [50, 0, -85],
    primaryActivity: 'Interferometric deep survey of Proxima Centauri orbital plane',
    features: ['16m Segmented Primary', 'Active Laser Guide Star', 'Liquid Helium Detector Well'],
    metrics: {
      powerUsage: '1.5 MW',
      structuralIntegrity: '99.7%',
      temperature: '-80.0°C (Unheated Optics)',
      radiationShielding: 'Class-4 Faraday Cage'
    }
  },
  {
    id: 'aether-quantum-lab',
    name: 'Superconducting Quantum Compute Hub',
    districtId: 'AETHER',
    type: 'Advanced Laboratory',
    purpose: 'Supercomputing complex utilizing low lunar ambient temperatures to sustain 10,000-qubit quantum coherency.',
    status: 'OPTIMAL',
    population: 46,
    capacity: 70,
    position: [32, 0, -96],
    primaryActivity: 'Simulating complex plasma dynamics and gravimetric anomalies',
    features: ['Dilution Refrigerators', 'Vacuum Sealed Levitated Core', 'Zero-Vibration Bedrock Mounts'],
    metrics: {
      powerUsage: '2.4 MW',
      structuralIntegrity: '99.9%',
      temperature: '15 mK (Core)',
      radiationShielding: 'Superconducting Lead Shield'
    }
  },
  {
    id: 'aether-seismic-post',
    name: 'Lunar Core Gravimetry & Seismic Post',
    districtId: 'AETHER',
    type: 'Geophysics Outpost',
    purpose: 'Monitoring tidal stress induced by Earth gravity and micro-meteorite impact shockwaves.',
    status: 'OPERATIONAL',
    population: 22,
    capacity: 40,
    position: [70, 0, -74],
    primaryActivity: 'Detecting 0.02 Richter tectonic settling in Shackleton Rim',
    features: ['Borehole Laser Interferometer', 'Fiber Optic Strain Gauges', 'Autonomous Seismic Torpedoes'],
    metrics: {
      powerUsage: '0.6 MW',
      structuralIntegrity: '98.5%',
      temperature: '19.0°C',
      radiationShielding: 'Class-3 Standard'
    }
  },

  // --- BEACON (Communications & Relay) ---
  {
    id: 'beacon-main-dish',
    name: 'Earth-Direct High-Gain Parabolic Array',
    districtId: 'BEACON',
    type: 'Deep Space Antenna',
    purpose: 'Primary 35-meter parabolic steerable antenna establishing 100 Gbps laser/RF downlink with Goldstone and Madrid Earth stations.',
    status: 'OPTIMAL',
    population: 28,
    capacity: 45,
    position: [-70, 0, -75],
    primaryActivity: 'Transmitting 48 TB of daily science telemetry to Earth ground stations',
    features: ['35m Carbon-Fiber Parabolic Dish', 'Cryogenic Low-Noise Amplifiers', 'Precision Azimuth Turret'],
    metrics: {
      powerUsage: '2.7 MW',
      structuralIntegrity: '99.2%',
      temperature: 'Operational Range (-120 to +110°C)',
      radiationShielding: 'Hardened Solid-State Electronics'
    }
  },
  {
    id: 'beacon-laser-tower',
    name: 'Orbital Optical Laser Transceiver Tower',
    districtId: 'BEACON',
    type: 'Laser Comms Spire',
    purpose: 'Point-to-point coherent laser communication with Artemis Lunar Gateway and orbital reconnaissance satellites.',
    status: 'OPTIMAL',
    population: 24,
    capacity: 40,
    position: [-86, 0, -62],
    primaryActivity: 'High-speed laser handoff with Gateway Orbiter at 1,550 nm',
    features: ['Gimbaled Optical Head', 'Fast Steering Mirrors', 'Adaptive Optics Atmospheric Shaper'],
    metrics: {
      powerUsage: '1.2 MW',
      structuralIntegrity: '99.5%',
      temperature: '20.0°C',
      radiationShielding: 'Class-4 Shield'
    }
  },
  {
    id: 'beacon-telecom-relay',
    name: 'Colony Mesh Telemetry & Navigation Node',
    districtId: 'BEACON',
    type: 'Surface Comms Hub',
    purpose: 'Local GPS/PNT equivalent beacon broadcasting precision position signals to rovers and EVA astronauts.',
    status: 'OPERATIONAL',
    population: 20,
    capacity: 35,
    position: [-54, 0, -88],
    primaryActivity: 'Centimeter-level positioning sync for 14 active rovers',
    features: ['Microwave Phased Array', 'Cesium Atomic Clock Bench', 'Dual Redundant Repeaters'],
    metrics: {
      powerUsage: '0.9 MW',
      structuralIntegrity: '99.8%',
      temperature: '21.0°C',
      radiationShielding: 'Triple Redundant Enclosure'
    }
  },

  // --- HAVEN (Residential Habitats) ---
  {
    id: 'haven-hab-ring-a',
    name: 'Olympus Hab Ring & Living Pods A',
    districtId: 'HAVEN',
    type: 'Modular Residential Cluster',
    purpose: 'Pressurized modular living quarters, private sleeping pods, and family habitations with simulated circadian lighting.',
    status: 'OPTIMAL',
    population: 135,
    capacity: 180,
    position: [35, 0, 80],
    primaryActivity: 'Evening recreation shift and hydroponic communal lounge hours',
    features: ['12 Interconnected Hab Pods', 'Circadian Spectrum LED Ceilings', 'Active Acoustic Damping'],
    metrics: {
      powerUsage: '2.2 MW',
      structuralIntegrity: '99.8%',
      temperature: '22.0°C',
      radiationShielding: 'Water-Wall + 2m Regolith'
    }
  },
  {
    id: 'haven-civic-center',
    name: 'The Agora — Civic Commons & Library',
    districtId: 'HAVEN',
    type: 'Community Hall',
    purpose: 'Colony civic heart, physical gymnasium, zero-g swimming simulator, and cultural auditorium.',
    status: 'OPTIMAL',
    population: 92,
    capacity: 160,
    position: [52, 0, 92],
    primaryActivity: 'Civilian assembly & Earth-streamed philharmonic concert',
    features: ['Spacious 20m High Atrium', 'Centrifuge Low-G Gym', 'Cultural Archival Holo-Room'],
    metrics: {
      powerUsage: '1.9 MW',
      structuralIntegrity: '99.4%',
      temperature: '21.8°C',
      radiationShielding: 'Class-5 Basalt Shielding'
    }
  },
  {
    id: 'haven-medical-center',
    name: 'Selene Infirmary & Radiation Care',
    districtId: 'HAVEN',
    type: 'Medical Complex',
    purpose: 'Surgical facilities, bone-density regeneration therapy, and solar-storm emergency shelters.',
    status: 'OPTIMAL',
    population: 48,
    capacity: 85,
    position: [18, 0, 68],
    primaryActivity: 'Routine bone density ultrasound screenings and EVA checkouts',
    features: ['Bio-Regeneration Beds', 'Emergency Rad Shelter B-3', 'Zero-G Sterile Operating Suites'],
    metrics: {
      powerUsage: '1.7 MW',
      structuralIntegrity: '100.0%',
      temperature: '21.0°C',
      radiationShielding: 'Lead & Polyethylene Laminate'
    }
  }
];
