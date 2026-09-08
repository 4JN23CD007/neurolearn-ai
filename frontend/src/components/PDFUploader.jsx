import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { transformAPI } from '../services/api';
import { useAppStore } from '../context/store';
import toast from 'react-hot-toast';

export default function PDFUploader({ onTextLoaded }) {
  const { setOriginalText } = useAppStore();
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      toast.error('Please select a valid PDF document.');
      return;
    }

    setFileName(file.name);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await transformAPI.uploadPDF(formData);
      if (data.text) {
        setOriginalText(data.text);
        onTextLoaded?.(data.text);
        toast.success(`Loaded PDF text (${data.metrics?.wordCount || 500} words, Grade ${data.metrics?.fleschKincaidGrade || 'Academic'})`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to extract text from PDF');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="inline-block">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700 hover:bg-teal-100 transition-all shadow-sm"
        title="Upload PDF Academic Article"
      >
        {uploading ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <span>Parsing PDF...</span>
          </>
        ) : (
          <>
            <UploadCloud size={14} />
            <span>Upload PDF</span>
          </>
        )}
      </button>
    </div>
  );
}
