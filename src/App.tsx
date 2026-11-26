import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CitizenProvider } from './context/CitizenContext';
import { ColonyProvider } from './context/ColonyContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import WorldPage from './pages/WorldPage';
import CitizenDirectoryPage from './pages/CitizenDirectoryPage';
import CitizenProfilePage from './pages/CitizenProfilePage';
import CitizenshipPage from './pages/CitizenshipPage';
import JoinPage from './pages/JoinPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CitizenProvider>
          <ColonyProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/world" replace />} />
              <Route path="/world" element={<WorldPage />} />
              <Route path="/citizens" element={<CitizenDirectoryPage />} />
              <Route path="/citizen/:citizenId" element={<CitizenProfilePage />} />
              <Route path="/citizenship" element={<CitizenshipPage />} />
              <Route element={<ProtectedRoute requireVerified />}>
                <Route path="/citizenship/apply" element={<CitizenshipPage />} />
              </Route>
              <Route path="/join" element={<JoinPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="*" element={<Navigate to="/world" replace />} />
            </Routes>
          </ColonyProvider>
        </CitizenProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
