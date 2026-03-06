import { useGetItem } from '../../services/itemServices';
import { useAuth } from '../auth';

const WorkLink = ({ issueId }) => {
    const { currentUser } = useAuth();
    const { data: items, isLoading, error } = useGetItem(issueId, currentUser?.all?.currentOrg);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center py-5">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error || !items || items.length === 0) {
        return (
            <div className="d-flex flex-column align-items-center py-5">
                <i className="bi bi-link-45deg fs-2x text-gray-400 mb-2"></i>
                <div className="text-gray-500">No work items linked. Go to a work item to link it to this goal.</div>
            </div>
        );
    }

    return (
        <div className="overflow-auto pb-5">
            {items.map(item => (
                <div
                    key={item.id}
                    className="d-flex align-items-center border border-dashed border-gray-300 rounded px-7 py-3 mb-3"
                >
                    <a
                        href={`/workspace/${item.projectId}/board/issues/${item.id}`}
                        className="fs-5 text-gray-900 text-hover-primary fw-semibold flex-grow-1 min-w-200px"
                    >
                        {item.title}
                    </a>
                    <div className="d-flex align-items-center" style={{ minWidth: 125 }}>
                        <div className="progress h-6px w-100 me-2 bg-light-success">
                            <div
                                className="progress-bar bg-primary"
                                role="progressbar"
                                style={{ width: `${item.progress || 0}%` }}
                                aria-valuenow={item.progress || 0}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            ></div>
                        </div>
                        <span className="text-gray-500 fw-semibold">
                            {item.progress || 0}%
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default WorkLink;
