import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
// Removed RealtimeChannelStatus import
import L from 'leaflet';
import { Activity, AlertTriangle, LoaderCircle, Radio, RefreshCw } from 'lucide-react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { addTestPatientLocation, fetchDoctorLocations, subscribeToPatientLocations } from '../lib/data';
import type { LocationPoint } from '../lib/types';

const MUMBAI_CENTER: [number, number] = [19.076, 72.8777];
const HEATMAP_LIMIT = 250;
const HEATMAP_GRADIENT: Record<number, string> = {
  0.2: '#3b0505',
  0.45: '#7a0d0d',
  0.7: '#d41f1f',
  1: '#ff5757',
};

type FeedState = 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR' | string | 'CONNECTING';

function sortLocations(points: LocationPoint[]) {
  return [...points]
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    .slice(0, HEATMAP_LIMIT);
}

function upsertLocation(points: LocationPoint[], nextLocation: LocationPoint) {
  return sortLocations([nextLocation, ...points.filter((point) => point.id !== nextLocation.id)]);
}

function formatRelativeTime(value: string | null) {
  if (!value) return 'Waiting for live data';

  const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (diffSeconds < 15) return 'Just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
}

function formatFeedStatus(status: FeedState) {
  switch (status) {
    case 'SUBSCRIBED':
      return 'Live feed connected';
    case 'CHANNEL_ERROR':
      return 'Realtime unavailable';
    case 'TIMED_OUT':
      return 'Realtime timed out';
    case 'CLOSED':
      return 'Realtime closed';
    case 'CONNECTING':
      return 'Connecting feed';
    default:
      return 'Syncing feed';
  }
}

function statusClasses(status: FeedState) {
  if (status === 'SUBSCRIBED') {
    return 'border-emerald-500/30 bg-emerald-500/[0.12] text-emerald-200';
  }

  if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
    return 'border-red-500/30 bg-red-500/[0.12] text-red-200';
  }

  return 'border-white/10 bg-white/[0.06] text-white/75';
}

function MapResizer() {
  const map = useMap();

  useEffect(() => {
    const invalidateSize = () => map.invalidateSize();
    const timer = window.setTimeout(invalidateSize, 0);

    window.addEventListener('resize', invalidateSize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', invalidateSize);
    };
  }, [map]);

  return null;
}

function HeatLayer({ points }: { points: Array<[number, number, number]> }) {
  const map = useMap();
  const layerRef = useRef<L.HeatLayer | null>(null);

  useEffect(() => {
    const layer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 15,
      minOpacity: 0.32,
      gradient: HEATMAP_GRADIENT,
    }).addTo(map);

    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    layerRef.current?.setLatLngs(points);
  }, [points]);

  return null;
}

export default function DoctorHeatMap() {
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [addingTestPoint, setAddingTestPoint] = useState(false);
  const [feedState, setFeedState] = useState<FeedState>('CONNECTING');

  const loadLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionError(null);

    try {
      const nextLocations = await fetchDoctorLocations(HEATMAP_LIMIT);
      startTransition(() => {
        setLocations(sortLocations(nextLocations));
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load patient locations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    void loadLocations();

    const unsubscribe = subscribeToPatientLocations({
      onInsert: (location) => {
        if (!active) return;

        startTransition(() => {
          setLocations((current) => upsertLocation(current, location));
        });
      },
      onStatus: (status) => {
        if (!active) return;

        setFeedState(status);

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setActionError('Realtime updates paused. Reload the feed to reconnect.');
          return;
        }

        setActionError(null);
      },
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [loadLocations]);

  const heatPoints = useMemo(
    () => locations.map((location) => [location.lat, location.lng, location.intensity] as [number, number, number]),
    [locations],
  );

  const averageIntensity = useMemo(() => {
    if (!locations.length) return 0;
    const total = locations.reduce((sum, location) => sum + location.intensity, 0);
    return Math.round((total / locations.length) * 100);
  }, [locations]);

  const latestLocation = locations[0] ?? null;
  const latestClusters = useMemo(() => locations.slice(0, 5), [locations]);

  async function handleAddTestPoint() {
    setActionError(null);
    setAddingTestPoint(true);

    try {
      const createdLocation = await addTestPatientLocation();
      startTransition(() => {
        setLocations((current) => upsertLocation(current, createdLocation));
      });
    } catch (createError) {
      setActionError(createError instanceof Error ? createError.message : 'Failed to add a test patient location.');
    } finally {
      setAddingTestPoint(false);
    }
  }

  return (
    <section id="doctor-live-heatmap" className="doctor-heatmap-shell space-y-6">
      <div className="panel-card overflow-hidden p-0">
        <div className="flex flex-col gap-5 border-b border-white/10 bg-[linear-gradient(135deg,rgba(255,77,77,0.16),rgba(255,77,77,0.03)_40%,rgba(0,0,0,0)_100%)] px-6 py-6 md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.34em] text-red-200/70">Doctor-Only Live Heatmap</p>
              <h2 className="heading-orbitron mt-3 text-3xl font-bold text-white md:text-4xl">
                Live patient location density around Mumbai
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/65 md:text-base">
                Monitor patient movement as a live density layer, subscribe to new Supabase location events instantly,
                and use the built-in test button to verify the feed without opening any patient-facing UI.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <button
                type="button"
                onClick={() => void loadLocations()}
                className="secondary-button inline-flex items-center justify-center gap-2"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Reload feed
              </button>
              <button
                type="button"
                onClick={handleAddTestPoint}
                className="primary-button inline-flex items-center justify-center gap-2"
                disabled={addingTestPoint}
              >
                {addingTestPoint ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                {addingTestPoint ? 'Adding test point...' : 'Add Test Patient Location'}
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Live pings</p>
              <p className="mt-3 text-3xl font-semibold text-white">{locations.length}</p>
              <p className="mt-2 text-sm text-white/55">Latest {HEATMAP_LIMIT} patient events retained for rendering.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Mean intensity</p>
              <p className="mt-3 text-3xl font-semibold text-white">{averageIntensity}%</p>
              <p className="mt-2 text-sm text-white/55">Heat radius 25, blur 15, red weighted gradient.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Latest activity</p>
              <p className="mt-3 text-3xl font-semibold text-white">{formatRelativeTime(latestLocation?.created_at ?? null)}</p>
              <p className="mt-2 text-sm text-white/55">Centered on Mumbai at 19.0760, 72.8777.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 px-4 py-4 md:px-6 md:py-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#06070b]">
            <div className="absolute left-4 top-4 z-[500] flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium ${statusClasses(feedState)}`}>
                <Radio className={`h-3.5 w-3.5 ${feedState === 'SUBSCRIBED' ? 'animate-pulse' : ''}`} />
                {formatFeedStatus(feedState)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#080a0f]/85 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-md">
                <Activity className="h-3.5 w-3.5 text-red-300" />
                Doctor access only
              </span>
            </div>

            <div className="h-[52vh] min-h-[340px] w-full md:h-[62vh]">
              <MapContainer
                center={MUMBAI_CENTER}
                zoom={11}
                zoomControl={false}
                scrollWheelZoom
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution="&copy; OpenStreetMap &copy; CARTO"
                />
                <HeatLayer points={heatPoints} />
                <MapResizer />
                <ZoomControl position="bottomright" />
              </MapContainer>
            </div>

            <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-2xl border border-white/10 bg-[#080a0f]/[0.88] px-4 py-4 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Heat legend</p>
              <div className="mt-3 h-2.5 w-40 rounded-full bg-[linear-gradient(90deg,#3b0505_0%,#7a0d0d_38%,#d41f1f_72%,#ff5757_100%)]" />
              <div className="mt-2 flex items-center justify-between text-[11px] text-white/55">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {loading && !locations.length ? (
              <div className="absolute inset-0 z-[550] flex items-center justify-center bg-[#05070a]/68 backdrop-blur-sm">
                <div className="rounded-3xl border border-white/10 bg-black/[0.35] px-6 py-5 text-center">
                  <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-red-300" />
                  <p className="mt-3 text-sm font-medium text-white">Loading live patient locations...</p>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-4">
            {(error || actionError) ? (
              <div className="rounded-2xl border border-red-500/[0.25] bg-red-500/10 p-4 text-sm text-red-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-100">Feed attention needed</p>
                    <p className="mt-1 text-red-200/85">{actionError ?? error}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="panel-card space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">Recent hotspots</p>
                  <h3 className="heading-orbitron mt-2 text-xl font-bold text-white">Live event stream</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                  {locations.length} total
                </span>
              </div>

              {latestClusters.length ? (
                <div className="space-y-3">
                  {latestClusters.map((location, index) => (
                    <article
                      key={location.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.24em] text-red-200/70">
                            Cluster {String(index + 1).padStart(2, '0')}
                          </p>
                          <p className="mt-2 text-sm font-medium text-white">
                            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                          </p>
                        </div>
                        <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-200">
                          {Math.round(location.intensity * 100)}%
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
                        <Activity className="h-3.5 w-3.5 text-red-300" />
                        <span>{formatRelativeTime(location.created_at)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-10 text-center">
                  <p className="text-sm text-white/65">No live patient points yet.</p>
                  <p className="mt-2 text-xs text-white/45">
                    Use the test button to drop a random Mumbai patient point and verify instant updates.
                  </p>
                </div>
              )}
            </div>

            <div className="panel-card p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-white/45">Operational notes</p>
              <div className="mt-4 space-y-3 text-sm text-white/65">
                <div className="flex items-start gap-3">
                  <Activity className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                  <p>Only authenticated doctors can read the location feed. Patients have no route or read policy for this dashboard layer.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Activity className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                  <p>Locations are append-only events, which keeps realtime updates predictable and avoids map flicker during live inserts.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Activity className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                  <p>The test button inserts randomized Mumbai coordinates directly through Supabase so every open doctor dashboard receives the same live event.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
