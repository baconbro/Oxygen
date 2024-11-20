import { moveItemWithinArray, insertItemIntoArray } from './javascript';

const calculateIssueListPosition = (...args) => {
    const { prevIssue, nextIssue } = getAfterDropPrevNextIssue(...args);
    const prevIssueLisposition = prevIssue ? Number(prevIssue.listPosition) : null;
    const nextIssueListPosition = nextIssue ? Number(nextIssue.listPosition) : null;
    let position;
    if (!prevIssue && !nextIssue) {
        position = 1000;
    } else if (!prevIssue) {
        position = nextIssueListPosition - 10;
    } else if (!nextIssue) {
        position = prevIssueLisposition + 10;
    } else {
        const midpoint = prevIssueLisposition + (nextIssueListPosition - prevIssueLisposition) / 2;
        // Calculate the number of decimal places needed to avoid collision
        const numDecimals = Math.ceil(-Math.log10(Math.abs(nextIssueListPosition - prevIssueLisposition))) + 1;
        position = midpoint.toFixed(numDecimals);
    }
    return position;
};
const getAfterDropPrevNextIssue = (allIssues, destination, source, droppedIssueId, issueStatus) => {
    const statusId = findIdByName(destination.droppableId, issueStatus)
    const beforeDropDestinationIssues = getSortedListIssues(allIssues, statusId);
    const droppedIssue = allIssues.find(issue => issue.id === droppedIssueId);
    const isSameList = destination.droppableId === source.droppableId;

    const afterDropDestinationIssues = isSameList
        ? moveItemWithinArray(beforeDropDestinationIssues, droppedIssue, destination.index)
        : insertItemIntoArray(beforeDropDestinationIssues, droppedIssue, destination.index);

    return {
        prevIssue: afterDropDestinationIssues[destination.index - 1],
        nextIssue: afterDropDestinationIssues[destination.index + 1],
    };
};

const getSortedListIssues = (issues, status) =>
    issues.filter(issue => issue.status === status).sort((a, b) => a.listPosition - b.listPosition);

export const findIdByName = (name, statusArray) => {
    const status = statusArray.find((status) => status.name === name);
    return status ? status.id : null; // Return the ID if found, otherwise return null
};

export default calculateIssueListPosition;