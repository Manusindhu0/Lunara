import { Department, DepartmentId } from '../types';

export const DEPARTMENTS: Record<DepartmentId, Department> = {
  ENGINEERING: {
    id: 'ENGINEERING',
    name: 'Engineering',
    primaryDistrictId: 'FORGE',
    description: 'Builds and maintains the physical infrastructure of the colony: structures, energy, robotics, and construction.',
    accentColor: '#f97316',
    professions: [
      'Systems Engineer',
      'Structural Engineer',
      'Energy Specialist',
      'Robotics Technician',
      'Construction Engineer',
    ],
  },
  BIOSCIENCE: {
    id: 'BIOSCIENCE',
    name: 'Bioscience',
    primaryDistrictId: 'EDEN',
    description: 'Manages life support biology: hydroponics, oxygen cycles, genetic preservation, and ecosystem research.',
    accentColor: '#10b981',
    professions: [
      'Biologist',
      'Agricultural Specialist',
      'Life Support Specialist',
      'Ecosystem Researcher',
      'Cryo-Preservation Geneticist',
    ],
  },
  RESEARCH: {
    id: 'RESEARCH',
    name: 'Research',
    primaryDistrictId: 'AETHER',
    description: 'Conducts deep space observation, quantum physics experiments, geological surveys, and scientific analysis.',
    accentColor: '#a855f7',
    professions: [
      'Scientist',
      'Astronomer',
      'Research Analyst',
      'Exploration Specialist',
      'Quantum Engineer',
      'Lunar Geologist',
    ],
  },
  SECURITY: {
    id: 'SECURITY',
    name: 'Security',
    primaryDistrictId: 'NEXUS',
    description: 'Ensures colony safety, monitors external threats, manages EVA protocols, and patrols critical zones.',
    accentColor: '#00f0ff',
    professions: [
      'Security Officer',
      'Safety Specialist',
      'Patrol Specialist',
      'EVA Commander',
    ],
  },
  COMMUNICATIONS: {
    id: 'COMMUNICATIONS',
    name: 'Communications',
    primaryDistrictId: 'BEACON',
    description: 'Operates Earth relay networks, orbital laser uplinks, surface navigation beacons, and telemetry systems.',
    accentColor: '#3b82f6',
    professions: [
      'Communications Operator',
      'Earth Relay Specialist',
      'Transmission Officer',
      'Network Architect',
      'Navigation Engineer',
    ],
  },
  CULTURE: {
    id: 'CULTURE',
    name: 'Culture',
    primaryDistrictId: 'HAVEN',
    description: 'Maintains the social fabric of the colony: civic administration, historical record, healthcare, and community programs.',
    accentColor: '#eab308',
    professions: [
      'Community Coordinator',
      'Colony Historian',
      'Event Organizer',
      'Medical Officer',
      'Habitat Architect',
    ],
  },
};

export const CAREER_RANKS = [
  'Citizen',
  'Specialist',
  'Senior Specialist',
  'Department Lead',
  'Mission Commander',
  'Colony Council',
] as const;
