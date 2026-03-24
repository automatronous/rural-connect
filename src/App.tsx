import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';


function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole?: 'doctor' | 'patient' }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#05070a] flex items-center justify-center text-white font-['Orbitron']">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && profile?.role && profile.role !== allowedRole) {
    return <Navigate to={`/${profile.role}/dashboard`} replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Router>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctor/dashboard" element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/patient/dashboard" element={
          <ProtectedRoute allowedRole="patient">
            <PatientDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
