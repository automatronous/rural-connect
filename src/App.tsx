import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PublicMap from './pages/PublicMap';

import PatientDashboard from './pages/patient/Dashboard';
import PatientRecords from './pages/patient/Records';
import PatientProfile from './pages/patient/Profile';
import PatientMap from './pages/patient/Map';

import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatients from './pages/doctor/Patients';
import PatientDetail from './pages/doctor/PatientDetail';
import DoctorHeatmap from './pages/doctor/Heatmap';
import DoctorPredict from './pages/doctor/Predict';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

// Redirect after login based on role
function LoginRedirect() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && profile) {
      navigate(profile.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard', { replace: true });
    }
  }, [profile, loading, navigate]);
  return null;
}

// Protected route — requires auth + optional role check
function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: 'patient' | 'doctor';
}) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#05070a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Orbitron', color: '#ff4444', fontSize: 14, letterSpacing: 2 }}>LOADING…</div>
      </div>
    );
  }

  // Not authenticated
  if (!session) return <Navigate to="/login" replace />;

  // Wait for profile
  if (!profile) return null;

  // Wrong role — redirect to correct dashboard
  if (requiredRole && profile.role !== requiredRole) {
    return <Navigate to={profile.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LoginRedirectWrapper />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0d1117',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                fontSize: 13,
              },
              success: { iconTheme: { primary: '#00cc66', secondary: '#000' } },
              error: { iconTheme: { primary: '#ff4444', secondary: '#000' } },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/map" element={<PublicMap />} />

            {/* Patient routes */}
            <Route path="/patient/dashboard" element={<ProtectedRoute requiredRole="patient"><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/records" element={<ProtectedRoute requiredRole="patient"><PatientRecords /></ProtectedRoute>} />
            <Route path="/patient/profile" element={<ProtectedRoute requiredRole="patient"><PatientProfile /></ProtectedRoute>} />
            <Route path="/patient/map" element={<ProtectedRoute requiredRole="patient"><PatientMap /></ProtectedRoute>} />

            {/* Doctor routes */}
            <Route path="/doctor/dashboard" element={<ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/patients" element={<ProtectedRoute requiredRole="doctor"><DoctorPatients /></ProtectedRoute>} />
            <Route path="/doctor/patients/:id" element={<ProtectedRoute requiredRole="doctor"><PatientDetail /></ProtectedRoute>} />
            <Route path="/doctor/heatmap" element={<ProtectedRoute requiredRole="doctor"><DoctorHeatmap /></ProtectedRoute>} />
            <Route path="/doctor/predict" element={<ProtectedRoute requiredRole="doctor"><DoctorPredict /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

// Inner wrapper to handle post-login redirect (needs to be inside Router + AuthProvider)
function LoginRedirectWrapper() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    // handled per-page but also catch edge cases
  }, [profile, loading, navigate]);
  return null;
}
