import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/common/Header';

// Lazy load components
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginForm = lazy(() => import('./components/auth/LoginForm'));
const RegisterForm = lazy(() => import('./components/auth/RegisterForm'));
const InvestmentDashboard = lazy(() => import('./pages/InvestmentDashboard'));
const HowToInvest = lazy(() => import('./pages/HowToInvest'));

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>}>
            <Suspense fallback={<div className="loading">Loading...</div>}><Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <RegisterForm />
              </PublicRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <InvestmentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/how-to-invest" element={<HowToInvest />} />
            <Route path="/services" element={<HomePage />} />
            <Route path="/about" element={<HomePage />} />
            </Routes></Suspense>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
