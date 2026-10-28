import { EvaluationReport } from '../types/review';

const STORAGE_KEY = 'taskreview_audit_vault_v1';

export function getSavedReports(): EvaluationReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load saved reports from localStorage:', err);
    return [];
  }
}

export function saveReportToVault(newReport: EvaluationReport): {
  report: EvaluationReport;
  allReports: EvaluationReport[];
} {
  const existing = getSavedReports();

  // Find previous evaluation for the same project or folder name
  const previous = existing.find(
    (r) =>
      r.projectName?.toLowerCase() === newReport.projectName?.toLowerCase() ||
      r.taskFolderName?.toLowerCase() === newReport.taskFolderName?.toLowerCase()
  );

  let version = 1;
  let versionDelta = undefined;

  if (previous) {
    version = (previous.version || 1) + 1;
    const scoreDiff = newReport.overallScore - previous.overallScore;

    // Check which deficiencies from the previous review appear to be addressed
    const resolvedDeficiencies: string[] = [];
    if (previous.identifiedDeficiencies) {
      for (const oldDef of previous.identifiedDeficiencies) {
        // If not in new report's deficiencies, considered resolved or mitigated
        const stillPresent = newReport.identifiedDeficiencies?.some((newDef) =>
          newDef.toLowerCase().includes(oldDef.slice(0, 20).toLowerCase())
        );
        if (!stillPresent) {
          resolvedDeficiencies.push(oldDef);
        }
      }
    }

    versionDelta = {
      scoreDiff,
      resolvedDeficiencies,
      newFindings: newReport.identifiedDeficiencies?.slice(0, 2) || [],
      summary:
        scoreDiff >= 0
          ? `Score improved by +${scoreDiff} points compared to Revision ${previous.version || 1}. ${resolvedDeficiencies.length} previous action items resolved.`
          : `Score adjusted by ${scoreDiff} points compared to Revision ${previous.version || 1}. Further remediation needed.`,
    };
  }

  const finalizedReport: EvaluationReport = {
    ...newReport,
    version,
    revisionLabel: `v${version}.0 ${version > 1 ? '(Iterative Revision)' : '(Initial Delivery)'}`,
    previousReviewId: previous?.id,
    versionDelta,
    createdAt: Date.now(),
  };

  // Prepend to list (most recent first)
  const updatedList = [finalizedReport, ...existing.filter((r) => r.id !== finalizedReport.id)];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.warn('Failed to persist report to localStorage:', err);
  }

  return {
    report: finalizedReport,
    allReports: updatedList,
  };
}

export function deleteReportFromVault(id: string): EvaluationReport[] {
  const existing = getSavedReports();
  const filtered = existing.filter((r) => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Failed to update localStorage after delete:', err);
  }
  return filtered;
}

export function clearVault(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear vault:', err);
  }
}
