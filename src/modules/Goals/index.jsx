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
  getSortedRowModel,
} from '@tanstack/react-table'
import { useAuth } from '../auth';
import { useFetchOKRs, useFetchSavedViews, useAddSavedView, useDeleteSavedView } from '../../services/okrServices'
import GoalFilter from './goalFilter';
import CreateGoal from './createGoal';
import GoalBoardView from './GoalBoardView';
import { Modal } from 'react-bootstrap';
import { groupTasksByParent } from '../../utils/itemManipulation';
import { Progress, WorkProgress } from './UtilProgress';


const Goals = () => {
  const { currentUser } = useAuth();
  const orgId = currentUser?.all?.currentOrg;
  const { data: okrs, status, error } = useFetchOKRs(orgId);
  const { data: savedViews } = useFetchSavedViews(orgId);
  const addSavedViewMutation = useAddSavedView();
  const deleteSavedViewMutation = useDeleteSavedView();
  const navigate = useNavigate();
  const { setCurrentGoal, orgUsers, filters, setGoals, mergeFilters } = useWorkspace();
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [viewMode, setViewMode] = useState('list'); // 'list', 'board', 'tree'
  const [sorting, setSorting] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showSaveViewInput, setShowSaveViewInput] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  useEffect(() => {
    if (status === 'success' && Array.isArray(okrs)) {
      setData(okrs);
      setGoals(okrs);
    }
  }, [status, okrs]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      let filtered = filterIssues(data, filters, currentUser?.all?.uid);

      // Apply type filter
      if (typeFilter !== 'all') {
        filtered = filtered.filter(g => g.type === typeFilter);
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(g => g.status === statusFilter);
      }

      // Apply archive filter
      if (!showArchived) {
        filtered = filtered.filter(g => !g.isArchived);
      }

      if (viewMode === 'tree' || viewMode === 'list') {
        const groupedTasks = groupTasksByParent(filtered);
        setFilteredIssues(groupedTasks);
      } else {
        setFilteredIssues(filtered);
      }
    }
  }, [data, filters, typeFilter, statusFilter, showArchived, viewMode]);

  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenModal = () => setIsModalOpen(true);

  const handleSaveView = () => {
    if (!newViewName.trim()) return;
    addSavedViewMutation.mutate({
      orgId,
      view: {
        name: newViewName.trim(),
        filters: { ...filters },
        viewMode,
        typeFilter,
        statusFilter,
        showArchived,
        createdBy: currentUser.all.uid,
        orgId,
      },
    });
    setNewViewName('');
    setShowSaveViewInput(false);
  };

  const handleLoadView = (view) => {
    if (view.filters) mergeFilters(view.filters);
    if (view.viewMode) setViewMode(view.viewMode);
    if (view.typeFilter) setTypeFilter(view.typeFilter);
    if (view.statusFilter) setStatusFilter(view.statusFilter);
    if (view.showArchived !== undefined) setShowArchived(view.showArchived);
  };

  const handleDeleteView = (viewId) => {
    deleteSavedViewMutation.mutate({ orgId, viewId });
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
      enableSorting: false,
    }),
    columnHelper.accessor('type', {
      header: () => <span>Type</span>,
      cell: info => (
        <Status
          className={`btn btn-sm btn-${goalType.IssueStatusClass[info.renderValue()] || 'light-primary'}`}
          color={info.renderValue()}
        >
          {goalType.IssueStatusCopy[info.renderValue()] || info.renderValue()}
        </Status>
      ),
    }),
    columnHelper.accessor('status', {
      header: () => <span>Status</span>,
      cell: info => (
        <Status
          className={`btn btn-sm btn-${customStatus.IssueStatusClass[info.renderValue()] || 'secondary'}`}
          color={info.renderValue()}
        >
          {customStatus.IssueStatusCopy[info.renderValue()] || info.renderValue()}
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
    columnHelper.accessor('tags', {
      header: 'Tags',
      cell: info => {
        const tags = info.renderValue();
        if (!tags || tags.length === 0) return null;
        return (
          <div className="d-flex gap-1 flex-wrap">
            {tags.slice(0, 2).map(tag => (
              <span key={tag} className="badge badge-light fs-8">{tag}</span>
            ))}
            {tags.length > 2 && (
              <span className="badge badge-light fs-8">+{tags.length - 2}</span>
            )}
          </div>
        );
      },
      enableSorting: false,
    }),
    columnHelper.accessor('krprogress', {
      header: 'Progress',
      cell: info => {
        const item = info.row.original;
        return <Progress item={item} />;
      },
      minSize: 150,
      enableSorting: false,
    }),
  ];

  const table = useReactTable({
    data: filteredIssues || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSubRows: row => row.subRows,
    state: {
      expanded,
      sorting,
    },
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
                Goals & OKRs
              </h1>
              <span className="text-gray-500 fs-7">Track objectives, key results, and initiatives</span>
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
          <Modal show={isModalOpen} onHide={handleCloseModal} centered size="lg">
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
      {/* Toolbar */}
      <div id="xgn_app_toolbar" className="app-toolbar py-3 py-lg-6">
        <div id="xgn_app_toolbar_container" className="app-container container-xxl d-flex flex-stack">
          <div className="page-title d-flex flex-column justify-content-center flex-wrap me-3">
            <h1 className="page-heading d-flex text-dark fw-bold fs-3 flex-column justify-content-center my-0">
              Goals & OKRs
            </h1>
            <span className="text-gray-500 fs-7">
              {(filteredIssues || []).length} goal{(filteredIssues || []).length !== 1 ? 's' : ''}
              {typeFilter !== 'all' && ` · ${goalType.IssueStatusCopy[typeFilter] || typeFilter}`}
              {statusFilter !== 'all' && ` · ${customStatus.IssueStatusCopy[statusFilter] || statusFilter}`}
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-primary btn-sm" onClick={handleOpenModal}>
              <i className="bi bi-plus"></i> Add a goal
            </button>
          </div>
        </div>
      </div>

      {/* Filters & View Controls */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-5">
        <div className="d-flex flex-wrap align-items-center gap-2 flex-fill">
          <GoalFilter />

          {/* Type filter */}
          <select
            className="form-select form-select-sm w-auto"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">All types</option>
            <option value="objective">Objectives</option>
            <option value="obj">Objectives</option>
            <option value="kr">Key Results</option>
            <option value="initiative">Initiatives</option>
          </select>

          {/* Status filter */}
          <select
            className="form-select form-select-sm w-auto"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {Object.entries(customStatus.IssueStatusCopy).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Archive toggle */}
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`btn btn-sm btn-flex fw-bold ${showArchived ? 'btn-light-primary' : 'bg-body btn-color-gray-700 btn-active-color-primary'}`}
          >
            <i className="bi bi-archive me-1"></i>
            {showArchived ? 'Showing archived' : 'Show archived'}
          </button>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Saved Views dropdown */}
          {savedViews && savedViews.length > 0 && (
            <div className="dropdown">
              <button
                className="btn btn-sm btn-light dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-bookmark me-1"></i> Views
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                {savedViews.map(view => (
                  <li key={view.id} className="dropdown-item d-flex justify-content-between align-items-center">
                    <span
                      className="cursor-pointer flex-fill"
                      onClick={() => handleLoadView(view)}
                    >
                      {view.name}
                    </span>
                    <i
                      className="bi bi-x text-gray-400 text-hover-danger cursor-pointer ms-2"
                      onClick={(e) => { e.stopPropagation(); handleDeleteView(view.id); }}
                    ></i>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Save current view */}
          {showSaveViewInput ? (
            <div className="d-flex gap-1">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="View name"
                value={newViewName}
                onChange={e => setNewViewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveView()}
                autoFocus
                style={{ width: 120 }}
              />
              <button className="btn btn-sm btn-primary" onClick={handleSaveView}>
                <i className="bi bi-check"></i>
              </button>
              <button className="btn btn-sm btn-light" onClick={() => setShowSaveViewInput(false)}>
                <i className="bi bi-x"></i>
              </button>
            </div>
          ) : (
            <button
              className="btn btn-sm btn-light"
              onClick={() => setShowSaveViewInput(true)}
              title="Save current view"
            >
              <i className="bi bi-bookmark-plus"></i>
            </button>
          )}

          {/* View mode toggle */}
          <div className="btn-group btn-group-sm">
            <button
              className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-light'}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <i className="bi bi-list-ul"></i>
            </button>
            <button
              className={`btn ${viewMode === 'tree' ? 'btn-primary' : 'btn-light'}`}
              onClick={() => { setViewMode('tree'); setExpanded({}); }}
              title="Tree view"
            >
              <i className="bi bi-diagram-3"></i>
            </button>
            <button
              className={`btn ${viewMode === 'board' ? 'btn-primary' : 'btn-light'}`}
              onClick={() => setViewMode('board')}
              title="Board view"
            >
              <i className="bi bi-kanban"></i>
            </button>
          </div>
        </div>
      </div>

      <HeaderInsight />

      {/* Board View */}
      {viewMode === 'board' && (
        <GoalBoardView goals={data} orgUsers={orgUsers} />
      )}

      {/* List / Tree View */}
      {(viewMode === 'list' || viewMode === 'tree') && (
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
                          style={{
                            minWidth: header.column.columnDef.minSize,
                            cursor: header.column.getCanSort() ? 'pointer' : 'default',
                          }}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="d-flex align-items-center gap-1">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            {header.column.getIsSorted() === 'asc' && <i className="bi bi-sort-up fs-8"></i>}
                            {header.column.getIsSorted() === 'desc' && <i className="bi bi-sort-down fs-8"></i>}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map(row => {
                    const goal = row.original;
                    const isArchived = goal.isArchived;
                    const isPaused = goal.isPaused || goal.status === 'paused';

                    return (
                      <tr
                        key={row.id}
                        className={`table-row-hover ${isArchived ? 'opacity-50' : ''}`}
                      >
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
                    );
                  })}
                </tbody>
              </table>
              {filteredIssues.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <i className="bi bi-funnel fs-2x text-gray-300 mb-3 d-block"></i>
                  No goals match the current filters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <Modal show={isModalOpen} onHide={handleCloseModal} centered size="lg">
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
