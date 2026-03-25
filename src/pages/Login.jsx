import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { supabase } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email, password
      });
      if (error) throw error;
      const role = data.user.user_metadata.role;
      navigate(role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50 to-primary-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary-200/50 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 sm:p-10 w-full max-w-md relative z-10"
      >
        <div className="flex justify-center mb-6">
          <HeartPulse className="w-12 h-12 text-primary-500 animate-pulse-slow" />
        </div>
        <h2 className="font-display text-gray-900 text-3xl font-bold mb-8 text-center tracking-tight">Welcome Back</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2 font-sans">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2 font-sans">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input"
              placeholder="Enter your password"
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary mt-4 flex items-center justify-center"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-center mt-4 text-sm font-medium"
            >
              {error}
            </motion.p>
          )}
        </div>

        <p className="text-gray-600 text-center mt-8 font-medium">
          New to RuralConnect? <Link to="/register" className="text-primary-600 hover:text-primary-700 font-bold transition-colors">Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
}
