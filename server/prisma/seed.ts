import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEPARTMENTS = [
  {
    slug: 'ENGINEERING',
    name: 'Engineering',
    districtId: 'FORGE',
    description:
      'Builds and maintains the physical infrastructure of the colony: structures, energy, robotics, and construction.',
    accentColor: '#f97316',
    professions: [
      'Systems Engineer',
      'Structural Engineer',
      'Energy Specialist',
      'Robotics Technician',
      'Construction Engineer',
    ],
  },
  {
    slug: 'BIOSCIENCE',
    name: 'Bioscience',
    districtId: 'EDEN',
    description:
      'Manages life support biology: hydroponics, oxygen cycles, genetic preservation, and ecosystem research.',
    accentColor: '#10b981',
    professions: [
      'Biologist',
      'Agricultural Specialist',
      'Life Support Specialist',
      'Ecosystem Researcher',
      'Cryo-Preservation Geneticist',
    ],
  },
  {
    slug: 'RESEARCH',
    name: 'Research',
    districtId: 'AETHER',
    description:
      'Conducts deep space observation, quantum physics experiments, geological surveys, and scientific analysis.',
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
  {
    slug: 'SECURITY',
    name: 'Security',
    districtId: 'NEXUS',
    description:
      'Ensures colony safety, monitors external threats, manages EVA protocols, and patrols critical zones.',
    accentColor: '#00f0ff',
    professions: [
      'Security Officer',
      'Safety Specialist',
      'Patrol Specialist',
      'EVA Commander',
    ],
  },
  {
    slug: 'COMMUNICATIONS',
    name: 'Communications',
    districtId: 'BEACON',
    description:
      'Operates Earth relay networks, orbital laser uplinks, surface navigation beacons, and telemetry systems.',
    accentColor: '#3b82f6',
    professions: [
      'Communications Operator',
      'Earth Relay Specialist',
      'Transmission Officer',
      'Network Architect',
      'Navigation Engineer',
    ],
  },
  {
    slug: 'CULTURE',
    name: 'Culture',
    districtId: 'HAVEN',
    description:
      'Maintains the social fabric of the colony: civic administration, historical record, healthcare, and community programs.',
    accentColor: '#eab308',
    professions: [
      'Community Coordinator',
      'Colony Historian',
      'Event Organizer',
      'Medical Officer',
      'Habitat Architect',
    ],
  },
];

const ACHIEVEMENTS = [
  {
    slug: 'FIRST_ARRIVAL',
    name: 'First Arrival',
    description: 'Registered as one of the very first citizens of the lunar colony.',
    icon: 'Rocket',
    rarity: 'legendary',
  },
  {
    slug: 'FOUNDING_100',
    name: 'Founding 100',
    description: 'Joined during the founding phase of LUNAR civilization.',
    icon: 'Star',
    rarity: 'epic',
  },
  {
    slug: 'PIONEER',
    name: 'Pioneer',
    description: 'Among the first 50 citizens to establish permanent residency on the Moon.',
    icon: 'Flag',
    rarity: 'epic',
  },
  {
    slug: 'COLONY_BUILDER',
    name: 'Colony Builder',
    description: 'Directly contributed to the construction of a colony structure.',
    icon: 'Building2',
    rarity: 'rare',
  },
  {
    slug: 'EXPLORER',
    name: 'Explorer',
    description: 'Completed surface EVA exploration activities beyond the colony perimeter.',
    icon: 'Compass',
    rarity: 'rare',
  },
  {
    slug: 'SCIENTIST',
    name: 'Scientist',
    description: 'Contributed to published lunar or deep space research findings.',
    icon: 'FlaskConical',
    rarity: 'common',
  },
  {
    slug: 'RECRUITER',
    name: 'Recruiter',
    description: 'Successfully sponsored the arrival of new colonists.',
    icon: 'Users',
    rarity: 'rare',
  },
  {
    slug: 'VETERAN',
    name: 'Veteran',
    description: 'Accumulated over 1,000 XP through colony service and contributions.',
    icon: 'Shield',
    rarity: 'epic',
  },
  {
    slug: 'MASTER_EVA',
    name: 'Master EVA',
    description: 'Logged exceptional extravehicular activity hours on the lunar surface.',
    icon: 'PersonStanding',
    rarity: 'rare',
  },
  {
    slug: 'EARTH_TETHER',
    name: 'Earth Tether',
    description: 'Maintained continuous Earth-Moon communications for over 1,000 consecutive sols.',
    icon: 'Radio',
    rarity: 'legendary',
  },
  {
    slug: 'LIFE_SAVER',
    name: 'Life Saver',
    description: 'Provided critical medical or life support assistance during a colony emergency.',
    icon: 'HeartPulse',
    rarity: 'epic',
  },
  {
    slug: 'GREEN_PIONEER',
    name: 'Green Pioneer',
    description: 'Established the first successful crop harvest cycle in a lunar biosphere.',
    icon: 'Leaf',
    rarity: 'epic',
  },
  {
    slug: 'FUSION_SPECIALIST',
    name: 'Fusion Specialist',
    description: 'Operated a Helium-3 fusion reactor through a full power generation cycle.',
    icon: 'Zap',
    rarity: 'rare',
  },
  {
    slug: 'CIVIC_LEADER',
    name: 'Civic Leader',
    description: 'Elected or appointed to serve in a colony-level civic role.',
    icon: 'Award',
    rarity: 'rare',
  },
];

async function main() {
  // Initialize CitizenSequence singleton row if missing
  await prisma.citizenSequence.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, lastValue: 0 },
  });

  // Seed 6 official Departments matching src/data/departments.ts
  for (const dept of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { slug: dept.slug },
      update: {
        name: dept.name,
        description: dept.description,
        districtId: dept.districtId,
        accentColor: dept.accentColor,
        professions: dept.professions,
      },
      create: dept,
    });
  }

  // Seed Achievements matching src/data/achievements.ts
  for (const ach of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { slug: ach.slug },
      update: {
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        rarity: ach.rarity,
      },
      create: ach,
    });
  }

  console.log(
    `Seeded CitizenSequence, ${DEPARTMENTS.length} departments, and ${ACHIEVEMENTS.length} achievements.`
  );
}

main()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
