import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Map, ArrowRight, Shield, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50 to-primary-100 flex flex-col relative overflow-hidden text-gray-900 font-sans">
      
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/40 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-200/40 rounded-full blur-3xl animate-float"></div>
      </div>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-20 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-primary-200 text-primary-700 font-medium mb-4 shadow-sm backdrop-blur-sm">
            <HeartPulse className="w-5 h-5 text-primary-500" />
            <span>Next Generation Medical Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-tight font-display">
            Elevating Rural <br/> <span className="text-primary-600">Healthcare Delivery</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-3xl mx-auto leading-relaxed">
            Connecting communities with advanced diagnostics, secure records, and seamless professional care.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link to="/login">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white border-2 border-primary-500 text-primary-600 font-bold py-4 px-10 rounded-xl transition-all w-full sm:w-auto shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Sign In
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary-500 text-white font-bold py-4 px-10 rounded-xl transition-all w-full sm:w-auto shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl"
        >
          <div className="glass-card p-8 flex flex-col items-center text-center group cursor-default transition-all duration-300 hover:bg-white/90">
            <div className="bg-primary-50 p-4 rounded-full mb-6 group-hover:bg-primary-100 transition-colors">
              <Activity className="text-primary-600 w-10 h-10" />
            </div>
            <h3 className="font-display font-bold text-gray-900 text-xl mb-3">AI Diagnostics</h3>
            <p className="text-gray-600 font-medium leading-relaxed">Upload symptoms or medical data for instant, reliable diagnostic insights powered by advanced models.</p>
          </div>
          
          <div className="glass-card p-8 flex flex-col items-center text-center group cursor-default transition-all duration-300 hover:bg-white/90">
            <div className="bg-primary-50 p-4 rounded-full mb-6 group-hover:bg-primary-100 transition-colors">
              <Map className="text-primary-600 w-10 h-10" />
            </div>
            <h3 className="font-display font-bold text-gray-900 text-xl mb-3">Regional Insights</h3>
            <p className="text-gray-600 font-medium leading-relaxed">A comprehensive platform for tracking and forecasting real-time public health metrics across districts.</p>
          </div>
          
          <div className="glass-card p-8 flex flex-col items-center text-center group cursor-default transition-all duration-300 hover:bg-white/90">
            <div className="bg-primary-50 p-4 rounded-full mb-6 group-hover:bg-primary-100 transition-colors">
              <Shield className="text-primary-600 w-10 h-10" />
            </div>
            <h3 className="font-display font-bold text-gray-900 text-xl mb-3">Secure Records</h3>
            <p className="text-gray-600 font-medium leading-relaxed">Digitize and encrypt patient histories with clinical-grade security, accessible globally by certified practitioners.</p>
          </div>
        </motion.div>
      </main>

    </div>
  );
}
