import { useState, useEffect } from 'react';
import { CopyLinkButton } from '../../components/common';
import Delete from './Delete';
import Title from '../IssueDetails/Title';
import Description from '../IssueDetails/Description';
import Status from '../IssueDetails/Status';
import ProjectBoardIssueDetailsReporter from '../IssueDetails/Reporter';
import TagsComponent from '../IssueDetails/Tags';
import KRTable from './krtables';
import { useAuth } from '../auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceProvider';
import { Tabs, Tab } from 'react-bootstrap';
import { InputDebounced } from '../../components/common';
import { isNil } from 'lodash';
import DatePicker from '../../components/common/DatePicker';
import { customStatus, getScoreColor, goalType } from '../../constants/custom';
import { useUpdateOKR, fetchSingleOKR } from '../../services/okrServices';
import { Avatar, Select, Icon } from '../../components/common';
import { User, Username } from '../IssueDetails/Reporter/Styles';
import CreateGoal from './createGoal';
import { Modal } from 'react-bootstrap';
import InputValue from './inputValue';
import CommentsComponent from './Comments';
import UpdatesComponent from './Updates';
import WorkLink from './workLink';
import KrGraph from './KrGraph';


const GoalDetails = () => {
  const [data, setData] = useState();
  const { currentGoal, setCurrentGoal, orgUsers, goals } = useWorkspace();
  const navigate = useNavigate();
  const editOKRMutation = useUpdateOKR();
  const [key, setKey] = useState('about');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser } = useAuth();
  const { search } = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingScore, setIsEditingScore] = useState(false);

  const orgUsersArray = Object.values(orgUsers?.users || {}).map((user) => ({ ...user }));

  const queryParams = new URLSearchParams(search);
  const goalId = queryParams.get('id');

  const fetchSingleGoal = async (goalId) => {
    if (!goalId || !currentUser?.all?.currentOrg) return;
    try {
      setIsLoading(true);
      const goalData = await fetchSingleOKR(currentUser.all.currentOrg, goalId);
      if (goalData) {
        setCurrentGoal(goalData);
        setData(goalData);
      }
    } catch (error) {
      console.error('Error fetching goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (goalId) {
      if (goals && goals.length > 0) {
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
          setCurrentGoal(goal);
          setData(goal);
          setIsLoading(false);
        } else {
          fetchSingleGoal(goalId);
        }
      } else {
        fetchSingleGoal(goalId);
      }
    }
  }, [goalId, goals]);

  useEffect(() => {
    if (currentGoal && Object.keys(currentGoal).length > 0) {
      setData(currentGoal);
      setIsLoading(false);
    }
  }, [currentGoal]);

  if (isLoading) return (
    <div className="card card-flush border-0 h-md-100">
      <div className="d-flex flex-column align-items-center justify-content-center p-10">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="text-gray-600">Loading goal details...</div>
      </div>
    </div>
  );

  if (!data || Object.keys(data).length < 1) return (
    <div className="card card-flush border-0 h-md-100">
      <div className="d-flex flex-column align-items-center justify-content-center p-10">
        <div className="text-gray-600">Goal not found or could not be loaded</div>
        <button
          className="btn btn-sm btn-primary mt-3"
          onClick={() => navigate('/goals')}
        >
          Return to Goals List
        </button>
      </div>
    </div>
  );

  const issue = data;

  const updateLocalIssueDetails = fields =>
    setData(currentData => ({ ...currentData, ...fields }));

  const updateIssue = (updatedFields) => {
    editOKRMutation({
      orgId: currentUser?.all?.currentOrg,
      feild: updatedFields,
      itemId: issue.id,
    });
    updateLocalIssueDetails(updatedFields);
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenModal = () => setIsModalOpen(true);

  const goalsOptions = (goals || [])
    .filter(goal => goal.id !== issue.id)
    .map(goal => ({ value: goal.id, label: goal.title }));

  const getGoalById = goalId => goals.find(goal => goal.id === goalId);

  const isObjective = issue.type !== 'kr';
  const isKeyResult = issue.type === 'kr';

  return (
    <div className="card card-flush border-0 h-md-100">
      {/* Header */}
      <div className="card-header py-5">
        <div className="card-toolbar d-flex align-items-center gap-2">
          <Status issue={issue} updateIssue={updateIssue} customStatus={goalType} fieldName="type" />
        </div>
        <div className="card-toolbar d-flex align-items-center gap-2">
          <CopyLinkButton variant="empty" className="btn btn-sm" />
          <Delete issue={issue} modalClose={false} />
        </div>
      </div>

      <div className="card-body py-9">
        <div className="row g-5 g-xl-10">
          <div className="col">
            {/* Title */}
            <div className="px-9 mb-5">
              <h3 className="card-title fw-bolder text-gray-800">
                <Title issue={issue} updateIssue={updateIssue} InStyle={{}} />
              </h3>
            </div>

            <Tabs
              id="goal-details-tabs"
              activeKey={key}
              onSelect={(k) => setKey(k)}
              className="nav nav-tabs nav-line-tabs nav-line-tabs-2x mb-5 fs-6"
            >
              {/* About Tab */}
              <Tab eventKey="about" title="About">
                <div className="px-9 mb-5">
                  <Description issue={issue} updateIssue={updateIssue} />
                </div>

                <div className="separator my-10"></div>

                <div className="px-9 mb-5">
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
                        {isEditingScore ? (
                          <InputDebounced
                            placeholder="Number"
                            filter={/^\d{0,6}$/}
                            value={isNil(issue.score) ? '' : issue.score}
                            onChange={stringValue => {
                              const value = stringValue.trim() ? Number(stringValue) : null;
                              updateIssue({ score: value });
                            }}
                            onBlur={() => setIsEditingScore(false)}
                            className="form-control form-control-flush"
                            autoFocus
                          />
                        ) : (
                          <span onClick={() => setIsEditingScore(true)} style={{ cursor: 'pointer' }}>
                            {issue.score ?? 0}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3 row">
                    <label className="col-sm-2 col-form-label fw-bold">Owner</label>
                    <div className="col-sm-10">
                      <ProjectBoardIssueDetailsReporter issue={issue} updateIssue={updateIssue} projectUsers={orgUsersArray} />
                    </div>
                  </div>

                  <div className="mb-3 row">
                    <label className="col-sm-2 col-form-label fw-bold">Cadence</label>
                    <div className="col-sm-10">
                      <DateSelector issue={issue} updateIssue={updateIssue} />
                    </div>
                  </div>

                  <div className="mb-3 row">
                    <label className="col-sm-2 col-form-label fw-bold">Tags</label>
                    <div className="col-sm-10">
                      <TagsComponent issue={issue} updateIssue={updateIssue} />
                    </div>
                  </div>
                </div>

                {isKeyResult && (
                  <>
                    <div className="separator my-10"></div>
                    <div className="px-9 mb-5">
                      <h4 className="fw-bold text-gray-700 mb-4">Key Result Measurement</h4>
                      <div className="d-flex flex-wrap gap-4">
                        <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4">
                          <div className="d-flex align-items-center">
                            <div className="fs-2 fw-bold counted">
                              <InputValue issue={issue} updateIssue={updateIssue} fieldName="startValue" />
                            </div>
                          </div>
                          <div className="fw-semibold fs-6 text-gray-500">Start value</div>
                        </div>
                        <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4">
                          <div className="d-flex align-items-center">
                            <div className="fs-2 fw-bold counted">
                              <InputValue issue={issue} updateIssue={updateIssue} fieldName="targetValue" />
                            </div>
                          </div>
                          <div className="fw-semibold fs-6 text-gray-500">Target value</div>
                        </div>
                        <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4">
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
                          <div className="fw-semibold fs-6 text-gray-500">Measure as</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Tab>

              {/* Key Results Tab (for Objectives only) */}
              {isObjective && (
                <Tab eventKey="keyresults" title="Key Results">
                  <div className="px-9 mb-5">
                    <KRTable parentGoalId={issue.id} />
                    <div className="mt-4">
                      <button className="btn btn-primary btn-sm" onClick={handleOpenModal}>
                        <i className="bi bi-plus"></i> Add a key result
                      </button>
                    </div>
                  </div>
                </Tab>
              )}

              {/* Updates Tab */}
              <Tab eventKey="updates" title="Updates">
                <div className="px-9">
                  <UpdatesComponent issue={issue} updateIssue={updateIssue} object="updates" />
                </div>
              </Tab>

              {/* Progress Graph (for KRs) */}
              {isKeyResult && (
                <Tab eventKey="progress" title="Progress">
                  <div className="px-9">
                    <KrGraph
                      kr={issue}
                      className="card-xl-stretch mb-xl-8"
                      chartColor="primary"
                      chartHeight="200px"
                    />
                  </div>
                </Tab>
              )}

              {/* Work Linked (for KRs) */}
              {isKeyResult && (
                <Tab eventKey="worklinked" title="Work Linked">
                  <div className="px-9">
                    <WorkLink issueId={issue.id} />
                  </div>
                </Tab>
              )}

              {/* Learning Tab */}
              <Tab eventKey="learning" title="Learning">
                <div className="px-9">
                  <CommentsComponent issue={issue} updateIssue={updateIssue} object="learnings" />
                </div>
              </Tab>

              {/* Risks Tab */}
              <Tab eventKey="risks" title="Risks">
                <div className="px-9">
                  <CommentsComponent issue={issue} updateIssue={updateIssue} object="risks" />
                </div>
              </Tab>

              {/* Parent Tab */}
              <Tab eventKey="parent" title="Parent">
                <div className="px-9">
                  <Select
                    variant="empty"
                    dropdownWidth={343}
                    withClearValue={false}
                    name="parent"
                    value={issue.parent}
                    options={goalsOptions}
                    onChange={goalId => updateIssue({ parent: goalId })}
                    renderValue={({ value: goalId }) => renderGoalOption(getGoalById(goalId), true)}
                    renderOption={({ value: goalId }) => renderGoalOption(getGoalById(goalId))}
                  />
                </div>
              </Tab>

              {/* Comments (for KRs) */}
              {isKeyResult && (
                <Tab eventKey="comments" title="Comments">
                  <div className="px-9">
                    <CommentsComponent issue={issue} updateIssue={updateIssue} object="comments" />
                  </div>
                </Tab>
              )}
            </Tabs>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal show={isModalOpen} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>New Key Result</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <CreateGoal modalClose={handleCloseModal} parent={issue.id} />
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

// Extracted as a proper component to avoid hook violations
const DateSelector = ({ issue, updateIssue }) => {
  const handleDateSelection = (event) => {
    const { value } = event.target;
    const currentYear = new Date().getFullYear();

    const cadenceMap = {
      Yearly: { start: new Date(currentYear, 0, 1), end: new Date(currentYear, 11, 31) },
      Q1: { start: new Date(currentYear, 0, 1), end: new Date(currentYear, 2, 31) },
      Q2: { start: new Date(currentYear, 3, 1), end: new Date(currentYear, 5, 30) },
      Q3: { start: new Date(currentYear, 6, 1), end: new Date(currentYear, 8, 30) },
      Q4: { start: new Date(currentYear, 9, 1), end: new Date(currentYear, 11, 31) },
      Custom: { start: new Date(currentYear, 0, 1), end: new Date(currentYear, 0, 2) },
    };

    const dates = cadenceMap[value];
    if (dates) {
      // Single update call instead of 3 separate Firestore writes
      updateIssue({
        start: Math.floor(dates.start.getTime()),
        end: Math.floor(dates.end.getTime()),
        cadence: value,
      });
    }
  };

  return (
    <div>
      <select
        value={issue.cadence || ''}
        onChange={handleDateSelection}
        className="form-select form-select-solid form-select-lg mb-4"
      >
        <option value="">Select cadence for the goal</option>
        <option value="Yearly">Yearly</option>
        <option value="Q1">Q1</option>
        <option value="Q2">Q2</option>
        <option value="Q3">Q3</option>
        <option value="Q4">Q4</option>
        <option value="Custom">Custom</option>
      </select>

      {issue.start && issue.end && (
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Start Date</label>
            <DatePicker
              onChange={start => updateIssue({ start })}
              value={issue.start}
              className="form-control form-control-solid"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">End Date</label>
            <DatePicker
              onChange={end => updateIssue({ end })}
              value={issue.end}
              className="form-control form-control-solid"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const renderGoalOption = (goal, isSelectValue, removeOptionValue) => {
  if (!goal) {
    goal = {
      avatarUrl: '',
      id: 0,
      title: 'Select a parent goal',
    };
  }

  return (
    <User
      key={goal.id}
      isSelectValue={isSelectValue}
      withBottomMargin={!!removeOptionValue}
    >
      <Avatar avatarUrl={goal.avatarUrl} name={goal.title} size={25} />
      <Username>{goal.title}</Username>
      {removeOptionValue && <Icon type="close" top={1} onClick={() => removeOptionValue()} />}
    </User>
  );
};

export default GoalDetails;
