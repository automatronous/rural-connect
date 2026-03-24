import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DiseaseReport } from '../types/database.types';
import HeatmapLegend, { DISEASE_COLORS } from './HeatmapLegend';
import Modal from './Modal';
import { Plus, Crosshair } from 'lucide-react';
import { useAddDiseaseReport } from '../hooks/useDiseaseReports';
import { api } from '../lib/api';
import 'leaflet/dist/leaflet.css';

const ALL_41_DISEASES = [
  '(vertigo) Paroymsal Positional Vertigo','AIDS','Acne','Alcoholic hepatitis','Allergy',
  'Arthritis','Bronchial Asthma','Cervical spondylosis','Chicken pox','Chronic cholestasis',
  'Common Cold','Dengue','Diabetes','Dimorphic hemmorhoids(piles)','Drug Reaction',
  'Fungal infection','GERD','Gastroenteritis','Heart attack','Hepatitis B','Hepatitis C',
  'Hepatitis D','Hepatitis E','Hypertension','Hyperthyroidism','Hypoglycemia','Hypothyroidism',
  'Impetigo','Jaundice','Malaria','Migraine','Osteoarthristis','Paralysis (brain hemorrhage)',
  'Peptic ulcer disease','Pneumonia','Psoriasis','Tuberculosis','Typhoid',
  'Urinary tract infection','Varicose veins','hepatitis A',
];

interface HeatmapViewProps {
  reports: DiseaseReport[];
  canAddReport?: boolean;
}

export default function HeatmapView({ reports, canAddReport = false }: HeatmapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<unknown>(null);
  const heatLayers = useRef<Record<string, unknown>>({});
  const [enabledDiseases, setEnabledDiseases] = useState<Set<string>>(new Set());
  const [pinMode, setPinMode] = useState(false);
  const [pinLatLng, setPinLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [diseaseName, setDiseaseName] = useState(ALL_41_DISEASES[0]);
  const [regionName, setRegionName] = useState('');
  const [caseCount, setCaseCount] = useState('');
  const [diseaseSearch, setDiseaseSearch] = useState('');
  const { mutateAsync: addReport, isPending: adding } = useAddDiseaseReport();

  // Collect unique diseases from reports + init enabled
  const uniqueDiseases = [...new Set(reports.map(r => r.disease_name))];

  useEffect(() => {
    setEnabledDiseases(prev => {
      const newSet = new Set(prev);
      uniqueDiseases.forEach(d => { if (!newSet.has(d)) newSet.add(d); });
      return newSet;
    });
  }, [reports.length]);

  const getColor = (disease: string): string => DISEASE_COLORS[disease] ?? '#aaaaaa';

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Leaflet.heat via CDN fallback (add script tag if not loaded)
      if (!(window as any).L?.heatLayer) {
        await new Promise<void>((resolve) => {
          const s = document.createElement('script');
          s.src = 'https://unpkg.com/leaflet.heat/dist/leaflet-heat.js';
          s.onload = () => resolve();
          document.head.appendChild(s);
        });
      }

      const map = L.map(mapRef.current!, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CartoDB',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      leafletMap.current = map;

      // Map click for pin mode
      map.on('click', (e: unknown) => {
        const ev = e as { latlng: { lat: number; lng: number } };
        if ((window as unknown as Record<string, boolean>).__pinMode) {
          setPinLatLng({ lat: ev.latlng.lat, lng: ev.latlng.lng });
          setShowModal(true);
          (window as unknown as Record<string, boolean>).__pinMode = false;
          setPinMode(false);
          map.getContainer().style.cursor = '';
        }
      });
    };

    initMap();
    return () => {
      if (leafletMap.current) {
        (leafletMap.current as { remove: () => void }).remove();
        leafletMap.current = null;
        heatLayers.current = {};
      }
    };
  }, []);

  // Update heat layers when reports change
  useEffect(() => {
    if (!leafletMap.current) return;
    const map = leafletMap.current as { addLayer: (l: unknown) => void; removeLayer: (l: unknown) => void };
    const LHeat = (window as any).L;
    if (!LHeat || !LHeat.heatLayer) return;

    const maxCount = Math.max(...reports.map(r => r.case_count), 1);

    // Group by disease
    const grouped: Record<string, [number, number, number][]> = {};
    for (const r of reports) {
      if (!grouped[r.disease_name]) grouped[r.disease_name] = [];
      grouped[r.disease_name].push([r.lat, r.lng, r.case_count / maxCount]);
    }

    // Remove old layers
    Object.values(heatLayers.current).forEach(l => { try { map.removeLayer(l); } catch {} });
    heatLayers.current = {};

    // Add new layers
    Object.entries(grouped).forEach(([disease, points]) => {
      const [r, g, b] = hexToRgb(getColor(disease));
      const layer = LHeat.heatLayer(points, {
        radius: 35, blur: 25, maxZoom: 10,
        gradient: { 0.2: `rgba(${r},${g},${b},0.3)`, 0.6: `rgba(${r},${g},${b},0.7)`, 1: `rgb(${r},${g},${b})` },
      });
      heatLayers.current[disease] = layer;
      if (enabledDiseases.has(disease)) {
        map.addLayer(layer);
      }
    });
  }, [reports]);

  // Toggle disease layers
  useEffect(() => {
    if (!leafletMap.current) return;
    const map = leafletMap.current as { addLayer: (l: unknown) => void; removeLayer: (l: unknown) => void };
    Object.entries(heatLayers.current).forEach(([disease, layer]) => {
      if (enabledDiseases.has(disease)) {
        try { map.addLayer(layer); } catch {}
      } else {
        try { map.removeLayer(layer); } catch {}
      }
    });
  }, [enabledDiseases]);

  const toggleDisease = useCallback((disease: string) => {
    setEnabledDiseases(prev => {
      const n = new Set(prev);
      if (n.has(disease)) n.delete(disease); else n.add(disease);
      return n;
    });
  }, []);

  const startPinMode = () => {
    setPinMode(true);
    (window as unknown as Record<string, boolean>).__pinMode = true;
    if (leafletMap.current) {
      (leafletMap.current as { getContainer: () => HTMLElement }).getContainer().style.cursor = 'crosshair';
    }
  };

  const cancelPinMode = () => {
    setPinMode(false);
    (window as unknown as Record<string, boolean>).__pinMode = false;
    if (leafletMap.current) {
      (leafletMap.current as { getContainer: () => HTMLElement }).getContainer().style.cursor = '';
    }
  };

  const handleAddReport = async () => {
    if (!pinLatLng || !regionName || !caseCount) return;
    await addReport({
      disease_name: diseaseName,
      region_name: regionName,
      lat: pinLatLng.lat,
      lng: pinLatLng.lng,
      case_count: parseInt(caseCount),
      report_date: new Date().toISOString().split('T')[0],
    });
    setShowModal(false);
    setPinLatLng(null);
    setRegionName('');
    setCaseCount('');
  };

  const filteredDiseases = ALL_41_DISEASES.filter(d => d.toLowerCase().includes(diseaseSearch.toLowerCase()));

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none',
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Map */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Legend */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 500 }}>
        <HeatmapLegend reports={reports} enabledDiseases={enabledDiseases} onToggle={toggleDisease} />
      </div>

      {/* Pin mode banner */}
      {pinMode && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 600, pointerEvents: 'none',
          background: 'rgba(255,68,68,0.9)', backdropFilter: 'blur(12px)',
          borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 600, color: '#fff',
          display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 0 40px rgba(255,68,68,0.5)',
        }}>
          <Crosshair size={18} /> Click anywhere on map to place report
        </div>
      )}
      {pinMode && (
        <button
          onClick={cancelPinMode}
          style={{
            position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            zIndex: 600, padding: '10px 24px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(0,0,0,0.8)', color: '#fff', cursor: 'pointer', fontSize: 13,
          }}
        >
          Cancel
        </button>
      )}

      {/* FAB (doctor only) */}
      {canAddReport && !pinMode && (
        <button
          onClick={startPinMode}
          style={{
            position: 'absolute', bottom: 32, right: 32, zIndex: 500,
            width: 56, height: 56, borderRadius: '50%', border: 'none',
            background: 'linear-gradient(135deg, #ff4444, #cc2222)', color: '#fff',
            cursor: 'pointer', fontSize: 28, fontWeight: 300,
            boxShadow: '0 0 32px rgba(255,68,68,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          title="Add Disease Report"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Add Report Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setPinLatLng(null); }} title="Add Disease Report" maxWidth={420}>
        {pinLatLng && (
          <div style={{ marginBottom: 16, padding: '8px 12px', background: 'rgba(255,68,68,0.08)', borderRadius: 8, fontSize: 12, color: '#ff8888' }}>
            📍 {pinLatLng.lat.toFixed(4)}, {pinLatLng.lng.toFixed(4)}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Disease Name</label>
            <input
              value={diseaseSearch}
              onChange={e => setDiseaseSearch(e.target.value)}
              placeholder="Search disease…"
              style={{ ...inputStyle, marginBottom: 6 }}
            />
            <select
              value={diseaseName}
              onChange={e => { setDiseaseName(e.target.value); setDiseaseSearch(''); }}
              size={Math.min(filteredDiseases.length, 5)}
              style={{ ...inputStyle, height: 'auto' }}
            >
              {filteredDiseases.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Region Name *</label>
            <input value={regionName} onChange={e => setRegionName(e.target.value)} placeholder="City / District" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Case Count *</label>
            <input type="number" min="1" value={caseCount} onChange={e => setCaseCount(e.target.value)} placeholder="e.g. 150" style={inputStyle} />
          </div>
          <button
            onClick={handleAddReport}
            disabled={adding || !regionName || !caseCount}
            style={{
              padding: '12px', borderRadius: 10, border: 'none',
              background: !regionName || !caseCount ? '#333' : 'linear-gradient(135deg, #ff4444, #cc2222)',
              color: '#fff', cursor: adding || !regionName || !caseCount ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 600,
            }}
          >
            {adding ? 'Adding…' : 'Add to Map'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
