import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingScreen } from '../../components/LoadingScreen';
import { fetchPatientListRows, filterPatientRows } from '../../lib/data';
import type { PatientListRow } from '../../lib/types';
import { formatDate } from '../../lib/utils';

export default function DoctorPatients() {
  const [rows, setRows] = useState<PatientListRow[]>([]);
  const [predictionOptions, setPredictionOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [predictedDisease, setPredictedDisease] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    void fetchPatientListRows()
      .then((result) => {
        setRows(result.rows);
        setPredictionOptions(result.predictionOptions);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Failed to load patients.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(
    () => filterPatientRows(rows, search, predictedDisease, fromDate, toDate),
    [fromDate, predictedDisease, rows, search, toDate],
  );

  if (loading) {
    return <LoadingScreen label="Loading patients..." />;
  }

  return (
    <div className="space-y-6">
      <section className="panel-card">
        <h1 className="heading-orbitron text-3xl font-bold text-white">Patients</h1>
        <p className="mt-3 text-white/60">
          Search by name or email, filter by latest predicted disease, and narrow results by last visit date.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr_0.85fr_0.85fr]">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="field-input"
            placeholder="Search name or email"
          />

          <select
            value={predictedDisease}
            onChange={(event) => setPredictedDisease(event.target.value)}
            className="field-select"
          >
            <option value="" className="bg-[#0b1118]">
              All predicted diseases
            </option>
            {predictionOptions.map((option) => (
              <option key={option} value={option} className="bg-[#0b1118]">
                {option}
              </option>
            ))}
          </select>

          <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="field-input" />
          <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="field-input" />
        </div>
      </section>

      {error ? <div className="panel-card text-red-300">{error}</div> : null}

      <div className="table-shell">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="table-head">
              <tr>
                <th className="table-cell">Name</th>
                <th className="table-cell">Age</th>
                <th className="table-cell">Blood Group</th>
                <th className="table-cell">Last Visit</th>
                <th className="table-cell">Last Predicted Disease</th>
                <th className="table-cell text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredRows.length ? (
                filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td className="table-cell">
                      <div className="font-medium text-white">{row.name}</div>
                      <div className="text-xs text-white/50">{row.email}</div>
                    </td>
                    <td className="table-cell">{row.age ?? 'N/A'}</td>
                    <td className="table-cell">{row.blood_group ?? 'N/A'}</td>
                    <td className="table-cell">{formatDate(row.lastVisitDate)}</td>
                    <td className="table-cell">{row.lastPredictedDisease ?? 'N/A'}</td>
                    <td className="table-cell text-right">
                      <Link to={`/doctor/patients/${row.id}`} className="secondary-button inline-flex py-2">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="table-cell py-8 text-center text-white/50" colSpan={6}>
                    No patients match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
