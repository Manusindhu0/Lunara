// ============================================================
// LUNAR — Phase 3: Citizen Context
// Fetches real PostgreSQL citizens via GET /api/citizens and
// safely merges optional SIM-* Phase 2 Demo Showcase citizens.
// ============================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Citizen, RegistrationFormData } from '../types';
import { citizenService, mergeCitizensWithDemo } from '../lib/citizenService';
import { isApiError } from '../lib/apiClient';

export interface CitizenContextType {
  citizens: Citizen[];
  liveCitizens: Citizen[];
  demoCitizens: Citizen[];
  selectedCitizen: Citizen | null;
  setSelectedCitizen: (citizen: Citizen | null) => void;
  isLoading: boolean;
  isApiOnline: boolean;
  apiError: string | null;
  showDemoCrew: boolean;
  setShowDemoCrew: (show: boolean) => void;
  applyForCitizenship: (data: RegistrationFormData) => Promise<Citizen>;
  registerDemoPreview: (data: RegistrationFormData) => Citizen;
  searchCitizens: (query: string) => Citizen[];
  getCitizenById: (id: string) => Citizen | undefined;
  fetchCitizenById: (id: string) => Promise<Citizen | null>;
  getCitizenByUsername: (username: string) => Citizen | undefined;
  getCitizensByBuildingId: (buildingId: string) => Citizen[];
  isUsernameTaken: (username: string) => boolean;
  refreshCitizens: () => Promise<Citizen[]>;
  totalCount: number;
  liveCount: number;
  demoCount: number;
}

const CitizenContext = createContext<CitizenContextType | null>(null);

export const CitizenProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [liveCitizens, setLiveCitizens] = useState<Citizen[]>([]);
  const [demoCitizens, setDemoCitizens] = useState<Citizen[]>(() =>
    citizenService.getDemoCitizens()
  );
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isApiOnline, setIsApiOnline] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showDemoCrew, setShowDemoCrew] = useState<boolean>(true);

  const refreshCitizens = useCallback(async (): Promise<Citizen[]> => {
    setIsLoading(true);
    try {
      const fetched = await citizenService.fetchLiveCitizens();
      setLiveCitizens(fetched);
      setIsApiOnline(true);
      setApiError(null);
      return fetched;
    } catch (err) {
      // Graceful fallback to Demo Mode when backend API is unreachable
      setIsApiOnline(false);
      setShowDemoCrew(true);
      const message = isApiError(err)
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Unable to reach colony registry server; running in demo mode.';
      setApiError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCitizens();
  }, [refreshCitizens]);

  const includeDemo = showDemoCrew || !isApiOnline;

  const citizens = useMemo(
    () => mergeCitizensWithDemo(liveCitizens, demoCitizens, includeDemo),
    [liveCitizens, demoCitizens, includeDemo]
  );

  const applyForCitizenship = useCallback(
    async (data: RegistrationFormData): Promise<Citizen> => {
      const created = await citizenService.applyForCitizenship(data);
      // Optimistically include the newly minted citizen and sync from backend
      setLiveCitizens((prev) => {
        const filtered = prev.filter((c) => c.citizenId !== created.citizenId);
        return [created, ...filtered];
      });
      await refreshCitizens();
      return created;
    },
    [refreshCitizens]
  );

  const registerDemoPreview = useCallback(
    (data: RegistrationFormData): Citizen => {
      const created = citizenService.registerDemoPreview(data, citizens);
      setDemoCitizens(citizenService.getDemoCitizens());
      setShowDemoCrew(true);
      return created;
    },
    [citizens]
  );

  const searchCitizens = useCallback(
    (query: string): Citizen[] => {
      const q = query.toLowerCase().trim();
      if (!q) return citizens;
      return citizens.filter(
        (c) =>
          c.citizenId.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q) ||
          c.displayName.toLowerCase().includes(q) ||
          c.profession.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q) ||
          c.districtId.toLowerCase().includes(q)
      );
    },
    [citizens]
  );

  const getCitizenById = useCallback(
    (id: string): Citizen | undefined => {
      const target = id.trim().toLowerCase();
      return (
        citizens.find((c) => c.citizenId.toLowerCase() === target) ??
        demoCitizens.find((c) => c.citizenId.toLowerCase() === target)
      );
    },
    [citizens, demoCitizens]
  );

  const fetchCitizenById = useCallback(
    async (id: string): Promise<Citizen | null> => {
      const trimmed = id.trim();
      if (!trimmed) return null;

      const localMatch =
        citizens.find(
          (c) => c.citizenId.toLowerCase() === trimmed.toLowerCase()
        ) ??
        demoCitizens.find(
          (c) => c.citizenId.toLowerCase() === trimmed.toLowerCase()
        );

      if (localMatch) {
        return localMatch;
      }

      if (trimmed.toUpperCase().startsWith('SIM-')) {
        return null;
      }

      try {
        const remote = await citizenService.fetchPublicCitizenById(trimmed);
        if (remote) {
          setLiveCitizens((prev) => {
            if (prev.some((c) => c.citizenId === remote.citizenId)) return prev;
            return [...prev, remote];
          });
        }
        return remote;
      } catch {
        return null;
      }
    },
    [citizens, demoCitizens]
  );

  const getCitizenByUsername = useCallback(
    (username: string): Citizen | undefined => {
      const target = username.trim().toLowerCase();
      return citizens.find((c) => c.username.toLowerCase() === target);
    },
    [citizens]
  );

  const getCitizensByBuildingId = useCallback(
    (buildingId: string): Citizen[] => {
      return citizens.filter((c) => c.buildingId === buildingId);
    },
    [citizens]
  );

  const isUsernameTaken = useCallback(
    (username: string): boolean => {
      const target = username.trim().toLowerCase();
      return liveCitizens.some((c) => c.username.toLowerCase() === target);
    },
    [liveCitizens]
  );

  const value = useMemo<CitizenContextType>(
    () => ({
      citizens,
      liveCitizens,
      demoCitizens,
      selectedCitizen,
      setSelectedCitizen,
      isLoading,
      isApiOnline,
      apiError,
      showDemoCrew: includeDemo,
      setShowDemoCrew,
      applyForCitizenship,
      registerDemoPreview,
      searchCitizens,
      getCitizenById,
      fetchCitizenById,
      getCitizenByUsername,
      getCitizensByBuildingId,
      isUsernameTaken,
      refreshCitizens,
      totalCount: citizens.length,
      liveCount: liveCitizens.length,
      demoCount: includeDemo ? demoCitizens.length : 0,
    }),
    [
      citizens,
      liveCitizens,
      demoCitizens,
      selectedCitizen,
      isLoading,
      isApiOnline,
      apiError,
      includeDemo,
      applyForCitizenship,
      registerDemoPreview,
      searchCitizens,
      getCitizenById,
      fetchCitizenById,
      getCitizenByUsername,
      getCitizensByBuildingId,
      isUsernameTaken,
      refreshCitizens,
    ]
  );

  return (
    <CitizenContext.Provider value={value}>{children}</CitizenContext.Provider>
  );
};

export const useCitizen = () => {
  const context = useContext(CitizenContext);
  if (!context) {
    throw new Error('useCitizen must be used within a CitizenProvider');
  }
  return context;
};
