import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegisterClick = async () => {
    setError(null);

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!role) {
      setError('Please select a role.');
      return;
    }

    setLoading(true);

    try {
      // STEP 1: Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;

      if (!user) {
        setError("User creation failed.");
        return;
      }

      // STEP 2: Insert profile into DB
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            name: name,
            email: email,
            role: role,
          },
        ]);

      if (profileError) {
        console.error(profileError);
        setError("Profile creation failed.");
        return;
      }

      // STEP 3: Redirect
      navigate('/login');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50 to-primary-100 flex items-center justify-center p-4 relative overflow-hidden my-8 sm:my-0">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-primary-200/50 rounded-full blur-3xl animate-pulse-slow"></div>
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
          Create Account
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2 font-sans">
              Full Name
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input"
              placeholder="Dr. John Doe / Jane Smith"
            />
          </div>

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
              placeholder="Create a secure password"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`bg-white/50 backdrop-blur-sm border rounded-xl p-4 transition-all flex items-center justify-center ${role === 'patient' ? 'border-primary-500 bg-primary-50 shadow-md ring-2 ring-primary-500/20' : 'border-gray-200 hover:bg-white/80'}`}
            >
              <span className={`font-bold ${role === 'patient' ? 'text-primary-600' : 'text-gray-600'}`}>
                I am a Patient
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`bg-white/50 backdrop-blur-sm border rounded-xl p-4 transition-all flex items-center justify-center ${role === 'doctor' ? 'border-primary-500 bg-primary-50 shadow-md ring-2 ring-primary-500/20' : 'border-gray-200 hover:bg-white/80'}`}
            >
              <span className={`font-bold ${role === 'doctor' ? 'text-primary-600' : 'text-gray-600'}`}>
                I am a Doctor
              </span>
            </button>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRegisterClick}
            disabled={loading}
            className="btn-primary mt-6 flex items-center justify-center"
          >
            {loading ? 'Creating Account...' : 'Register'}
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
          Already have an account?{" "}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
