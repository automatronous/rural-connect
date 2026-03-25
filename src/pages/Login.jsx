import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  // stores email input

  const [password, setPassword] = useState('');
  // stores password input

  const [loading, setLoading] = useState(false);
  // controls loading state

  const [error, setError] = useState(null);
  // stores error message

  const { signIn } = useAuth();
  // ONLY using signIn now (removed refreshProfile)

  const navigate = useNavigate();
  // used to change pages

  const handleLoginClick = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // STEP 1: Login
      await signIn(email, password);

      // TEMP: assign role manually
const role = email.includes('doctor') ? 'doctor' : 'patient';

// store role in browser
localStorage.setItem('role', role);

// redirect based on role
if (role === 'doctor') {
  navigate('/doctor/dashboard');
} else {
  navigate('/patient/dashboard');
}

    } catch (err) {
      setError(err.message || "An error occurred during sign in");
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

        <h2 className="font-display text-gray-900 text-3xl font-bold mb-8 text-center tracking-tight">
          Welcome Back
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2 font-sans">
              Email Address
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2 font-sans">
              Password
            </label>
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
            onClick={handleLoginClick}
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
          New to RuralConnect?{" "}
          <Link 
            to="/register" 
            className="text-primary-600 hover:text-primary-700 font-bold transition-colors"
          >
            Create Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
