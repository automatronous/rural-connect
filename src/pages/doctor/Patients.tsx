import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { usePatientsWithStats } from '../../hooks/usePatients';
import { TableSkeleton } from '../../components/SkeletonLoader';
import { Search, ArrowRight, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function DoctorPatients() {
  const navigate = useNavigate();
  const { data: patients, isLoading } = usePatientsWithStats();
  const [search, setSearch] = useState('');
  const [filterDisease, setFilterDisease] = useState('');

  const filtered = patients?.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase());
    const matchDisease = !filterDisease || (p as unknown as Record<string,string|null>).last_predicted_disease?.toLowerCase().includes(filterDisease.toLowerCase());
    return matchSearch && matchDisease;
  }) ?? [];

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', padding: '10px 14px',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#05070a' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '32px 36px', color: '#fff' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Orbitron', fontSize: 24, fontWeight: 700, margin: 0 }}>Patients</h1>
          <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>{patients?.length ?? 0} registered patients</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              style={{ ...inputStyle, paddingLeft: 36, width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ position: 'relative', flex: '0 1 220px' }}>
            <Filter size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
            <input
              value={filterDisease} onChange={e => setFilterDisease(e.target.value)}
              placeholder="Filter by disease…"
              style={{ ...inputStyle, paddingLeft: 36, width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.6fr 0.8fr 1.2fr 1.4fr 80px', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>
            <span>Patient</span><span>Age</span><span>Blood</span><span>Last Visit</span><span>Last Diagnosis</span><span></span>
          </div>

          {isLoading ? <TableSkeleton rows={6} /> : filtered.length === 0
            ? <div style={{ padding: 40, textAlign: 'center', color: '#555', fontSize: 13 }}>{search || filterDisease ? 'No patients match your search' : 'No patients registered yet'}</div>
            : filtered.map((p, i) => {
                const pp = p as unknown as Record<string, string | null>;
                return (
                  <div key={p.id} style={{
                    display: 'grid', gridTemplateColumns: '2fr 0.6fr 0.8fr 1.2fr 1.4fr 80px',
                    padding: '14px 16px', alignItems: 'center',
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
                    borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,68,68,0.05)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(68,136,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#4488ff', flexShrink: 0 }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#666' }}>{p.email}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 13, color: '#aaa' }}>{p.age ?? '—'}</span>
                    <span style={{ fontSize: 12, padding: '3px 8px', background: 'rgba(255,68,68,0.1)', borderRadius: 6, color: '#ff8888', display: 'inline-block' }}>{p.blood_group ?? '—'}</span>
                    <span style={{ fontSize: 12, color: '#aaa' }}>{pp.last_visit_date ? format(new Date(pp.last_visit_date), 'MMM d, yyyy') : '—'}</span>
                    <span style={{ fontSize: 12, color: pp.last_predicted_disease ? '#ff8888' : '#555' }}>{pp.last_predicted_disease ?? '—'}</span>
                    <button
                      onClick={() => navigate(`/doctor/patients/${p.id}`)}
                      style={{
                        padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(255,68,68,0.3)',
                        background: 'rgba(255,68,68,0.08)', color: '#ff4444', cursor: 'pointer', fontSize: 12,
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      View <ArrowRight size={11} />
                    </button>
                  </div>
                );
              })
          }
        </div>
      </main>
    </div>
  );
}
