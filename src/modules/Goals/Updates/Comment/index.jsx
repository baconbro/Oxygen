import { formatDateTimeConversational } from '../../../../utils/dateTime';
import { ConfirmModal } from '../../../../components/common';
import { Avatar } from '../../../../components/common';
import { useWorkspace } from '../../../../contexts/WorkspaceProvider';
import { customStatus, getScoreColor } from '../../../../constants/custom';


const DetailsUpdate = ({ comment, issue, updateIssue, object }) => {
  const { orgUsers } = useWorkspace();

  const findUser = () => {
    if (orgUsers?.users) {
      return Object.values(orgUsers.users).find(u => u.email === comment.user);
    }
    return null;
  };
  const user = findUser();
  const displayName = user?.name || user?.displayName || user?.fName || comment.user || 'Unknown';

  const handleCommentDelete = async () => {
    try {
      const updatedComments = issue[object].filter(c => c.id !== comment.id);
      updateIssue({ [object]: updatedComments });
    } catch (error) {
      console.error('Error deleting update:', error);
    }
  };

  const hasScoreChange = comment.oldScore !== null && comment.oldScore !== undefined;
  const hasStatusChange = comment.oldStatus && comment.oldStatus !== comment.newStatus;

  return (
    <div className="relative mt-[25px] text-[15px]">
      <div className="d-flex mb-6">
        <div className="me-4">
          <Avatar className="relative top-0 left-0" name={user?.name} avatarUrl={user?.avatarUrl} />
        </div>
        <div className="flex-fill">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <span className="text-gray-800 fw-bold me-2">{displayName}</span>
              <span className="text-gray-400 fw-semibold fs-7">
                {formatDateTimeConversational(comment.createdAt)}
              </span>
            </div>
            <ConfirmModal
              title="Delete this check-in?"
              message="This will remove the check-in record. The goal's current score and status won't be affected."
              confirmText="Delete"
              onConfirm={handleCommentDelete}
              className="card card-flush border-0 h-md-100"
              renderLink={modal => (
                <div onClick={modal.open} className="inline-block py-[2px] text-gray-400 text-[14.5px] cursor-pointer hover:underline pl-[10px] text-hover-danger">
                  <i className="bi bi-trash fs-7"></i>
                </div>
              )}
            />
          </div>

          {/* Changes */}
          <div className="border border-gray-200 rounded p-3">
            <div className="d-flex flex-wrap gap-4 align-items-center">
              {/* Score change */}
              {comment.newScore !== null && comment.newScore !== undefined && (
                <div className="d-flex align-items-center gap-2">
                  <span className="text-gray-500 fs-7 fw-semibold">Value:</span>
                  {hasScoreChange && (
                    <>
                      <span className={`badge badge-light-${getScoreColor(comment.oldScore)} fs-7`}>
                        {comment.oldScore}
                      </span>
                      <i className="bi bi-arrow-right text-gray-400 fs-8"></i>
                    </>
                  )}
                  <span className={`badge badge-light-${getScoreColor(comment.newScore)} fs-7`}>
                    {comment.newScore}
                  </span>
                </div>
              )}

              {/* Status change */}
              {comment.newStatus && (
                <div className="d-flex align-items-center gap-2">
                  <span className="text-gray-500 fs-7 fw-semibold">Status:</span>
                  {hasStatusChange && (
                    <>
                      <div
                        className={`btn btn-sm btn-${customStatus.IssueStatusClass[comment.oldStatus] || 'secondary'}`}
                        style={{ fontSize: '0.7rem', padding: '1px 6px' }}
                      >
                        {customStatus.IssueStatusCopy[comment.oldStatus] || comment.oldStatus}
                      </div>
                      <i className="bi bi-arrow-right text-gray-400 fs-8"></i>
                    </>
                  )}
                  <div
                    className={`btn btn-sm btn-${customStatus.IssueStatusClass[comment.newStatus] || 'secondary'}`}
                    style={{ fontSize: '0.7rem', padding: '1px 6px' }}
                  >
                    {customStatus.IssueStatusCopy[comment.newStatus] || comment.newStatus}
                  </div>
                </div>
              )}
            </div>

            {/* Summary / Comment body */}
            {comment.body && (
              <div className="mt-3 pt-3 border-top border-gray-200">
                <span className="text-gray-700 fs-7">{comment.body}</span>
              </div>
            )}

            {/* Structured fields from StatusUpdateComposer */}
            {comment.risks && (
              <div className="mt-2 pt-2 border-top border-gray-100">
                <div className="d-flex align-items-start gap-2">
                  <i className="bi bi-exclamation-triangle text-danger fs-8 mt-1"></i>
                  <div>
                    <span className="text-gray-500 fs-8 fw-semibold">Risks: </span>
                    <span className="text-gray-600 fs-8">{comment.risks}</span>
                  </div>
                </div>
              </div>
            )}

            {comment.decisions && (
              <div className="mt-2 pt-2 border-top border-gray-100">
                <div className="d-flex align-items-start gap-2">
                  <i className="bi bi-signpost-split text-primary fs-8 mt-1"></i>
                  <div>
                    <span className="text-gray-500 fs-8 fw-semibold">Decisions: </span>
                    <span className="text-gray-600 fs-8">{comment.decisions}</span>
                  </div>
                </div>
              </div>
            )}

            {comment.learnings && (
              <div className="mt-2 pt-2 border-top border-gray-100">
                <div className="d-flex align-items-start gap-2">
                  <i className="bi bi-lightbulb text-success fs-8 mt-1"></i>
                  <div>
                    <span className="text-gray-500 fs-8 fw-semibold">Learnings: </span>
                    <span className="text-gray-600 fs-8">{comment.learnings}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsUpdate;
