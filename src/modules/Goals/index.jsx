import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../components/common';
import { useWorkspace } from '../../contexts/WorkspaceProvider';
import { Status } from '../IssueDetails/Status/Styles';
import { customStatus, getScoreColor, goalType } from '../../constants/custom';
import EmptyGoals from '../../components/common/emptyStates/emptyGoals';
import { filterIssues } from '../../utils/issueFilterUtils';
import HeaderInsight from './headerInsight';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getExpandedRowModel,
} from '@tanstack/react-table'
import { useAuth } from '../auth';
import { useFetchOKRs } from '../../services/okrServices'
import GoalFilter from './goalFilter';
import CreateGoal from './createGoal';
import { Modal } from 'react-bootstrap';
import { groupTasksByParent } from '../../utils/itemManipulation';
import { Progress, WorkProgress } from './UtilProgress';


const Goals = () => {
  const { currentUser } = useAuth();
  const { data: okrs, status, error } = useFetchOKRs(currentUser?.all?.currentOrg);
  const navigate = useNavigate();
  const { setCurrentGoal, orgUsers, filters, setGoals } = useWorkspace();
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (status === 'success' && Array.isArray(okrs)) {
      setData(okrs);
      setGoals(okrs);
    }
  }, [status, okrs]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const filtered = filterIssues(data, filters, currentUser?.all?.uid);
      const groupedTasks = groupTasksByParent(filtered);
      setFilteredIssues(groupedTasks);
    }
  }, [data, filters]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor('title', {
      cell: ({ row, getValue }) => (
        <div
          style={{
            paddingLeft: `${row.depth * 2}rem`,
            cursor: 'pointer',
          }}
          className="fw-semibold text-gray-800 text-hover-primary"
        >
          {getValue()}
        </div>
      ),
      header: () => <span>Goal</span>,
    }),
    columnHelper.accessor('reporterId', {
      id: 'Owner',
      cell: info => <OwnerName reporterId={info.getValue()} orgUsers={orgUsers} />,
      header: () => <span>Owner</span>,
    }),
    columnHelper.accessor('type', {
      header: () => <span>Type</span>,
      cell: info => (
        <Status
          className={`btn btn-sm btn-${goalType.IssueStatusClass[info.renderValue()]}`}
          color={info.renderValue()}
        >
          {goalType.IssueStatusCopy[info.renderValue()]}
        </Status>
      ),
    }),
    columnHelper.accessor('status', {
      header: () => <span>Status</span>,
      cell: info => (
        <Status
          className={`btn btn-sm btn-${customStatus.IssueStatusClass[info.renderValue()]}`}
          color={info.renderValue()}
        >
          {customStatus.IssueStatusCopy[info.renderValue()]}
        </Status>
      ),
    }),
    columnHelper.accessor('score', {
      header: 'Score',
      cell: info => <Score score={info.renderValue()} />,
    }),
    columnHelper.accessor('cadence', {
      header: 'Cadence',
      cell: info => <span className="text-gray-600">{info.renderValue()}</span>,
    }),
    columnHelper.accessor('workprogress', {
      header: 'Work Progress',
      cell: info => {
        const item = info.row.original;
        return <WorkProgress item={item} />;
      },
      minSize: 150,
    }),
    columnHelper.accessor('krprogress', {
      header: 'Key Result Progress',
      cell: info => {
        const item = info.row.original;
        return <Progress item={item} />;
      },
      minSize: 150,
    }),
  ];

  const table = useReactTable({
    data: filteredIssues || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSubRows: row => row.subRows,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
  });

  const handleRowClick = (row) => {
    const goal = okrs.find((goal) => goal.id === row.original.id);
    if (goal) {
      setCurrentGoal(goal);
    }
    navigate(`details?id=${row.original.id}`);
  };

  if (status === 'loading') {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-10">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="text-gray-600">Loading goals...</div>
      </div>
    );
  }

  if (status === 'error' || error) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-10">
        <div className="text-gray-600">
          {error instanceof Error ? `Error: ${error.message}` : 'Error loading goals'}
        </div>
      </div>
    );
  }

  if (!okrs || okrs.length === 0) {
    return (
      <>
        <div id="xgn_app_toolbar" className="app-toolbar py-3 py-lg-6">
          <div id="xgn_app_toolbar_container" className="app-container container-xxl d-flex flex-stack">
            <div className="page-title d-flex flex-column justify-content-center flex-wrap me-3">
              <h1 className="page-heading d-flex text-dark fw-bold fs-3 flex-column justify-content-center my-0">
                Objectives and Key Results
              </h1>
            </div>
            <div>
              <button className="btn btn-primary btn-sm" onClick={handleOpenModal}>
                <i className="bi bi-plus"></i> Create your first goal
              </button>
            </div>
          </div>
        </div>
        <EmptyGoals />
        {isModalOpen && (
          <Modal show={isModalOpen} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>New Goal</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <CreateGoal modalClose={handleCloseModal} />
            </Modal.Body>
          </Modal>
        )}
      </>
    );
  }

  return (
    <>
      <GoalFilter />
      <HeaderInsight />
      <div id="xgn_app_toolbar" className="app-toolbar py-3 py-lg-6">
        <div id="xgn_app_toolbar_container" className="app-container container-xxl d-flex flex-stack">
          <div className="page-title d-flex flex-column justify-content-center flex-wrap me-3">
            <h1 className="page-heading d-flex text-dark fw-bold fs-3 flex-column justify-content-center my-0">
              Objectives and Key Results
            </h1>
          </div>
          <div>
            <button className="btn btn-primary btn-sm" onClick={handleOpenModal}>
              <i className="bi bi-plus"></i> Add a goal
            </button>
          </div>
        </div>
      </div>

      <div className="card kanban">
        <div className="card-body" style={{ padding: '1rem 1rem' }}>
          <div className="table-responsive">
            <table className="table table-row-dashed table-row-gray-300 gy-3">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="fw-bold fs-6 text-gray-800">
                    <th key={'expand' + headerGroup.id} className="max-w-50px min-w-25px"></th>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        style={{ minWidth: header.column.columnDef.minSize }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="table-row-hover">
                    <td>
                      {row.getCanExpand() ? (
                        <button
                          className="btn btn-icon btn-light btn-active-light-primary toggle h-25px w-25px me-1"
                          onClick={row.getToggleExpandedHandler()}
                        >
                          {row.getIsExpanded()
                            ? <span className="bi bi-dash fs-3 m-0"></span>
                            : <span className="bi bi-plus fs-3 m-0"></span>
                          }
                        </button>
                      ) : null}
                    </td>
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        onClick={() => handleRowClick(row)}
                        style={{ cursor: 'pointer' }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal show={isModalOpen} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>New Goal</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <CreateGoal modalClose={handleCloseModal} />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

// Extracted outside the render function to avoid re-creating on every render
const OwnerName = ({ reporterId, orgUsers }) => {
  let name = '';
  let avatarUrl = '';

  if (orgUsers && orgUsers.users) {
    Object.values(orgUsers.users).forEach(user => {
      if (user.uid === reporterId) {
        name = user.name || user.displayName || user.fName || '';
        avatarUrl = user.photoURL || '';
      }
    });
  }

  return <Avatar avatarUrl={avatarUrl} name={name} size={25} className="avatar-circle" />;
};

const Score = ({ score }) => (
  <div className="d-flex align-items-center">
    <span className={`badge badge-light-${getScoreColor(score)} fs-base`}>
      {score}
    </span>
  </div>
);

export default Goals;
