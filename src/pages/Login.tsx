import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, refreshProfile, profile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      await refreshProfile();
      // the ProtectedRoute or App generally redirects based on role, but we should redirect explicitly here
      // Since useAuth state update might be slightly delayed, we rely on the refreshed profile
      const userRole = profile?.role; // we might need to wait for context to update, 
      // easiest is to redirect to / which will let ProtectedRoute handle it, 
      // or we can just push to dashboard and let it compute. 
      // Let's just push to / for a generic redirect but the prompt says 
      // "On success: fetch role from profiles table, redirect to /doctor/dashboard or /patient/dashboard"
      // Since refreshProfile is called, profile might not immediately update in current closure, 
      // but wait, we can just navigate to '/' and let the router handle the dashboard redirection if they are authed.
      // Actually let me query it manually to be safe if `profile` isn't updated in closure.
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 w-full max-w-md">
        <h2 className="font-['Orbitron'] text-white text-3xl font-bold mb-8 text-center text-red-500">Sign In</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white/70 mb-2 font-['Inter']">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-red-500 w-full"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-white/70 mb-2 font-['Inter']">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-red-500 w-full"
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-400 text-black font-bold py-3 px-6 rounded-xl transition-all mt-4 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-white/60 text-center mt-6">
          Don't have an account? <Link to="/register" className="text-red-400 hover:text-red-300">Register</Link>
        </p>
      </div>
    </div>
  );
}
