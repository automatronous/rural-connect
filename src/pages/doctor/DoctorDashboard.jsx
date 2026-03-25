import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Stethoscope, 
  User, 
  LogOut, 
  Search, 
  FileText, 
  Download,
  AlertCircle,
  CheckCircle2,
  HeartPulse,
  ChevronRight,
  TrendingUp,
  Activity,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SYMPTOMS = [
  'fever', 'cough', 'fatigue', 'difficulty_breathing', 'headache',
  'body_aches', 'loss_of_taste', 'sore_throat', 'runny_nose',
  'nausea', 'vomiting', 'diarrhea', 'rash', 'chest_pain', 'chills'
];

export default function DoctorDashboard() {
  const { supabase, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState('patients');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', user.id).single();
      
      if (!profileData || profileData.role !== 'doctor') {
        navigate('/login');
        return;
      }
      setProfile(profileData);

      // Fetch all patients
      const { data: patientsData } = await supabase
        .from('profiles').select('*').eq('role', 'patient');
      setPatients(patientsData || []);
      
      setLoading(false);
    };

    initDashboard();
  }, [supabase, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const fetchPatientRecords = async (patient) => {
    setSelectedPatient(patient);
    const { data: recordsData } = await supabase
      .from('medical_records').select('*')
      .eq('patient_id', patient.id).order('created_at', { ascending: false });
    setPatientRecords(recordsData || []);
  };

  const handlePredict = async () => {
    if (selectedSymptoms.length === 0) return;
    setPredicting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_FASTAPI_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: selectedSymptoms })
      });
      const result = await res.json();
      setPrediction(result);
    } catch (err) {
      console.error('Prediction failed:', err.message);
    } finally {
      setPredicting(false);
    }
  };

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
      ? prev.filter(s => s !== symptom) 
      : [...prev, symptom]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="flex flex-col items-center">
          <HeartPulse className="w-12 h-12 text-primary-500 animate-pulse" />
          <p className="mt-4 text-primary-600 font-medium font-display text-xl">Accessing clinical portal...</p>
        </div>
      </div>
    );
  }

  const SidebarLink = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setSelectedPatient(null);
      }}
      className={`w-full flex items-center gap-3 px-6 py-4 transition-all ${
        activeTab === id 
        ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-500 font-bold' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-sans font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-8 h-8 text-primary-600" />
          <span className="font-display font-bold text-2xl tracking-tight text-gray-900">RuralConnect Portal</span>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <span className="text-gray-600 font-medium italic">Clinical Session: <span className="font-bold text-gray-900 not-italic">Dr. {profile?.full_name || profile?.name}</span></span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 font-bold text-sm hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Terminate Session
        </motion.button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
          <div className="py-8">
            <SidebarLink id="patients" icon={Users} label="Patients" />
            <SidebarLink id="predictor" icon={Stethoscope} label="Disease Predictor" />
            <SidebarLink id="profile" icon={User} label="My Profile" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-primary-100/20 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <AnimatePresence mode="wait">
              {activeTab === 'patients' && (
                <motion.div
                  key="patients"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="font-display text-4xl font-bold">Patient Registry</h2>
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search patients..." 
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500/20 outline-none transition-all w-64"
                      />
                    </div>
                  </div>

                  {!selectedPatient ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {patients.map((patient) => (
                        <motion.div
                          key={patient.id}
                          whileHover={{ scale: 1.02, y: -5 }}
                          onClick={() => fetchPatientRecords(patient)}
                          className="glass-card p-6 cursor-pointer border-t-4 border-t-primary-500 group"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-bold text-xl">
                              {patient.full_name?.charAt(0) || patient.name?.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg group-hover:text-primary-600 transition-colors">{patient.full_name || patient.name}</h3>
                              <p className="text-sm text-gray-500">{patient.email}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-50 pt-4">
                            <span>Age: <span className="font-bold text-gray-900">{patient.age || 'N/A'}</span></span>
                            <span>Blood: <span className="font-bold text-red-600">{patient.blood_group || 'N/A'}</span></span>
                          </div>
                          <button className="w-full mt-4 py-2 bg-gray-50 text-gray-600 font-bold rounded-lg group-hover:bg-primary-500 group-hover:text-white transition-all flex items-center justify-center gap-2">
                            View Records <ChevronRight className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <button 
                        onClick={() => setSelectedPatient(null)}
                        className="text-primary-600 font-bold flex items-center gap-2 hover:underline mb-4"
                      >
                        ← Back to Patient Registry
                      </button>
                      
                      <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-white to-primary-50/30">
                        <div className="w-24 h-24 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 text-3xl font-bold">
                          {selectedPatient.full_name?.charAt(0) || selectedPatient.name?.charAt(0)}
                        </div>
                        <div className="text-center md:text-left">
                          <h3 className="text-3xl font-bold mb-2">{selectedPatient.full_name || selectedPatient.name}</h3>
                          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <span className="bg-white px-3 py-1 rounded-lg border text-sm font-medium">Email: {selectedPatient.email}</span>
                            <span className="bg-white px-3 py-1 rounded-lg border text-sm font-medium">Age: {selectedPatient.age || 'N/A'}</span>
                            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg border border-red-100 text-sm font-bold">Blood: {selectedPatient.blood_group || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <h4 className="font-display font-bold text-2xl mt-8 mb-6">Patient Medical History</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {patientRecords.map((record) => (
                          <div key={record.id} className="glass-card p-6 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-primary-50 rounded-xl group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                <FileText className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-lg">{record.file_name}</p>
                                <p className="text-gray-500">Documented on {new Date(record.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <a 
                              href={record.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn-primary w-auto px-6 flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              View Report
                            </a>
                          </div>
                        ))}
                        {patientRecords.length === 0 && (
                          <div className="glass-card p-12 text-center text-gray-500">
                            No medical records found for this patient.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeTab === 'predictor' && (
                <motion.div
                  key="predictor"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="max-w-4xl mx-auto space-y-8"
                >
                  <div className="text-center mb-12">
                    <h2 className="font-display text-4xl font-bold mb-4">ML Diagnostic Assistant</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto font-medium">Select observed clinical symptoms to generate a statistically probable diagnosis using our advanced ML disease model.</p>
                  </div>

                  <div className="glass-card p-8">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-primary-500" />
                      Select Clinical Symptoms
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {SYMPTOMS.map((symptom) => (
                        <button
                          key={symptom}
                          onClick={() => toggleSymptom(symptom)}
                          className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all text-center ${
                            selectedSymptoms.includes(symptom)
                            ? 'bg-primary-500 text-white border-primary-500 shadow-lg scale-105'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          {symptom.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>

                    <div className="mt-8 flex flex-col items-center">
                      <div className="flex flex-wrap gap-2 mb-8 justify-center min-h-[40px]">
                        {selectedSymptoms.map(s => (
                          <span key={s} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold border border-primary-100 flex items-center gap-1 uppercase tracking-wider">
                            {s.replace(/_/g, ' ')}
                            <button onClick={() => toggleSymptom(s)} className="hover:text-red-500">×</button>
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={handlePredict}
                        disabled={predicting || selectedSymptoms.length === 0}
                        className={`btn-primary w-full max-w-xs flex items-center justify-center gap-2 ${predicting ? 'opacity-70' : ''}`}
                      >
                        {predicting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Activity className="w-5 h-5" />
                            Generate Prediction
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {prediction && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-8 border-l-8 border-primary-500 bg-gradient-to-br from-primary-50/50 to-white"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                          <p className="text-primary-600 font-bold uppercase tracking-widest text-xs mb-2">Predicted Diagnosis</p>
                          <h4 className="text-4xl font-display font-black text-gray-900">{prediction.disease}</h4>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-gray-500 text-sm font-medium">Confidence Score</p>
                            <p className="text-3xl font-bold text-primary-600 font-display">{prediction.confidence}%</p>
                          </div>
                          <div className="w-16 h-16 rounded-full border-4 border-primary-100 flex items-center justify-center">
                            <TrendingUp className="w-8 h-8 text-primary-500" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 pt-8 border-t border-gray-100">
                        <h5 className="font-bold flex items-center gap-2 mb-4">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          Recommended Next Steps
                        </h5>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <li className="flex items-center gap-2 text-gray-600 font-medium bg-white p-3 rounded-lg border border-gray-100 italic">
                            • Review clinical history for similar episodes.
                          </li>
                          <li className="flex items-center gap-2 text-gray-600 font-medium bg-white p-3 rounded-lg border border-gray-100 italic">
                            • Order relevant laboratory diagnostics (CBC, LFT).
                          </li>
                          <li className="flex items-center gap-2 text-gray-600 font-medium bg-white p-3 rounded-lg border border-gray-100 italic">
                            • Schedule immediate follow-up if symptoms worsen.
                          </li>
                          <li className="flex items-center gap-2 text-gray-600 font-medium bg-white p-3 rounded-lg border border-gray-100 italic">
                            • Monitor vital signs every 4 hours.
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-2xl mx-auto"
                >
                  <h2 className="font-display text-4xl font-bold mb-8">Clinical Profile</h2>
                  <div className="glass-card overflow-hidden">
                    <div className="h-40 bg-gradient-to-r from-primary-600 to-primary-800 flex items-end justify-end p-6">
                      <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold flex items-center gap-2 border border-white/30">
                        <CheckCircle2 className="w-4 h-4" />
                        Verified Medical Professional
                      </div>
                    </div>
                    <div className="px-8 pb-8">
                      <div className="relative -mt-16 mb-6 flex flex-col md:flex-row md:items-end gap-6">
                        <div className="w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                          <div className="w-full h-full bg-primary-50 flex items-center justify-center">
                            <User className="w-16 h-16 text-primary-600" />
                          </div>
                        </div>
                        <div className="pb-2">
                          <h3 className="text-3xl font-bold text-gray-900">Dr. {profile?.full_name || profile?.name}</h3>
                          <p className="text-primary-600 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            {profile?.specialization || 'General Physician'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Medical License</p>
                          <p className="text-gray-900 font-bold text-lg">#MC-445920-IND</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                          <p className="text-gray-900 font-medium">{profile?.email}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Affiliation</p>
                          <p className="text-gray-900 font-medium">RuralConnect Health Network</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Consultations</p>
                          <p className="text-primary-600 font-black text-2xl">12</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
