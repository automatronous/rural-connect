import { useEffect, useMemo, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { ChevronDown, ChevronUp, Mic, MicOff, Search } from 'lucide-react';
import { getSymptoms } from '../lib/api';
import { SYMPTOM_CATEGORY_ORDER } from '../lib/constants';
import { formatLabel, getSymptomCategory, normalizeSymptomKey, unique } from '../lib/utils';

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  onChange: (symptoms: string[]) => void;
}

const MAX_VOICE_PHRASE_WORDS = 5;

function buildTranscriptSegments(transcript: string) {
  const words = transcript.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const compactTranscript = normalizeSymptomKey(transcript);
  const segments = new Set<string>(compactTranscript ? [compactTranscript] : []);

  for (let phraseLength = 1; phraseLength <= Math.min(MAX_VOICE_PHRASE_WORDS, words.length); phraseLength += 1) {
    for (let index = 0; index <= words.length - phraseLength; index += 1) {
      segments.add(normalizeSymptomKey(words.slice(index, index + phraseLength).join(' ')));
    }
  }

  return { compactTranscript, segments };
}

function buildSymptomAliases(symptom: string) {
  const compactSymptom = normalizeSymptomKey(symptom);
  const compactLabel = normalizeSymptomKey(formatLabel(symptom));
  return Array.from(new Set([compactSymptom, compactLabel])).filter(Boolean);
}

export default function SymptomSelector({ selectedSymptoms, onChange }: SymptomSelectorProps) {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
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
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition({
    clearTranscriptOnListen: true,
  });

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
      void SpeechRecognition.abortListening();
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

  const symptomAliases = useMemo(
    () => symptoms.map((symptom) => ({ symptom, aliases: buildSymptomAliases(symptom) })),
    [symptoms],
  );

  const liveTranscript = useMemo(() => {
    return `${finalTranscript} ${interimTranscript}`.trim() || transcript.trim();
  }, [finalTranscript, interimTranscript, transcript]);

  const voiceMatches = useMemo(() => {
    if (!liveTranscript) return [];

    const { compactTranscript, segments } = buildTranscriptSegments(liveTranscript);
    return symptomAliases
      .filter(({ aliases }) => aliases.some((alias) => segments.has(alias) || compactTranscript.includes(alias)))
      .map(({ symptom }) => symptom);
  }, [liveTranscript, symptomAliases]);

  useEffect(() => {
    if (!voiceMatches.length) {
      return;
    }

    const nextSymptoms = unique([...selectedSymptoms, ...voiceMatches]);
    if (nextSymptoms.length !== selectedSymptoms.length) {
      onChange(nextSymptoms);
    }
  }, [onChange, selectedSymptoms, voiceMatches]);

  function toggleSymptom(symptom: string) {
    if (selectedSymptoms.includes(symptom)) {
      onChange(selectedSymptoms.filter((entry) => entry !== symptom));
      return;
    }

    onChange([...selectedSymptoms, symptom]);
  }

  async function handleVoiceToggle() {
    setVoiceError(null);

    if (listening) {
      await SpeechRecognition.stopListening();
      return;
    }

    try {
      resetTranscript();
      await SpeechRecognition.startListening({
        continuous: true,
        interimResults: true,
        language: 'en-US',
      });
    } catch (startError) {
      setVoiceError(startError instanceof Error ? startError.message : 'Unable to start voice input.');
    }
  }

  return (
    <div className="panel-card space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-display text-xl font-bold text-cs-ink">Symptom Selector</h3>
          <p className="mt-1 text-sm text-cs-ink-secondary">{selectedSymptoms.length} symptom(s) selected</p>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <div className="relative flex-1 md:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cs-ink-secondary/40" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="field-input pl-10"
              placeholder="Search symptoms"
            />
          </div>
          {browserSupportsSpeechRecognition ? (
            <button
              type="button"
              onClick={() => void handleVoiceToggle()}
              className={`flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all ${
                listening
                  ? 'bg-cs-primary text-white shadow-sm'
                  : 'border border-cs-outline bg-white text-cs-primary hover:bg-cs-primary-light'
              }`}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {listening ? 'Stop mic' : 'Start mic'}
            </button>
          ) : null}
          <button type="button" className="secondary-button whitespace-nowrap" onClick={() => onChange([])}>
            Clear all
          </button>
        </div>
      </div>

      {loading ? <p className="text-cs-ink-secondary">Loading symptoms...</p> : null}
      {error ? <p className="text-cs-error">{error}</p> : null}

      {browserSupportsSpeechRecognition ? (
        <div className="rounded-[20px] border border-cs-outline bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-cs-ink">Voice input</p>
              <p className="mt-1 text-sm text-cs-ink-secondary">
                {listening
                  ? 'Listening now. Say symptoms such as cough, headache, nausea, or skin rash.'
                  : 'Use the microphone to dictate symptoms and auto-select matching entries.'}
              </p>
            </div>
            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                listening ? 'bg-cs-primary-light text-cs-primary' : 'bg-cs-surface-low text-cs-ink-secondary'
              }`}
            >
              {listening ? 'Listening' : 'Idle'}
            </span>
          </div>

          <div className="mt-4 rounded-2xl bg-cs-surface-low px-4 py-3 text-sm text-cs-ink">
            {liveTranscript || 'Your live transcript will appear here while the microphone is active.'}
          </div>

          {!isMicrophoneAvailable ? (
            <p className="mt-3 text-sm text-cs-error">
              Microphone access is blocked. Enable microphone permissions in your browser to use voice input.
            </p>
          ) : null}

          {voiceError ? <p className="mt-3 text-sm text-cs-error">{voiceError}</p> : null}

          {voiceMatches.length ? (
            <p className="mt-3 text-sm text-cs-ink-secondary">
              Auto-selected from speech: {voiceMatches.map((symptom) => formatLabel(symptom)).join(', ')}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="rounded-[20px] border border-amber-200 bg-cs-warning-light px-4 py-3 text-sm text-cs-warning">
          Voice input is not supported in this browser.
        </div>
      )}

      <div className="space-y-3">
        {groupedSymptoms.map((group) => (
          <div key={group.category} className="overflow-hidden rounded-2xl border border-cs-outline bg-white">
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
              <span className="font-display text-sm font-bold text-cs-ink">{group.category}</span>
              {openSections[group.category] ? (
                <ChevronUp className="h-4 w-4 text-cs-ink-secondary" />
              ) : (
                <ChevronDown className="h-4 w-4 text-cs-ink-secondary" />
              )}
            </button>

            {openSections[group.category] ? (
              <div className="grid gap-2 border-t border-cs-outline px-5 pb-4 pt-4 md:grid-cols-2 xl:grid-cols-3">
                {group.symptoms.map((symptom) => (
                  <label
                    key={symptom}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3 text-sm transition-all ${
                      selectedSymptoms.includes(symptom)
                        ? 'bg-cs-primary-light ring-1 ring-cs-primary/20 text-cs-ink'
                        : 'bg-cs-surface-low text-cs-ink-secondary hover:bg-cs-surface-mid'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSymptoms.includes(symptom)}
                      onChange={() => toggleSymptom(symptom)}
                      className="mt-0.5 h-4 w-4 rounded border-cs-outline text-cs-primary focus:ring-cs-primary"
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
