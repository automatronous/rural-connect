import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Check } from 'lucide-react';

const SYMPTOM_GROUPS: { label: string; emoji: string; symptoms: string[] }[] = [
  {
    label: 'Fever & Temperature', emoji: '🌡️',
    symptoms: ['high_fever','mild_fever','shivering','chills','sweating'],
  },
  {
    label: 'Respiratory', emoji: '🫁',
    symptoms: ['cough','breathlessness','chest_pain','phlegm','mucoid_sputum','blood_in_sputum','continuous_sneezing','congestion','rusty_sputum'],
  },
  {
    label: 'Digestive', emoji: '🤢',
    symptoms: ['vomiting','nausea','diarrhoea','constipation','abdominal_pain','stomach_pain','belly_pain','indigestion','acidity','stomach_bleeding','bloody_stool','distention_of_abdomen','passage_of_gases','swelling_of_stomach','pain_during_bowel_movements','pain_in_anal_region','irritation_in_anus'],
  },
  {
    label: 'Neurological', emoji: '🧠',
    symptoms: ['headache','dizziness','loss_of_balance','altered_sensorium','slurred_speech','spinning_movements','unsteadiness','coma','depression','anxiety','mood_swings','lack_of_concentration','loss_of_smell','blurred_and_distorted_vision','visual_disturbances','weakness_of_one_body_side'],
  },
  {
    label: 'Musculoskeletal', emoji: '🦴',
    symptoms: ['joint_pain','muscle_pain','back_pain','neck_pain','knee_pain','hip_joint_pain','muscle_weakness','muscle_wasting','stiff_neck','movement_stiffness','painful_walking','swelling_joints','weakness_in_limbs','cramps'],
  },
  {
    label: 'Skin', emoji: '🩺',
    symptoms: ['skin_rash','itching','nodal_skin_eruptions','skin_peeling','pus_filled_pimples','blackheads','blister','red_spots_over_body','yellow_crust_ooze','silver_like_dusting','dischromic_patches','red_sore_around_nose','bruising'],
  },
  {
    label: 'Liver / Jaundice', emoji: '🟡',
    symptoms: ['yellowish_skin','yellowing_of_eyes','dark_urine','yellow_urine','acute_liver_failure','internal_itching'],
  },
  {
    label: 'Urinary', emoji: '💧',
    symptoms: ['burning_micturition','bladder_discomfort','continuous_feel_of_urine','foul_smell_of_urine','spotting_urination'],
  },
  {
    label: 'Eyes / ENT', emoji: '👁️',
    symptoms: ['redness_of_eyes','watering_from_eyes','throat_irritation','patches_in_throat','enlarged_thyroid','sinus_pressure','runny_nose'],
  },
  {
    label: 'General / Other', emoji: '⚡',
    symptoms: ['fatigue','lethargy','malaise','dehydration','loss_of_appetite','weight_loss','weight_gain','obesity','restlessness','irritability','fast_heart_rate','palpitations','fluid_overload','swelled_lymph_nodes','swollen_legs','swollen_blood_vessels','swollen_extremeties','prominent_veins_on_calf','puffy_face_and_eyes','cold_hands_and_feets','sunken_eyes','brittle_nails','small_dents_in_nails','inflammatory_nails','abnormal_menstruation','polyuria','excessive_hunger','increased_appetite','irregular_sugar_level','family_history','history_of_alcohol_consumption','extra_marital_contacts','receiving_blood_transfusion','receiving_unsterile_injections','toxic_look_(typhos)','ulcers_on_tongue','drying_and_tingling_lips','pain_behind_the_eyes','scurring'],
  },
];

interface SymptomSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  accent?: string;
}

export default function SymptomSelector({ selected, onChange, accent = '#ff4444' }: SymptomSelectorProps) {
  const [search, setSearch] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleSymptom = (s: string) => {
    onChange(selected.includes(s) ? selected.filter(x => x !== s) : [...selected, s]);
  };

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return SYMPTOM_GROUPS;
    const q = search.toLowerCase().replace(/ /g, '_');
    return SYMPTOM_GROUPS
      .map(g => ({ ...g, symptoms: g.symptoms.filter(s => s.includes(q)) }))
      .filter(g => g.symptoms.length > 0);
  }, [search]);

  const isSearching = search.trim().length > 0;

  return (
    <div>
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search symptoms..."
          style={{
            width: '100%', padding: '10px 12px 10px 34px',
            background: 'rgba(255,255,255,0.06)', border: `1px solid ${search ? accent + '66' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box',
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16 }}
          >×</button>
        )}
      </div>

      {/* Selected count */}
      {selected.length > 0 && (
        <div style={{
          marginBottom: 10, padding: '8px 12px', borderRadius: 8,
          background: `${accent}15`, border: `1px solid ${accent}33`,
          fontSize: 12, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>{selected.length} symptom{selected.length > 1 ? 's' : ''} selected</span>
          <button
            onClick={() => onChange([])}
            style={{ background: 'none', border: 'none', color: accent, cursor: 'pointer', fontSize: 11, textDecoration: 'underline' }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Groups */}
      <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filteredGroups.map(g => {
          const isOpen = isSearching || openGroups[g.label];
          const groupSelected = g.symptoms.filter(s => selected.includes(s)).length;
          return (
            <div key={g.label} style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
              {/* Group header */}
              <button
                onClick={() => toggleGroup(g.label)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                  border: 'none', cursor: 'pointer', color: '#fff', transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{g.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{g.label}</span>
                  {groupSelected > 0 && (
                    <span style={{ padding: '2px 8px', borderRadius: 20, background: `${accent}22`, color: accent, fontSize: 10, fontWeight: 700 }}>
                      {groupSelected}
                    </span>
                  )}
                </div>
                {isOpen ? <ChevronDown size={14} color="#888" /> : <ChevronRight size={14} color="#888" />}
              </button>

              {/* Symptoms grid */}
              {isOpen && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 4, padding: '8px 10px 10px' }}>
                  {g.symptoms.map(s => {
                    const isSelected = selected.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleSymptom(s)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                          border: `1px solid ${isSelected ? accent + '55' : 'rgba(255,255,255,0.06)'}`,
                          background: isSelected ? `${accent}15` : 'rgba(255,255,255,0.02)',
                          color: isSelected ? accent : '#aaa',
                          fontSize: 11, fontWeight: isSelected ? 600 : 400,
                          transition: 'all 0.15s', textAlign: 'left',
                        }}
                      >
                        <div style={{
                          width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                          border: `1.5px solid ${isSelected ? accent : 'rgba(255,255,255,0.15)'}`,
                          background: isSelected ? accent : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {isSelected && <Check size={9} color="#000" strokeWidth={3} />}
                        </div>
                        {s.replace(/_/g, ' ')}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
