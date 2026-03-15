// ── Mock AI Diagnosis Result ───────────────────────────────────
// In production this would be replaced by an API response.

export const mockDiagnosisResult = {
  diagnosisId: 'DX-20260313-001',
  timestamp: '2026-03-13T10:45:00',
  conditions: [
    {
      id: 'c1',
      name: 'Viral Upper Respiratory Infection',
      confidence: 82,
      severity: 'Moderate',      // Low | Moderate | High | Critical
      description:
        'A common viral infection affecting the nose, throat, and airways. Symptoms typically resolve within 7–10 days with rest and symptomatic treatment.',
      medications: [
        { name: 'Paracetamol 500 mg',  dose: 'Every 6 hrs as needed', note: 'For fever & pain' },
        { name: 'Cetirizine 10 mg',    dose: 'Once daily at night',  note: 'For congestion'   },
        { name: 'ORS Sachets',         dose: '2–3 per day',          note: 'Stay hydrated'    },
      ],
      careAdvice: [
        'Rest adequately and avoid exertion.',
        'Drink warm fluids — water, soup, herbal tea.',
        'Maintain good hand hygiene to prevent spread.',
        'Return to clinic if fever exceeds 103°F or breathing worsens.',
      ],
    },
    {
      id: 'c2',
      name: 'Seasonal Allergic Rhinitis',
      confidence: 61,
      severity: 'Low',
      description:
        'Inflammation of the nasal passages triggered by seasonal allergens such as pollen, dust, or mold spores.',
      medications: [
        { name: 'Loratadine 10 mg', dose: 'Once daily', note: 'Non-sedating antihistamine' },
      ],
      careAdvice: [
        'Avoid exposure to known allergens.',
        'Keep windows closed during high pollen season.',
        'Use a saline nasal rinse twice daily.',
      ],
    },
  ],
  referralRecommended: false,
  generatedBy: 'RuralCareConnect AI v0.1 (Prototype — Dummy Data)',
}
