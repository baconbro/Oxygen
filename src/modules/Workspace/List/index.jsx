import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';
import { IssueStatusCopy, IssuePriorityCopy } from '../../../constants/issues';
import { filterIssues } from '../../../utils/issueFilterUtils';
import { createColumnHelper } from '@tanstack/react-table';
import { useAuth } from '../../auth';
import { groupTasksByParent } from '../../../utils/itemManipulation';
import Filters from '../Board/Filters/filter';
import EmptyList from '../../../components/common/emptyStates/emptyList';
import GenericList from '../../../components/common/List/GenericList';
import { 
  TruncatedCellRenderer, 
  TypeCellRenderer, 
  StatusCellRenderer, 
  DateCellRenderer, 
  PriorityCellRenderer, 
  UserCellRenderer,
  DotsRenderer
} from '../../../components/common/List/CellRenderers';

const List = () => {
  const { currentUser } = useAuth();
  const match = useLocation();
  const navigate = useNavigate();
  const { project, setCurrentGoal, projectUsers, orgUsers, defaultFilters, filters, mergeFilters } = useWorkspace();
  const [refreshData, setRefreshData] = useState(true);
  const [showPrioritization, setShowPrioritization] = useState(project.config.workspaceConfig?.board?.rice || false);
  const [data, setData] = useState([]);
  
  // Create a comprehensive statusMapping object from project configuration
  const statusMapping = {};
  const statusColors = {};
  
  if (project && project.config && project.config.issueStatus) {
    project.config.issueStatus.forEach(status => {
      statusMapping[status.id] = status.name;
      statusColors[status.id] = status.borderColor || '#FF5733'; // Default color if not specified
    });
  }
  
  const filteredIssues = filterIssues(project.issues, filters, currentUser?.all?.uid);

  const reloadGoals = () => {
    if (project) {
      if (Object.keys(filteredIssues).length > 0) {
        const groupedTasks = groupTasksByParent(filteredIssues);
        setData(Object.values(groupedTasks));
        setRefreshData(false);
        return;
      }
      
      const groupedTasks = groupTasksByParent(project.issues);
      setData(Object.values(groupedTasks));
      setRefreshData(false);
    }
  };

  const handleDataRefresh = () => {
    setRefreshData(true);
    reloadGoals();
  };

  useEffect(() => {
    setRefreshData(true);
  }, [filters]);

  useEffect(() => {
    if (refreshData) {
      reloadGoals();
      setRefreshData(false);
    }
  }, [refreshData]);

  const columnHelper = createColumnHelper();

  // Define columns for this specific list implementation
  const columns = [
    columnHelper.accessor('type', {
      cell: ({ row, getValue }) => (
        <div style={{ paddingLeft: `${row.depth * 4}rem` }}>
          <TypeCellRenderer value={getValue()} projectConfig={project.config} />
        </div>
      ),
      header: () => <span>Type</span>
    }),
    columnHelper.accessor('reporterId', {
      id: 'Reporter',
      cell: info => <UserCellRenderer value={info.getValue()} orgUsers={orgUsers} />,
      header: () => <span>Owner</span>,
    }),
    columnHelper.accessor('title', {
      header: () => 'Title',
      cell: value => <TruncatedCellRenderer value={value.getValue()} />,
      width: 300,
    }),
    columnHelper.accessor('status', {
      header: () => <span>Status</span>,
      cell: info => (
        <StatusCellRenderer 
          value={info.renderValue()} 
          statusMapping={{...IssueStatusCopy, ...statusMapping}} 
          statusColors={statusColors}
        />
      ),
    }),
    columnHelper.accessor('id', {
      header: 'Key',
      cell: info => info.renderValue(),
    }),
    columnHelper.accessor('dueDate', {
      header: 'Due date',
      cell: info => <DateCellRenderer value={info.renderValue()} />,
    }),
    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: info => <PriorityCellRenderer value={info.renderValue()} priorityMapping={IssuePriorityCopy} />,
    }),
  ];

  // If prioritization is enabled, add additional columns
  if (showPrioritization) {
    columns.push(
      columnHelper.accessor('reach', {
        header: 'Reach',
        cell: info => <DotsRenderer count={info.renderValue() || 0} />,
      }),
      columnHelper.accessor('impact', {
        header: 'Impact',
        cell: info => <DotsRenderer count={info.renderValue() || 0} />,
      }),
      columnHelper.accessor('confidence', {
        header: 'Confidence',
        cell: info => <DotsRenderer count={info.renderValue() || 0} />,
      }),
      columnHelper.accessor('effort', {
        header: 'Effort',
        cell: info => <DotsRenderer count={info.renderValue() || 0} />,
      }),
      columnHelper.accessor('rice', {
        header: 'RICE',
        cell: info => info.renderValue(),
      })
    );
  }

  const handleRowClick = (row, cell) => {
    if (cell.id.endsWith('_title')) {
      const goal = data.find((goal) => goal.id === row.getValue('id'));
      setCurrentGoal(goal);
      navigate(`issues/${row.getValue('id')}`);
    }
  };

  return (
    <>
      <div className="d-flex align-items-center py-2 py-md-1 ">
        <Filters
          projectUsers={projectUsers}
          defaultFilters={defaultFilters}
          filters={filters}
          mergeFilters={mergeFilters}
        />
      </div>

      <GenericList 
        data={data}
        columns={columns}
        onRowClick={handleRowClick}
        emptyComponent={EmptyList}
        getSubRows={row => row.subRows}
      />
    </>
  );
};

export default List;