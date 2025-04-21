import { useGetItem } from '../../services/itemServices';
import { useAuth } from '../auth';

const WorkLink = ({ issueId }) => {
    const { currentUser } = useAuth();
    const { data: items, isLoading, error } = useGetItem(issueId, currentUser?.all?.currentOrg);
    
    if (isLoading) {
        return <div>Loading...</div>;
    }
    
    if (error || !items || items.length === 0) {
        return <div>No work is linked. Go to work item to link to this goal</div>;
    }

    return (
        <div>
            <div className="overflow-auto pb-5">
                {items.map(item => (
                    <div key={item.id} className="d-flex align-items-center border border-dashed border-gray-300 rounded min-w-750px px-7 py-3 mb-5">
                        <a
                            href={`/workspace/${item.projectId}/board/issues/${item.id}`}
                            className="fs-5 text-gray-900 text-hover-primary fw-semibold w-375px min-w-200px"
                        >
                            {item.title}
                        </a>
                        <div className="d-flex align-items-center w-100 mw-125px">
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
        </div>
    );
};

export default WorkLink;