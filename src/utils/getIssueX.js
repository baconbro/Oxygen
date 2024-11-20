export function getIssueField(issues, issueId, field) {
    // Convert issueId to a number for comparison
    const numericIssueId = Number(issueId);

    const issue = issues.find(issue => issue.id === numericIssueId);
    if (issue) {
        return issue[field];
    }
    return null;
}

export const getParentIssueIds = (issueId, projectIssues) => {
    const parentIds = [];
    const visited = new Set();

    const findParent = (currentIssueId) => {
        if (visited.has(currentIssueId)) {
            return; // Stop recursion if the parent ID has already been visited
        }
        visited.add(currentIssueId);

        const issue = projectIssues.find(issue => issue.id === Number(currentIssueId));
        if (issue && issue.parent) {
            parentIds.unshift(issue.parent);
            findParent(issue.parent);
        }
    };

    findParent(issueId);

    return parentIds;
};
