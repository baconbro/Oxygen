import React, { FC, useEffect, useRef, useState } from 'react'
import { SearchComponent } from '../../../../components/common'
import { InlineSVG } from '../../../../utils'
import { useWorkspace } from '../../../../contexts/WorkspaceProvider'
import { Status } from '../../../../modules/IssueDetails/Status/Styles'

interface SearchProps {
  orgId: any;
  scope: String;
  onAction: (issue: any) => void; // Make sure to import the correct type for 'issue'
}

interface IssueTypeDetails {
  id: number; // Or string, if your IDs are strings
  icon: string;
  color: string;
}

interface ProjectConfig {
  issueType: Record<string | number, IssueTypeDetails>; // ID as key 
}

interface Project {
  config: ProjectConfig;
}

const SearchReturn: React.FC<SearchProps> = ({ orgId, scope, onAction }) => {
  const [menuState, setMenuState] = useState<'main' | 'advanced' | 'preferences'>('main')
  const element = useRef<HTMLDivElement | null>(null)
  const wrapperElement = useRef<HTMLDivElement | null>(null)
  const resultsElement = useRef<HTMLDivElement | null>(null)
  const suggestionsElement = useRef<HTMLDivElement | null>(null)
  const emptyElement = useRef<HTMLDivElement | null>(null)
  const { project, highLevelWorkItems } = useWorkspace();
  const [searchText, setSearchText] = useState('')
  let lastUpdateIssues: any[]

  lastUpdateIssues = [
    {
      "status": "selected",
      "priority": "",
      "projectId": "8tMoVHMqwMuGlkUPD83T",
      "listPosition": 0,
      "userIds": [],
      "createdAt": 1687037605455,
      "users": [],
      "description": "",
      "id": 4,
      "updatedAt": 1687037605455,
      "type": "task",
      "title": "test2",
      "reporterId": 8908
    },
    {
      "updatedAt": 1686920914882,
      "listPosition": 1,
      "status": "selected",
      "userIds": [],
      "title": "test",
      "createdAt": 1682995595402,
      "id": 3,
      "reporterId": 8908,
      "description": "",
      "users": [],
      "type": "task",
      "priority": "",
      "estimate": 90,
      "projectId": "8tMoVHMqwMuGlkUPD83T"
    },
    {
      "listPosition": 2,
      "userIds": [],
      "id": 2,
      "title": "test",
      "users": [],
      "projectId": "8tMoVHMqwMuGlkUPD83T",
      "updatedAt": 1682995584682,
      "type": "task",
      "priority": "",
      "status": "backlog",
      "createdAt": 1682995584682,
      "reporterId": 8908,
      "description": ""
    }
  ]

  const getIssueTypeDetails = (typeId: number | string, project: Project) => { // Specify types
    return Object.values(project.config.issueType).find(issueType => issueType.id === typeId);
  };

  const IconComponent = ({ typeId }: { typeId: number | string }) => { // Props type
    const issueTypeDetails = getIssueTypeDetails(typeId, project); // project variable needed

    if (!issueTypeDetails) return null;

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

  //get the 10 last update issues form the project based on the most recent updatedAt date
  if (scope === "project") {
    lastUpdateIssues = project?.issues?.sort((a: { updatedAt: string | number | Date }, b: { updatedAt: string | number | Date }) => {
      if (a.updatedAt && b.updatedAt) {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
      return 0
    }).slice(0, 10)
  } else if (scope === 'workItems') {
    lastUpdateIssues = highLevelWorkItems?.sort((a: { updatedAt: string | number | Date }, b: { updatedAt: string | number | Date }) => {
      if (a.updatedAt && b.updatedAt) {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
      return 0
    }).slice(0, 10)
  }



  //for each issue in lastUpdateIssues, create a div with the issue name and the issue description
  const lastUpdateIssuesDiv = lastUpdateIssues?.map((issue: any, _index: any) => {
    return (
      <div className='d-flex align-items-center mb-5' key={_index}>
        <div className='avatar avatar-40px me-4'>
          <span className='avatar-label bg-light'>
            <IconComponent typeId={issue.type} />
          </span>
        </div>

        <div className='flex-grow-1 link-primary fw-bolder' style={{ cursor: "pointer" }}>
          <span className='fs-6 text-gray-800 text-hover-primary fw-bold' onClick={() => handleClick(issue)}>
            {issue.title}
            <br />
            <span className='fs-7 text-muted fw-bold'>{issue.id}</span>
          </span  >

        </div>
        <div className='d-flex flex-column'>
          <Status color={issue.status}>
            {project.config.issueStatus.find((statusName: any) => statusName.id === issue.status)?.name
              || 'Status Not Found' // Provide a default value
            }
          </Status>
        </div>
      </div>
    )
  })

  //on clik on the issue name
  const handleClick = (issue: any) => {
    onAction(issue)
  }

  //filter the issues based on the search input and return 10 matching issues max

  const filteredIssues = project?.issues?.filter((issue: any) => {
    return issue.title.toLowerCase().includes(searchText.toLowerCase())
  }).slice(0, 10)
  const filteredIssuesDiv = filteredIssues?.map((issue: any, _index: any) => {
    return (
      <div className='d-flex align-items-center mb-5' key={_index}>
        <div className='avatar avatar-40px me-4'>
          <span className='avatar-label bg-light'>
            <IconComponent typeId={issue.type} />
          </span>
        </div>

        <div className='flex-grow-1 link-primary fw-bolder' style={{ cursor: "pointer" }}>
          <span className='fs-6 text-gray-800 text-hover-primary fw-bold' onClick={() => handleClick(issue)}>
            {issue.title}
            <br />
            <span className='fs-7 text-muted fw-bold'>{issue.id}</span>
          </span  >

        </div>
        <div className='d-flex flex-column'>
          <Status color={issue.status}>
            {project.config.issueStatus.find((statusName: any) => statusName.id === issue.status)?.name
              || 'Status Not Found' // Provide a default value
            }
          </Status>
        </div>
      </div>
    )
  })







  const processs = (search: SearchComponent) => {
    setSearchText(search.getQuery())
    setTimeout(function () {
      const number = Math.floor(Math.random() * 6) + 1

      // Hide recently viewed
      suggestionsElement.current!.classList.add('d-none')

      if (number === 3) {
        // Hide results
        resultsElement.current!.classList.add('d-none')
        // Show empty message
        emptyElement.current!.classList.remove('d-none')
      } else {
        // Show results
        resultsElement.current!.classList.remove('d-none')
        // Hide empty message
        emptyElement.current!.classList.add('d-none')
      }

      // Complete search
      search.complete()
    }, 1500)
  }

  const clear = (search: SearchComponent) => {
    // Show recently viewed
    suggestionsElement.current!.classList.remove('d-none')
    // Hide results
    resultsElement.current!.classList.add('d-none')
    // Hide empty message
    emptyElement.current!.classList.add('d-none')
  }

  useEffect(() => {
    // Initialize search handler
    const searchObject = SearchComponent.createInsance('#xgn_header_search')

    // Search handler
    searchObject!.on('xgn.search.process', processs)

    // Clear handler
    searchObject!.on('xgn.search.clear', clear)
  }, [])



  return (
    <>

      <div
        id="xgn_header_search"
        className="d-flex align-items-center w-lg-400px"

        data-xgn-search-keypress="true"
        data-xgn-search-min-length="2"
        data-xgn-search-enter="enter"
        data-xgn-search-layout="menu"
        data-xgn-search-responsive="lg"

        data-xgn-menu-trigger="auto"
        data-xgn-menu-permanent="true"
        data-xgn-menu-placement="bottom-start">
        <div data-xgn-search-element="toggle" className="d-flex d-lg-none align-items-center">
          <div className="btn btn-icon btn-active-light-primary">
          </div>
        </div>
        <form data-xgn-search-element="form" className="d-none d-lg-block w-100 position-relative mb-5 mb-lg-0" autoComplete='off' >
          <input type="hidden" />
          <input type="text" className="form-control form-control-solid ps-14" name="search" placeholder="Search..." data-xgn-search-element="input" />
          <span className="position-absolute top-50 end-0 translate-middle-y lh-0 d-none me-6" data-xgn-search-element="spinner">
            <span className="spinner-border h-15px w-15px align-middle text-gray-400"></span>
          </span>
          <span className="btn btn-flush btn-active-color-primary position-absolute top-50 end-0 translate-middle-y lh-0 me-5 d-none" data-xgn-search-element="clear">
          </span>
        </form>
        <div data-xgn-search-element="content" className="menu menu-sub menu-sub-dropdown w-300px w-md-400px py-7 px-7 overflow-hidden">
          <div data-xgn-search-element="wrapper">
            <div ref={resultsElement} data-xgn-search-element='results' className='d-none'>
              <div className='scroll-y mh-200px mh-lg-350px'>
                <h3 className='fs-5 text-muted m-0 pb-5' data-xgn-search-element='category-title'>
                  Search results
                </h3>
                {filteredIssuesDiv}
              </div>
            </div>
            <div ref={suggestionsElement} className='mb-4' data-xgn-search-element='main'>
              <div className='d-flex flex-stack fw-bold mb-4'>
                <span className='text-muted fs-6 me-2'>Recently updated:</span>
              </div>
              <div className='scroll-y mh-200px mh-lg-325px'>
                {lastUpdateIssuesDiv}
              </div>
            </div>
            <div ref={emptyElement} data-xgn-search-element='empty' className='text-center d-none'>
              <div className='pt-10 pb-10'>
                <InlineSVG
                  path='/media/icons/duotune/files/fil024.svg'
                  className='svg-icon-4x opacity-50'
                />
              </div>

              <div className='pb-15 fw-bold'>
                <h3 className='text-gray-600 fs-5 mb-2'>No result found</h3>
                <div className='text-muted fs-7'>Please try again with a different query</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export { SearchReturn }
