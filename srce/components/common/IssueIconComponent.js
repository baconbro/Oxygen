const getIssueTypeDetails = (typeId, projectConfig) => {
  return Object.values(projectConfig.issueType).find(issueType => issueType.id === typeId);
};

export const IconComponent = ({ typeId, projectConfig }) => {
  const issueTypeDetails = getIssueTypeDetails(typeId, projectConfig);

  if (!issueTypeDetails) return null; // Or some default icon

  const { icon, color } = issueTypeDetails;
  const iconClass = `bi bi-${icon}`;

  return (
    <i className={iconClass}
      style={{
        color: color,
        display: 'inline-block',
        fontSize: '18px'
      }}></i>
  );
};

export const IconText = ({ typeId, projectConfig }) => {
  const issueTypeDetails = getIssueTypeDetails(typeId, projectConfig);

  if (!issueTypeDetails) return null; // Or some default icon

  const { name } = issueTypeDetails;

  return name;
};


