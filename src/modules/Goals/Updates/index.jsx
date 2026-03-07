import { sortByNewest } from '../../../utils/javascript';
import UpdatesCreate from './Create';
import DetailsUpdate from './Comment';



const UpdatesComponent = ({ issue, updateIssue, object }) => {
  const updates = issue[object];
  const hasUpdates = updates && updates.length > 0;

  return (
    <div className="pt-[40px]">
      <UpdatesCreate issue={issue} updateIssue={updateIssue} object={object} />

      {hasUpdates && (
        <div className="mt-6">
          <div className="d-flex align-items-center mb-4">
            <i className="bi bi-clock-history fs-5 text-gray-500 me-2"></i>
            <h6 className="fw-bold text-gray-700 m-0">Check-in History</h6>
            <span className="badge badge-light-primary ms-2">{updates.length}</span>
          </div>
          <div className="timeline">
            {sortByNewest(updates, 'createdAt').map(comment => (
              <DetailsUpdate key={comment.id} comment={comment} issue={issue} updateIssue={updateIssue} object={object} />
            ))}
          </div>
        </div>
      )}

      {!hasUpdates && (
        <div className="d-flex flex-column align-items-center py-6 mt-4">
          <i className="bi bi-graph-up-arrow fs-2x text-gray-300 mb-3"></i>
          <div className="text-gray-500 fw-semibold mb-1">No check-ins yet</div>
          <div className="text-gray-400 fs-7">Record your first check-in to start tracking progress over time.</div>
        </div>
      )}
    </div>
  );
};

export default UpdatesComponent;
