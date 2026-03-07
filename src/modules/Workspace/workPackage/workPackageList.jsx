import { useEffect, useState } from 'react';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';
import { Status } from '../../IssueDetails/Status/Styles';
import EmptyList from '../../../components/common/emptyStates/emptyList';
import { formatDate } from '../../../utils/dateTime';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getExpandedRowModel,
  getSortedRowModel,
} from '@tanstack/react-table'
import { useAuth } from '../../auth';
import { Modal } from 'react-bootstrap';
import CreateWorkPackage from './createWorkPackage';
import { useGetWorkPackages } from '../../../services/workPackageServices';


const defaultData = [
  {
    title: 'Version 1.0',
    startDate: 909,
    endDate: 8080,
    status: 'Released',
    progress: [1, 2],
    description: 'kjkjj'
  }
]


const WorkPackageList = () => {
  const { currentUser } = useAuth();
  const { project } = useWorkspace();
  const [refreshData, setRefreshData] = useState(true);
  const {filters } = useWorkspace();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wpData, setWpData] = useState(null);
  const { data: spaceData } = useGetWorkPackages(project.spaceId, currentUser?.all?.currentOrg);
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setWpData(null);
    setRefreshData(true);
    reload()
  };

  const reload = () => {
    if (project) {
      setData(spaceData);
      setRefreshData(false);
      return
    }
  };

  const handleDataRefresh = () => {
    setRefreshData(true); // Trigger data retrieval by updating the state
    reload()
  };

  useEffect(() => {
    setRefreshData(true);
  }, [filters, spaceData]);

  useEffect(() => {
    if (refreshData) {
      reload();
      setRefreshData(false); // Reset the state after fetching data
    }
  }, [refreshData]);

  const [data, setData] = useState(() => [...defaultData])
  const [expanded, setExpanded] = useState({})
  const [columnVisibility, setColumnVisibility] = useState({})
  const [sorting, setSorting] = useState([])

  const columnHelper = createColumnHelper()

  const defaultColumns = [
    columnHelper.accessor('title', {
      header: () => 'Package title',
      cell: value => <TruncatedCellRenderer value={value.getValue()} />,
      //footer: info => info.column.id,
    }),
    columnHelper.accessor('desc', {
      cell: value => <TruncatedCellRenderer value={value.getValue()} />,
      header: () => <span>Description</span>,
      //footer: info => info.column.id,
    }),
    columnHelper.accessor('status', {
      header: () => <span>Status</span>,
      cell: info => <Status className={`btn`}>{info.renderValue()}</Status>,
      //footer: info => info.column.id,
    }),
    columnHelper.accessor('startDate', {
      header: 'Start date',
      cell: info => <GetFormattedInputValue value={info.renderValue()} />,
      //footer: info => info.column.id,
    }),
    columnHelper.accessor('endDate', {
      header: 'End date',
      cell: info => <GetFormattedInputValue value={info.renderValue()} />,
      //footer: info => info.column.id,
    }),
    columnHelper.accessor('progress', {
      header: 'Progress',
      cell: info => {
        const title = info.row.getValue('title');
        return <Progress title={title} />;
      },
      minSize: 150,
      //footer: info => info.column.id,
    }),
  ]


  const [columns] = useState(() => [
    ...defaultColumns,
  ])

  const returnIssue = (id) => {
    return project.issues.find((issue) => issue.id === id);
  }

 /*  const Progress = ( {title} ) => {
    return (
      <div className="flex items-center gap-1 mb-1">
        {title}
        <div className='progress h-6px w-100'>
          <div
            className='progress-bar bg-primary'
            role='progressbar'
            style={{ width: '50%' }}
          ></div>

          {/*     Next it would be by status color ( new option to come )
 <div
          className='progress-bar bg-warning'
          role='progressbar'
          style={{ width: '20%' }}
        ></div>
        <div
          className='progress-bar bg-success'
          role='progressbar'
          style={{ width: '30%' }}
        ></div> 

        </div>
      </div>
    )


  }; */
  const Progress = ({ title }) => {
  
    // Get all issues with the given work package title
    const issues = project.issues.filter(issue => issue.wpkg === title);
  
    // Total number of issues
    const totalIssues = issues.length || 1;
  
    // Count issues by status
    const statusCounts = issues.reduce((counts, issue) => {
      const status = issue.status; // Adjust property name if different
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});
  
    // Define colors for each status
    const statusColors = {
      1: 'bg-warning',
      2: 'bg-primary',
      3: 'bg-success',
      4: 'bg-danger',
      5: 'bg-info',
      6: 'bg-dark',
      // Add other statuses if needed
    };
  
    // Generate progress bar segments
    const progressSegments = Object.keys(statusCounts).map(status => {
      const widthPercent = (statusCounts[status] / totalIssues) * 100;
      const colorClass = statusColors[status] || 'bg-secondary';
      return (
        <div
          key={status}
          className={`progress-bar ${colorClass}`}
          role="progressbar"
          style={{ width: `${widthPercent}%` }}
        ></div>
      );
    });
  
    return (
      <div className="progress h-6px w-100">
        {progressSegments}
      </div>
    );
  };

  // Custom cell renderer with text-truncate class
  const TruncatedCellRenderer = ({ value }) => {
    return <div className="text-dark fw-bold text-hover-primary fs-6 cursor-pointer" >{value}</div>;
  };


  const GetFormattedInputValue = ({ value }) => {
    if (!value) return '';
    return <span className="badge badge-light">{formatDate(value)}</span>
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

  const handleRowClick = (rowData) => {
    if (rowData.original) {
      setWpData(rowData.original);
    }
    handleOpenModal();

  };

  return (
    <>
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
                      <th key={header.id}
                      style={{ minWidth: header.column.columnDef.minSize }}  // Set the min width of the column
                      >
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
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} >
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
            <button className='btn btn-primary me-2 mb-2 ms-2' onClick={handleOpenModal}><i className='bi bi-plus'></i>Add a work package</button>
          </div>
        </div>
      </div>

      {(!data || data.length === 0) ? <EmptyList /> : ('')}

      {isModalOpen &&
        <Modal show={isModalOpen} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <CreateWorkPackage modalClose={handleCloseModal} wpgData={wpData} />
          </Modal.Body>
          <Modal.Footer>
          </Modal.Footer>
        </Modal>
      }
    </>
  );
};

export default WorkPackageList;