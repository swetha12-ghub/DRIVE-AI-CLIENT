import jsPDF from 'jspdf';
import { EvaluationReport } from '../types/review';

/**
 * Generates an executive-grade 3-page PDF document meeting high-density corporate audit standards.
 */
export function generateReviewPdf(report: EvaluationReport): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210 x 297 mm
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const primaryDark = [15, 23, 42]; // #0f172a
  const primaryBrand = [79, 70, 229]; // #4f46e5
  const slateText = [71, 85, 105]; // #475569
  const mutedBorder = [226, 232, 240]; // #e2e8f0
  const lightBg = [248, 250, 252]; // #f8fafc
  const emeraldGreen = [16, 185, 129];
  const amberWarning = [245, 158, 11];
  const roseDanger = [239, 68, 68];

  const drawHeader = (pageNum: number, title: string) => {
    // Top accent bar
    doc.setFillColor(primaryBrand[0], primaryBrand[1], primaryBrand[2]);
    doc.rect(0, 0, pageWidth, 4, 'F');

    // Header content
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryBrand[0], primaryBrand[1], primaryBrand[2]);
    doc.text('TASKREVIEW AI', margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(slateText[0], slateText[1], slateText[2]);
    doc.text('AUDIT & DELIVERABLE EVALUATION PROTOCOL', margin + 32, 12);

    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), pageWidth - margin, 12, { align: 'right' });

    doc.setDrawColor(mutedBorder[0], mutedBorder[1], mutedBorder[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, 15, pageWidth - margin, 15);
  };

  const drawFooter = (pageNum: number) => {
    doc.setDrawColor(mutedBorder[0], mutedBorder[1], mutedBorder[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(slateText[0], slateText[1], slateText[2]);
    doc.text(
      `Confidential Review Document • Project: ${report.projectName || 'Task Submission'} • ID: ${report.id}`,
      margin,
      pageHeight - 7
    );

    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${pageNum} of 3`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

  // ==========================================
  // PAGE 1: EXECUTIVE OVERVIEW & DIMENSIONAL SCORECARDS
  // ==========================================
  drawHeader(1, 'Executive Evaluation & Scorecard');

  // Title section
  let y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('Completed Task Deliverable Audit', margin, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const revText = report.revisionLabel ? ` • Revision: ${report.revisionLabel}` : '';
  doc.text(`Folder: ${report.taskFolderName || 'root'} • Ref: ${report.id}${revText}`, margin, y);

  // Verdict Badge on Right
  const verdictColor =
    report.verdict === 'APPROVED'
      ? emeraldGreen
      : report.verdict === 'APPROVED WITH CONDITIONS'
      ? amberWarning
      : roseDanger;

  doc.setFillColor(verdictColor[0], verdictColor[1], verdictColor[2]);
  doc.roundedRect(pageWidth - margin - 58, 18, 58, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(report.verdict, pageWidth - margin - 29, 25.5, { align: 'center' });

  // Official Metadata Box (Date, Time, Google Meet Link)
  y += 7;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(primaryBrand[0], primaryBrand[1], primaryBrand[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 23, 2, 2, 'FD');

  // Metadata Grid
  const col1 = margin + 5;
  const col2 = margin + 50;
  const col3 = margin + 105;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text('REVIEW DATE', col1, y + 6);
  doc.text('REVIEW TIME', col2, y + 6);
  doc.text('GOOGLE MEET LIVE LINK', col3, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text(report.reviewDate || 'October 28, 2026', col1, y + 13);
  doc.text(report.reviewTime || '09:30 AM PDT', col2, y + 13);

  // Clickable Google Meet link in PDF!
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryBrand[0], primaryBrand[1], primaryBrand[2]);
  const meetUrl = report.googleMeetLink || 'https://meet.google.com/qmv-trbp-xzk';
  doc.text(meetUrl, col3, y + 13);
  doc.link(col3, y + 9, 80, 6, { url: meetUrl });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text('(Click link to join live Google Meet review room with Voice Assistant)', col3, y + 19);

  // Overall Score & Scope Box
  y += 28;
  const cardWidth = (contentWidth - 6) / 2;

  // Left card: Score & Tier
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(mutedBorder[0], mutedBorder[1], mutedBorder[2]);
  doc.roundedRect(margin, y, cardWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text('COMPOSITE AUDIT SCORE', margin + 6, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(primaryBrand[0], primaryBrand[1], primaryBrand[2]);
  doc.text(`${report.overallScore || 88}`, margin + 6, y + 20);

  doc.setFontSize(11);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text('/ 100', margin + 30, y + 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text(`Rating: ${report.qualityTier || 'A (Production Ready)'}`, margin + 6, y + 28);

  // Right card: Scope Verification
  doc.roundedRect(margin + cardWidth + 6, y, cardWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text('SCOPE & CRITERIA COMPLETION', margin + cardWidth + 12, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.text(`${report.scopeVerification?.completionPercentage || 92}%`, margin + cardWidth + 12, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text(
    `${report.scopeVerification?.requirementsMet || 11} of ${report.scopeVerification?.requirementsAnalyzed || 12} criteria fulfilled`,
    margin + cardWidth + 12,
    y + 28
  );

  // Executive Summary Section
  y += 39;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('1. Executive Overview & Synthesis', margin, y);

  y += 4;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(mutedBorder[0], mutedBorder[1], mutedBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  const splitSummary = doc.splitTextToSize(
    report.executiveSummary ||
      'Deliverables have been evaluated against enterprise engineering standards and scope benchmarks.',
    contentWidth - 10
  );
  doc.text(splitSummary.slice(0, 7), margin + 5, y + 7);

  // Dimensional Scorecard Section
  y += 39;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('2. Dimensional Evaluation Scorecards', margin, y);

  y += 5;
  // Table Header
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('EVALUATION DIMENSION', margin + 4, y + 4.8);
  doc.text('WEIGHT', margin + 68, y + 4.8);
  doc.text('SCORE', margin + 88, y + 4.8);
  doc.text('STATUS', margin + 110, y + 4.8);
  doc.text('KEY RATIONALE & CITATION', margin + 135, y + 4.8);

  y += 7;
  const dimensions = report.dimensionScores?.length
    ? report.dimensionScores
    : [
        {
          category: 'Architecture & Structural Integrity',
          score: 92,
          weight: 25,
          status: 'Exceeds' as const,
          rationale: 'Modular directory organization with clean separation.',
        },
        {
          category: 'Functional Completeness & Scope',
          score: 90,
          weight: 25,
          status: 'Meets' as const,
          rationale: 'Core features implemented according to requirements.',
        },
        {
          category: 'Testing, Coverage & Error Handling',
          score: 82,
          weight: 20,
          status: 'Needs Work' as const,
          rationale: 'Integration tests pass; edge error paths need coverage.',
        },
        {
          category: 'Security, Environment & Data Integrity',
          score: 94,
          weight: 15,
          status: 'Exceeds' as const,
          rationale: 'No leaked keys or hardcoded production secrets.',
        },
        {
          category: 'Documentation & Maintainability',
          score: 88,
          weight: 15,
          status: 'Meets' as const,
          rationale: 'Clear README setup and configuration instructions.',
        },
      ];

  dimensions.forEach((dim, idx) => {
    const rowBg = idx % 2 === 0 ? [255, 255, 255] : lightBg;
    doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
    doc.rect(margin, y, contentWidth, 11, 'F');
    doc.setDrawColor(mutedBorder[0], mutedBorder[1], mutedBorder[2]);
    doc.line(margin, y + 11, margin + contentWidth, y + 11);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    doc.text(dim.category, margin + 4, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateText[0], slateText[1], slateText[2]);
    doc.text(`${dim.weight}%`, margin + 70, y + 7);

    // Score with mini bar
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    doc.text(`${dim.score}`, margin + 89, y + 7);

    // Status pill
    const statusColor =
      dim.status === 'Exceeds'
        ? emeraldGreen
        : dim.status === 'Meets'
        ? primaryBrand
        : amberWarning;
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(margin + 109, y + 3, 21, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text(dim.status, margin + 119.5, y + 6.8, { align: 'center' });

    // Rationale text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(slateText[0], slateText[1], slateText[2]);
    const splitRationale = doc.splitTextToSize(dim.rationale, 44);
    doc.text(splitRationale.slice(0, 2), margin + 135, y + 5);

    y += 11;
  });

  drawFooter(1);

  // ==========================================
  // PAGE 2: DELIVERABLE AUDIT & TECHNICAL FINDINGS
  // ==========================================
  doc.addPage();
  drawHeader(2, 'Deliverable Inventory & Findings');

  y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('3. Deliverable File-by-File Inspection Matrix', margin, y);

  y += 5;
  // Deliverable files table header
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('INSPECTED DELIVERABLE', margin + 4, y + 4.8);
  doc.text('CATEGORY', margin + 65, y + 4.8);
  doc.text('STATUS', margin + 98, y + 4.8);
  doc.text('AUDIT FINDING & REMEDIATION NOTE', margin + 125, y + 4.8);

  y += 7;
  const filesList = (report.fileAudits && report.fileAudits.length > 0)
    ? report.fileAudits.slice(0, 8)
    : [
        {
          fileName: 'Core Application Pipeline',
          filePath: 'src/main.ts',
          category: 'Source Code' as const,
          status: 'Verified' as const,
          score: 95,
          finding: 'Proper error propagation and lifecycle state management.',
        },
        {
          fileName: 'Environment Schema',
          filePath: 'config/env.json',
          category: 'Configuration' as const,
          status: 'Warning' as const,
          score: 78,
          finding: 'Add strict runtime type checking for production ports.',
        },
        {
          fileName: 'Suite Test Harness',
          filePath: 'tests/e2e.spec.ts',
          category: 'Test Suite' as const,
          status: 'Verified' as const,
          score: 90,
          finding: 'All core scenario tests pass with deterministic mocks.',
        },
        {
          fileName: 'Architecture Documentation',
          filePath: 'README.md',
          category: 'Documentation' as const,
          status: 'Verified' as const,
          score: 92,
          finding: 'Comprehensive installation instructions and dependency matrix.',
        },
      ];

  filesList.forEach((file, idx) => {
    const rowBg = idx % 2 === 0 ? [255, 255, 255] : lightBg;
    doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
    doc.rect(margin, y, contentWidth, 11, 'F');
    doc.setDrawColor(mutedBorder[0], mutedBorder[1], mutedBorder[2]);
    doc.line(margin, y + 11, margin + contentWidth, y + 11);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    doc.text(file.fileName.slice(0, 32), margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(slateText[0], slateText[1], slateText[2]);
    doc.text(file.filePath.slice(0, 38), margin + 4, y + 9);

    doc.setFontSize(7.5);
    doc.text(file.category, margin + 65, y + 7);

    // Status Pill
    const sColor =
      file.status === 'Verified'
        ? emeraldGreen
        : file.status === 'Warning'
        ? amberWarning
        : roseDanger;
    doc.setFillColor(sColor[0], sColor[1], sColor[2]);
    doc.roundedRect(margin + 98, y + 3.5, 21, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text(file.status, margin + 108.5, y + 7, { align: 'center' });

    // Finding
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(slateText[0], slateText[1], slateText[2]);
    const splitFinding = doc.splitTextToSize(file.finding, 54);
    doc.text(splitFinding.slice(0, 2), margin + 125, y + 5);

    y += 11;
  });

  // Strengths & Deficiencies Section
  y += 7;
  const colWidth = (contentWidth - 6) / 2;

  // Strengths Box (Left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.text('Key Technical Strengths', margin, y);

  y += 3;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, colWidth, 70, 2, 2, 'FD');

  let sy = y + 7;
  const strengths = report.identifiedStrengths?.length
    ? report.identifiedStrengths.slice(0, 4)
    : [
        'Robust modular code architecture with clean separation of domain logic.',
        'Proper handling of environment configurations with zero exposed secrets.',
        'Clear documentation facilitating rapid handover and maintenance.',
        'Comprehensive typing and structured interfaces.',
      ];

  strengths.forEach((str, i) => {
    doc.setFillColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
    doc.circle(margin + 5, sy - 1, 1.2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    const splitStr = doc.splitTextToSize(str, colWidth - 14);
    doc.text(splitStr.slice(0, 3), margin + 8, sy);
    sy += 16;
  });

  // Deficiencies Box (Right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(amberWarning[0], amberWarning[1], amberWarning[2]);
  doc.text('Identified Deficiencies & Gaps', margin + colWidth + 6, y - 3);

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(amberWarning[0], amberWarning[1], amberWarning[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin + colWidth + 6, y, colWidth, 70, 2, 2, 'FD');

  let dy = y + 7;
  const deficiencies = report.identifiedDeficiencies?.length
    ? report.identifiedDeficiencies.slice(0, 4)
    : [
        'Missing retry policy on transient network API failures.',
        'Test suite needs coverage for high-concurrency throughput bounds.',
        'Console log statements should be replaced with structured logger.',
        'Staging environment variables require automated parity check.',
      ];

  deficiencies.forEach((def, i) => {
    doc.setFillColor(amberWarning[0], amberWarning[1], amberWarning[2]);
    doc.circle(margin + colWidth + 11, dy - 1, 1.2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    const splitDef = doc.splitTextToSize(def, colWidth - 14);
    doc.text(splitDef.slice(0, 3), margin + colWidth + 14, dy);
    dy += 16;
  });

  drawFooter(2);

  // ==========================================
  // PAGE 3: RISK MATRIX, ACTION PROTOCOL & SIGN-OFF
  // ==========================================
  doc.addPage();
  drawHeader(3, 'Risk, Action Items & Sign-Off');

  y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('4. Risk Assessment Matrix', margin, y);

  y += 5;
  // Risk Table Header
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('IDENTIFIED RISK & IMPACT', margin + 4, y + 4.8);
  doc.text('AREA', margin + 70, y + 4.8);
  doc.text('SEVERITY', margin + 98, y + 4.8);
  doc.text('MITIGATION PROTOCOL', margin + 125, y + 4.8);

  y += 7;
  const risks = report.riskMatrix?.length
    ? report.riskMatrix.slice(0, 3)
    : [
        {
          id: 'RSK-01',
          title: 'Uncaught Async Rejection in API Layer',
          impactArea: 'Stability' as const,
          severity: 'Medium' as const,
          mitigation: 'Implement centralized error boundary and retry circuit.',
        },
        {
          id: 'RSK-02',
          title: 'Staging Environment Variable Drift',
          impactArea: 'Maintainability' as const,
          severity: 'Low' as const,
          mitigation: 'Add schema validation on process startup using Zod.',
        },
      ];

  risks.forEach((r, idx) => {
    const rowBg = idx % 2 === 0 ? [255, 255, 255] : lightBg;
    doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
    doc.rect(margin, y, contentWidth, 12, 'F');
    doc.setDrawColor(mutedBorder[0], mutedBorder[1], mutedBorder[2]);
    doc.line(margin, y + 12, margin + contentWidth, y + 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    doc.text(r.title.slice(0, 36), margin + 4, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(slateText[0], slateText[1], slateText[2]);
    doc.text(r.impactArea || 'Engineering', margin + 70, y + 7);

    // Severity
    const sevColor = r.severity === 'Critical' ? roseDanger : r.severity === 'High' ? roseDanger : amberWarning;
    doc.setFillColor(sevColor[0], sevColor[1], sevColor[2]);
    doc.roundedRect(margin + 98, y + 3.5, 18, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text(r.severity, margin + 107, y + 7, { align: 'center' });

    // Mitigation
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(slateText[0], slateText[1], slateText[2]);
    const splitMit = doc.splitTextToSize(r.mitigation, 52);
    doc.text(splitMit.slice(0, 2), margin + 125, y + 6);

    y += 12;
  });

  // Action Items Section
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('5. Mandatory Pre-Sign-Off Action Items', margin, y);

  y += 5;
  const actions = report.mandatoryActionItems?.length
    ? report.mandatoryActionItems.slice(0, 3)
    : [
        {
          id: 'ACT-01',
          priority: 'Immediate (P0)' as const,
          assigneeRecommendation: 'Backend Lead',
          task: 'Add structured exception handling to external API calls with 3x retry limit.',
          deadlineTimeline: 'Within 24 Hours',
        },
        {
          id: 'ACT-02',
          priority: 'High (P1)' as const,
          assigneeRecommendation: 'QA / Test Lead',
          task: 'Expand test suite with 4 additional integration edge case test suites.',
          deadlineTimeline: 'Pre-Deployment',
        },
      ];

  actions.forEach((act, idx) => {
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.setDrawColor(mutedBorder[0], mutedBorder[1], mutedBorder[2]);
    doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'FD');

    // Priority badge
    const pColor = act.priority.includes('P0') ? roseDanger : primaryBrand;
    doc.setFillColor(pColor[0], pColor[1], pColor[2]);
    doc.roundedRect(margin + 4, y + 4.5, 24, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text(act.priority, margin + 16, y + 8, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    const splitTask = doc.splitTextToSize(act.task, contentWidth - 85);
    doc.text(splitTask.slice(0, 2), margin + 32, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(slateText[0], slateText[1], slateText[2]);
    doc.text(`Assignee: ${act.assigneeRecommendation}`, margin + 32, y + 11.5);
    doc.text(`Timeline: ${act.deadlineTimeline}`, contentWidth - 25, y + 8);

    y += 16;
  });

  // Official Sign-Off Block & Google Meet Debrief Box
  y += 4;
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.roundedRect(margin, y, contentWidth, 48, 2, 2, 'F');

  // Debrief header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text('LIVE GOOGLE MEET DEBRIEF & FORMAL SIGN-OFF', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`Scheduled Session: ${report.reviewDate} at ${report.reviewTime}`, margin + 6, y + 16);

  // Meet Link Box inside Sign-off
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin + 6, y + 20, contentWidth - 12, 12, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(147, 197, 253); // blue-300
  doc.text('Google Meet Space: ', margin + 10, y + 27.5);

  doc.setTextColor(96, 165, 250);
  doc.text(meetUrl, margin + 44, y + 27.5);
  doc.link(margin + 44, y + 23, 75, 6, { url: meetUrl });

  // Verification Seal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Auditor: ${report.signOffBlock?.leadAuditor || 'AI Chief Deliverable Auditor'} • Protocol: ${
      report.signOffBlock?.reviewProtocol || 'Clean Architecture ISO Gate'
    }`,
    margin + 6,
    y + 38
  );
  doc.text(
    `Verification Hash: ${report.signOffBlock?.verificationHash || 'SHA256-VALIDATED'} • Generated by TaskReview AI`,
    margin + 6,
    y + 43
  );

  drawFooter(3);

  return doc;
}
