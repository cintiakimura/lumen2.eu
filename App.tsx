import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Learning from './pages/Learning';
import Progress from './pages/Progress';
import Teacher from './pages/Teacher';
import Command from './pages/Command';
import Audio from './pages/Audio';
import Author from './pages/Author';
import Admin from './pages/Admin';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/learn" element={<Learning />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/teacher" element={<Teacher />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/command" element={<Command />} />
                <Route path="/audio" element={<Audio />} />
                <Route path="/author" element={<Author />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;