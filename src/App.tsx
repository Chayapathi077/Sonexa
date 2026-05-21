import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReportEditor from './pages/ReportEditor';
import ReportView from './pages/ReportView';
import TemplateManager from './pages/TemplateManager';
import Profile from './pages/Profile';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isChecking } = useAuth();
  
  if (isChecking) return <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

function AppRoutes() {
  const { isAuthenticated, isChecking } = useAuth();

  if (isChecking) {
    return <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/new" element={<PrivateRoute><ReportEditor /></PrivateRoute>} />
      <Route path="/edit/:id" element={<PrivateRoute><ReportEditor /></PrivateRoute>} />
      <Route path="/print/:id" element={<PrivateRoute><ReportView /></PrivateRoute>} />
      <Route path="/templates" element={<PrivateRoute><TemplateManager /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
