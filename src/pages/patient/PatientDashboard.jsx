import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  User, 
  LogOut, 
  Upload, 
  Download,
  Plus,
  HeartPulse,
  Activity,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PatientDashboard() {
  const { supabase, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [consultationStatus, setConsultationStatus] = useState(null);

  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);

      // Fetch records
      const { data: recordsData } = await supabase
        .from('medical_records').select('*')
        .eq('patient_id', user.id).order('created_at', { ascending: false });
      setRecords(recordsData || []);
      
      setLoading(false);
    };

    initDashboard();
  }, [supabase, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const path = `${user.id}/${Date.now()}_${file.name}`;
    
    try {
      const { error: uploadError } = await supabase.storage.from('medical-records').upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('medical-records').getPublicUrl(path);
      
      const { error: insertError } = await supabase.from('medical_records').insert({
        patient_id: user.id,
        file_url: urlData.publicUrl,
        file_name: file.name
      });
      if (insertError) throw insertError;

      // Refresh records
      const { data: recordsData } = await supabase
        .from('medical_records').select('*')
        .eq('patient_id', user.id).order('created_at', { ascending: false });
      setRecords(recordsData || []);
    } catch (err) {
      console.error('Upload failed:', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleBookConsultation = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    try {
      const { error } = await supabase.from('consultations').insert({
        patient_id: user.id,
        status: 'pending',
        notes: symptoms
      });
      if (error) throw error;
      setConsultationStatus('Consultation booked successfully!');
      setSymptoms('');
    } catch (err) {
      setConsultationStatus('Failed to book consultation: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="flex flex-col items-center">
          <HeartPulse className="w-12 h-12 text-primary-500 animate-pulse" />
          <p className="mt-4 text-primary-600 font-medium font-display text-xl">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const SidebarLink = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
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
          <span className="font-display font-bold text-2xl tracking-tight text-gray-900">RuralConnect</span>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <span className="text-gray-600 font-medium">Welcome, <span className="font-bold text-gray-900">{profile?.full_name || profile?.name}</span></span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 font-bold text-sm hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </motion.button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
          <div className="py-8">
            <SidebarLink id="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink id="records" icon={FileText} label="My Records" />
            <SidebarLink id="book" icon={Calendar} label="Book Consultation" />
            <SidebarLink id="profile" icon={User} label="Profile" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-primary-100/30 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <h2 className="font-display text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Overview</h2>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 border-l-4 border-primary-500">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-primary-50 rounded-xl">
                          <FileText className="w-6 h-6 text-primary-600" />
                        </div>
                        <span className="text-3xl font-bold font-display">{records.length}</span>
                      </div>
                      <h3 className="text-gray-600 font-medium">Total Records</h3>
                    </div>
                    <div className="glass-card p-6 border-l-4 border-yellow-500">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-yellow-50 rounded-xl">
                          <Activity className="w-6 h-6 text-yellow-600" />
                        </div>
                        <span className="text-3xl font-bold font-display">2</span>
                      </div>
                      <h3 className="text-gray-600 font-medium">Pending Consultations</h3>
                    </div>
                  </div>

                  {/* Recent Records list */}
                  <div className="glass-card p-6">
                    <h3 className="font-display font-bold text-xl mb-6">Recent Medical Records</h3>
                    {records.length > 0 ? (
                      <div className="space-y-4">
                        {records.slice(0, 3).map((record) => (
                          <div key={record.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <ClipboardList className="w-5 h-5 text-blue-500" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{record.file_name}</p>
                                <p className="text-sm text-gray-500">{new Date(record.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <a href={record.file_url} target="_blank" rel="noopener noreferrer" className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                              <Download className="w-5 h-5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No records found. Upload your first record!</p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'records' && (
                <motion.div
                  key="records"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="font-display text-4xl font-bold">My Medical Records</h2>
                    <label className="btn-primary cursor-pointer flex items-center gap-2 w-auto px-6">
                      <Plus className="w-5 h-5" />
                      {uploading ? 'Uploading...' : 'Upload Record'}
                      <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleUpload} disabled={uploading} />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {records.map((record) => (
                      <div key={record.id} className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary-50 rounded-xl">
                            <FileText className="w-6 h-6 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">{record.file_name}</p>
                            <p className="text-gray-500 font-medium">Uploaded on {new Date(record.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a 
                            href={record.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white border border-gray-200 text-gray-700 font-bold py-2 px-6 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                    {records.length === 0 && (
                      <div className="glass-card p-12 text-center">
                        <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium text-lg">No medical records uploaded yet.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'book' && (
                <motion.div
                  key="book"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-2xl mx-auto"
                >
                  <h2 className="font-display text-4xl font-bold mb-8">Book Consultation</h2>
                  <div className="glass-card p-8">
                    <form onSubmit={handleBookConsultation} className="space-y-6">
                      <div>
                        <label className="block text-gray-700 font-bold mb-2">Describe your symptoms</label>
                        <textarea
                          value={symptoms}
                          onChange={(e) => setSymptoms(e.target.value)}
                          className="glass-input h-32 py-3"
                          placeholder="Please provide details about what you're feeling..."
                          required
                        />
                      </div>
                      <button type="submit" className="btn-primary">
                        Request Consultation
                      </button>
                    </form>
                    {consultationStatus && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`mt-6 p-4 rounded-xl text-center font-bold ${
                          consultationStatus.includes('successfully') ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                        }`}
                      >
                        {consultationStatus}
                      </motion.div>
                    )}
                  </div>
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
                  <h2 className="font-display text-4xl font-bold mb-8 text-center md:text-left">Your Profile</h2>
                  <div className="glass-card overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-primary-400 to-primary-600"></div>
                    <div className="px-8 pb-8">
                      <div className="relative -mt-16 mb-6 flex flex-col md:flex-row md:items-end gap-6">
                        <div className="w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                          <User className="w-16 h-16 text-primary-200" />
                        </div>
                        <div className="pb-2">
                          <h3 className="text-3xl font-bold text-gray-900">{profile?.full_name || profile?.name}</h3>
                          <p className="text-primary-600 font-bold uppercase tracking-wider text-sm">{profile?.role}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                          <p className="text-gray-900 font-medium">{profile?.email}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                          <p className="text-gray-900 font-medium">{profile?.phone || 'Not provided'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Age</p>
                          <p className="text-gray-900 font-medium">{profile?.age || 'Not provided'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Blood Group</p>
                          <p className="text-gray-900 font-medium text-lg font-bold text-red-600">{profile?.blood_group || 'Not provided'}</p>
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
