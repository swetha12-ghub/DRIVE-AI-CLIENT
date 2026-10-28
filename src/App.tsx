/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { FolderUpload } from './components/FolderUpload';
import { DocumentViewer } from './components/DocumentViewer';
import { VoiceMeetingCompanion } from './components/VoiceMeetingCompanion';
import { HistoryDashboard } from './components/HistoryDashboard';
import { FilePreviewModal } from './components/FilePreviewModal';
import { UploadedFile, EvaluationReport } from './types/review';
import { SAMPLE_TASKS } from './data/sampleTasks';
import { initAuth, googleSignIn, logout } from './services/firebaseAuth';
import { generateReviewPdf } from './services/pdfGenerator';
import { createGoogleMeetSpace } from './services/googleMeet';
import {
  getSavedReports,
  saveReportToVault,
  deleteReportFromVault,
} from './services/storageService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'document' | 'meeting' | 'vault'>('upload');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Vault / History State for recurring client uploads
  const [vaultReports, setVaultReports] = useState<EvaluationReport[]>(() => getSavedReports());

  // Deliverables State
  const [files, setFiles] = useState<UploadedFile[]>(SAMPLE_TASKS[0].files);
  const [folderName, setFolderName] = useState<string>(SAMPLE_TASKS[0].folderName);
  const [projectName, setProjectName] = useState<string>(SAMPLE_TASKS[0].name);

  // Review Protocol & Google Meet State
  const [reviewDate, setReviewDate] = useState<string>('October 28, 2026');
  const [reviewTime, setReviewTime] = useState<string>('09:30 AM PDT');
  const [googleMeetLink, setGoogleMeetLink] = useState<string>('https://meet.google.com/qmv-trbp-xzk');
  const [customGuidelines, setCustomGuidelines] = useState<string>(
    'Ensure all monetary values use integer cents to avoid floating point inaccuracies, verify zero exposed secrets, and confirm unit test coverage.'
  );

  // Evaluation & Modal State
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  // Initialize Firebase Auth
  useEffect(() => {
    initAuth(
      (user) => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
      }
    );
  }, []);

  // Sync latest report from vault on initial load if available
  useEffect(() => {
    if (!report && vaultReports.length > 0) {
      setReport(vaultReports[0]);
    }
  }, [vaultReports, report]);

  const handleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        // Automatically create a live Meet space for the authenticated user
        const meetResult = await createGoogleMeetSpace(
          `${projectName || 'Task'} Deliverable Review`,
          reviewDate,
          reviewTime
        );
        if (meetResult.meetLink) {
          setGoogleMeetLink(meetResult.meetLink);
        }
      }
    } catch (err) {
      console.error('Google Sign-in failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleStartEvaluation = async () => {
    if (files.length === 0 || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const response = await fetch('/api/evaluate-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskFolderName: folderName || 'task-deliverables',
          projectName: projectName || 'Completed Task Submission',
          reviewDate,
          reviewTime,
          googleMeetLink,
          files,
          customGuidelines,
        }),
      });

      if (!response.ok) {
        throw new Error(`Evaluation failed with status ${response.status}`);
      }

      const generatedReport: EvaluationReport = await response.json();
      
      // Save to Vault with automatic version incrementing & delta comparison against previous submissions!
      const { report: savedReport, allReports } = saveReportToVault(generatedReport);
      setReport(savedReport);
      setVaultReports(allReports);
      setActiveTab('document');
    } catch (err) {
      console.error('Task evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!report) return;
    const doc = generateReviewPdf(report);
    const fileName = `${report.projectName || 'TaskReview'}-3Page-Audit-${report.revisionLabel || 'Report'}.pdf`.replace(/\s+/g, '_');
    doc.save(fileName);
  };

  const handleSelectReport = (selected: EvaluationReport) => {
    setReport(selected);
    setFolderName(selected.taskFolderName);
    setProjectName(selected.projectName);
    setGoogleMeetLink(selected.googleMeetLink);
    setReviewDate(selected.reviewDate);
    setReviewTime(selected.reviewTime);
    setActiveTab('document');
  };

  const handleDeleteReport = (id: string) => {
    const updated = deleteReportFromVault(id);
    setVaultReports(updated);
    if (report?.id === id) {
      setReport(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleUploadRevision = (baseReport: EvaluationReport) => {
    const nextVer = (baseReport.version || 1) + 1;
    setProjectName(`${baseReport.projectName}`);
    setFolderName(`${baseReport.taskFolderName}`);
    setCustomGuidelines(
      `Revision ${nextVer} Focus: Verify resolution of previous deficiencies: ${baseReport.identifiedDeficiencies?.slice(0, 2).join('; ') || 'Resolve P0 action items'}.`
    );
    setActiveTab('upload');
  };

  const handleUploadNewTask = () => {
    setActiveTab('upload');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        hasReport={!!report}
        vaultCount={vaultReports.length}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onDownloadPdf={report ? handleDownloadPdf : undefined}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 pb-16">
        {activeTab === 'upload' && (
          <FolderUpload
            files={files}
            setFiles={setFiles}
            folderName={folderName}
            setFolderName={setFolderName}
            projectName={projectName}
            setProjectName={setProjectName}
            reviewDate={reviewDate}
            setReviewDate={setReviewDate}
            reviewTime={reviewTime}
            setReviewTime={setReviewTime}
            googleMeetLink={googleMeetLink}
            setGoogleMeetLink={setGoogleMeetLink}
            customGuidelines={customGuidelines}
            setCustomGuidelines={setCustomGuidelines}
            onStartEvaluation={handleStartEvaluation}
            isEvaluating={isEvaluating}
            onPreviewFile={(f) => setPreviewFile(f)}
            isGoogleSignedIn={!!currentUser}
          />
        )}

        {activeTab === 'document' && (
          <DocumentViewer
            report={report}
            onOpenVoiceAssistant={() => setActiveTab('meeting')}
            onReupload={() => setActiveTab('upload')}
            onUploadRevision={handleUploadRevision}
          />
        )}

        {activeTab === 'meeting' && (
          <VoiceMeetingCompanion
            report={report}
            googleMeetLink={googleMeetLink}
            onViewDocument={() => setActiveTab('document')}
          />
        )}

        {activeTab === 'vault' && (
          <HistoryDashboard
            reports={vaultReports}
            activeReportId={report?.id || null}
            onSelectReport={handleSelectReport}
            onDeleteReport={handleDeleteReport}
            onUploadNewTask={handleUploadNewTask}
            onUploadRevision={handleUploadRevision}
            onOpenVoiceCompanion={(r) => {
              handleSelectReport(r);
              setActiveTab('meeting');
            }}
          />
        )}
      </main>

      {/* File Preview Drawer / Modal */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />

      {/* Global Minimal Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            TaskReview AI • Automated Deliverable Audit Protocol • Google Meet & Voice Companion
          </p>
          <p className="font-mono text-[11px]">
            Model: Gemini 3.8 Flash & Gemini 3.8 Flash Lite TTS
          </p>
        </div>
      </footer>
    </div>
  );
}
