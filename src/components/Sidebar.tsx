import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, Map, User, Users,
  Brain, Activity, LogOut, Stethoscope, HeartPulse
} from 'lucide-react';

const doctorLinks = [
  { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/doctor/patients', icon: Users, label: 'Patients' },
  { to: '/doctor/heatmap', icon: Map, label: 'Disease Heatmap' },
  { to: '/doctor/predict', icon: Brain, label: 'AI Predictor' },
];

const patientLinks = [
  { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patient/records', icon: FileText, label: 'My Records' },
  { to: '/patient/map', icon: Map, label: 'Disease Map' },
  { to: '/patient/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const isDoctor = profile?.role === 'doctor';
  const links = isDoctor ? doctorLinks : patientLinks;
  const accent = isDoctor ? '#ff4444' : '#4488ff';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${accent}22, ${accent}44)`,
            border: `1px solid ${accent}66`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <HeartPulse size={18} color={accent} />
          </div>
          <div>
            <div style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>
              RuralConnect
            </div>
            <div style={{ fontSize: 10, color: '#666', marginTop: 1 }}>
              {isDoctor ? 'Doctor Portal' : 'Patient Portal'}
            </div>
          </div>
        </div>
        {/* Profile mini card */}
        <div style={{
          marginTop: 16, padding: '10px 12px', borderRadius: 10,
          background: `${accent}0d`, border: `1px solid ${accent}22`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: `${accent}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: accent
            }}>
              {profile?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{profile?.name || 'User'}</div>
              <div style={{ fontSize: 10, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
                {isDoctor ? <Stethoscope size={9} /> : <Activity size={9} />}
                {isDoctor ? 'Doctor' : 'Patient'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, padding: '0 8px' }}>
          Navigation
        </div>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 10,
              marginBottom: 4,
              textDecoration: 'none',
              transition: 'all 0.2s',
              background: isActive ? `${accent}15` : 'transparent',
              border: isActive ? `1px solid ${accent}33` : '1px solid transparent',
              color: isActive ? accent : '#888',
            })}
          >
            <Icon size={16} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={handleSignOut}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: '#888', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ff4444'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#ff444433'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#888'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
