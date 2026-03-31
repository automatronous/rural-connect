import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { createDiseaseReport, fetchPublicDiseaseReports, subscribeToDiseaseReports } from '../lib/data';
import { INDIA_CENTER, INDIA_ZOOM } from '../lib/constants';
import { formatDate, getDiseaseColor } from '../lib/utils';
import type { DiseaseReport } from '../lib/types';

interface DiseaseHeatmapProps {
  title: string;
  description: string;
  allowReporting?: boolean;
  doctorId?: string;
  diseaseOptions?: string[];
}

function buildPopupContent(report: DiseaseReport) {
  return `
    <div style="min-width: 200px; font-family: Inter, sans-serif;">
      <div style="color: #0066CC; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">${report.disease_name}</div>
      <div style="margin-top: 6px; font-size: 16px; font-weight: 700; color: #1A2B4A;">${report.region_name}</div>
      <div style="margin-top: 8px; color: #4A5568; font-size: 12px;">Cases: ${report.case_count}</div>
      <div style="margin-top: 3px; color: #4A5568; font-size: 12px;">Report Date: ${formatDate(report.report_date)}</div>
    </div>
  `;
}

export default function DiseaseHeatmap({
  title,
  description,
  allowReporting = false,
  doctorId,
  diseaseOptions = [],
}: DiseaseHeatmapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const heatLayersRef = useRef<Record<string, L.HeatLayer>>({});
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const [reports, setReports] = useState<DiseaseReport[]>([]);
  const [visibleDiseases, setVisibleDiseases] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [placingPin, setPlacingPin] = useState(false);
  const [draftLatLng, setDraftLatLng] = useState<L.LatLng | null>(null);
  const [regionName, setRegionName] = useState('');
  const [diseaseName, setDiseaseName] = useState('');
  const [caseCount, setCaseCount] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: INDIA_CENTER,
      zoom: INDIA_ZOOM,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', (event) => {
      if (!allowReporting || !placingPin) return;
      setDraftLatLng(event.latlng);
      setPlacingPin(false);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, [allowReporting, placingPin]);

  useEffect(() => {
    let active = true;

    async function loadReports() {
      try {
        const nextReports = await fetchPublicDiseaseReports();
        if (!active) return;

        setReports(nextReports);
        setVisibleDiseases((current) => {
          if (Object.keys(current).length) return current;
          return Object.fromEntries(
            Array.from(new Set(nextReports.map((report) => report.disease_name))).map((name) => [name, true]),
          );
        });
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load disease reports.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadReports();

    const unsubscribe = subscribeToDiseaseReports((report) => {
      setReports((current) => {
        if (current.some((existing) => existing.id === report.id)) return current;
        return [report, ...current];
      });
      setVisibleDiseases((current) => ({
        ...current,
        [report.disease_name]: current[report.disease_name] ?? true,
      }));
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const diseaseTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const report of reports) {
      totals.set(report.disease_name, (totals.get(report.disease_name) ?? 0) + report.case_count);
    }
    return Array.from(totals.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [reports]);

  const selectableDiseases = useMemo(() => {
    const liveDiseases = diseaseTotals.map((entry) => entry.name);
    return Array.from(new Set([...diseaseOptions, ...liveDiseases])).sort((left, right) => left.localeCompare(right));
  }, [diseaseOptions, diseaseTotals]);

  useEffect(() => {
    if (!diseaseName && selectableDiseases.length) {
      setDiseaseName(selectableDiseases[0]);
    }
  }, [diseaseName, selectableDiseases]);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!map || !markerLayer) return;

    for (const layer of Object.values(heatLayersRef.current)) {
      map.removeLayer(layer);
    }
    heatLayersRef.current = {};
    markerLayer.clearLayers();

    const maxCases = Math.max(...reports.map((report) => report.case_count), 1);

    for (const disease of Object.keys(visibleDiseases)) {
      if (!visibleDiseases[disease]) continue;

      const diseaseReports = reports.filter((report) => report.disease_name === disease);
      if (!diseaseReports.length) continue;

      const color = getDiseaseColor(disease);
      const points = diseaseReports.map(
        (report) => [report.lat, report.lng, Math.max(0.2, report.case_count / maxCases)] as [number, number, number],
      );

      const heatLayer = L.heatLayer(points, {
        radius: 28,
        blur: 24,
        minOpacity: 0.35,
        gradient: {
          0.2: color,
          0.55: color,
          1: '#ffffff',
        },
      });

      heatLayer.addTo(map);
      heatLayersRef.current[disease] = heatLayer;

      for (const report of diseaseReports) {
        const marker = L.circleMarker([report.lat, report.lng], {
          radius: Math.max(6, Math.min(16, Math.sqrt(report.case_count))),
          color,
          fillColor: color,
          fillOpacity: 0.5,
          weight: 1,
        });

        marker.bindPopup(buildPopupContent(report));
        marker.addTo(markerLayer);
      }
    }
  }, [reports, visibleDiseases]);

  async function handleSubmitReport() {
    if (!doctorId || !draftLatLng || !diseaseName || !regionName.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      await createDiseaseReport({
        disease_name: diseaseName,
        region_name: regionName.trim(),
        lat: Number(draftLatLng.lat.toFixed(6)),
        lng: Number(draftLatLng.lng.toFixed(6)),
        case_count: Number(caseCount),
        report_date: new Date().toISOString().slice(0, 10),
        reported_by: doctorId,
      });

      setDraftLatLng(null);
      setRegionName('');
      setCaseCount('1');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="panel-card">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cs-primary">{title}</p>
        <p className="mt-3 max-w-3xl text-sm text-cs-ink-secondary">{description}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="panel-card h-fit space-y-4 xl:sticky xl:top-28">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-cs-ink">Disease Layers</h2>
            <span className="text-xs text-cs-ink-secondary">{reports.length} reports</span>
          </div>

          {diseaseTotals.length ? (
            <div className="space-y-2">
              {diseaseTotals.map((entry) => (
                <label
                  key={entry.name}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-transparent bg-white px-4 py-3 transition-colors hover:border-cs-outline hover:bg-cs-primary-light"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={visibleDiseases[entry.name] ?? true}
                      onChange={() =>
                        setVisibleDiseases((current) => ({
                          ...current,
                          [entry.name]: !(current[entry.name] ?? true),
                        }))
                      }
                      className="h-4 w-4 rounded border-cs-outline text-cs-primary focus:ring-cs-primary"
                    />
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: getDiseaseColor(entry.name) }} />
                    <span className="text-sm text-cs-ink">{entry.name}</span>
                  </div>
                  <span className="text-sm text-cs-ink-secondary">{entry.total}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-cs-ink-secondary">{loading ? 'Loading reports...' : 'No reports available.'}</p>
          )}

          {error ? <p className="text-sm text-cs-error">{error}</p> : null}
        </aside>

        <div className="panel-card relative overflow-hidden p-0">
          <div ref={containerRef} className="h-[72vh] w-full rounded-2xl" />

          <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-2xl border border-cs-outline bg-white/95 p-4 backdrop-blur-md shadow-cs">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-cs-primary">Risk Levels</p>
            <div className="mt-2 space-y-1.5">
              {[
                { color: '#D64545', label: 'High Risk (>50 cases)' },
                { color: '#B7791F', label: 'Moderate Risk (10-50 cases)' },
                { color: '#1F9D55', label: 'Low Risk (<10 cases)' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs text-cs-ink-secondary">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {allowReporting ? (
            <>
              <button
                type="button"
                onClick={() => setPlacingPin((current) => !current)}
                className="absolute bottom-6 right-6 z-[500] flex h-14 w-14 items-center justify-center rounded-full bg-cs-primary text-3xl text-white shadow-cs-lg transition-colors hover:bg-cs-primary-dark"
                title="Add disease report"
              >
                +
              </button>

              {placingPin ? (
                <div className="absolute left-1/2 top-6 z-[500] -translate-x-1/2 rounded-full bg-cs-primary px-4 py-2 text-sm text-white shadow-cs">
                  Click anywhere on the map to place a report pin.
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      {allowReporting && draftLatLng ? (
        <div className="fixed inset-0 z-[700] flex items-center justify-center bg-cs-ink/20 px-4 backdrop-blur-sm">
          <div className="panel-card w-full max-w-xl space-y-5">
            <div>
              <h2 className="font-display text-2xl font-bold text-cs-ink">Add Disease Report</h2>
              <p className="mt-2 text-cs-ink-secondary">
                Lat {draftLatLng.lat.toFixed(6)}, Lng {draftLatLng.lng.toFixed(6)}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <select value={diseaseName} onChange={(event) => setDiseaseName(event.target.value)} className="field-select">
                {selectableDiseases.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={caseCount}
                onChange={(event) => setCaseCount(event.target.value)}
                className="field-input"
                placeholder="Case count"
              />
            </div>

            <input
              type="text"
              value={regionName}
              onChange={(event) => setRegionName(event.target.value)}
              className="field-input"
              placeholder="Region name"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <input type="text" value={draftLatLng.lat.toFixed(6)} readOnly className="field-input" />
              <input type="text" value={draftLatLng.lng.toFixed(6)} readOnly className="field-input" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" className="secondary-button" onClick={() => setDraftLatLng(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={handleSubmitReport}
                disabled={submitting || !regionName.trim() || !caseCount}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
