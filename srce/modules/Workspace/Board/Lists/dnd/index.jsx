import Board from "./board/Board";


const Dnd = ({
  project,
  filters,
  updateLocalProjectIssues,
}) => {


  const groupIssuesByStatus = (issues, issueStatus) => {
    // Convert the issueStatus array into an object with status IDs as keys for faster lookup
    const statusLookup = issueStatus.reduce((lookup, status) => {
      lookup[status.id] = status.name;
      return lookup;
    }, {});

    // Initialize groups for all statuses, even if there are no issues for them
    const groupedByStatusId = issueStatus.reduce((groups, status) => {
      groups[status.name] = [];
      return groups;
    }, {});

    // Group the issues by their status ID
    issues.forEach((issue) => {
      const statusName = statusLookup[issue.status];
      if (!statusName) return; // Skip if status not found

      // Transform the issue object as needed (e.g., adding author details)
      const transformedIssue = {
        ...issue, // Copy all original fields from the issue object
        id: String(issue.id), //for the dnd only -maybe change it later to simplify and have the same type everywhere
        content: issue.title,

        // Other transformation logic can go here
      };

      groupedByStatusId[statusName].push(transformedIssue);
    });

    // Sort the issues within each status group by listPosition
    Object.values(groupedByStatusId).forEach((group) => {
      group.sort((a, b) => a.listPosition - b.listPosition);
    });

    return groupedByStatusId;
  };

  const groupedIssues = groupIssuesByStatus(project.issues, project.config.issueStatus);

  return (
    <>
      <Board initial={groupedIssues}
        withScrollableColumns
        project={project}
        filters={filters}
        updateLocalProjectIssues={updateLocalProjectIssues} />
    </>
  );
}

export default Dnd