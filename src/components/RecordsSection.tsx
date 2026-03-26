import { useState } from 'react';
import type { MedicalRecordView } from '../lib/types';
import { formatDate } from '../lib/utils';

interface UploadPayload {
  file: File;
  recordType: string;
  notes: string;
}

interface RecordsSectionProps {
  title: string;
  description: string;
  records: MedicalRecordView[];
  onUpload?: (payload: UploadPayload) => Promise<void>;
  uploading?: boolean;
}

export function RecordsSection({
  title,
  description,
  records,
  onUpload,
  uploading = false,
}: RecordsSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [recordType, setRecordType] = useState('Blood Test');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    if (!onUpload) return;
    if (!file) {
      setError('Choose a PDF or image first.');
      return;
    }

    setError(null);
    await onUpload({ file, recordType, notes });
    setFile(null);
    setNotes('');
    setRecordType('Blood Test');
  }

  return (
    <div className="space-y-6">
      <div className="panel-card">
        <h2 className="heading-orbitron text-2xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-white/65">{description}</p>

        {onUpload ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*,application/pdf"
                className="field-input"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="field-textarea"
                placeholder="Notes for this record"
              />
            </div>

            <div className="space-y-4">
              <select
                value={recordType}
                onChange={(event) => setRecordType(event.target.value)}
                className="field-select"
              >
                {['Blood Test', 'X-Ray', 'MRI', 'Prescription', 'ECG', 'Other'].map((option) => (
                  <option key={option} value={option} className="bg-[#0b1118]">
                    {option}
                  </option>
                ))}
              </select>

              <button type="button" onClick={handleUpload} className="primary-button w-full" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Record'}
              </button>

              {file ? (
                <p className="text-sm text-white/60">
                  Selected file: <span className="text-white">{file.name}</span>
                </p>
              ) : null}

              {error ? <p className="text-sm text-red-300">{error}</p> : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="table-shell">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="table-head">
              <tr>
                <th className="table-cell">File Name</th>
                <th className="table-cell">Type</th>
                <th className="table-cell">Date</th>
                <th className="table-cell">Uploaded By</th>
                <th className="table-cell text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {records.length ? (
                records.map((record) => (
                  <tr key={record.id}>
                    <td className="table-cell font-medium text-white">{record.file_name ?? 'Untitled file'}</td>
                    <td className="table-cell">{record.record_type ?? 'Other'}</td>
                    <td className="table-cell">{formatDate(record.upload_date ?? record.created_at)}</td>
                    <td className="table-cell">{record.uploaderName}</td>
                    <td className="table-cell text-right">
                      {record.downloadUrl ? (
                        <a
                          href={record.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="secondary-button inline-flex py-2"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-white/40">Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="table-cell py-8 text-center text-white/50" colSpan={5}>
                    No records uploaded yet.
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
