import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DoctorDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50 to-primary-100 text-gray-900 font-sans p-4 sm:p-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary-200/40 rounded-full blur-3xl animate-float"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8 relative z-10"
      >
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 gap-4 mt-4">
          <div>
            <h1 className="font-display text-4xl font-bold text-gray-900 tracking-tight">Clinical Dashboard</h1>
            <p className="text-gray-600 mt-2 font-medium text-lg">Welcome, Dr. {profile?.name}</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-2 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center"
          >
            Sign Out
          </motion.button>
        </header>
        
        <div className="glass-card p-8">
          <h2 className="font-display font-bold text-2xl mb-4 text-gray-900">Active Patient Cases</h2>
          <div className="bg-primary-50/50 rounded-xl p-8 border border-primary-100 text-center">
            <p className="text-gray-600 font-medium">There are currently no assigned cases.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
