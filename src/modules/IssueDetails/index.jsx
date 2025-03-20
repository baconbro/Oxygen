import { useState, useEffect } from 'react';
import { CopyLinkButton } from '../../components/common';
import Loader from './Loader';
import Type from './Type';
import Delete from './Delete';
import Title from './Title';
import Description from './Description';
import Comments from './Comments';
import Status from './Status';
import AssigneesReporter from './AssigneesReporter';
import Priority from './Priority';
import EstimateTracking from './EstimateTracking';
import Dates from './Dates';
import ProjectBoardIssueDetailsReporter from './Reporter';
import Progress from './Progress';
import { issueTypeColors } from '../../utils/styles';
import TagsComponent from './Tags';
import SubsComponent from './Subs';
import TaskDependencies from './Dependencies';
import DetailsPrioritization from './Prioritization';
import BudgetTracking from './BudgetTracking';
import StoryPointInput from './Size/Storypoints';
import TshirtSizeInput from './Size/TshirtSize/TshirtSize';
import Checklist from './Checklist';

import * as FirestoreService from '../../services/firestore';

import { useAuth } from '../auth';
import { useParams } from 'react-router-dom';
import { useUpdateItem } from '../../services/itemServices';
import { Breadcrumbs } from '../../components/common';
import { getParentIssueIds } from '../../utils/getIssueX';
import { useWorkspace } from '../../contexts/WorkspaceProvider';
import PackageDetail from './Package/package';
import GoalIssueLink from './GoalLink/goalLink';


const ProjectBoardIssueDetails = ({
  issueId,
  projectUsers,
  //fetchProject,
  updateLocalProjectIssues,
  modalClose,
  issueProps,
}) => {
  const initUsers = []
  const [data, setData] = useState()
  const editItemMutation = useUpdateItem();
  const { currentUser } = useAuth();
  const { project, goals } = useWorkspace();
  var id = useParams()
  const [breadcrumbItems, setBreadcrumbItems] = useState([]);
  const [showPrioritization, setShowPrioritization] = useState(project.config.workspaceConfig?.board?.rice || false);

  // Convert issueId to a number
  const numericIssueId = Number(issueId);

  useEffect(() => {
    if (id.issueId) {
      const unsubscribe = FirestoreService.streamSubItem(currentUser?.all?.currentOrg, id.issueId,
        (querySnapshot) => {
          const singleItem =
            querySnapshot.docs.map(docSnapshot => docSnapshot.data());
          setData({
            issue: {
              ...singleItem[0],
              users: initUsers, comments: singleItem[0].comments
            }
          });
        },
        (error) => console.log('single item fail')
      );
      return unsubscribe;
    }
  }, [issueId]);

  useEffect(() => {
    const fetchParentIssueIds = () => {
      if (issueId) {
        const parentIds = getParentIssueIds(issueId, project.issues);
        parentIds.forEach(parentId => {
          const parentIssue = project.issues.find(issue => issue.id === parentId);
          if (parentIssue) {
            setBreadcrumbItems(currentItems => [
              ...currentItems,
              {
                title: parentIssue.title,
                href: `${parentId}`,
                icon: <i className={`bi bi-${findIconById(parentIssue.type)}`} style={{ color: findColorById(parentIssue.type) }}></i>,
              },
            ]);
          }
        });
      }
    };

    fetchParentIssueIds();
  }, [issueId]);

  const findColorById = (id) => {
    for (const key in project.config.issueType) {
      if (project.config.issueType[key].id === id) {
        return project.config.issueType[key].color;
      }
    }
    return null; // Return null if no matching id is found
  };
  const findIconById = (id) => {
    for (const key in project.config.issueType) {
      if (project.config.issueType[key].id === id) {
        return project.config.issueType[key].icon;
      }
    }
    return null; // Return null if no matching id is found
  };

  if (!data) return (
    <div className='border-0 h-md-100'>
      <Loader />
    </div>)

  const { issue } = data;

  const updateLocalIssueDetails = fields =>
    setData(currentData => ({ issue: { ...currentData.issue, ...fields } }));

  const updateIssue = (updatedFields) => {
    const mutateItem = editItemMutation({
      orgId: currentUser?.all?.currentOrg,
      field: updatedFields,
      itemId: issue.id,
      workspaceId: issue.projectId,
    }
    );
  };

  return (
    <div className='border-0 h-md-100' style={{ backgroundColor: 'white' }}>
      <div className="py-5" style={{ backgroundColor: issueTypeColors[issue.type] }}>
        <div className='d-flex justify-content-between'>
          <div className='d-flex'>
            <Breadcrumbs items={breadcrumbItems} />
            {issue.parent && <span>/</span>}
            <Type issue={issue} updateIssue={updateIssue} />
          </div>
          <div className='d-flex'>
            <div className='me-3'>
              <CopyLinkButton variant="empty" className="btn" />
            </div>
            <div className='me-3'>
              <Delete issue={issue} modalClose={modalClose} />
            </div>
          </div>
        </div>
      </div>
      <div className='py-5' style={{ backgroundColor: 'white' }}>
        <div className='px-4 mb-5'>
          <div className="row">
            <div className="col-12">
              <h3 className="fw-bolder text-gray-800 text-start">
                <Title issue={issue} updateIssue={updateIssue} />
              </h3>
            </div>
          </div>
        </div>
        
        <div className='px-4 mb-5'>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Description</label>
            <div className="col-sm-10">
              <Description issue={issue} updateIssue={updateIssue} />
            </div>
          </div>
        </div>
        
        <div className='px-4 mb-5'>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Checklist</label>
            <div className="col-sm-10">
              <Checklist issue={issue} updateIssue={updateIssue} />
            </div>
          </div>
        </div>
        
        <div className='px-4 mb-5'>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Sub-Issues</label>
            <div className="col-sm-10">
              <SubsComponent issue={issue} updateIssue={updateIssue} />
            </div>
          </div>
        </div>
        
        <div className='px-4 mb-5'>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Dependencies</label>
            <div className="col-sm-10">
              <TaskDependencies issue={issue} updateIssue={updateIssue} modalClose={modalClose} />
            </div>
          </div>
        </div>
        
        <div className='px-4 mb-5'>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Status</label>
            <div className="col-sm-10">
              <Status issue={issue} updateIssue={updateIssue} />
            </div>
          </div>
        </div>
        
        <div className='px-4 mb-5'>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Priority</label>
            <div className="col-sm-10">
              <Priority issue={issue} updateIssue={updateIssue} />
            </div>
          </div>
        </div>
        
        <div className='px-4 mb-5'>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Assignees</label>
            <div className="col-sm-10">
              <AssigneesReporter issue={issue} updateIssue={updateIssue} projectUsers={projectUsers} />
            </div>
          </div>
        </div>
        
        <div className='px-4 mb-5'>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Reporter</label>
            <div className="col-sm-10">
              <ProjectBoardIssueDetailsReporter issue={issue} updateIssue={updateIssue} projectUsers={projectUsers} />
            </div>
          </div>
        </div>
        
        <div className='px-4 mb-5'>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Tags</label>
            <div className="col-sm-10">
              <TagsComponent issue={issue} updateIssue={updateIssue} />
            </div>
          </div>
        </div>
        
        <div className='px-4 mb-5'>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Dates</label>
            <div className="col-sm-10">
              <Dates issue={issue} updateIssue={updateIssue} />
            </div>
          </div>
        </div>
        
        {showPrioritization && (
          <div className='px-4 mb-5'>
            <div className="mb-3 row">
              <label className="col-sm-2 col-form-label fw-bold">Prioritization</label>
              <div className="col-sm-10">
                <DetailsPrioritization issue={issue} updateIssue={updateIssue} />
              </div>
            </div>
          </div>
        )}
        
        <div className='px-4 mb-5'>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Progress</label>
            <div className="col-sm-10">
              <Progress issue={issue} updateIssue={updateIssue} />
            </div>
          </div>
        </div>
        
        <div className='px-4 mb-5'>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Estimate & Tracking</label>
            <div className="col-sm-10">
              <EstimateTracking issue={issue} updateIssue={updateIssue} />
            </div>
          </div>
        </div>
        
        <div className='px-4 mb-5'>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Budget Tracking</label>
            <div className="col-sm-10">
              <BudgetTracking issue={issue} updateIssue={updateIssue} />
            </div>
          </div>
        </div>
        
        <div className='px-4 mb-5'>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Story Points</label>
            <div className="col-sm-10">
              <StoryPointInput issue={issue} updateIssue={updateIssue} />
            </div>
          </div>
        </div>
        
        <div className='px-4 mb-5'>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">T-shirt Size</label>
            <div className="col-sm-10">
              <TshirtSizeInput issue={issue} updateIssue={updateIssue} />
            </div>
          </div>
        </div>
        
        <div className='px-4 mb-5'>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Work Package</label>
            <div className="col-sm-10">
              <PackageDetail issue={issue} updateIssue={updateIssue} />
            </div>
          </div>
        </div>
        
        <div className='px-4 mb-5'>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Goal Link</label>
            <div className="col-sm-10">
              <GoalIssueLink issue={issue} updateIssue={updateIssue} />
            </div>
          </div>
        </div>
        
        <div className='px-4 mb-5'>
          <div className="mb-3 row">
            <label className="col-sm-2 col-form-label fw-bold">Comments</label>
            <div className="col-sm-10">
              <Comments issue={issue} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectBoardIssueDetails;
