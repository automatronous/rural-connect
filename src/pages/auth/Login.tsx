import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HeartPulse, Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Fill in all fields'); return; }
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      // role-based redirect handled by a brief delay for profile to load
      setTimeout(() => {
        const role = profile?.role;
        if (role === 'doctor') navigate('/doctor/dashboard');
        else navigate('/patient/dashboard');
      }, 500);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px 12px 40px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#05070a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,68,68,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(68,136,255,0.05) 0%, transparent 70%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '12px 20px', borderRadius: 16,
            background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)',
            marginBottom: 16,
          }}>
            <HeartPulse size={24} color="#ff4444" />
            <span style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: 2 }}>RuralConnect</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: '12px 0 6px' }}>Welcome back</h1>
          <p style={{ color: '#666', fontSize: 14 }}>Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32,
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 8 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#ff4444'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => { e.target.style.borderColor = '#ff4444'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                background: loading ? '#333' : 'linear-gradient(135deg, #ff4444, #cc2222)',
                color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 14, fontWeight: 600, marginTop: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 0 30px rgba(255,68,68,0.25)',
              }}
            >
              {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#666' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#ff4444', textDecoration: 'none', fontWeight: 600 }}>Register here</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: 14, color: '#666' }}>
          <Link to="/map" style={{ color: '#4488ff', textDecoration: 'none' }}>View public disease map →</Link>
        </p>
      </div>
    </div>
  );
}
