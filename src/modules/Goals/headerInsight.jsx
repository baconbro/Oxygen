import { useWorkspace } from "../../contexts/WorkspaceProvider";
import { customStatus } from "../../constants/custom";

const HeaderInsight = () => {
    const { goals } = useWorkspace();

    if (!goals || goals.length === 0) return null;

    const statuses = Object.values(customStatus.IssueStatus);

    const statusCounts = statuses.reduce((counts, status) => {
        counts[status] = 0;
        return counts;
    }, {});

    goals.forEach(goal => {
        if (statusCounts.hasOwnProperty(goal.status)) {
            statusCounts[goal.status]++;
        }
    });

    return (
        <div className="row g-5 gx-xl-10 mb-5 mb-xl-10">
            {statuses.map(status => (
                <div
                    key={status}
                    className="col-6 col-md-3 col-xxl mb-md-5 mb-xl-0"
                >
                    <div className={`card bg-${customStatus.IssueStatusClass[status]}`}>
                        <div className="card-body py-4 px-5">
                            <div className="d-flex align-items-center justify-content-between">
                                <h4 className="text-white mb-0 fs-6">
                                    {customStatus.IssueStatusCopy[status]}
                                </h4>
                                <span className="text-white fs-2 fw-bold">
                                    {statusCounts[status]}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HeaderInsight;
