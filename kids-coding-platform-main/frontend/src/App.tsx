import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { FamilyAuthProvider } from './context/FamilyAuthContext';
import { GlobalErrorProvider } from './context/GlobalErrorContext';
import { LanguageProvider } from './hooks/useLanguage';
import ProtectedRoute from './components/ProtectedRoute';
import MascotWrapper from './components/MascotWrapper';
import GlobalErrorManager from './components/GlobalErrorManager';
import DevAuthControls from './components/DevAuthControls';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ParentRegistrationPage from './pages/ParentRegistrationPage';
import ParentDashboard from './pages/ParentDashboard';
import LearnPage from './pages/LearnPage';
import LearnInteractivePage from './pages/LearnInteractivePage';
import LearnAdvancedPage from './pages/LearnAdvancedPage';
import BadgesPage from './pages/BadgesPage';
import BuildPage from './pages/BuildPage';
import GameLibraryPage from './pages/GameLibraryPage';
import MultiplayerPage from './pages/MultiplayerPage';
import ProfilePage from './pages/ProfilePage';
import ChildProfilePage from './pages/ChildProfilePage';
import AchievementsPage from './pages/AchievementsPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <GlobalErrorProvider>
        <FamilyAuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="app-container">
              <MascotWrapper>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register-parent" element={<ParentRegistrationPage />} />
                  <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

                  {/* Parent Routes */}
                  <Route path="/parent-dashboard" element={
                    <ProtectedRoute requiredUserType="parent">
                      <ParentDashboard />
                    </ProtectedRoute>
                  } />

                  {/* Child Routes */}
                  <Route path="/" element={
                    <ProtectedRoute requiredUserType="child">
                      <HomePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute requiredUserType="child">
                      <HomePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/learn" element={
                    <ProtectedRoute requiredUserType="child">
                      <LearnPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/learn/interactive" element={
                    <ProtectedRoute requiredUserType="child">
                      <LearnInteractivePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/learn/advanced" element={
                    <ProtectedRoute requiredUserType="child">
                      <LearnAdvancedPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/learn/:moduleId" element={
                    <ProtectedRoute requiredUserType="child">
                      <LearnPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/build" element={
                    <ProtectedRoute requiredUserType="child">
                      <BuildPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/games" element={
                    <ProtectedRoute requiredUserType="child">
                      <GameLibraryPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute requiredUserType="child">
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute requiredUserType="child">
                      <ChildProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/achievements" element={
                    <ProtectedRoute requiredUserType="child">
                      <AchievementsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/badges" element={
                    <ProtectedRoute requiredUserType="child">
                      <BadgesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/multiplayer/*" element={
                    <ProtectedRoute requiredUserType="child">
                      <MultiplayerPage />
                    </ProtectedRoute>
                  } />

                  {/* Fallback - redirect to login */}
                  <Route path="*" element={<LoginPage />} />
                </Routes>
              </MascotWrapper>

              {/* Global Error Display Manager */}
              <GlobalErrorManager />

              {/* Development helper - only shows in dev mode */}
              <DevAuthControls />
            </div>
          </Router>
        </FamilyAuthProvider>
      </GlobalErrorProvider>
    </LanguageProvider>
  );
};

export default App;