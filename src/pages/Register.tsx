import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor' | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      // removed toast
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, name, role);
      // removed toast
      navigate(`/${role}/dashboard`);
    } catch (err: any) {
      // removed toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 w-full max-w-md">
        <h2 className="font-['Orbitron'] text-white text-3xl font-bold mb-8 text-center text-red-500">Create Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-white/70 mb-2 font-['Inter']">Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-red-500 w-full"
              placeholder="John Doe"
            />
          </div>
          
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
              placeholder="Create a password"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`bg-white/5 backdrop-blur-md border rounded-2xl p-4 transition-all flex items-center justify-center ${role === 'patient' ? 'border-[#4488ff] bg-[#4488ff]/20' : 'border-white/10 hover:bg-white/10'}`}
            >
              <span className={`font-bold ${role === 'patient' ? 'text-[#4488ff]' : 'text-white'}`}>I am a Patient</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`bg-white/5 backdrop-blur-md border rounded-2xl p-4 transition-all flex items-center justify-center ${role === 'doctor' ? 'border-[#ff4444] bg-[#ff4444]/20' : 'border-white/10 hover:bg-white/10'}`}
            >
              <span className={`font-bold ${role === 'doctor' ? 'text-[#ff4444]' : 'text-white'}`}>I am a Doctor</span>
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-400 text-black font-bold py-3 px-6 rounded-xl transition-all mt-6 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="text-white/60 text-center mt-6">
          Already have an account? <Link to="/login" className="text-red-400 hover:text-red-300">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
