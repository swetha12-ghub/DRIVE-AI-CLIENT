import React, { useState } from 'react';
import {
  FileText,
  Download,
  Video,
  Calendar,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  ArrowRight,
  Printer,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layers,
  Sparkles
} from 'lucide-react';
import { EvaluationReport } from '../types/review';
import { generateReviewPdf } from '../services/pdfGenerator';

interface DocumentViewerProps {
  report: EvaluationReport | null;
  onOpenVoiceAssistant: () => void;
  onReupload: () => void;
  onUploadRevision?: (report: EvaluationReport) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  report,
  onOpenVoiceAssistant,
  onReupload,
  onUploadRevision,
}) => {
  const [activePage, setActivePage] = useState<1 | 2 | 3 | 'all'>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
          <FileText className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Review Document Generated Yet</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Please upload your completed task folder or load a sample preset from Step 1 to conduct the AI evaluation and generate the 3-page review document.
        </p>
        <button
          onClick={onReupload}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Sparkles className="h-4 w-4" />
          <span>Go to Step 1: Ingest Folder</span>
        </button>
      </div>
    );
  }

  const handleDownloadPdf = () => {
    setIsExporting(true);
    try {
      const doc = generateReviewPdf(report);
      const fileName = `${report.projectName || 'TaskReview'}-3Page-Audit-Report.pdf`.replace(/\s+/g, '_');
      doc.save(fileName);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const copyMeet = () => {
    navigator.clipboard.writeText(report.googleMeetLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getVerdictStyles = (verdict: string) => {
    if (verdict === 'APPROVED') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (verdict === 'APPROVED WITH CONDITIONS') {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Top Action & Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        {/* Page Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-medium w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActivePage(1)}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activePage === 1
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Page 1: Overview</span>
          </button>
          <button
            onClick={() => setActivePage(2)}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activePage === 2
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Page 2: Deliverables</span>
          </button>
          <button
            onClick={() => setActivePage(3)}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activePage === 3
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Page 3: Risk & Sign-Off</span>
          </button>
          <button
            onClick={() => setActivePage('all')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activePage === 'all'
                ? 'bg-slate-800 text-slate-100 font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Continuous View</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="h-4 w-4" />
            <span>{isExporting ? 'Generating PDF...' : 'Download Crisp PDF (3 Pages)'}</span>
          </button>

          <button
            onClick={onOpenVoiceAssistant}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
            title="Launch Voice Assistant for this Review Document"
          >
            <Video className="h-4 w-4" />
            <span>Launch Voice Debrief</span>
          </button>

          {onUploadRevision && (
            <button
              onClick={() => onUploadRevision(report)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all"
              title="Upload an updated revision for this task"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Upload Revision</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Print Document"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Document Canvas Container (Rendered to match Crisp A4 Standards) */}
      <div className="space-y-8">
        {/* ================= PAGE 1 ================= */}
        {(activePage === 1 || activePage === 'all') && (
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-8 sm:p-12 relative overflow-hidden font-sans print:shadow-none print:border-none print:m-0">
            {/* Top Corporate Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500" />

            {/* Header / Running Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-5 mb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">
                    TaskReview AI
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-bold text-slate-500 tracking-wide">
                    AUDIT & DELIVERABLE EVALUATION PROTOCOL
                  </span>
                  {report.revisionLabel && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {report.revisionLabel}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Completed Task Deliverable Audit
                </h1>
                <p className="text-xs text-slate-500 font-mono">
                  Folder: {report.taskFolderName} • Ref: {report.id}
                </p>
              </div>

              {/* Verdict Tag */}
              <div className="text-right flex flex-col items-end">
                <span className={`px-3.5 py-1.5 rounded-lg border text-xs font-extrabold tracking-wide uppercase shadow-sm ${getVerdictStyles(report.verdict)}`}>
                  {report.verdict}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">Page 1 of 3</span>
              </div>
            </div>

            {/* Revision Delta Alert Banner if present */}
            {report.versionDelta && (
              <div className="mb-6 p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold">
                    <span>Recurring Revision Delta:</span>
                    <span className={report.versionDelta.scoreDiff >= 0 ? 'text-emerald-700 font-extrabold' : 'text-rose-700 font-extrabold'}>
                      {report.versionDelta.scoreDiff >= 0 ? `+${report.versionDelta.scoreDiff}` : report.versionDelta.scoreDiff} Points Improvement
                    </span>
                  </div>
                  <p className="mt-0.5 text-slate-700 text-[11px]">{report.versionDelta.summary}</p>
                </div>
              </div>
            )}

            {/* MANDATORY METADATA STRIP: DATE, TIME, GOOGLE MEET LINK */}
            <div className="bg-slate-50 border-2 border-indigo-500/20 rounded-xl p-4 mb-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Review Date
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {report.reviewDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Review Time
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {report.reviewTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2 truncate">
                    <Video className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                    <div className="truncate">
                      <span className="text-[10px] uppercase font-bold text-indigo-900 tracking-wider block">
                        Google Meet Debrief Room
                      </span>
                      <a
                        href={report.googleMeetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-indigo-600 hover:underline truncate block"
                      >
                        {report.googleMeetLink}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={copyMeet}
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Copy Google Meet Link"
                    >
                      {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <a
                      href={report.googleMeetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Open Google Meet Space"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Score & Scope Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              {/* Score Card */}
              <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Composite Audit Score
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-indigo-600">
                      {report.overallScore}
                    </span>
                    <span className="text-slate-400 font-bold text-base">/ 100</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 mt-1 block">
                    Rating Tier: {report.qualityTier}
                  </span>
                </div>
                <div className="h-16 w-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-600 flex items-center justify-center font-bold text-sm text-indigo-600">
                  {report.overallScore}%
                </div>
              </div>

              {/* Scope Criteria Card */}
              <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Scope & Acceptance Criteria
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-emerald-600">
                      {report.scopeVerification?.completionPercentage}%
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 mt-1 block">
                    {report.scopeVerification?.requirementsMet} of {report.scopeVerification?.requirementsAnalyzed} requirements met
                  </span>
                </div>
                <div className="h-16 w-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center font-bold text-sm text-emerald-600">
                  ✓
                </div>
              </div>
            </div>

            {/* Executive Overview */}
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2">
                1. Executive Overview & Synthesis
              </h2>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {report.executiveSummary}
              </div>
            </div>

            {/* Dimensional Scorecards Table */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3">
                2. Dimensional Evaluation Scorecards
              </h2>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Evaluation Dimension</th>
                      <th className="py-2.5 px-3">Weight</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-4">Key Rationale & Citation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {report.dimensionScores?.map((dim, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="py-3 px-4 font-bold text-slate-900">{dim.category}</td>
                        <td className="py-3 px-3 text-slate-500 font-mono">{dim.weight}%</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 font-mono">{dim.score}</span>
                            <div className="w-12 h-1.5 rounded-full bg-slate-200 overflow-hidden hidden sm:block">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${dim.score}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              dim.status === 'Exceeds'
                                ? 'bg-emerald-100 text-emerald-800'
                                : dim.status === 'Meets'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {dim.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px] leading-snug">
                          {dim.rationale}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Page 1 Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
              <span>TaskReview AI Confidential Audit • Project: {report.projectName}</span>
              <span className="font-bold">Page 1 of 3</span>
            </div>
          </div>
        )}

        {/* ================= PAGE 2 ================= */}
        {(activePage === 2 || activePage === 'all') && (
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-8 sm:p-12 relative overflow-hidden font-sans print:shadow-none print:border-none print:m-0">
            {/* Top Corporate Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500" />

            {/* Running Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Deliverable Inventory & Findings Matrix
                </span>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Section 3: Deliverable File-by-File Technical Audit
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-400">ID: {report.id}</span>
                <span className="text-[10px] text-slate-400 block">Page 2 of 3</span>
              </div>
            </div>

            {/* File Audits Table */}
            <div className="mb-8">
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Inspected Deliverable</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-4">Audit Finding & Remediation Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {report.fileAudits?.map((file, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{file.fileName}</span>
                          <span className="text-[10px] font-mono text-slate-500">{file.filePath}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{file.category}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              file.status === 'Verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : file.status === 'Warning'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {file.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">{file.score}</td>
                        <td className="py-3 px-4 text-slate-600 text-[11px] leading-snug">
                          <p>{file.finding}</p>
                          {file.remediation && (
                            <p className="mt-1 text-[10px] text-indigo-600 font-medium">
                              Fix: {file.remediation}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strengths and Deficiencies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Strengths */}
              <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Key Technical & Architectural Strengths</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  {report.identifiedStrengths?.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deficiencies */}
              <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Identified Deficiencies & Technical Gaps</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  {report.identifiedDeficiencies?.map((def, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold mt-0.5">•</span>
                      <span>{def}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Page 2 Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
              <span>TaskReview AI Confidential Audit • Project: {report.projectName}</span>
              <span className="font-bold">Page 2 of 3</span>
            </div>
          </div>
        )}

        {/* ================= PAGE 3 ================= */}
        {(activePage === 3 || activePage === 'all') && (
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-8 sm:p-12 relative overflow-hidden font-sans print:shadow-none print:border-none print:m-0">
            {/* Top Corporate Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500" />

            {/* Running Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Risk Protocol & Formal Sign-Off
                </span>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Section 4 & 5: Risk Matrix, Actions & Google Meet Debrief
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-400">ID: {report.id}</span>
                <span className="text-[10px] text-slate-400 block">Page 3 of 3</span>
              </div>
            </div>

            {/* Risk Assessment Matrix */}
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2">
                4. Risk Assessment Matrix
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Identified Risk & Impact</th>
                      <th className="py-2.5 px-3">Area</th>
                      <th className="py-2.5 px-3">Severity</th>
                      <th className="py-2.5 px-4">Mitigation Protocol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {report.riskMatrix?.map((risk, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="py-3 px-4 font-bold text-slate-900">{risk.title}</td>
                        <td className="py-3 px-3 text-slate-500">{risk.impactArea}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              risk.severity === 'Critical' || risk.severity === 'High'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {risk.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px] leading-snug">
                          {risk.mitigation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mandatory Pre-Sign-Off Action Items */}
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2">
                5. Mandatory Pre-Sign-Off Action Items
              </h3>
              <div className="space-y-2.5">
                {report.mandatoryActionItems?.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider flex-shrink-0 ${
                          act.priority.includes('P0')
                            ? 'bg-rose-600 text-white'
                            : 'bg-indigo-600 text-white'
                        }`}
                      >
                        {act.priority}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{act.task}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Recommended Assignee: <span className="font-medium text-slate-700">{act.assigneeRecommendation}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200 flex-shrink-0">
                      {act.deadlineTimeline}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Strategic Post-Launch Recommendations
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
                {report.strategicRecommendations?.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* FORMAL SIGN-OFF & GOOGLE MEET DEBRIEF BLOCK */}
            <div className="rounded-xl bg-slate-900 text-white p-6 relative overflow-hidden shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-extrabold uppercase tracking-widest">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Official Quality Verification & Sign-Off</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Google Meet Live Debrief Session Scheduled
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Session Time: <span className="text-slate-200 font-medium">{report.reviewDate} at {report.reviewTime}</span>
                  </p>
                </div>

                <button
                  onClick={onOpenVoiceAssistant}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Video className="h-4 w-4" />
                  <span>Start Voice Debrief with AI Companion</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Meet link inside sign-off */}
              <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700 flex items-center justify-between gap-3 text-xs mb-4">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-400">Integrated Room:</span>
                  <a
                    href={report.googleMeetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-emerald-400 hover:underline truncate"
                  >
                    {report.googleMeetLink}
                  </a>
                </div>
                <button
                  onClick={copyMeet}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Digital Seal info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-slate-400">
                <div>
                  <p>
                    <span className="text-slate-500">Auditor:</span> {report.signOffBlock?.leadAuditor}
                  </p>
                  <p>
                    <span className="text-slate-500">Protocol:</span> {report.signOffBlock?.reviewProtocol}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="text-slate-500">Verification Hash:</span>{' '}
                    <span className="font-mono text-indigo-300">{report.signOffBlock?.verificationHash}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Next Action:</span> Client sign-off during Google Meet debrief.
                  </p>
                </div>
              </div>
            </div>

            {/* Page 3 Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
              <span>TaskReview AI Confidential Audit • Project: {report.projectName}</span>
              <span className="font-bold">Page 3 of 3 (End of Document)</span>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls at Bottom */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => setActivePage((prev) => (prev === 'all' || prev === 1 ? 1 : ((prev - 1) as any)))}
          disabled={activePage === 1}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous Page</span>
        </button>

        <span className="text-xs text-slate-400 font-mono">
          Viewing {activePage === 'all' ? 'Continuous 3-Page Document' : `Page ${activePage} of 3`}
        </span>

        <button
          onClick={() => setActivePage((prev) => (prev === 'all' || prev === 3 ? 3 : ((prev + 1) as any)))}
          disabled={activePage === 3}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
        >
          <span>Next Page</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
