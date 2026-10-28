export interface UploadedFile {
  name: string;
  path: string;
  size: number;
  type: string;
  content: string;
  lastModified?: number;
}

export interface DimensionScore {
  category: string;
  score: number; // 0 - 100
  weight: number; // percentage
  status: 'Exceeds' | 'Meets' | 'Needs Work' | 'Critical Issue';
  rationale: string;
}

export interface FileAuditFinding {
  fileName: string;
  filePath: string;
  category: 'Source Code' | 'Configuration' | 'Documentation' | 'Test Suite' | 'Asset / Data' | 'Build Artifact';
  status: 'Verified' | 'Warning' | 'Critical Flag' | 'Incomplete';
  score: number; // 0 - 100
  finding: string;
  remediation?: string;
}

export interface RiskItem {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  likelihood: 'High' | 'Medium' | 'Low';
  impactArea: 'Security' | 'Stability' | 'Performance' | 'Maintainability' | 'Compliance';
  description: string;
  mitigation: string;
}

export interface ActionItem {
  id: string;
  priority: 'Immediate (P0)' | 'High (P1)' | 'Medium (P2)';
  assigneeRecommendation: string;
  task: string;
  deadlineTimeline: string;
}

export interface EvaluationReport {
  id: string;
  projectName: string;
  taskFolderName: string;
  reviewDate: string;
  reviewTime: string;
  googleMeetLink: string;
  meetingId?: string;
  verdict: 'APPROVED' | 'APPROVED WITH CONDITIONS' | 'ACTION REQUIRED' | 'REJECTED';
  overallScore: number; // 0 - 100
  qualityTier: 'A+ (Exemplary)' | 'A (Production Ready)' | 'B+ (Minor Polish)' | 'B (Substantial Revision)' | 'C (Unsatisfactory)';
  executiveSummary: string;
  scopeVerification: {
    requirementsAnalyzed: number;
    requirementsMet: number;
    completionPercentage: number;
    summary: string;
  };
  dimensionScores: DimensionScore[];
  fileAudits: FileAuditFinding[];
  identifiedStrengths: string[];
  identifiedDeficiencies: string[];
  riskMatrix: RiskItem[];
  mandatoryActionItems: ActionItem[];
  strategicRecommendations: string[];
  version?: number; // e.g. 1, 2, 3
  revisionLabel?: string; // e.g. "v1.0 (Initial Delivery)", "v2.0 (Revision)"
  previousReviewId?: string;
  versionDelta?: {
    scoreDiff: number;
    resolvedDeficiencies: string[];
    newFindings: string[];
    summary: string;
  };
  createdAt?: number;
  signOffBlock: {
    leadAuditor: string;
    reviewProtocol: string;
    verificationHash: string;
    meetingAgendaPoints: string[];
    nextReviewDate?: string;
  };
}

export type AssistantTone = 'Executive & Strategic' | 'Technical & Rigorous' | 'Constructive & Collaborative' | 'Urgent & Remedial' | 'Adaptive (Auto)';

export interface VoiceMeetingMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  speakerName: string;
  timestamp: string;
  text: string;
  toneUsed?: AssistantTone;
  audioUrl?: string;
}
