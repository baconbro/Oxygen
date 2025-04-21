import { useGetItem } from "../../services/itemServices";
import { useAuth } from "../auth";


const GetItem = ({ item }) => {
    const { currentUser } = useAuth();
    //get the work linked to the KR
    const { data: workItems, isLoading, error } = useGetItem(item.id, currentUser?.all?.currentOrg);
    // wait during data fetching
    if (isLoading) {
        return null;
    }
    //if error or no work item is linked
    if (error || !workItems || workItems.length === 0) {
        return null;
    }
    
    // If there are multiple items linked, calculate the average progress
    let totalProgress = 0;
    let itemCount = 0;
    
    workItems.forEach(workItem => {
        if (workItem.progress !== undefined && workItem.progress !== null) {
            totalProgress += Number(workItem.progress);
            itemCount++;
        }
    });
    
    // Return the average progress, or null if no valid progress values
    return itemCount > 0 ? totalProgress / itemCount : null;
};

export const Progress = ({ item }) => {
    let progressValue;

    if (item && item.type === 'kr') {
        progressValue = calculateKRProgress(item);
        if (progressValue === null && (item.score === 0 || item.score === "0")) {
            progressValue = 0;
        }
    } else {
        progressValue = calculateProgress(item);
    }


    if (progressValue === null) {
        return null;
    }
    //round the progress value
    progressValue = Math.round(progressValue);

    return (
        <>
            <div className="progress h-6px w-100">
                <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: `${progressValue}%` }}
                    aria-valuenow={progressValue}
                    aria-valuemin="0"
                    aria-valuemax="100"
                ></div>
            </div>
            <span class="text-gray-500 fw-semibold">
                {progressValue}%
            </span>
        </>
    );
};

const calculateProgress = (item) => {
    if (!item || !item.subRows || item.subRows.length === 0) {
        return null;
    }

    let totalProgress = 0;
    let krCount = 0;

    const calculateKRProgress = (subRows) => {
        subRows.forEach(child => {
            if (child.type === 'kr') {
                const score = Number(child.score);
                const target = Number(child.targetValue); // Use targetValue

                if (!isNaN(score) && !isNaN(target) && target !== 0) { // Check for valid numbers and avoid division by zero
                    totalProgress += score / target;
                    krCount++;
                }
            }
            if (child.subRows && child.subRows.length > 0) {
                calculateKRProgress(child.subRows);
            }
        });
    };

    calculateKRProgress(item.subRows);

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
}

export const WorkProgress = ({ item }) => {
    let progressValue;

    if (item && item.type === 'kr') {
        progressValue = calculateKRWorkProgress(item);
        if (progressValue === null && (item.score === 0 || item.score === "0")) {
            progressValue = 0;
        }
    } else {
        progressValue = calculateWorkProgress(item);
    }

    if (progressValue === null) {
        return null;
    }
    // round the progress value
    progressValue = Math.round(progressValue);

    return (
        <>
            <div className="progress h-6px w-100">
                <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: `${progressValue}%` }}
                    aria-valuenow={progressValue}
                    aria-valuemin="0"
                    aria-valuemax="100"
                ></div>
            </div>
            <span class="text-gray-500 fw-semibold">
                {progressValue}%
            </span>
        </>
    );
};
const calculateWorkProgress = (item) => {
    if (!item || !item.subRows || item.subRows.length === 0) {
        return null;
    }

    let totalProgress = 0;
    let krCount = 0;

    const calculateKRWorkProgress = (subRows) => {
        subRows.forEach(item => {
            if (item.type === 'kr') {
                const workProgress = GetItem({ item })

                if (!isNaN(workProgress) && workProgress !== 0) { // Check for valid numbers and avoid division by zero
                    totalProgress += workProgress / 100;
                    krCount++;
                }
            }
            if (item.subRows && item.subRows.length > 0) {
                calculateKRWorkProgress(item.subRows);
            }
        });
    };
    calculateKRWorkProgress(item.subRows);

    return krCount > 0 ? (totalProgress / krCount) * 100 : null;
};

const calculateKRWorkProgress = (item) => {
    if (!item) {
        return null;
    }
    const progress = GetItem({ item });
    return progress !== null ? progress : null;
}