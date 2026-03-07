import { useState } from 'react';
import { useAuth } from '../auth';
import { customStatus } from '../../constants/custom';
import { Status } from '../IssueDetails/Status/Styles';

const StatusUpdateComposer = ({ issue, updateIssue, onCancel }) => {
  const { currentUser } = useAuth();
  const [newStatus, setNewStatus] = useState(issue.status || 'pending');
  const [newScore, setNewScore] = useState(issue.score || 0);
  const [summary, setSummary] = useState('');
  const [risks, setRisks] = useState('');
  const [decisions, setDecisions] = useState('');
  const [learnings, setLearnings] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isKeyResult = issue.type === 'kr';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!summary.trim()) return;

    try {
      setIsSubmitting(true);
      const now = Math.floor(Date.now());
      const updateEntry = {
        id: Math.floor(1000000000 + Math.random() * 9000000000),
        body: summary,
        issueId: issue.id,
        createdAt: now,
        user: currentUser.all.email,
        newScore: isKeyResult ? Number(newScore) : null,
        newStatus: newStatus,
        oldStatus: issue.status !== newStatus ? issue.status : null,
        oldScore: issue.score !== Number(newScore) ? issue.score : null,
        risks: risks || null,
        decisions: decisions || null,
        learnings: learnings || null,
      };

      const updatedUpdates = issue.updates ? [...issue.updates, updateEntry] : [updateEntry];
      const fieldsToUpdate = {
        updates: updatedUpdates,
        status: newStatus,
        updatedAt: now,
      };

      if (isKeyResult) {
        fieldsToUpdate.score = Number(newScore);
      }

      // Also append to risks/learnings arrays if provided
      if (risks.trim()) {
        const riskEntry = {
          id: Math.floor(1000000000 + Math.random() * 9000000000),
          body: risks,
          issueId: issue.id,
          createdAt: now,
          user: currentUser.all.email,
        };
        fieldsToUpdate.risks = issue.risks ? [...issue.risks, riskEntry] : [riskEntry];
      }

      if (learnings.trim()) {
        const learningEntry = {
          id: Math.floor(1000000000 + Math.random() * 9000000000),
          body: learnings,
          issueId: issue.id,
          createdAt: now,
          user: currentUser.all.email,
        };
        fieldsToUpdate.learnings = issue.learnings ? [...issue.learnings, learningEntry] : [learningEntry];
      }

      await updateIssue(fieldsToUpdate);

      if (onCancel) onCancel();
    } catch (error) {
      console.error('Error creating status update:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card card-flush border border-primary border-dashed">
        <div className="card-header pt-5 pb-0 border-0">
          <div className="d-flex align-items-center">
            <i className="bi bi-pencil-square fs-4 text-primary me-2"></i>
            <h5 className="fw-bold text-gray-800 m-0 fs-6">Status Update</h5>
          </div>
        </div>
        <div className="card-body pt-4">
          {/* Status + Score row */}
          <div className="row g-3 mb-4">
            <div className={isKeyResult ? 'col-md-6' : 'col-12'}>
              <label className="form-label fw-semibold text-gray-600 fs-7 mb-2">Status</label>
              <div className="d-flex flex-wrap gap-2">
                {Object.values(customStatus.IssueStatus).map(statusVal => (
                  <button
                    key={statusVal}
                    type="button"
                    className={`btn btn-sm ${newStatus === statusVal
                      ? `btn-${customStatus.IssueStatusClass[statusVal]}`
                      : `btn-outline btn-outline-${customStatus.IssueStatusClass[statusVal]} btn-active-light-${customStatus.IssueStatusClass[statusVal]}`
                    }`}
                    onClick={() => setNewStatus(statusVal)}
                  >
                    {customStatus.IssueStatusCopy[statusVal]}
                  </button>
                ))}
              </div>
            </div>
            {isKeyResult && (
              <div className="col-md-6">
                <label className="form-label fw-semibold text-gray-600 fs-7 mb-2">
                  Current Value
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={newScore}
                  onChange={e => setNewScore(e.target.value)}
                  placeholder="Enter current value"
                />
              </div>
            )}
          </div>

          {/* Summary (required) */}
          <div className="mb-4">
            <label className="form-label fw-semibold text-gray-600 fs-7 mb-2 required">
              Summary
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="What's the current state? What progress was made?"
              required
            />
          </div>

          {/* Risks */}
          <div className="mb-4">
            <label className="form-label fw-semibold text-gray-600 fs-7 mb-2">
              <i className="bi bi-exclamation-triangle text-danger me-1"></i>
              Risks & Blockers
              <span className="text-gray-400 fs-8 ms-1">(optional)</span>
            </label>
            <textarea
              className="form-control"
              rows={2}
              value={risks}
              onChange={e => setRisks(e.target.value)}
              placeholder="Any blockers, dependencies, or risks?"
            />
          </div>

          {/* Decisions */}
          <div className="mb-4">
            <label className="form-label fw-semibold text-gray-600 fs-7 mb-2">
              <i className="bi bi-signpost-split text-primary me-1"></i>
              Key Decisions
              <span className="text-gray-400 fs-8 ms-1">(optional)</span>
            </label>
            <textarea
              className="form-control"
              rows={2}
              value={decisions}
              onChange={e => setDecisions(e.target.value)}
              placeholder="Any decisions made or direction changes?"
            />
          </div>

          {/* Learnings */}
          <div className="mb-4">
            <label className="form-label fw-semibold text-gray-600 fs-7 mb-2">
              <i className="bi bi-lightbulb text-success me-1"></i>
              Learnings
              <span className="text-gray-400 fs-8 ms-1">(optional)</span>
            </label>
            <textarea
              className="form-control"
              rows={2}
              value={learnings}
              onChange={e => setLearnings(e.target.value)}
              placeholder="What did you learn?"
            />
          </div>

          {/* Actions */}
          <div className="d-flex justify-content-end gap-2">
            {onCancel && (
              <button type="button" className="btn btn-light btn-sm" onClick={onCancel}>
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isSubmitting || !summary.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1"></span>
                  Posting...
                </>
              ) : (
                <>
                  <i className="bi bi-check2 me-1"></i>
                  Post Update
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default StatusUpdateComposer;
