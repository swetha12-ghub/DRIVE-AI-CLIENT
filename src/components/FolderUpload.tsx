import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Folder,
  FileCode,
  Calendar,
  Clock,
  Video,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Trash2,
  FolderCheck,
  AlertCircle
} from 'lucide-react';
import { UploadedFile } from '../types/review';
import { SAMPLE_TASKS, SampleTaskPackage } from '../data/sampleTasks';
import { createGoogleMeetSpace } from '../services/googleMeet';

interface FolderUploadProps {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  folderName: string;
  setFolderName: (name: string) => void;
  projectName: string;
  setProjectName: (name: string) => void;
  reviewDate: string;
  setReviewDate: (date: string) => void;
  reviewTime: string;
  setReviewTime: (time: string) => void;
  googleMeetLink: string;
  setGoogleMeetLink: (link: string) => void;
  customGuidelines: string;
  setCustomGuidelines: (val: string) => void;
  onStartEvaluation: () => void;
  isEvaluating: boolean;
  onPreviewFile: (file: UploadedFile) => void;
  isGoogleSignedIn: boolean;
}

export const FolderUpload: React.FC<FolderUploadProps> = ({
  files,
  setFiles,
  folderName,
  setFolderName,
  projectName,
  setProjectName,
  reviewDate,
  setReviewDate,
  reviewTime,
  setReviewTime,
  googleMeetLink,
  setGoogleMeetLink,
  customGuidelines,
  setCustomGuidelines,
  onStartEvaluation,
  isEvaluating,
  onPreviewFile,
  isGoogleSignedIn,
}) => {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  const [isGeneratingMeet, setIsGeneratingMeet] = useState(false);
  const [copiedMeet, setCopiedMeet] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Read files from HTML input or drop
  const processFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const parsedFiles: UploadedFile[] = [];
    let detectedRootFolder = '';

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      // Skip hidden files like .DS_Store or git internals
      if (file.name.startsWith('.') || file.webkitRelativePath?.includes('/.git/')) {
        continue;
      }

      if (file.webkitRelativePath && !detectedRootFolder) {
        const parts = file.webkitRelativePath.split('/');
        if (parts.length > 1) {
          detectedRootFolder = parts[0];
        }
      }

      // Read text content
      try {
        const content = await file.text();
        parsedFiles.push({
          name: file.name,
          path: file.webkitRelativePath || file.name,
          size: file.size,
          type: file.type || 'text/plain',
          content,
          lastModified: file.lastModified,
        });
      } catch (err) {
        parsedFiles.push({
          name: file.name,
          path: file.webkitRelativePath || file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          content: `[Binary deliverable: ${file.name}]`,
          lastModified: file.lastModified,
        });
      }
    }

    if (parsedFiles.length > 0) {
      setFiles(parsedFiles);
      if (detectedRootFolder && !projectName) {
        setFolderName(detectedRootFolder);
        setProjectName(
          detectedRootFolder
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())
        );
      }
    }
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleMultipleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const loadSample = (sample: SampleTaskPackage) => {
    setFiles(sample.files);
    setFolderName(sample.folderName);
    setProjectName(sample.name);
  };

  const handleCreateMeet = async () => {
    setIsGeneratingMeet(true);
    try {
      const result = await createGoogleMeetSpace(
        `${projectName || 'Task'} Deliverable Review`,
        reviewDate,
        reviewTime
      );
      setGoogleMeetLink(result.meetLink);
    } catch (err) {
      console.error('Error generating Google Meet link:', err);
    } finally {
      setIsGeneratingMeet(false);
    }
  };

  const copyMeetLink = () => {
    navigator.clipboard.writeText(googleMeetLink);
    setCopiedMeet(true);
    setTimeout(() => setCopiedMeet(false), 2000);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalSizeKB = (files.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
            <FolderCheck className="h-4 w-4 text-indigo-400" />
            <span>Automated Deliverable Audit Protocol</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Upload Task Folder & Generate Professional Review Document
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Upload completed project deliverables, code repositories, or task folders. Our senior AI evaluation engine conducts a multi-dimensional inspection, generates a crisp 2–3 page executive review document with an official Google Meet link, and equips you with an adaptive voice assistant for your live meeting debrief.
          </p>

          {/* Quick Stats or Highlights */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <span className="h-2 w-2 rounded-full bg-teal-400" />
              <span>Full Folder Tree Scanning</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              <span>Exact 2-3 Page Crisp Executive PDF</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Real-Time Google Meet Voice Assistant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Files Ingestion (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upload Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-slate-900/60 backdrop-blur-sm ${
              dragActive
                ? 'border-indigo-400 bg-indigo-950/30 scale-[1.01]'
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            {/* Hidden native folder input with webkitdirectory */}
            <input
              ref={folderInputRef}
              type="file"
              // @ts-ignore
              webkitdirectory=""
              // @ts-ignore
              directory=""
              multiple
              onChange={handleFolderSelect}
              className="hidden"
            />
            {/* Hidden native multiple files input */}
            <input
              ref={filesInputRef}
              type="file"
              multiple
              onChange={handleMultipleFilesSelect}
              className="hidden"
            />

            <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
              <UploadCloud className="h-8 w-8" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Select or Drop Completed Task Folder
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
              Select an entire folder from your machine containing code files, documentation, configuration, or test deliverables.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Folder className="h-4 w-4" />
                <span>Upload Task Folder</span>
              </button>

              <button
                type="button"
                onClick={() => filesInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
              >
                <FileCode className="h-4 w-4" />
                <span>Select Multiple Files</span>
              </button>
            </div>
          </div>

          {/* Quick Presets / Samples */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Or Test Immediately With Sample Task Deliverables
              </span>
              <span className="text-[11px] text-slate-500">1-Click Load</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAMPLE_TASKS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => loadSample(sample)}
                  className="text-left p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                      {sample.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                      {sample.files.length} files
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">
                    {sample.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Uploaded Deliverables Inventory */}
          {files.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white tracking-wide">
                    Scanned Deliverables Inventory ({files.length} Files, {totalSizeKB} KB)
                  </span>
                </div>
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/40">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-slate-800/50 group transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate max-w-[70%]">
                      <FileCode className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 flex-shrink-0" />
                      <div className="truncate">
                        <span className="text-slate-200 font-medium truncate block">
                          {file.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 truncate block">
                          {file.path}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-mono text-slate-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        onClick={() => onPreviewFile(file)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        title="View file content"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeFile(idx)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Review Protocol & Google Meet Integration (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Review Session & Document Metadata</span>
            </h3>

            {/* Project & Folder Name */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Project Title / Submission Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. NextGen Payment Gateway Delivery"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Task Folder Name
                </label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="e.g. fintech-payment-engine-v2"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Review Date & Review Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Review Date</span>
                </label>
                <input
                  type="text"
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Review Time</span>
                </label>
                <input
                  type="text"
                  value={reviewTime}
                  onChange={(e) => setReviewTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Google Meet Integration */}
            <div className="pt-2 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Video className="h-4 w-4 text-emerald-400" />
                  <span>Google Meet Integration</span>
                </label>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isGoogleSignedIn
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                }`}>
                  {isGoogleSignedIn ? 'Google Account Connected' : 'Ready'}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={googleMeetLink}
                  onChange={(e) => setGoogleMeetLink(e.target.value)}
                  placeholder="https://meet.google.com/xxx-yyyy-zzz"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={copyMeetLink}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
                  title="Copy Google Meet Link"
                >
                  {copiedMeet ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCreateMeet}
                  disabled={isGeneratingMeet}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isGeneratingMeet ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingMeet ? 'Creating Space...' : 'Generate Official Meet Space'}</span>
                </button>

                {googleMeetLink && (
                  <a
                    href={googleMeetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                  >
                    <span>Test Room</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Custom Guidelines (Optional) */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Custom Client Directives (Optional)
              </label>
              <textarea
                value={customGuidelines}
                onChange={(e) => setCustomGuidelines(e.target.value)}
                placeholder="e.g. Ensure zero floating point arithmetic in payments, check compliance with OWASP Top 10, verify test coverage exceeds 85%."
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onStartEvaluation}
                disabled={files.length === 0 || isEvaluating}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
                  files.length === 0 || isEvaluating
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                    : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                    <span>Auditing Files & Generating 3-Page Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>Scan Folder & Generate 3-Page Review Document</span>
                  </>
                )}
              </button>

              {files.length === 0 && (
                <p className="text-[11px] text-amber-400/90 text-center mt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Upload a task folder or select a sample preset above to begin.</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
