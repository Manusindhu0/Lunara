import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CitizenProvider } from './context/CitizenContext';
import { ColonyProvider } from './context/ColonyContext';
import WorldPage from './pages/WorldPage';
import CitizenDirectoryPage from './pages/CitizenDirectoryPage';
import CitizenProfilePage from './pages/CitizenProfilePage';
import JoinPage from './pages/JoinPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <CitizenProvider>
        <ColonyProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/world" replace />} />
            <Route path="/world" element={<WorldPage />} />
            <Route path="/citizens" element={<CitizenDirectoryPage />} />
            <Route path="/citizen/:citizenId" element={<CitizenProfilePage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="*" element={<Navigate to="/world" replace />} />
          </Routes>
        </ColonyProvider>
      </CitizenProvider>
    </BrowserRouter>
  );
};

export default App;
