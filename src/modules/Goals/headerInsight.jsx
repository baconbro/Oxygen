import { useWorkspace } from "../../contexts/WorkspaceProvider";
import { customStatus } from "../../constants/custom";

const HeaderInsight = () => {
    const { goals } = useWorkspace();

    // Get the list of statuses
    const statuses = Object.values(customStatus.IssueStatus);

    // Initialize counts for each status
    const statusCounts = statuses.reduce((counts, status) => {
        counts[status] = 0;
        return counts;
    }, {});

    // Count goals by status
    goals.forEach(goal => {
        if (statusCounts.hasOwnProperty(goal.status)) {
            statusCounts[goal.status]++;
        }
    });

    return (
        <div className="row g-5 gx-xl-10 mb-5 mb-xl-10" >
            {statuses.map(status => (
                <div
                    key={status}
                    className="col-md-3 col-lg-3 col-xl-6 col-xxl-3 mb-md-5 mb-xl-10 text-white"

                >
                    <div className={`card bg-${customStatus.IssueStatusClass[status]}`}>
                        <div className="card-body ">
                            <h3 className="text-white">{customStatus.IssueStatusCopy[status]}</h3>
                            <p style={{ fontSize: '2em' }}>{statusCounts[status]}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HeaderInsight;