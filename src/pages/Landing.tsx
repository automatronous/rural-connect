import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Map, Brain, Lock, ArrowRight, Stethoscope, Activity } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#05070a', color: '#fff', overflow: 'hidden' }}>
      {/* Animated background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,68,68,0.08) 0%, transparent 70%)', animation: 'pulse 8s infinite' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(68,136,255,0.06) 0%, transparent 70%)', animation: 'pulse 10s infinite 2s' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,68,68,0.04) 0%, transparent 70%)' }} />
      </div>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(5,7,10,0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <HeartPulse size={22} color="#ff4444" />
          <span style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: 2 }}>
            RuralConnect
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={{
            padding: '9px 22px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent', color: '#ccc', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ff4444'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#ccc'; }}
          >
            Log In
          </button>
          <button onClick={() => navigate('/register')} style={{
            padding: '9px 22px', borderRadius: 8, border: '1px solid #ff4444',
            background: '#ff4444', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#cc3333'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ff4444'; }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, border: '1px solid rgba(255,68,68,0.3)', background: 'rgba(255,68,68,0.08)', marginBottom: 32, fontSize: 12, color: '#ff8888' }}>
          <Activity size={12} /> AI-Powered Rural Healthcare Platform
        </div>

        <h1 style={{ fontFamily: 'Orbitron', fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, maxWidth: 800 }}>
          Connecting Rural India to{' '}
          <span style={{ background: 'linear-gradient(135deg, #ff4444, #ff8888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Modern Healthcare
          </span>
        </h1>

        <p style={{ fontSize: 18, color: '#888', maxWidth: 560, lineHeight: 1.7, marginBottom: 48 }}>
          AI disease prediction, live disease heatmaps, secure medical records — all in one platform designed for doctors and patients in remote communities.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 80 }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '14px 32px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #ff4444, #cc2222)', color: '#fff',
              cursor: 'pointer', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 0 40px rgba(255,68,68,0.3)',
              transition: 'all 0.2s',
            }}
          >
            <Stethoscope size={18} />
            Register as Doctor
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '14px 32px', borderRadius: 12, border: '2px solid rgba(68,136,255,0.5)',
              background: 'rgba(68,136,255,0.1)', color: '#4488ff',
              cursor: 'pointer', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s',
            }}
          >
            <Lock size={16} />
            Register as Patient
          </button>
          <button
            onClick={() => navigate('/map')}
            style={{
              padding: '14px 32px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent', color: '#aaa',
              cursor: 'pointer', fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s',
            }}
          >
            <Map size={16} />
            View Disease Map
          </button>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 900, width: '100%' }}>
          {[
            {
              icon: <Brain size={28} color="#ff4444" />,
              title: 'AI Disease Prediction',
              desc: 'ML model trained on 132 diseases across 131 symptoms. Doctors get instant differential diagnoses with confidence scores.',
              accent: '#ff4444',
            },
            {
              icon: <Map size={28} color="#4488ff" />,
              title: 'Live Disease Heatmap',
              desc: 'Real-time disease surveillance across India. Powered by Supabase Realtime — updates instantly when doctors file reports.',
              accent: '#4488ff',
            },
            {
              icon: <Lock size={28} color="#00cc66" />,
              title: 'Secure Medical Records',
              desc: 'Patient records encrypted and stored in Supabase. Role-based access ensures patient data privacy at all times.',
              accent: '#00cc66',
            },
          ].map((f, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${f.accent}22`,
              borderRadius: 16, padding: 28,
              textAlign: 'left', transition: 'all 0.3s',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background = `${f.accent}08`;
                el.style.borderColor = `${f.accent}44`;
                el.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background = 'rgba(255,255,255,0.03)';
                el.style.borderColor = `${f.accent}22`;
                el.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10, fontFamily: 'Orbitron', letterSpacing: 0.5 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#777', lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 1, padding: '24px 48px', borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HeartPulse size={16} color="#ff4444" />
          <span style={{ fontFamily: 'Orbitron', fontSize: 12, color: '#666' }}>RuralConnect</span>
        </div>
        <span style={{ fontSize: 12, color: '#555' }}>Bridging the healthcare gap in rural India</span>
      </footer>
    </div>
  );
}
