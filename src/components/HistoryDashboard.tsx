import React, { useState } from 'react';
import {
  History,
  FileText,
  Download,
  Video,
  Calendar,
  Clock,
  ExternalLink,
  Trash2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { EvaluationReport } from '../types/review';
import { generateReviewPdf } from '../services/pdfGenerator';

interface HistoryDashboardProps {
  reports: EvaluationReport[];
  activeReportId: string | null;
  onSelectReport: (report: EvaluationReport) => void;
  onDeleteReport: (id: string) => void;
  onUploadNewTask: () => void;
  onUploadRevision: (baseReport: EvaluationReport) => void;
  onOpenVoiceCompanion: (report: EvaluationReport) => void;
}

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({
  reports,
  activeReportId,
  onSelectReport,
  onDeleteReport,
  onUploadNewTask,
  onUploadRevision,
  onOpenVoiceCompanion,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<string>('ALL');

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.taskFolderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVerdict = filterVerdict === 'ALL' || r.verdict === filterVerdict;

    return matchesSearch && matchesVerdict;
  });

  const avgScore = reports.length
    ? Math.round(reports.reduce((acc, r) => acc + (r.overallScore || 0), 0) / reports.length)
    : 0;

  const approvedCount = reports.filter((r) => r.verdict === 'APPROVED' || r.verdict === 'APPROVED WITH CONDITIONS').length;
  const approvalRate = reports.length ? Math.round((approvedCount / reports.length) * 100) : 0;

  const handleDownload = (report: EvaluationReport, e: React.MouseEvent) => {
    e.stopPropagation();
    const doc = generateReviewPdf(report);
    const fileName = `${report.projectName || 'TaskReview'}-3Page-Audit-${report.revisionLabel || 'v1'}.pdf`.replace(/\s+/g, '_');
    doc.save(fileName);
  };

  const getVerdictPill = (verdict: string) => {
    if (verdict === 'APPROVED') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (verdict === 'APPROVED WITH CONDITIONS') {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <History className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Task Evaluation Vault & Revision History
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track frequent task uploads, review progress across sprint cycles, and manage Google Meet review debriefs.
          </p>
        </div>

        <button
          onClick={onUploadNewTask}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Next Task / Revision</span>
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Submissions Audited
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{reports.length}</span>
            <span className="text-xs text-slate-500 font-medium">task deliverables</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Average Quality Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-400">{avgScore}</span>
            <span className="text-xs text-slate-500 font-medium">/ 100 benchmark</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Approval & Readiness Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">{approvalRate}%</span>
            <span className="text-xs text-slate-500 font-medium">passed criteria</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Google Meet Review Rooms
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-400">{reports.length}</span>
            <span className="text-xs text-slate-500 font-medium">ready for debrief</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks by name, folder, or ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Verdict:</span>
          <select
            value={filterVerdict}
            onChange={(e) => setFilterVerdict(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Verdicts</option>
            <option value="APPROVED">Approved</option>
            <option value="APPROVED WITH CONDITIONS">Approved with Conditions</option>
            <option value="ACTION REQUIRED">Action Required</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <AlertCircle className="h-8 w-8 text-slate-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-300">No Task Evaluations Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {reports.length === 0
              ? 'Complete your first task folder scan in Step 1 to populate the audit vault.'
              : 'Try adjusting your search query or filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((item) => {
            const isActive = item.id === activeReportId;
            return (
              <div
                key={item.id}
                onClick={() => onSelectReport(item)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer bg-slate-900/90 hover:bg-slate-900 group ${
                  isActive
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left: Project & Version info */}
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                        {item.projectName}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                        {item.revisionLabel || `v${item.version || 1}.0`}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getVerdictPill(item.verdict)}`}>
                        {item.verdict}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active in Viewer
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 font-mono">
                      Folder: {item.taskFolderName} • Ref: {item.id}
                    </p>

                    {/* Version Delta if it's an update */}
                    {item.versionDelta && (
                      <div className="flex items-center gap-2 text-[11px] pt-1">
                        {item.versionDelta.scoreDiff >= 0 ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5" />
                            +{item.versionDelta.scoreDiff} pts
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <TrendingDown className="h-3.5 w-3.5" />
                            {item.versionDelta.scoreDiff} pts
                          </span>
                        )}
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-300">{item.versionDelta.summary}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        {item.reviewDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-indigo-400" />
                        {item.reviewTime}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Score Badge */}
                  <div className="flex items-center gap-4 lg:border-x lg:border-slate-800 lg:px-6 py-1">
                    <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Audit Score
                      </span>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-2xl font-extrabold text-indigo-400">
                          {item.overallScore}
                        </span>
                        <span className="text-xs text-slate-500">/100</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {item.qualityTier?.split(' ')[0]}
                      </span>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Scope Met
                      </span>
                      <span className="text-2xl font-extrabold text-emerald-400">
                        {item.scopeVerification?.completionPercentage}%
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {item.scopeVerification?.requirementsMet}/{item.scopeVerification?.requirementsAnalyzed} reqs
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 justify-end w-full lg:w-auto">
                    {/* Google Meet Link pill */}
                    <a
                      href={item.googleMeetLink}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-colors"
                      title="Open Google Meet Debrief Room"
                    >
                      <Video className="h-3.5 w-3.5" />
                      <span>Meet Room</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenVoiceCompanion(item);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                      title="Debrief with Voice Assistant"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Voice Bot</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDownload(item, e)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                      title="Download 3-Page PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUploadRevision(item);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors"
                      title="Upload an updated task revision"
                    >
                      <span>Upload Rev</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteReport(item.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete from vault"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
