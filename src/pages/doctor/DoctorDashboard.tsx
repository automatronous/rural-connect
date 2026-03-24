import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center pb-6 border-b border-white/10">
          <div>
            <h1 className="font-['Orbitron'] text-3xl font-bold text-red-500">Doctor Dashboard</h1>
            <p className="text-white/60 mt-1">Welcome back, Dr. {profile?.name}</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="border border-white/20 hover:bg-white/10 text-white font-bold py-2 px-6 rounded-xl transition-all"
          >
            Sign Out
          </button>
        </header>
        
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <h2 className="font-['Orbitron'] text-xl mb-4 text-white">Incoming Cases</h2>
          <p className="text-white/60">No pending cases at the moment.</p>
        </div>
      </div>
    </div>
  );
}
