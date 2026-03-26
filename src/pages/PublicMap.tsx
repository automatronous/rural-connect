import DiseaseHeatmap from '../components/DiseaseHeatmap';
import { PublicHeader } from '../components/PublicHeader';

export default function PublicMap() {
  return (
    <div className="app-shell min-h-screen">
      <PublicHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <DiseaseHeatmap
          title="Disease Map"
          description="Public realtime heatmap of disease reports across India. No login is required to inspect current case distribution."
        />
      </main>
    </div>
  );
}
