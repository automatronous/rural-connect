import DiseaseHeatmap from '../../components/DiseaseHeatmap';

export default function PatientMap() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-cs-ink">Disease Heatmap</h1>
      <DiseaseHeatmap
        title="Disease Map"
        description="Track public disease reports and outbreak intensity nationwide from your patient workspace."
      />
    </div>
  );
}
