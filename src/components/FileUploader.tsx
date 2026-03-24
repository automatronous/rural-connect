import React, { useState, useRef } from 'react';
import { Upload, File, X, Image } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
}

export default function FileUploader({ onFileSelect, accept = '.pdf,.jpg,.jpeg,.png', maxSizeMB = 20 }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setError('');
    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large (max ${maxSizeMB}MB)`);
      return;
    }
    setFile(f);
    onFileSelect(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const isPDF = file?.name.toLowerCase().endsWith('.pdf');

  return (
    <div>
      <div
        style={{
          border: `2px dashed ${dragging ? '#4488ff' : file ? '#00cc66' : 'rgba(255,255,255,0.15)'}`,
          borderRadius: 12,
          padding: file ? '16px' : '32px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          background: dragging ? 'rgba(68,136,255,0.05)' : file ? 'rgba(0,204,102,0.05)' : 'rgba(255,255,255,0.02)',
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {file ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: 'rgba(0,204,102,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {isPDF ? <File size={20} color="#00cc66" /> : <Image size={20} color="#00cc66" />}
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{file.name}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); setFile(null); }}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 4 }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <Upload size={28} color="#4488ff" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14, color: '#fff', marginBottom: 6 }}>
              {dragging ? 'Drop file here' : 'Click or drag to upload'}
            </div>
            <div style={{ fontSize: 11, color: '#666' }}>PDF, JPG, PNG up to {maxSizeMB}MB</div>
          </>
        )}
      </div>
      {error && <div style={{ color: '#ff4444', fontSize: 12, marginTop: 8 }}>{error}</div>}
      <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  );
}
