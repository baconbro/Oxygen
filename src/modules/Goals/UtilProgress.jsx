export const Progress = ({ item }) => {
    let progressValue;

    if (item && item.type === 'kr') {
        progressValue = calculateKRProgress(item);
        if (progressValue === null && (item.score === 0 || item.score === "0")) {
            progressValue = 0;
        }
    } else {
        progressValue = calculateObjectiveProgress(item);
    }

    if (progressValue === null) {
        return null;
    }

    progressValue = Math.round(progressValue);

    return (
        <div className="d-flex align-items-center">
            <div className="progress h-6px w-100 me-2">
                <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: `${Math.min(progressValue, 100)}%` }}
                    aria-valuenow={progressValue}
                    aria-valuemin="0"
                    aria-valuemax="100"
                ></div>
            </div>
            <span className="text-gray-500 fw-semibold" style={{ minWidth: 35 }}>
                {progressValue}%
            </span>
        </div>
    );
};

const calculateObjectiveProgress = (item) => {
    if (!item || !item.subRows || item.subRows.length === 0) {
        return null;
    }

    let totalProgress = 0;
    let krCount = 0;

    const aggregateKRProgress = (subRows) => {
        subRows.forEach(child => {
            if (child.type === 'kr') {
                const score = Number(child.score);
                const target = Number(child.targetValue);

                if (!isNaN(score) && !isNaN(target) && target !== 0) {
                    totalProgress += score / target;
                    krCount++;
                }
            }
            if (child.subRows && child.subRows.length > 0) {
                aggregateKRProgress(child.subRows);
            }
        });
    };

    aggregateKRProgress(item.subRows);

    return krCount > 0 ? (totalProgress / krCount) * 100 : null;
};

const calculateKRProgress = (item) => {
    if (!item || !item.score || !item.targetValue) {
        return null;
    }
    const score = Number(item.score);
    const target = Number(item.targetValue);

    if (!isNaN(score) && !isNaN(target) && target !== 0) {
        return (score / target) * 100;
    }
    return null;
};

export const WorkProgress = ({ item }) => {
    let progressValue;

    if (item && item.type === 'kr') {
        // For individual KRs, we can't compute work progress without hooks in a loop
        // so we show nothing here; work progress is visible in the detail view
        return null;
    } else {
        progressValue = calculateObjectiveWorkProgress(item);
    }

    if (progressValue === null) {
        return null;
    }

    progressValue = Math.round(progressValue);

    return (
        <div className="d-flex align-items-center">
            <div className="progress h-6px w-100 me-2">
                <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: `${Math.min(progressValue, 100)}%` }}
                    aria-valuenow={progressValue}
                    aria-valuemin="0"
                    aria-valuemax="100"
                ></div>
            </div>
            <span className="text-gray-500 fw-semibold" style={{ minWidth: 35 }}>
                {progressValue}%
            </span>
        </div>
    );
};

const calculateObjectiveWorkProgress = (item) => {
    if (!item || !item.subRows || item.subRows.length === 0) {
        return null;
    }

    // For objectives, derive work progress from the KR progress of children
    let totalProgress = 0;
    let krCount = 0;

    const aggregateProgress = (subRows) => {
        subRows.forEach(child => {
            if (child.type === 'kr') {
                const krProgress = calculateKRProgress(child);
                if (krProgress !== null) {
                    totalProgress += krProgress / 100;
                    krCount++;
                }
            }
            if (child.subRows && child.subRows.length > 0) {
                aggregateProgress(child.subRows);
            }
        });
    };

    aggregateProgress(item.subRows);
    return krCount > 0 ? (totalProgress / krCount) * 100 : null;
};
