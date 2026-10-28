import React from 'react';
import { X, FileCode, Copy, Check } from 'lucide-react';
import { UploadedFile } from '../types/review';

interface FilePreviewModalProps {
  file: UploadedFile | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!file) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">{file.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{file.path || file.name} • {(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-4 overflow-auto flex-1 bg-slate-950 font-mono text-xs text-slate-200">
          <pre className="leading-relaxed whitespace-pre-wrap">{file.content || '// (Empty or binary deliverable file)'}</pre>
        </div>
      </div>
    </div>
  );
};
