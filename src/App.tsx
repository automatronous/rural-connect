import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { LoadingScreen } from './components/LoadingScreen';
import { useAuth } from './context/AuthContext';
import type { Role } from './lib/types';
import Landing from './pages/Landing';
import PublicMap from './pages/PublicMap';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorHeatmap from './pages/doctor/Heatmap';
import DoctorPatientDetail from './pages/doctor/PatientDetail';
import DoctorPatients from './pages/doctor/Patients';
import DoctorPredict from './pages/doctor/Predict';
import DoctorResults from './pages/doctor/Results';
import PatientDashboard from './pages/patient/Dashboard';
import PatientHistory from './pages/patient/History';
import PatientPredict from './pages/patient/Predict';
import PatientResults from './pages/patient/Results';
import PatientProfile from './pages/patient/Profile';
import PatientRecords from './pages/patient/Records';

function ProtectedRoute({ requiredRole }: { requiredRole?: Role }) {
  const { loading, user, profile } = useAuth();

  if (loading) {
    return <LoadingScreen label="Loading access..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    if (profile?.role === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    }

    if (profile?.role === 'patient') {
      return <Navigate to="/patient/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/map" element={<PublicMap />} />

        <Route element={<ProtectedRoute requiredRole="patient" />}>
          <Route element={<AppShell />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/records" element={<PatientRecords />} />
            <Route path="/patient/profile" element={<PatientProfile />} />
            <Route path="/patient/history" element={<PatientHistory />} />
            <Route path="/patient/predict" element={<PatientPredict />} />
            <Route path="/patient/results" element={<PatientResults />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute requiredRole="doctor" />}>
          <Route element={<AppShell />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route path="/doctor/patients/:id" element={<DoctorPatientDetail />} />
            <Route path="/doctor/heatmap" element={<DoctorHeatmap />} />
            <Route path="/doctor/predict" element={<DoctorPredict />} />
            <Route path="/doctor/results" element={<DoctorResults />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
