// ============================================================
// LUNAR — Citizen Context
// Manages reactive Phase-2 Citizen state, registration,
// directory query, and full profile inspection.
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Citizen, RegistrationFormData } from '../types';
import { citizenService } from '../lib/citizenService';

interface CitizenContextType {
  citizens: Citizen[];
  selectedCitizen: Citizen | null;
  setSelectedCitizen: (citizen: Citizen | null) => void;
  registerCitizen: (data: RegistrationFormData) => Citizen;
  searchCitizens: (query: string) => Citizen[];
  getCitizenById: (id: string) => Citizen | undefined;
  getCitizenByUsername: (username: string) => Citizen | undefined;
  isUsernameTaken: (username: string) => boolean;
  refreshCitizens: () => void;
  totalCount: number;
}

const CitizenContext = createContext<CitizenContextType | null>(null);

export const CitizenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [citizens, setCitizens] = useState<Citizen[]>(() => citizenService.getAll());
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);

  const refreshCitizens = useCallback(() => {
    setCitizens([...citizenService.getAll()]);
  }, []);

  useEffect(() => {
    // Subscribe to service updates (e.g. registration, demo reset)
    const unsubscribe = citizenService.subscribe(() => {
      refreshCitizens();
    });
    return () => {
      unsubscribe();
    };
  }, [refreshCitizens]);

  const registerCitizen = useCallback((data: RegistrationFormData): Citizen => {
    const newCitizen = citizenService.register(data);
    refreshCitizens();
    return newCitizen;
  }, [refreshCitizens]);

  const searchCitizens = useCallback((query: string) => {
    return citizenService.search(query);
  }, []);

  const getCitizenById = useCallback((id: string) => {
    return citizenService.getById(id);
  }, []);

  const getCitizenByUsername = useCallback((username: string) => {
    return citizenService.getByUsername(username);
  }, []);

  const isUsernameTaken = useCallback((username: string) => {
    return citizenService.isUsernameTaken(username);
  }, []);

  return (
    <CitizenContext.Provider
      value={{
        citizens,
        selectedCitizen,
        setSelectedCitizen,
        registerCitizen,
        searchCitizens,
        getCitizenById,
        getCitizenByUsername,
        isUsernameTaken,
        refreshCitizens,
        totalCount: citizens.length,
      }}
    >
      {children}
    </CitizenContext.Provider>
  );
};

export const useCitizen = () => {
  const context = useContext(CitizenContext);
  if (!context) {
    throw new Error('useCitizen must be used within a CitizenProvider');
  }
  return context;
};
