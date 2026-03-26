import { useEffect, useMemo, useState } from 'react';
import { getSymptoms } from '../lib/api';
import { SYMPTOM_CATEGORY_ORDER } from '../lib/constants';
import { formatLabel, getSymptomCategory } from '../lib/utils';

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  onChange: (symptoms: string[]) => void;
}

export default function SymptomSelector({ selectedSymptoms, onChange }: SymptomSelectorProps) {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Fever: true,
    Respiratory: true,
    Digestive: true,
    Neurological: true,
    Musculoskeletal: true,
    Skin: true,
    Liver: true,
    Urinary: true,
    'Eyes/ENT': true,
    General: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSymptoms() {
      try {
        const nextSymptoms = await getSymptoms();
        if (active) {
          setSymptoms(nextSymptoms);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load symptoms.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSymptoms();

    return () => {
      active = false;
    };
  }, []);

  const filteredSymptoms = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return symptoms;

    return symptoms.filter((symptom) => {
      const label = formatLabel(symptom).toLowerCase();
      return label.includes(normalizedSearch) || symptom.toLowerCase().includes(normalizedSearch);
    });
  }, [search, symptoms]);

  const groupedSymptoms = useMemo(
    () =>
      SYMPTOM_CATEGORY_ORDER.map((category) => ({
        category,
        symptoms: filteredSymptoms.filter((symptom) => getSymptomCategory(symptom) === category),
      })).filter((group) => group.symptoms.length),
    [filteredSymptoms],
  );

  function toggleSymptom(symptom: string) {
    if (selectedSymptoms.includes(symptom)) {
      onChange(selectedSymptoms.filter((entry) => entry !== symptom));
      return;
    }

    onChange([...selectedSymptoms, symptom]);
  }

  return (
    <div className="panel-card space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="heading-orbitron text-2xl font-bold text-white">Symptom Selector</h3>
          <p className="mt-2 text-sm text-white/60">{selectedSymptoms.length} symptom(s) selected</p>
        </div>

        <div className="flex w-full gap-3 md:w-auto">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="field-input md:min-w-[280px]"
            placeholder="Search symptoms"
          />
          <button type="button" className="secondary-button whitespace-nowrap" onClick={() => onChange([])}>
            Clear all
          </button>
        </div>
      </div>

      {loading ? <p className="text-white/60">Loading symptoms...</p> : null}
      {error ? <p className="text-red-300">{error}</p> : null}

      <div className="space-y-3">
        {groupedSymptoms.map((group) => (
          <div key={group.category} className="rounded-2xl border border-white/10 bg-black/10">
            <button
              type="button"
              onClick={() =>
                setOpenSections((current) => ({
                  ...current,
                  [group.category]: !current[group.category],
                }))
              }
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="heading-orbitron text-sm font-semibold text-white">{group.category}</span>
              <span className="text-sm text-white/50">{openSections[group.category] ? 'Hide' : 'Show'}</span>
            </button>

            {openSections[group.category] ? (
              <div className="grid gap-3 border-t border-white/10 px-5 py-4 md:grid-cols-2 xl:grid-cols-3">
                {group.symptoms.map((symptom) => (
                  <label
                    key={symptom}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/85 transition hover:bg-white/[0.06]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSymptoms.includes(symptom)}
                      onChange={() => toggleSymptom(symptom)}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-red-500 focus:ring-red-500"
                    />
                    <span>{formatLabel(symptom)}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
