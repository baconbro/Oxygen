import React, { useState, useEffect, useReducer } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useMergeState from '../../hooks/mergeState';
import { Avatar } from '../../components/common';

import * as FirestoreService from '../../services/firestore';
import { useWorkspace } from '../../contexts/WorkspaceProvider';

import { Status } from '../IssueDetails/Status/Styles';
import { customStatus, getScoreColor } from '../../constants/custom';
import AddGoal from './goal-drawer/AddGoal';
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


const defaultFilters = {
  searchTerm: '',
  userIds: [],
  myOnly: false,
  recent: false,
  groupBy: 'None',
  viewType: [],
  viewStatus: [],
};



const Goals = () => {
  const { currentUser } = useAuth();
  const { data: okrs, status, error } = useFetchOKRs(currentUser?.all?.currentOrg);
  const match = useLocation();
  const navigate = useNavigate();
  const { setCurrentGoal, setOrgUsers, setHighLevelWorkItems, orgUsers , filters, setGoals} = useWorkspace();
  const [refreshData, setRefreshData] = React.useState(true);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [data, setData] = useState(() => [...defaultData])

 // const [filters, mergeFilters] = useMergeState(defaultFilters);

  const reloadGoals = () => {
        setRefreshData(false);
  };


  // Fetch OKRs when status is 'success'
  useEffect(() => {
    if (status === 'success' && Array.isArray(okrs)) {
      setData(okrs);
      setGoals(okrs);
    }
  }, [status, okrs]);

    // Filter issues when data or filters change
    useEffect(() => {
      const issues = data; // Assume 'data' contains issues
      if (issues && Array.isArray(issues)) {
        const filtered = filterIssues(issues, filters,currentUser?.all?.uid);
        setFilteredIssues(filtered);
      }
    }, [data, filters]);



  const handleDataRefresh = () => {
    setRefreshData(true); // Trigger data retrieval by updating the state
    reloadGoals()
  };




  useEffect(() => {
    if (refreshData) {
      //reloadGoals();
      setRefreshData(false); // Reset the state after fetching data
    }
    const orgUsers = FirestoreService.getOrgUsers(currentUser?.all?.currentOrg)
      .then((data) => {
        if (data.exists()) {
          const desiredResult = Object.entries(data.data().users).map(([id, { email }]) => ({ id, email }));
          let orgUsersInfos = []
          desiredResult.forEach(async (user) => {
            const userInfo = await FirestoreService.getUserInfo(user.email, user.id);
            userInfo.forEach(async (doc) => {
              const userInfo = doc.data();
              user.name = userInfo.name;
              user.avatarUrl = userInfo.avatarUrl;
              orgUsersInfos = [...orgUsersInfos, user];
            });
            setOrgUsers(orgUsersInfos);
          });
        } else {
          console.log("No such document!");
        }
      }
      )
      .catch((err) => {
        console.log(err);
      }
      );
    const HighLevelWorkItems = FirestoreService.getHighLevelWorkItems(currentUser?.all?.currentOrg,
      (querySnapshot) => {
        const items =
          querySnapshot.docs.map(docSnapshot => docSnapshot.data());
        setHighLevelWorkItems(items);
      },
      (error) => console.log(error)





    )
      .catch((err) => {
        console.log(err);
      }
      );
  }, [refreshData]);

 
  const rerender = useReducer(() => ({}), {})[1]
  const [expanded, setExpanded] = useState({})
  const columnHelper = createColumnHelper()


  const columns = [
    columnHelper.accessor('title', {
      cell: ({ row, getValue }) => (
        <div
          style={{
            // Since rows are flattened by default,
            // we can use the row.depth property
            // and paddingLeft to visually indicate the depth
            // of the row
            paddingLeft: `${row.depth * 2}rem`, cursor: 'pointer'
          }}
        >
          <>
            {row.getCanExpand() ? (
              <button className='btn btn-link btn-color-gray-500 btn-active-color-primary me-1 '
                {...{
                  onClick: row.getToggleExpandedHandler(),
                  style: {},
                }}
              >
                {row.getIsExpanded() ? '⌄' : '>'}
              </button>
            ) : (
              ''
            )}{' '}
            {getValue()}
          </>
        </div>),
      header: () => <span>Goal</span>
      //footer: info => info.column.id,
    }),
    columnHelper.accessor('reporterId', {
      id: 'Owner',
      cell: info => <OwnerName reporterId={info.getValue()} />,
      header: () => <span>Owner</span>,
      //footer: info => info.column.id,
    }),
    columnHelper.accessor('krs', {
      header: () => 'Key Results',
      cell: value => <Keyresults krs={value.getValue()} />,
      //footer: info => info.column.id,
    }),
    columnHelper.accessor('status', {
      header: () => <span>Status</span>,
      cell: info => <Status className={`btn btn-${customStatus.IssueStatusClass[info.renderValue()]}`} color={info.renderValue()}>{customStatus.IssueStatusCopy[info.renderValue()]}</Status>,
      //footer: info => info.column.id,
    }),
    /* columnHelper.accessor('Work', {
      header: () => <span>Work</span>,
      cell: info => <Progress progress={info.renderValue()} />,
      footer: info => info.column.id,
    }), */
    columnHelper.accessor('score', {
      header: 'Score',
      cell: info => <Score score={info.renderValue()} />,
      //footer: info => info.column.id,
    }),
    columnHelper.accessor('cadence', {
      header: 'Cadence',
      cell: info => info.renderValue(),
      //footer: info => info.column.id,
    }),
    columnHelper.accessor('id', {
      header: '',
      cell: '',
      footer: '',
    }),
  ]

  // Custom component to render Keyresults 
  const Keyresults = ({ krs }) => {
    if (krs) {
      return (
        <>
          {krs.map((obj) => (
            <div className="d-flex flex-stack mb-3" key={obj.keyResultId}>
              <div className="text-gray-700 fw-semibold fs-6 me-2">{obj.title}</div>
              <div className="d-flex align-items-senter">
                <span className={`badge badge-light-${getScoreColor(obj.score)} fs-base`}>
                  {obj.score}
                </span>
              </div>
            </div>

          ))
          }
        </>
      )
    }
    return null;
  };

  //get the owner name 
  const OwnerName = ({ reporterId }) => {
    const foundItem = orgUsers.find(item => item.id === reporterId);
    let name = ''
    if (foundItem) {
      name = foundItem.name;
    }

    return <Avatar avatarUrl='' name={name} size={25} />
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
        <span className={`badge badge-light-${getScoreColor(score)} fs-base`}>
          {score}
        </span>
      </div>
    )
  };



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
  })

  const handleRowClick = (row) => {
    //get the object from data that matches the id
    const goal = okrs.find((goal) => goal.id === row.getValue('id'));
    setCurrentGoal(goal);
    /*     const drawerToggle = document.getElementById('goals_drawer_detail_toggle');
        drawerToggle.click(); */
    navigate(`details?id=${row.getValue('id')}`)

  };



  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'error' && error instanceof Error) {
    return <div>Error: {error.message}</div>;
  } 

  if (error) {
    return <div>Error loading OKRs</div>;
  }


  return (
    <>
    <GoalFilter />
    <HeaderInsight />
      <div id="xgn_app_toolbar" className="app-toolbar  py-3 py-lg-6 ">
        <div id="xgn_app_toolbar_container" className="app-container  container-xxl d-flex flex-stack ">
          <div className="page-title d-flex flex-column justify-content-center flex-wrap me-3 ">
            <h1 className="page-heading d-flex text-dark fw-bold fs-3 flex-column justify-content-center my-0">
              Objectives and Key results
            </h1>
          </div>
          <div className="d-flex align-items-center gap-2 gap-lg-3">
            <AddGoal reloadGoals={handleDataRefresh} />
          </div>
        </div>
      </div>

      <div className='card kanban' >
        <div className='card-body' style={{ padding: "1rem 1rem" }}>
          <div className="table-responsive">
            <table className='table table-row-dashed table-row-gray-300 gy-3'>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className='fw-bold fs-6 text-gray-800'>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
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
                  <tr key={row.id} >
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

      {(!okrs || okrs.length === 0) ? <EmptyGoals /> : ''}
    </>
  );
};

export default Goals;
