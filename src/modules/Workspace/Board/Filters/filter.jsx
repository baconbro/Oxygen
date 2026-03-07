import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { xor } from 'lodash';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Filters,
  SearchInput,
  Avatars,
  AvatarIsActiveBorder,
  StyledAvatar,
  ClearAll,
} from './Styles';
import { Modal } from 'react-bootstrap'
import ProjectMembers from '../../WorkspaceSettings/Members';
import { useWorkspace } from '../../../../contexts/WorkspaceProvider';
import findAvailableParameters from '../../../../utils/issueVariables';
import { useGetSprints } from '../../../../services/sprintServices';
import { useGetWorkPackages } from '../../../../services/workPackageServices';

const propTypes = {
  projectUsers: PropTypes.array.isRequired,
  defaultFilters: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  mergeFilters: PropTypes.func.isRequired,
};

const ProjectBoardFilters = ({ projectUsers, defaultFilters, filters, mergeFilters }) => {
  const [projectMembers, setProjectMembers] = useState([]);
  const { searchTerm, userIds, myOnly, recent, groupBy, viewType, viewStatus, hideOld, sprint, wpkg } = filters;
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const { project, orgUsers } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();

  const { data } = useGetSprints(project?.spaceId, project?.org);
  const { data: wpkgData } = useGetWorkPackages(project?.spaceId, project?.org);
  const [sprints, setSprints] = useState([]);
  const [wpkgs, setWpkgs] = useState([]);
  const [activeSprints, setActiveSprints] = useState([]);
  const [availableParameters, setAvailableParameters] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Map project users to full user data from orgUsers
  useEffect(() => {
    if (orgUsers && orgUsers.users && projectUsers) {
      // Map project users to full user data from orgUsers
      const mappedUsers = projectUsers.map(projectUser => {
        const userId = typeof projectUser.id === "number" ? projectUser.id.toString() : projectUser.id;
        // Find matching user in orgUsers by uid
        const orgUserData = orgUsers.users[userId];
        
        if (orgUserData) {
          return {
            ...projectUser,
            ...orgUserData,
            uid: userId,  // Ensure uid is set for filter component
            id: userId,
            name: orgUserData.name || orgUserData.displayName || orgUserData.email,
            photoURL: orgUserData.photoURL || orgUserData.avatarUrl
          };
        } else {
          // Fallback to project user data if not found in orgUsers
          console.warn(`User with ID ${userId} not found in organization users`);
          return {
            ...projectUser,
            uid: userId,
            id: userId
          };
        }
      });
      
      setProjectMembers(mappedUsers);
      setIsLoading(false);
    }
  }, [orgUsers, projectUsers]);

  // Update URL with current filters
  const updateURLWithFilters = (updatedFilters) => {
    const currentFilters = { ...filters, ...updatedFilters };
    const searchParams = new URLSearchParams(location.search);
    
    // Preserve non-filter related params that might exist in the URL
    const otherParams = [];
    searchParams.forEach((value, key) => {
      if (!['search', 'users', 'recent', 'myOnly', 'types', 'status', 'hideOld', 'sprint', 'wpkg'].includes(key)) {
        otherParams.push([key, value]);
      }
    });
    
    // Clear existing params and set new ones
    searchParams.forEach((_, key) => searchParams.delete(key));
    
    // Add filter params
    if (currentFilters.searchTerm) searchParams.set('search', currentFilters.searchTerm);
    if (currentFilters.userIds.length > 0) searchParams.set('users', currentFilters.userIds.join(','));
    if (currentFilters.recent) searchParams.set('recent', 'true');
    if (currentFilters.myOnly) searchParams.set('myOnly', 'true');
    if (currentFilters.viewType.length > 0) searchParams.set('types', currentFilters.viewType.join(','));
    if (currentFilters.viewStatus.length > 0) searchParams.set('status', currentFilters.viewStatus.join(','));
    if (currentFilters.hideOld !== 30) searchParams.set('hideOld', currentFilters.hideOld.toString());
    if (currentFilters.sprint) searchParams.set('sprint', currentFilters.sprint);
    if (currentFilters.wpkg) searchParams.set('wpkg', currentFilters.wpkg);
    
    // Restore other params
    otherParams.forEach(([key, value]) => searchParams.set(key, value));
    
    navigate({ pathname: location.pathname, search: searchParams.toString() }, { replace: true });
  };

  // Original mergeFilters with URL update
  const mergeFiltersWithURL = (filterUpdates) => {
    mergeFilters(filterUpdates);
    updateURLWithFilters(filterUpdates);
  };

  // Read filters from URL on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlFilters = {};
    
    if (searchParams.has('search')) urlFilters.searchTerm = searchParams.get('search');
    if (searchParams.has('users')) urlFilters.userIds = searchParams.get('users').split(',');
    if (searchParams.has('recent')) urlFilters.recent = searchParams.get('recent') === 'true';
    if (searchParams.has('myOnly')) urlFilters.myOnly = searchParams.get('myOnly') === 'true';
    if (searchParams.has('types')) urlFilters.viewType = searchParams.get('types').split(',');
    if (searchParams.has('status')) urlFilters.viewStatus = searchParams.get('status').split(',');
    if (searchParams.has('hideOld')) urlFilters.hideOld = parseInt(searchParams.get('hideOld'));
    if (searchParams.has('sprint')) urlFilters.sprint = searchParams.get('sprint');
    if (searchParams.has('wpkg')) urlFilters.wpkg = searchParams.get('wpkg');
    
    if (Object.keys(urlFilters).length > 0) {
      mergeFilters(urlFilters);
    }
  }, []);

  useEffect(() => {
    setSprints(data)
  }, [data])

  useEffect(() => {
    if (wpkgData) {
      setWpkgs(wpkgData)
    }
  }, [wpkgData])

  useEffect(() => {
    const today = new Date();
    const filteredSprints = sprints?.filter(sprint => new Date(sprint.endDate) >= today) || [];
    setActiveSprints(filteredSprints);
  }, [sprints]);

  const calculateAvailableParams = async () => {
    if (project?.issues) {
      const params = findAvailableParameters(project.issues);
      setAvailableParameters(params);
    }
  };

  useEffect(() => {
    // Only calculate if empty
    if (Object.keys(availableParameters).length === 0) calculateAvailableParams();
  }, [availableParameters]); // Run once on component mount

  const areFiltersCleared = !searchTerm && userIds.length === 0 && !myOnly && !recent && viewType.length === 0 && viewStatus.length === 0 && hideOld === 30 && !sprint && !wpkg;

  const closeModal = () => {
    setShowMembersModal(false)
    setShowFilterModal(false)
  }

  const handleTypeChange = type => {
    const typeIn = type.split(':')[0];
    mergeFiltersWithURL({ viewType: xor(viewType, [typeIn]) });
  }
  
  const handleStatusChange = status => {
    const statusIn = status.split(':')[0];
    mergeFiltersWithURL({ viewStatus: xor(viewStatus, [statusIn]) });
  }
  
  //reset filters
  const clearFilters = () => {
    mergeFiltersWithURL(defaultFilters);
  };

  // Global validation
  if (!project || Object.keys(project).length === 0) {
    return null;
  }
  
  return (
    <div className="d-flex flex-wrap flex-stack pb-7">
      <Filters data-testid="board-filters">
        <SearchInput
          value={searchTerm}
          onChange={value => mergeFiltersWithURL({ searchTerm: value })}
          placeholder='Search'
          className="form-control"
        />
        <Avatars>
          {projectMembers && projectMembers.map(user => (
            <AvatarIsActiveBorder key={user.uid} isActive={userIds.includes(user.uid)}>
              <StyledAvatar
                avatarUrl={user.photoURL || ""}
                name={user.name}
                size={35}
                className='avatar-circle'
                onClick={() => mergeFiltersWithURL({ userIds: xor(userIds, [user.uid]) })}
              />
            </AvatarIsActiveBorder>
          ))}
        </Avatars>
        {isLoading && <span className='spinner-border spinner-border-sm align-middle ms-2'></span>}

        <a href="#" className="avatar avatar-35px avatar-circle" onClick={() => setShowMembersModal(true)} >
          <span className="avatar-label bg-secondary text-gray-300 fs-8 fw-bold"><i className="bi bi-person-plus-fill"></i> </span>
        </a>
        <Modal
          id='modal_issueDetail'
          tabIndex={-1}
          aria-hidden='true'
          dialogClassName='modal-dialog modal-dialog-centered mw-900px'
          show={showMembersModal}
          onHide={() => closeModal()}
          animation={false}
        >
          <div className='modal-header'>
            <h2>Add user to workspace</h2>
            <div className='btn btn-sm btn-icon btn-active-color-primary' onClick={() => closeModal()}>
              <i className='bi bi-x fs-2'></i>
            </div>
          </div>
          <div className='modal-body py-lg-10 px-lg-10'>
            <ProjectMembers project={project} spaceId={project?.spaceId} />
          </div>
        </Modal>
        <button
          onClick={() => mergeFiltersWithURL({ recent: !recent })}
          className="btn btn-sm btn-flex bg-body btn-color-gray-700 btn-active-color-primary fw-bold ms-2"
        >
          Recently Updated
        </button>
        <Modal
          id='modal_issueFilter'
          tabIndex={-1}
          aria-hidden='true'
          dialogClassName='modal-dialog modal-dialog-centered mw-900px'
          show={showFilterModal}
          onHide={() => closeModal()}
          animation={false}
        >
          <div className='modal-header'>
            <h2>Filter</h2>
            <div className='btn btn-sm btn-icon btn-active-color-primary' onClick={() => closeModal()}>
              <i className='bi bi-x fs-2'></i>
            </div>
          </div>
          <div className='modal-body py-lg-10 px-lg-10'>
            <div className="px-7 py-5">
              <div className="mb-10">
                <label className="form-label fw-semibold">Issues Type:</label>
                {project.config.issueType && Object.values(project.config.issueType).map(({ id, name }) => (
                  <div className="d-flex mb-1" key={id}>
                    <label className="form-check form-check-sm form-check-custom form-check-solid me-5">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={viewType.includes(id)}
                        onChange={() => handleTypeChange(id)}
                      />
                      <span className="form-check-label">
                        {name}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              <div className="mb-10">
                <label className="form-label fw-semibold">Issues Status:</label>

                {project.config.issueStatus && Object.values(project.config.issueStatus).map(({ id, name }) => (
                  <div className="d-flex mb-1" key={id}>
                    <label className="form-check form-check-sm form-check-custom form-check-solid me-5">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={viewStatus.includes(id)}
                        onChange={() => handleStatusChange(id)}
                      />
                      <span className="form-check-label">
                        {name}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              <div className="mb-10">
                <label className="form-label fw-semibold">Active and future sprints</label>
                <select className="form-select" onChange={(e) => mergeFiltersWithURL({ sprint: e.target.value })}>
                  <option value=''>
                    No sprint selected
                  </option>
                  {activeSprints.map(sprint => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-10">
                <label className="form-label fw-semibold">Work packages</label>
                <select className="form-select" onChange={(e) => mergeFiltersWithURL({ wpkg: e.target.value })}>
                  <option value=''>
                    No work package selected
                  </option>
                  {wpkgs.map(wpkg => (
                    <option key={wpkg.id} value={wpkg.title}>
                      {wpkg.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="d-flex justify-content-end">
                <button type="reset" className="btn btn-sm btn-light btn-active-light-primary me-2" onClick={() => { clearFilters(); closeModal(); }}>Reset</button>
                <button type="submit" className="btn btn-sm btn-primary" onClick={() => closeModal()} >Apply</button>
              </div>
            </div>
          </div>
        </Modal>
        <a href="#" className="btn btn-sm btn-flex bg-body btn-color-gray-700 btn-active-color-primary fw-bold ms-2" onClick={() => setShowFilterModal(true)}>
          <i className={`bi bi-funnel${viewType.length != 0 || viewStatus.length != 0 ? '-fill' : ''} fs-6 text-muted p-0`}><span className="path1"></span><span className="path2"></span></i>
        </a>
        <button
          onClick={() => mergeFiltersWithURL({ hideOld: hideOld == 0 ? 30 : 0 })}
          className="btn btn-sm btn-flex bg-body btn-color-gray-700 btn-active-color-primary fw-bold ms-2"
        >
          Show old
        </button>
        {!areFiltersCleared && (
          <ClearAll onClick={() => mergeFiltersWithURL(defaultFilters)}>Clear all</ClearAll>
        )}
      </Filters>
    </div>
  );
};

ProjectBoardFilters.propTypes = propTypes;

export default ProjectBoardFilters;
