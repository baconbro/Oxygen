import React, { Fragment, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar } from '../../../components/common';
import Filters from '../Board/Filters/filter';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';
import { Status } from '../../IssueDetails/Status/Styles';
import { IssueStatusCopy } from '../../../constants/issues';
import AddItem from '../Board/Lists/List/AddItem';
import EmptyList from '../../../components/common/emptyStates/emptyList';
import { Type, TypeLabel } from '../../IssueDetails/Type/Styles';
import { IssuePriorityCopy } from '../../../constants/issues';
import { IssueTypeIcon, IssuePriorityIcon } from '../../../components/common';
import { User, Username } from '../../IssueDetails/Reporter/Styles';
import { formatDate } from '../../../utils/dateTime';
import { Priority, Label } from '../../IssueDetails/Priority/Styles';
import { IconComponent, IconText } from '../../../components/common/IssueIconComponent';
import { filterIssues } from '../../../utils/issueFilterUtils';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getExpandedRowModel,
  ColumnDef,//for column pinning
  getSortedRowModel,
} from '@tanstack/react-table'
import { useAuth } from '../../auth';
import { Modal, Button } from 'react-bootstrap';
import { groupTasksByParent } from '../../../utils/itemManipulation';


const defaultData = [
  {
    title: 'tanner',
    owner: 'linsley',
    objectiveId: 24,
    work: 90,
    status: 'In Relationship',
    progress: ["test", "again"],
    score: 60,
    subRows: [
      {
        title: 'tanner',
        owner: 'linsley',
        objectiveId: 24,
        work: 90,
        status: 'In Relationship',
        progress: ["test", "again"],
        score: 60,
      }
    ]
  },
  {
    title: 'tandy',
    owner: 'miller',
    age: 40,
    visits: 40,
    status: 'Single',
    progress: 80,
  },
  {
    firstName: 'joe',
    lastName: 'dirte',
    age: 45,
    visits: 20,
    status: 'Complicated',
    progress: 10,
  },
]



const List = () => {
  const { currentUser } = useAuth();
  const match = useLocation();
  const navigate = useNavigate();
  const { project, setCurrentGoal, } = useWorkspace();
  const [refreshData, setRefreshData] = React.useState(true);
  const { projectUsers, defaultFilters, filters, mergeFilters } = useWorkspace();
  const [showPrioritization, setShowPrioritization] = useState(project.config.workspaceConfig?.board?.rice || false);
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const reloadGoals = () => {
    if (project) {

      if (Object.keys(filteredIssues).length > 0) {
        const groupedTasks = groupTasksByParent(filteredIssues);

        // Convert the object of grouped tasks into an array of parent tasks
        setData(Object.values(groupedTasks));
        //setData(filteredIssues)
        setRefreshData(false);
        return
      }
      // Group tasks by parent
      const groupedTasks = groupTasksByParent(project.issues);

      // Convert the object of grouped tasks into an array of parent tasks
      setData(Object.values(groupedTasks));
      //setData(project.issues);
      setRefreshData(false);
      return
    }
  };

  const handleDataRefresh = () => {
    setRefreshData(true); // Trigger data retrieval by updating the state
    reloadGoals()
  };

  useEffect(() => {
    // This useEffect will be triggered whenever the `filters` state changes
    // and it will set `refreshData` to true
    setRefreshData(true);
  }, [filters]);


  useEffect(() => {
    if (refreshData) {
      reloadGoals();
      setRefreshData(false); // Reset the state after fetching data
    }
  }, [refreshData]);

  const [data, setData] = React.useState(() => [...defaultData])
  const rerender = React.useReducer(() => ({}), {})[1]
  const [expanded, setExpanded] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [sorting, setSorting] = React.useState([])
  const filteredIssues = filterIssues(project.issues, filters, currentUser?.all?.uid);

  const columnHelper = createColumnHelper()

  const defaultColumns = [
    columnHelper.accessor('type', {
      cell: ({ row, getValue }) => (
        <div
          style={{
            // Since rows are flattened by default,
            // we can use the row.depth property
            // and paddingLeft to visually indicate the depth
            // of the row
            paddingLeft: `${row.depth * 4}rem`
          }}
        >


          <RenderTask type={getValue()} />

        </div>),
      header: () => <span>Type</span>
      //footer: info => info.column.id,
    }),
    columnHelper.accessor('reporterId', {
      id: 'Reporter',
      cell: info => <OwnerName reporterId={info.getValue()} />,
      header: () => <span>Owner</span>,
      //footer: info => info.column.id,
    }),
    columnHelper.accessor('title', {
      header: () => 'Title',
      cell: value => <TruncatedCellRenderer value={value.getValue()} />,
      width: 300,
      //footer: info => info.column.id,
    }),
    columnHelper.accessor('status', {
      header: () => <span>Status</span>,
      cell: info => <Status className={`btn btn-${IssueStatusCopy[info.renderValue()]}`} color={info.renderValue()}>{IssueStatusCopy[info.renderValue()]}</Status>,
      //footer: info => info.column.id,
    }),
    columnHelper.accessor('id', {
      header: 'Key',
      cell: info => info.renderValue(),
      //footer: info => info.column.id,
    }),
    columnHelper.accessor('dueDate', {
      header: 'Due date',
      cell: info => <GetFormattedInputValue value={info.renderValue()} />,
      //footer: info => info.column.id,
    }),
    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: info => <RenderPriority priority={info.renderValue()} />,
      //footer: info => info.column.id,
    }),
    /*    
       columnHelper.accessor('reach', {
          header: 'Reach',
          cell: info => <Dots count={info.renderValue() || 0} />,
          //footer: info => info.column.id,
        }),
        columnHelper.accessor('impact', {
          header: 'Impact',
          cell: info => <Dots count={info.renderValue() || 0} />,
          //footer: info => info.column.id,
        }),
        columnHelper.accessor('confidence', {
          header: 'Confidence',
          cell: info => <Dots count={info.renderValue() || 0} />,
          //footer: info => info.column.id,
        }),
        columnHelper.accessor('effort', {
          header: 'Effort',
          cell: info => <Dots count={info.renderValue() || 0} />,
          //footer: info => info.column.id,
        }),
        columnHelper.accessor('rice', {
          header: 'RICE',
          cell: info => info.renderValue(),
          //footer: info => info.column.id,
        }),  */


  ]


  const [columns] = React.useState(() => [
    ...defaultColumns,
  ])

  //get the owner name 
  const OwnerName = ({ reporterId }) => {
    const foundItem = projectUsers.find(item => item.id === reporterId);
    let name = ''
    if (foundItem) {
      name = foundItem.name;
    }

    return (
      <User
        isSelectValue={false}
        withBottomMargin={false}
      >
        <Avatar avatarUrl={''} name={name} size={25} />
        <Username>{name}</Username>
      </User>)
  }
  const returnIssue = (id) => {
    return project.issues.find((issue) => issue.id === id);
  }

  const Progress = ({ progress }) => {
    return (
      <div className='progress h-6px w-100'>
        <div
          className='progress-bar bg-primary'
          role='progressbar'
          style={{ width: '50%' }}
        ></div>
      </div>
    )


  };
  const Score = ({ score }) => {
    return (
      <div className="d-flex align-items-senter">
        <span className={`badge badge-light-${score} fs-base`}>
          {score}
        </span>
      </div>
    )
  };
  // Custom cell renderer with text-truncate class
  const TruncatedCellRenderer = ({ value }) => {
    return <div className="text-dark fw-bold text-hover-primary fs-6 min-w-300px  cursor-pointer" >{value}</div>;
  };
  const RenderTask = ({ type }) => {
    return (
      <Type >
        <IssueTypeIcon type={type} top={1} />
        <IconComponent typeId={type} projectConfig={project.config} />
        <TypeLabel>
          <IconText typeId={type} projectConfig={project.config} />
        </TypeLabel>
      </Type>
    )
  }

  const GetFormattedInputValue = ({ value }) => {
    if (!value) return '';
    return <span className="badge badge-light">{formatDate(value)}</span>
  };

  const RenderPriority = ({ priority }) => (
    <Priority isValue={true}>
      <IssuePriorityIcon priority={priority} />
      <Label>{IssuePriorityCopy[priority]}</Label>
    </Priority>
  );
  const Dot = ({ active }) => (
    <i
      className={`bi bi-circle-fill fs-5 ${active ? 'text-primary' : 'text-light'}`}
      style={{ margin: '0 2px' }}
    />
  );

  const Dots = ({ count }) => {
    const dots = new Array(10).fill(null).map((_, index) => <Dot key={index} active={index < count} />);
    return <div className="d-flex flex-column flex-row-fluid">
      <div className="d-flex flex-column-auto h-25px  flex-center">{dots}
      </div>
    </div>;
  };



  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSubRows: row => row.subRows,
    state: {
      expanded,
      columnVisibility,
      sorting,
    },
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  })

  const handleRowClick = (row) => {
    //get the object from data that matches the id
    const goal = data.find((goal) => goal.id === row.getValue('id'));
    setCurrentGoal(goal);
    /*     const drawerToggle = document.getElementById('goals_drawer_detail_toggle');
        drawerToggle.click(); */
    navigate(`issues/${row.getValue('id')}`)

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


      <div className='card kanban' >
        <div className='card-body' style={{ padding: "1rem 1rem" }}>
          <div className="table-responsive">
            <table className='table table-row-dashed table-row-gray-300 gy-3'>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className='fw-bold fs-6 text-gray-800'>
                    <th key={'expand' + headerGroup.id} className="max-w-50px min-w-25px">

                    </th>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} >
                        {header.isPlaceholder
                          ? null : (
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? 'cursor-pointer select-none'
                                  : '',
                                onClick: header.column.getToggleSortingHandler(),
                              }}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: <><i className="bi bi-filter-circle-fill fs-6 me-1 ms-2 text-primary"></i><i className="bi bi-arrow-up "></i></>,
                                desc: <><i className="bi bi-filter-circle-fill fs-6 me-1 ms-2 text-primary"></i><i className="bi bi-arrow-down "></i></>,
                              }[header.column.getIsSorted()] ?? null}
                            </div>
                          )}
                      </th>


                    ))}
                    <th key={'expand'} className="max-w-50px min-w-25px">
                      <div className="m-0">
                        <a
                          href="#"
                          className="btn btn-sm btn-flex bg-body btn-color-gray-700 btn-active-color-primary fw-bold"
                          onClick={handleShowModal}
                        >
                          <i className="bi bi-plus fs-6 text-muted me-1"></i>
                        </a>
                        <Modal show={showModal} onHide={handleCloseModal}>
                          <Modal.Header closeButton>
                            <Modal.Title>Columns</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div className=" w-250px w-md-300px"  >
                              <div className="separator border-gray-200"></div>
                              <div className="px-7 py-5">
                                <div className="mb-10">
                                  <div className="mb-10 form-check">
                                    <label className="form-check-label fw-semibold mb-3">
                                      <input
                                        {...{
                                          type: 'checkbox',
                                          checked: table.getIsAllColumnsVisible(),
                                          onChange: table.getToggleAllColumnsVisibilityHandler(),
                                          className: 'form-check-input',
                                        }}
                                      />{' '}
                                      Toggle All
                                    </label>
                                  </div>
                                  {table.getAllLeafColumns().map(column => {
                                    return (
                                      <div key={column.id} className="px-1 form-check mb-3">
                                        <label className='form-check-label'>
                                          <input
                                            {...{
                                              type: 'checkbox',
                                              checked: column.getIsVisible(),
                                              onChange: column.getToggleVisibilityHandler(),
                                              className: 'form-check-input',
                                            }}
                                          />{' '}
                                          {column.id}
                                        </label>
                                      </div>
                                    )
                                  })}
                                </div>

                              </div>
                            </div>
                          </Modal.Body>
                          <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                              Close
                            </Button>
                          </Modal.Footer>
                        </Modal>
                      </div>
                    </th>
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} >
                    {/* Add a custom column with the expanding button */}
                    <td>
                      {row.getCanExpand() ? (
                        <button className='btn btn-icon btn-light btn-active-light-primary toggle h-25px w-25px me-1 '
                          {...{
                            onClick: row.getToggleExpandedHandler(),
                            style: {},
                          }}
                        >
                          {row.getIsExpanded() ? <span className="bi bi-dash fs-3 m-0"></span> : <span className="bi bi-plus fs-3 m-0 "></span>}
                        </button>
                      ) : (
                        ''
                      )}{''}
                    </td>
                    {/* Render the other data columns */}
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} onClick={() => {
                        if (cell.id === row.id + '_title') {
                          handleRowClick(row)
                        } else {
                          // do something else
                        }
                      }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {table.getFooterGroups().map(footerGroup => (
                  <tr key={footerGroup.id}>
                    {footerGroup.headers.map(header => (
                      <th key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.footer,
                            header.getContext()
                          )}
                      </th>
                    ))}
                  </tr>
                ))}
              </tfoot>
            </table>
            <div className="h-4" />
            {/*             <button onClick={() => rerender()} className="border p-2">
                Rerender
              </button> */}
          </div>
        </div>
      </div>

      {(!data || data.length === 0) ?
        <EmptyList /> : ('')
      }

    </>
  );
};

export default List;