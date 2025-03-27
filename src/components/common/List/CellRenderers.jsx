import React from 'react';
import { Avatar } from '../index';
import { Status } from '../../../modules/IssueDetails/Status/Styles';
import { Type, TypeLabel } from '../../../modules/IssueDetails/Type/Styles';
import { User, Username } from '../../../modules/IssueDetails/Reporter/Styles';
import { Priority, Label } from '../../../modules/IssueDetails/Priority/Styles';
import { IssueTypeIcon, IssuePriorityIcon } from '../index';
import { IconComponent, IconText } from '../IssueIconComponent';
import { formatDate } from '../../../utils/dateTime';

// Common cell renderers that can be reused across different lists
export const TruncatedCellRenderer = ({ value }) => {
  return <div className="text-dark fw-bold text-hover-primary fs-6 min-w-300px cursor-pointer">{value}</div>;
};

export const TypeCellRenderer = ({ value, projectConfig }) => {
  return (
    <Type>
      <IssueTypeIcon type={value} top={1} />
      <IconComponent typeId={value} projectConfig={projectConfig} />
      <TypeLabel>
        <IconText typeId={value} projectConfig={projectConfig} />
      </TypeLabel>
    </Type>
  );
};

export const StatusCellRenderer = ({ value, statusMapping }) => {
  return (
    <Status className={`btn btn-${statusMapping[value]}`} color={value}>
      {statusMapping[value]}
    </Status>
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
    <Priority isValue={true}>
      <IssuePriorityIcon priority={value} />
      <Label>{priorityMapping[value]}</Label>
    </Priority>
  );
};

export const UserCellRenderer = ({ value, users }) => {
  const user = users.find(user => user.id === value);
  const name = user ? user.name : '';
  
  return (
    <User isSelectValue={false} withBottomMargin={false}>
      <Avatar avatarUrl={''} name={name} size={25} />
      <Username>{name}</Username>
    </User>
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
