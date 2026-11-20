import { Achievement } from '../types';

export const ACHIEVEMENT_LIBRARY: Record<string, Omit<Achievement, 'unlockedAt'>> = {
  FIRST_ARRIVAL: {
    id: 'FIRST_ARRIVAL',
    name: 'First Arrival',
    description: 'Registered as one of the very first citizens of the lunar colony.',
    icon: 'Rocket',
    rarity: 'legendary',
  },
  FOUNDING_100: {
    id: 'FOUNDING_100',
    name: 'Founding 100',
    description: 'Joined during the founding phase of LUNAR civilization.',
    icon: 'Star',
    rarity: 'epic',
  },
  PIONEER: {
    id: 'PIONEER',
    name: 'Pioneer',
    description: 'Among the first 50 citizens to establish permanent residency on the Moon.',
    icon: 'Flag',
    rarity: 'epic',
  },
  COLONY_BUILDER: {
    id: 'COLONY_BUILDER',
    name: 'Colony Builder',
    description: 'Directly contributed to the construction of a colony structure.',
    icon: 'Building2',
    rarity: 'rare',
  },
  EXPLORER: {
    id: 'EXPLORER',
    name: 'Explorer',
    description: 'Completed surface EVA exploration activities beyond the colony perimeter.',
    icon: 'Compass',
    rarity: 'rare',
  },
  SCIENTIST: {
    id: 'SCIENTIST',
    name: 'Scientist',
    description: 'Contributed to published lunar or deep space research findings.',
    icon: 'FlaskConical',
    rarity: 'common',
  },
  RECRUITER: {
    id: 'RECRUITER',
    name: 'Recruiter',
    description: 'Successfully sponsored the arrival of new colonists.',
    icon: 'Users',
    rarity: 'rare',
  },
  VETERAN: {
    id: 'VETERAN',
    name: 'Veteran',
    description: 'Accumulated over 1,000 XP through colony service and contributions.',
    icon: 'Shield',
    rarity: 'epic',
  },
  MASTER_EVA: {
    id: 'MASTER_EVA',
    name: 'Master EVA',
    description: 'Logged exceptional extravehicular activity hours on the lunar surface.',
    icon: 'PersonStanding',
    rarity: 'rare',
  },
  EARTH_TETHER: {
    id: 'EARTH_TETHER',
    name: 'Earth Tether',
    description: 'Maintained continuous Earth-Moon communications for over 1,000 consecutive sols.',
    icon: 'Radio',
    rarity: 'legendary',
  },
  LIFE_SAVER: {
    id: 'LIFE_SAVER',
    name: 'Life Saver',
    description: 'Provided critical medical or life support assistance during a colony emergency.',
    icon: 'HeartPulse',
    rarity: 'epic',
  },
  GREEN_PIONEER: {
    id: 'GREEN_PIONEER',
    name: 'Green Pioneer',
    description: 'Established the first successful crop harvest cycle in a lunar biosphere.',
    icon: 'Leaf',
    rarity: 'epic',
  },
  FUSION_SPECIALIST: {
    id: 'FUSION_SPECIALIST',
    name: 'Fusion Specialist',
    description: 'Operated a Helium-3 fusion reactor through a full power generation cycle.',
    icon: 'Zap',
    rarity: 'rare',
  },
  CIVIC_LEADER: {
    id: 'CIVIC_LEADER',
    name: 'Civic Leader',
    description: 'Elected or appointed to serve in a colony-level civic role.',
    icon: 'Award',
    rarity: 'rare',
  },
};

export const makeAchievement = (id: string, unlockedAt?: string): Achievement => ({
  ...ACHIEVEMENT_LIBRARY[id],
  unlockedAt: unlockedAt || new Date().toISOString(),
});
