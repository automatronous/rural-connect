import type { PredictionView } from '../lib/types';
import { formatDate } from '../lib/utils';

export function PredictionHistoryTable({
  predictions,
  includePatient = false,
}: {
  predictions: PredictionView[];
  includePatient?: boolean;
}) {
  return (
    <div className="table-shell">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="table-head">
            <tr>
              {includePatient ? <th className="table-cell">Patient</th> : null}
              <th className="table-cell">Predicted Disease</th>
              <th className="table-cell">Confidence</th>
              <th className="table-cell">Doctor</th>
              <th className="table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {predictions.length ? (
              predictions.map((prediction) => (
                <tr key={prediction.id} className="border-t border-cs-surface-high">
                  {includePatient ? <td className="table-cell">{prediction.patientName}</td> : null}
                  <td className="table-cell font-medium text-cs-ink">{prediction.predicted_disease}</td>
                  <td className="table-cell">{prediction.confidence.toFixed(1)}%</td>
                  <td className="table-cell">{prediction.doctorName}</td>
                  <td className="table-cell">{formatDate(prediction.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="table-cell py-8 text-center text-cs-ink-secondary" colSpan={includePatient ? 5 : 4}>
                  No predictions saved yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
