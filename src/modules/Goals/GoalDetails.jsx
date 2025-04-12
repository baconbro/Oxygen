import { useState, useEffect } from 'react';

import { CopyLinkButton, } from '../../components/common';

import Loader from '../IssueDetails/Loader';

import Delete from './Delete';
import Title from '../IssueDetails/Title';
import Description from '../IssueDetails/Description';

import Status from '../IssueDetails/Status';

import ProjectBoardIssueDetailsReporter from '../IssueDetails/Reporter';

import TagsComponent from '../IssueDetails/Tags';
import KRTable from './krtables';

import { useAuth } from '../auth';
import { Route, Routes, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceProvider';
import { Tabs, Tab } from 'react-bootstrap';
import { InputDebounced } from '../../components/common'
import { isNil } from 'lodash';
import DatePicker from '../../components/common/DatePicker';
import { toAbsoluteUrl } from '../../utils'
import { customStatus, getScoreColor, goalType } from '../../constants/custom';
import { useUpdateOKR } from '../../services/okrServices';
import { Avatar, Select, Icon } from '../../components/common';
import { User, Username } from '../IssueDetails/Reporter/Styles';
import CreateGoal from './createGoal';
import { Modal } from 'react-bootstrap';
import InputValue from './inputValue';
import CommentsComponent from './Comments';
import UpdatesComponent from './Updates';
import WorkLink from './workLink';
import KrGraph from './KrGraph';



const GoalDetails = ({
}) => {
  const initUsers = []


  const [data, setData] = useState()
  const [comments, setComments] = useState([])
  const { currentGoal, setCurrentGoal, orgUsers, goals } = useWorkspace();
  const [showCreateAppModal, setShowCreateAppModal] = useState(false)
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const editOKRMutation = useUpdateOKR();
  const [key, setKey] = useState('tab1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser } = useAuth();
  var id = useParams()
  const { search } = useLocation();


  //transform orgUsers into an array of objects
  const orgUsersArray = Object.values(orgUsers?.users || {}).map((user) => {
    return { ...user }
  })

  //get params from the url
  const queryParams = new URLSearchParams(search);
  const goalId = queryParams.get('id');


  // Set current goal based on URL id
  useEffect(() => {
    if (goalId && goals.length > 0) {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        setCurrentGoal(goal);
      }
    }
  }, [goalId, goals, setCurrentGoal]);

  // If currentGoal changes, update the data
  useEffect(() => {
    setData(currentGoal);
  }, [currentGoal]);

  if (!data || data.length < 1) return (
    <div className='card card-flush border-0 h-md-100'>
      fetching data...
      <div className="spinner-border" role="status">
      </div>
      <Loader />
    </div>)

  const issue = data;

  const updateLocalIssueDetails = fields =>
    setData(currentData => ({ ...currentData, ...fields }));

  const updateIssue = (updatedFields) => {
    editOKRMutation({
      orgId: currentUser?.all?.currentOrg,
      feild: updatedFields,
      itemId: issue.id,
    }
    );
    updateLocalIssueDetails(updatedFields)
  };

  const handleTextClick = () => {
    setIsEditing(true);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const goalsOptions = goals
    .filter(goal => goal.id !== issue.id)
    .map(goal => ({ value: goal.id, label: goal.title }));

  const getGoalById = goalId => {
    return goals.find(goal => goal.id === goalId)
  }


  function DateSelector() {


    const handleDateSelection = (event) => {
      const { value } = event.target;

      // Get the current year
      const currentYear = new Date().getFullYear();

      // Set the start and end dates based on the selected value
      if (value === 'Yearly') {
        setStartDate(Math.floor(new Date(currentYear, 0, 1).getTime()));
        setEndDate(Math.floor(new Date(currentYear, 11, 31).getTime()));
        updateIssue({ start: Math.floor(new Date(currentYear, 0, 1).getTime()) })
        updateIssue({ end: Math.floor(new Date(currentYear, 11, 31).getTime()) })
        updateIssue({ cadence: 'Yearly' })
      } else if (value === 'Q1') {
        setStartDate(Math.floor(new Date(currentYear, 0, 1).getTime()));
        setEndDate(Math.floor(new Date(currentYear, 2, 31).getTime()));
        updateIssue({ start: Math.floor(new Date(currentYear, 0, 1).getTime()) })
        updateIssue({ end: Math.floor(new Date(currentYear, 2, 31).getTime()) })
        updateIssue({ cadence: 'Q1' })
      } else if (value === 'Q2') {
        setStartDate(Math.floor(new Date(currentYear, 3, 1).getTime()));
        setEndDate(Math.floor(new Date(currentYear, 5, 30).getTime()));
        updateIssue({ start: Math.floor(new Date(currentYear, 3, 1).getTime()) })
        updateIssue({ end: Math.floor(new Date(currentYear, 5, 30).getTime()) })
        updateIssue({ cadence: 'Q2' })
      } else if (value === 'Q3') {
        setStartDate(Math.floor(new Date(currentYear, 6, 1).getTime()));
        setEndDate(Math.floor(new Date(currentYear, 8, 30).getTime()));
        updateIssue({ start: Math.floor(new Date(currentYear, 6, 1).getTime()) })
        updateIssue({ end: Math.floor(new Date(currentYear, 8, 30).getTime()) })
        updateIssue({ cadence: 'Q3' })
      } else if (value === 'Q4') {
        setStartDate(Math.floor(new Date(currentYear, 9, 1).getTime()));
        setEndDate(Math.floor(new Date(currentYear, 11, 31).getTime()));
        updateIssue({ start: Math.floor(new Date(currentYear, 9, 1).getTime()) })
        updateIssue({ end: Math.floor(new Date(currentYear, 11, 31).getTime()) })
        updateIssue({ cadence: 'Q4' })
      } else if (value === 'Custom') {
        setStartDate(Math.floor(new Date(currentYear, 0, 1).getTime()));
        setEndDate(Math.floor(new Date(currentYear, 0, 2).getTime()));
        updateIssue({ start: Math.floor(new Date(currentYear, 0, 1).getTime()) })
        updateIssue({ end: Math.floor(new Date(currentYear, 0, 2).getTime()) })
        updateIssue({ cadence: 'Custom' })
      }
    };

    return (
      <div>
        <select value={issue.cadence} onChange={handleDateSelection} className='form-select form-select-solid form-select-lg mb-4'>
          <option value="">Select Cadence for the goal</option>
          <option value="Yearly">Yearly</option>
          <option value="Q1">Q1</option>
          <option value="Q2">Q2</option>
          <option value="Q3">Q3</option>
          <option value="Q4">Q4</option>
          <option value="Custom">Custom</option>
        </select>

        {issue.start && issue.end && (
          <div>
            <label className="form-label">Start Date</label>
            <DatePicker
              onChange={start => updateIssue({ start })}
              value={issue.start}
              className="form-control form-control-solid mb-4"
            />
            <label className="form-label">End Date</label>
            <DatePicker
              onChange={end => updateIssue({ end })}
              value={issue.end}
              className="form-control form-control-solid mb-4"
            />
          </div>
        )}
      </div>
    );
  }


  return (
    <div className='card card-flush border-0 h-md-100'>
      <div className="card-header py-5" >
        <div className='card-toolbar' >
          <Status issue={issue} updateIssue={updateIssue} customStatus={goalType} fieldName='type' />
        </div>
        <div className="card-toolbar">
          <div className='me-3'>
            <CopyLinkButton variant="empty" className="btn" />
          </div>
          <div className='me-3'>
            <Delete issue={issue} modalClose={false} />
          </div>
        </div>
      </div>
      <div className='card-body py-9'>
        <div className='row g-5 g-xl-10'>
          <div className='col'>
            <div className=" flex-wrap d-grid gap-5 px-9 mb-5">
              <h3 className="card-title fw-bolder text-gray-800">
                <Title issue={issue} updateIssue={updateIssue} InStyle={{}} /></h3>
            </div>

            <Tabs
              id="goal-details-tabs"
              activeKey={key}
              onSelect={(k) => setKey(k)}
              className="nav nav-tabs nav-line-tabs nav-line-tabs-2x mb-5 fs-6"
            >
              <Tab eventKey="tab1" title="About">
                <div className="flex-wrap gap-5 px-9 mb-5">
                  <Description issue={issue} updateIssue={updateIssue} />
                </div>

                <div className="separator my-10"></div>
                
                <div className='px-9 mb-5'>
                  <div className="mb-3 row">
                    <label className="col-sm-2 col-form-label fw-bold">Status</label>
                    <div className="col-sm-10">
                      <Status issue={issue} updateIssue={updateIssue} customStatus={customStatus} />
                    </div>
                  </div>
                  
                  <div className="mb-3 row">
                    <label className="col-sm-2 col-form-label fw-bold">Score</label>
                    <div className="col-sm-10">
                      <span className={`fs-4hx badge badge-light-${getScoreColor(issue.score)} fs-base`}>
                        {isEditing ? (
                          renderHourInput('score', issue, updateIssue, handleInputBlur)) : (<span onClick={handleTextClick}>{issue.score}</span>)
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3 row">
                    <label className="col-sm-2 col-form-label fw-bold">Reporter</label>
                    <div className="col-sm-10">
                      <ProjectBoardIssueDetailsReporter issue={issue} updateIssue={updateIssue} projectUsers={orgUsersArray} />
                    </div>
                  </div>
                  
                  <div className="mb-3 row">
                    <label className="col-sm-2 col-form-label fw-bold">Cadence</label>
                    <div className="col-sm-10">
                      {DateSelector()}
                    </div>
                  </div>
                  
                  <div className="mb-3 row">
                    <label className="col-sm-2 col-form-label fw-bold">Tags</label>
                    <div className="col-sm-10">
                      <TagsComponent issue={issue} updateIssue={updateIssue} />
                    </div>
                  </div>
                </div>

                {issue.type === 'kr' && (
                  <>
                    <div className="separator my-10"></div>
                    <div className="flex-wrap gap-5 px-9 mb-5">
                      <div className="d-flex flex-wrap">
                        <div className=" border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                          <div className="d-flex align-items-center">
                            <div className="fs-2 fw-bold counted">
                              <InputValue issue={issue} updateIssue={updateIssue} fieldName='startValue' />
                            </div>
                          </div>
                          <div className="fw-semibold fs-6 text-gray-500">Start value</div>
                        </div>
                        <div className=" border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                          <div className="d-flex align-items-center">
                            <div className="fs-2 fw-bold counted">
                              <InputValue issue={issue} updateIssue={updateIssue} fieldName='targetValue' />
                            </div>
                          </div>
                          <div className="fw-semibold fs-6 text-gray-500">Target value</div>
                        </div>
                        <div className=" border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                          <div className="d-flex align-items-center">
                            <div className="fs-2 fw-bold counted">
                              <Select
                                variant="empty"
                                dropdownWidth={343}
                                withClearValue={false}
                                name="mesureAs"
                                value={issue.mesureAs}
                                options={[
                                  { value: 'percent', label: 'Percent %' },
                                  { value: 'dollar', label: 'Dollar $' },
                                  { value: 'number', label: 'Number #' },
                                ]}
                                onChange={mesure => updateIssue({ mesureAs: mesure })}

                              />
                            </div>
                          </div>
                          <div className="fw-semibold fs-6 text-gray-500">Mesure as</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Tab>
              <Tab eventKey="tab2" title="Learning">
                <div>
                  <CommentsComponent issue={issue} updateIssue={updateIssue} object='learnings' />
                </div>
              </Tab>
              {issue.type != 'kr' && (
                <Tab eventKey="tab3" title="Key Results">
                  <div className="flex-wrap gap-5 px-9 mb-5">
                    <KRTable parentGoalId={issue.id} />
                    <div className="h-4" >

                      <button className='btn btn-primary me-2 mb-2 ms-2' onClick={handleOpenModal}><i className='bi bi-plus'></i>Add a key result</button>

                    </div>

                  </div>
                </Tab>
              )}
              <Tab eventKey="tab4" title="Risks">
                <div>
                  <CommentsComponent issue={issue} updateIssue={updateIssue} object='risks' />
                </div>
              </Tab>
              <Tab eventKey="tab5" title="Updates">
                <div>
                  <UpdatesComponent issue={issue} updateIssue={updateIssue} object='updates' />
                </div>
              </Tab>
              <Tab eventKey="tab6" title="Parent">
                <Select
                  variant="empty"
                  dropdownWidth={343}
                  withClearValue={false}
                  name="parent"
                  value={issue.parent}
                  options={goalsOptions}
                  onChange={goalId => updateIssue({ parent: goalId })}
                  renderValue={({ value: goalId }) => renderUser(getGoalById(goalId), true)}
                  renderOption={({ value: goalId }) => renderUser(getGoalById(goalId))}
                />
              </Tab>
              {issue.type === 'kr' && (

                <Tab eventKey="tab7" title="Progress graph">
                  <div>
                    <KrGraph
                      kr={issue}
                      className='card-xl-stretch mb-xl-8'
                      chartColor='primary'
                      chartHeight='200px'
                    />
                  </div>
                </Tab>
              )}
              {issue.type === 'kr' && (
                <Tab eventKey="tab8" title="Work linked">
                  <div>
                    <WorkLink issueId={issue.id} />
                  </div>
                </Tab>
              )}
              {issue.type === 'kr' && (
                <Tab eventKey="tab9" title="Comments">
                  <div>
                    <CommentsComponent issue={issue} updateIssue={updateIssue} object='comments' />
                  </div>
                </Tab>
              )}
            </Tabs>
          </div>
        </div>


      </div>
      {isModalOpen &&
        <Modal show={isModalOpen} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <CreateGoal modalClose={handleCloseModal} parent={issue.id} />
          </Modal.Body>
          <Modal.Footer>
          </Modal.Footer>
        </Modal>
      }
    </div>
  );
};

const renderHourInput = (fieldName, issue, updateIssue, handleInputBlur) => (
  <InputDebounced
    placeholder="Number"
    filter={/^\d{0,6}$/}
    value={isNil(issue[fieldName]) ? '' : issue[fieldName]}
    onChange={stringValue => {
      const value = stringValue.trim() ? Number(stringValue) : null;
      updateIssue({ [fieldName]: value });
    }}
    onBlur={handleInputBlur}
    className="form-control form-control-flush"
    autoFocus
  />
);



const renderUser = (goal, isSelectValue, removeOptionValue) => {

  if (!goal) {
    goal = {
      avatarUrl: "",
      email: "anonymous@oxgneap.com",
      id: 69420,
      name: "Anonymous",
      role: "member"
    }
  }

  return (
    <>
      <User
        key={goal.id}
        isSelectValue={isSelectValue}
        withBottomMargin={!!removeOptionValue}
      >
        <Avatar avatarUrl={goal.avatarUrl} name={goal.title} size={25} />
        <Username>{goal.title}</Username>
        {removeOptionValue && <Icon type="close" top={1} onClick={() => removeOptionValue && removeOptionValue()} />}
      </User>
    </>
  );
}

export default GoalDetails;
