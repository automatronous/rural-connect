import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PatientProvider } from './context/PatientContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/common/Navbar'
import ProtectedRoute from './components/common/ProtectedRoute'

import LoginPage              from './pages/LoginPage'
import LandingPage            from './pages/LandingPage'
import PatientRegistrationPage from './pages/PatientRegistrationPage'
import SymptomsPage           from './pages/SymptomsPage'
import DiagnosisResultPage    from './pages/DiagnosisResultPage'
import DoctorReviewPage       from './pages/DoctorReviewPage'
import AshaWorkerDashboard    from './pages/AshaWorkerDashboard'
import SubmitCasePage         from './pages/SubmitCasePage'
import DoctorDashboard        from './pages/DoctorDashboard'

function RootRedirect() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'asha' ? '/asha/dashboard' : '/doctor/dashboard'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <PatientProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-neutral-100">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public */}
                <Route path="/login" element={<LoginPage />} />

                {/* Root — redirect by role */}
                <Route path="/" element={<RootRedirect />} />

                {/* ASHA Worker routes */}
                <Route path="/asha/dashboard" element={
                  <ProtectedRoute allowedRoles={['asha']}>
                    <AshaWorkerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/asha/submit-case" element={
                  <ProtectedRoute allowedRoles={['asha']}>
                    <SubmitCasePage />
                  </ProtectedRoute>
                } />

                {/* Doctor routes */}
                <Route path="/doctor/dashboard" element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                } />

                {/* Existing consultation flow (accessible to any authenticated user) */}
                <Route path="/register" element={
                  <ProtectedRoute><PatientRegistrationPage /></ProtectedRoute>
                } />
                <Route path="/symptoms" element={
                  <ProtectedRoute><SymptomsPage /></ProtectedRoute>
                } />
                <Route path="/diagnosis" element={
                  <ProtectedRoute><DiagnosisResultPage /></ProtectedRoute>
                } />
                <Route path="/doctor-review" element={
                  <ProtectedRoute><DoctorReviewPage /></ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <footer className="text-center text-xs text-neutral-400 py-4 border-t border-neutral-200">
              © 2026 RuralCareConnect · AI-Assisted Rural Healthcare · Prototype
            </footer>
          </div>
        </BrowserRouter>
      </PatientProvider>
    </AuthProvider>
  )
}
