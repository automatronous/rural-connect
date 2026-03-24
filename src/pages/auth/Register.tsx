import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HeartPulse, Mail, Lock, User, Stethoscope, Activity, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor' | null>(null);
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px 11px 40px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', transition: 'border-color 0.2s',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) { toast.error('Fill all required fields and select a role'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signUp(email, password, name, role, age ? parseInt(age) : undefined, bloodGroup || undefined);
      toast.success('Account created! Redirecting…');
      setTimeout(() => {
        navigate(role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
      }, 800);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const accent = role === 'doctor' ? '#ff4444' : role === 'patient' ? '#4488ff' : '#666';

  return (
    <div style={{ minHeight: '100vh', background: '#05070a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: role === 'doctor' ? 'radial-gradient(ellipse at top left, rgba(255,68,68,0.06) 0%, transparent 60%)' : 'radial-gradient(ellipse at top right, rgba(68,136,255,0.06) 0%, transparent 60%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 500, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <HeartPulse size={22} color="#ff4444" />
            <span style={{ fontFamily: 'Orbitron', fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: 2 }}>RuralConnect</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Create your account</h1>
          <p style={{ color: '#666', fontSize: 13 }}>Join the healthcare network</p>
        </div>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { r: 'doctor' as const, icon: <Stethoscope size={22} color="#ff4444" />, title: 'I am a Doctor', desc: 'Access AI predictions & all patients', accent: '#ff4444' },
            { r: 'patient' as const, icon: <Activity size={22} color="#4488ff" />, title: 'I am a Patient', desc: 'Manage your health records', accent: '#4488ff' },
          ].map(({ r, icon, title, desc, accent: a }) => (
            <button
              key={r} type="button" onClick={() => setRole(r)}
              style={{
                padding: '18px 16px', borderRadius: 14, cursor: 'pointer',
                background: role === r ? `${a}15` : 'rgba(255,255,255,0.03)',
                border: `2px solid ${role === r ? a : 'rgba(255,255,255,0.08)'}`,
                color: '#fff', transition: 'all 0.2s', textAlign: 'center',
              }}
            >
              <div style={{ marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 11, color: '#666', lineHeight: 1.4 }}>{desc}</div>
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)',
          border: `1px solid ${role ? accent + '22' : 'rgba(255,255,255,0.08)'}`, borderRadius: 16, padding: 28,
          transition: 'border-color 0.3s',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Name */}
            <div>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Dr. / Patient full name" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = accent; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }} />
              </div>
            </div>
            {/* Email */}
            <div>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Email *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = accent; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }} />
              </div>
            </div>
            {/* Age & Blood Group */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Age</label>
                <input type="number" min="1" max="120" value={age} onChange={e => setAge(e.target.value)} placeholder="25" style={{ ...inputStyle, paddingLeft: 14 }}
                  onFocus={e => { e.target.style.borderColor = accent; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Blood Group</label>
                <div style={{ position: 'relative' }}>
                  <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} style={{ ...inputStyle, paddingLeft: 14, appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Select…</option>
                    {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <ChevronDown size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#555', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>
            {/* Passwords */}
            <div>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = accent; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter password" style={{ ...inputStyle, borderColor: confirm && confirm !== password ? '#ff4444' : 'rgba(255,255,255,0.12)' }}
                  onFocus={e => { e.target.style.borderColor = accent; }} onBlur={e => { e.target.style.borderColor = confirm && confirm !== password ? '#ff4444' : 'rgba(255,255,255,0.12)'; }} />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !role}
              style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                background: !role ? '#333' : `linear-gradient(135deg, ${accent}, ${accent}bb)`,
                color: '#fff', cursor: loading || !role ? 'not-allowed' : 'pointer',
                fontSize: 14, fontWeight: 600, marginTop: 6, transition: 'all 0.2s',
                boxShadow: role ? `0 0 30px ${accent}25` : 'none',
              }}
            >
              {loading ? 'Creating account…' : !role ? 'Select a role above' : `Create ${role === 'doctor' ? 'Doctor' : 'Patient'} Account`}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#666' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#ff4444', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
