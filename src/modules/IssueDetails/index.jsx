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

import * as FirestoreService from '../../services/firestore';

import { useAuth } from '../auth';
import { useParams } from 'react-router-dom';
import { useUpdateItem } from '../../services/itemServices';
import { useAddUserView } from '../../services/userViewServices';
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

  // Add a user view
  const addUserViewMutation = useAddUserView();
  useEffect(() => {
    if (currentUser?.all?.id && currentUser?.all?.currentOrg && issueId) {
      addUserViewMutation.mutate({
        userId: currentUser?.all?.id,
        orgId: currentUser?.all?.currentOrg,
        viewData: {
          itemId: numericIssueId,
          userId: currentUser?.all?.id,
          type: 'issue',
          lastTime: new Date().toISOString(),
        }
      });
    }
  }, [issueId]);

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
    <div className='card card-flush border-0 h-md-100'>
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
    <div className='card card-flush border-0 h-md-100'>
      <div className="card-header py-5" style={{ backgroundColor: issueTypeColors[issue.type] }}>
        <div className='card-toolbar'>
          <Breadcrumbs items={breadcrumbItems} />
          {issue.parent && <span>/</span>}
          <Type issue={issue} updateIssue={updateIssue} /></div>

        <div className="card-toolbar">
          <div className='me-3'>
            <CopyLinkButton variant="empty" className="btn" />
          </div>
          <div className='me-3'>
            <Delete issue={issue} modalClose={modalClose} />
          </div>
        </div>
      </div>
      <div className='card-body py-9'>
        <div className='row g-5 g-xl-10'>

          <div className='col-xl-8 mb-5 mb-xl-10'>

            <div className=" flex-wrap d-grid gap-5 px-9 mb-5">
              <h3 className="card-title fw-bolder text-gray-800">
                <Title issue={issue} updateIssue={updateIssue} /></h3>
            </div>
            <div className="flex-wrap gap-5 px-9 mb-5">
              <Description issue={issue} updateIssue={updateIssue} />
            </div>
            <div className="flex-wrap gap-5 px-9 mb-5">
              <SubsComponent issue={issue} updateIssue={updateIssue} />
            </div>
            <div className="flex-wrap gap-5 px-9 mb-5">
              <TaskDependencies issue={issue} updateIssue={updateIssue} modalClose={modalClose} />
            </div>

            <div className="flex-wrap d-grid gap-5 px-9 mb-5">
              <Comments issue={issue} />
            </div>
          </div>
          <div className='col-xl-4 mb-xl-10'>
            <div className='card'>
              <div className='card-body pt-6'>
                <div className="me-md-2">
                  <h3 className="fw-bold mb-1">Status</h3>
                  <Status issue={issue} updateIssue={updateIssue} />
                </div>
                <div className="">
                  <Priority issue={issue} updateIssue={updateIssue} />
                </div>
              </div>
            </div>
            <div className='card'>
              <div className='card-body pt-6'>
                <div className="">
                  <AssigneesReporter issue={issue} updateIssue={updateIssue} projectUsers={projectUsers} />
                </div>
                <div className="me-md-2">
                  <ProjectBoardIssueDetailsReporter issue={issue} updateIssue={updateIssue} projectUsers={projectUsers} />
                </div>

              </div>
            </div>
            <div className='card'>
              <div className='card-body pt-6'>
                <TagsComponent issue={issue} updateIssue={updateIssue} />
              </div>
            </div>
            <div className='card'>
              <div className='card-body pt-6'>
                <div className="">
                  <Dates issue={issue} updateIssue={updateIssue} />
                </div>

              </div>
            </div>
            {showPrioritization && (
              <div className='card'>
                <div className='card-body pt-6'>
                  <div className="">
                    <DetailsPrioritization issue={issue} updateIssue={updateIssue} />
                  </div>

                </div>
              </div>
            )}
            <div className='card'>
              <div className='card-body pt-6'>
                <div className="">
                  <Progress issue={issue} updateIssue={updateIssue} />
                </div>
                <div className="">
                  <EstimateTracking issue={issue} updateIssue={updateIssue} />
                </div>
                <div className="">
                  <BudgetTracking issue={issue} updateIssue={updateIssue} />
                </div>
                <div className="">
                  <StoryPointInput issue={issue} updateIssue={updateIssue} />
                </div>
                <div className="">
                  <TshirtSizeInput issue={issue} updateIssue={updateIssue} />
                </div>
                <div className="">
                  <h3 className="fw-bold mb-1">Work package</h3>
                  <PackageDetail issue={issue} updateIssue={updateIssue} />
                </div>
                <div className="">
                  <h3 className="fw-bold mb-1">Goal Link</h3>
                  <GoalIssueLink issue={issue} updateIssue={updateIssue} />
                </div>

              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default ProjectBoardIssueDetails;
