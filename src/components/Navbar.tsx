import React from 'react';
import { ShieldCheck, Video, FileText, Sparkles, LogOut, CheckCircle2, History } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  activeTab: 'upload' | 'document' | 'meeting' | 'vault';
  setActiveTab: (tab: 'upload' | 'document' | 'meeting' | 'vault') => void;
  currentUser: User | null;
  hasReport: boolean;
  vaultCount: number;
  onLogin: () => void;
  onLogout: () => void;
  onDownloadPdf?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  hasReport,
  vaultCount,
  onLogin,
  onLogout,
  onDownloadPdf,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  TaskReview AI
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                  Audit & Voice Bot
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Deliverable Evaluator • 3-Page Review Document • Adaptive Voice Reviewer
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>1. Scan Folder</span>
            </button>

            <button
              onClick={() => setActiveTab('document')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'document'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>2. Review Document</span>
              {hasReport && (
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('meeting')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'meeting'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              <span>3. Voice Review Bot</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-teal-500/20 text-teal-300 font-mono">
                LIVE
              </span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'vault'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>Vault History</span>
              {vaultCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/30 text-indigo-300 font-mono font-bold">
                  {vaultCount}
                </span>
              )}
            </button>
          </nav>

          {/* User Auth & Actions */}
          <div className="flex items-center gap-3">
            {hasReport && onDownloadPdf && (
              <button
                onClick={onDownloadPdf}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors"
                title="Download 3-Page Executive PDF"
              >
                <FileText className="h-3.5 w-3.5 text-indigo-400" />
                <span>Export PDF</span>
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Google Account'}
                      className="h-5 w-5 rounded-full"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                      {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="hidden lg:block text-left">
                    <p className="text-[11px] font-medium leading-none text-slate-200 truncate max-w-[120px]">
                      {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </p>
                    <p className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Meet Synced
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-800 hover:bg-slate-100 shadow transition-all border border-slate-200"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="hidden sm:inline">Sign in with Google</span>
                <span className="sm:hidden">Google</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
