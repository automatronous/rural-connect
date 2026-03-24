import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import { useUpdateProfile } from '../../hooks/usePatients';
import { User, Droplets, AlertCircle, Calendar, Loader } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function PatientProfile() {
  const { profile, refreshProfile } = useAuth();
  const { mutateAsync: updateProfile, isPending: saving } = useUpdateProfile();

  const [name, setName] = useState(profile?.name ?? '');
  const [age, setAge] = useState(profile?.age?.toString() ?? '');
  const [bloodGroup, setBloodGroup] = useState(profile?.blood_group ?? '');
  const [allergies, setAllergies] = useState(profile?.allergies ?? '');

  const handleSave = async () => {
    if (!profile) return;
    await updateProfile({ id: profile.id, name, age: age ? parseInt(age) : null, blood_group: bloodGroup || null, allergies: allergies || null });
    await refreshProfile();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px 12px 40px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#05070a' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '32px 36px', color: '#fff' }}>
        <h1 style={{ fontFamily: 'Orbitron', fontSize: 24, fontWeight: 700, marginBottom: 28 }}>My Profile</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, maxWidth: 900 }}>
          {/* Avatar card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(68,136,255,0.2)', borderRadius: 16, padding: 28,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center',
          }}>
            <div style={{
              width: 90, height: 90, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(68,136,255,0.3), rgba(68,136,255,0.1))',
              border: '3px solid rgba(68,136,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, fontWeight: 700, color: '#4488ff',
            }}>
              {profile?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{profile?.name}</div>
              <div style={{ fontSize: 12, color: '#4488ff', marginTop: 4 }}>Patient</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{profile?.email}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
              {[
                { label: 'Blood Group', value: profile?.blood_group ?? '—', color: '#ff4444' },
                { label: 'Age', value: profile?.age ? `${profile.age}y` : '—', color: '#4488ff' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: `${color}10`, border: `1px solid ${color}22`, borderRadius: 10, padding: '10px 8px' }}>
                  <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
                </div>
              ))}
            </div>
            {profile?.allergies && (
              <div style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,170,0,0.08)', border: '1px solid rgba(255,170,0,0.2)', borderRadius: 10, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ffaa00', marginBottom: 4 }}><AlertCircle size={12} /> Allergies</div>
                <div style={{ color: '#aaa' }}>{profile.allergies}</div>
              </div>
            )}
          </div>

          {/* Edit form */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28 }}>
            <h2 style={{ fontFamily: 'Orbitron', fontSize: 14, color: '#fff', marginBottom: 20 }}>Edit Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                  <input value={name} onChange={e => setName(e.target.value)} style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#4488ff'; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Age</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                    <input type="number" min="1" max="120" value={age} onChange={e => setAge(e.target.value)} style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = '#4488ff'; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Blood Group</label>
                  <div style={{ position: 'relative' }}>
                    <Droplets size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                    <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                      <option value="">Unknown</option>
                      {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Allergies</label>
                <div style={{ position: 'relative' }}>
                  <AlertCircle size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                  <input value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="Penicillin, Pollen, etc." style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#4488ff'; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }} />
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '13px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #4488ff, #2266dd)', color: '#fff',
                  cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600,
                  marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {saving && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
