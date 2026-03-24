import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PatientDashboard() {
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
            <h1 className="font-['Orbitron'] text-3xl font-bold text-[#4488ff]">Patient Dashboard</h1>
            <p className="text-white/60 mt-1">Welcome, {profile?.name}</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="border border-white/20 hover:bg-white/10 text-white font-bold py-2 px-6 rounded-xl transition-all"
          >
            Sign Out
          </button>
        </header>
        
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 border-l-4 border-l-[#4488ff]">
          <h2 className="font-['Orbitron'] text-xl mb-4 text-white">Your Health Records</h2>
          <p className="text-white/60">No recent diagnoses found.</p>
        </div>
      </div>
    </div>
  );
}
