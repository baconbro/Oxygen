import { Avatar } from '../index';

import { IssueTypeIcon, IssuePriorityIcon } from '../index';
import { IconComponent, IconText } from '../IssueIconComponent';
import { formatDate } from '../../../utils/dateTime';

// Common cell renderers that can be reused across different lists
export const TruncatedCellRenderer = ({ value }) => {
  return <div className="text-dark fw-bold text-hover-primary fs-6 min-w-300px cursor-pointer">{value}</div>;
};

export const TypeCellRenderer = ({ value, projectConfig }) => {
  return (
    <div className="flex items-center gap-2">
      <IssueTypeIcon type={value} top={1} />
      <IconComponent typeId={value} projectConfig={projectConfig} />
      <span className="text-sm">
        <IconText typeId={value} projectConfig={projectConfig} />
      </span>
    </div>
  );
};

export const StatusCellRenderer = ({ value, statusMapping, statusColors }) => {
  const borderColor = statusColors && statusColors[value] ? statusColors[value] : '#FF5733';

  return (
    <div
      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded btn btn-${statusMapping[value]}`}
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      {statusMapping[value]}
    </div>
  );
};

export const DateCellRenderer = ({ value }) => {
  if (!value) return '';

  // Calculate date status
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDateObj = new Date(value);
  dueDateObj.setHours(0, 0, 0, 0);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  let statusClass = 'badge-light'; // default styling

  if (dueDateObj < today) {
    statusClass = 'badge-danger'; // overdue - red
  } else if (dueDateObj.getTime() === today.getTime()) {
    statusClass = 'badge-warning'; // due today - yellow
  } else if (dueDateObj < nextWeek) {
    statusClass = 'badge-success'; // due this week - green
  }

  return <span className={`badge ${statusClass}`}>{formatDate(value)}</span>;
};

export const PriorityCellRenderer = ({ value, priorityMapping }) => {
  return (
    <div className="flex items-center gap-2">
      <IssuePriorityIcon priority={value} />
      <span className="text-sm">{priorityMapping[value]}</span>
    </div>
  );
};

export const UserCellRenderer = ({ value, users, orgUsers }) => {
  let name = '';
  let avatarUrl = '';

  if (orgUsers && value) {
    const orgUser = orgUsers.users ? orgUsers.users[value] : null;
    if (orgUser) {
      name = orgUser.name || orgUser.displayName || orgUser.email;
      avatarUrl = orgUser.photoURL || "";
    }
  } else if (users) {
    // Fallback to projectUsers if orgUsers not available
    const user = users.find(user => user.id === value);
    name = user ? user.name : '';
    avatarUrl = user ? user.photoURL : '';
  }

  return (
    <div className="flex items-center">
      <Avatar avatarUrl={avatarUrl} name={name} size={25} className='avatar-circle' />
    </div>
  );
};

export const DotsRenderer = ({ count }) => {
  const Dot = ({ active }) => (
    <i
      className={`bi bi-circle-fill fs-5 ${active ? 'text-primary' : 'text-light'}`}
      style={{ margin: '0 2px' }}
    />
  );

  const dots = new Array(10).fill(null).map((_, index) => (
    <Dot key={index} active={index < count} />
  ));

  return (
    <div className="d-flex flex-column flex-row-fluid">
      <div className="d-flex flex-column-auto h-25px flex-center">{dots}</div>
    </div>
  );
};
