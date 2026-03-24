import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Map, FileText } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center p-6 space-y-16">
      
      <div className="text-center space-y-6">
        <h1 className="font-['Orbitron'] text-5xl md:text-7xl font-bold text-red-500 drop-shadow-[0_0_30px_rgba(255,68,68,0.8)] tracking-wider">
          RuralConnect
        </h1>
        <p className="text-xl md:text-2xl text-white/80 font-['Inter']">
          AI-Powered Rural Healthcare Platform
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link to="/login" className="border-2 border-red-500 hover:bg-red-500/10 text-white font-bold py-3 px-8 rounded-xl transition-all text-center">
            Login
          </Link>
          <Link to="/register" className="bg-red-500 hover:bg-red-400 text-black font-bold py-3 px-8 rounded-xl transition-all text-center">
            Register
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
          <Activity className="text-red-500 w-12 h-12 mb-4" />
          <h3 className="font-['Orbitron'] text-white text-xl mb-2">AI Disease Prediction</h3>
          <p className="text-white/60">Upload symptoms or medical data for instant AI-based diagnosis assistance.</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
          <Map className="text-red-500 w-12 h-12 mb-4" />
          <h3 className="font-['Orbitron'] text-white text-xl mb-2">Live Disease Heatmap</h3>
          <p className="text-white/60">Track and predict outbreaks in rural regions with our real-time interactive mapping.</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
          <FileText className="text-red-500 w-12 h-12 mb-4" />
          <h3 className="font-['Orbitron'] text-white text-xl mb-2">Secure Medical Records</h3>
          <p className="text-white/60">Digitize and securely store long-term health records accessible anywhere.</p>
        </div>
      </div>

    </div>
  );
}
