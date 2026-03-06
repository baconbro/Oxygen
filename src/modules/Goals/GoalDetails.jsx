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
import { InputDebounced } from '../../components/common';
import { isNil } from 'lodash';
import DatePicker from '../../components/common/DatePicker';
import {
  customStatus,
  getScoreColor,
  goalType,
  goalVisibilityCopy,
  scoringMethodCopy,
  updateCadenceCopy,
} from '../../constants/custom';
import { useUpdateOKR, fetchSingleOKR } from '../../services/okrServices';
import { Avatar, Select, Icon } from '../../components/common';
import { User, Username } from '../IssueDetails/Reporter/Styles';
import CreateGoal from './createGoal';
import { Modal } from 'react-bootstrap';
import InputValue from './inputValue';
import CommentsComponent from './Comments';
import UpdatesComponent from './Updates';
import StatusUpdateComposer from './StatusUpdateComposer';
import WorkLink from './workLink';
import KrGraph from './KrGraph';


const GoalDetails = () => {
  const [data, setData] = useState();
  const { currentGoal, setCurrentGoal, orgUsers, goals } = useWorkspace();
  const navigate = useNavigate();
  const editOKRMutation = useUpdateOKR();
  const [activeSection, setActiveSection] = useState('updates');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser } = useAuth();
  const { search } = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [showUpdateComposer, setShowUpdateComposer] = useState(false);

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
    <div className="d-flex flex-column align-items-center justify-content-center p-20">
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <div className="text-gray-600">Loading goal details...</div>
    </div>
  );

  if (!data || Object.keys(data).length < 1) return (
    <div className="d-flex flex-column align-items-center justify-content-center p-20">
      <i className="bi bi-bullseye fs-3x text-gray-300 mb-5"></i>
      <div className="text-gray-600 fs-5">Goal not found</div>
      <button className="btn btn-sm btn-primary mt-4" onClick={() => navigate('/goals')}>
        <i className="bi bi-arrow-left me-1"></i> Back to Goals
      </button>
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

  const getGoalById = goalId => goals?.find(goal => goal.id === goalId);

  const isObjective = issue.type === 'objective' || issue.type === 'obj';
  const isKeyResult = issue.type === 'kr';
  const isInitiative = issue.type === 'initiative';

  // Progress calculation
  const getProgress = () => {
    if (isKeyResult) {
      const score = Number(issue.score) || 0;
      const target = Number(issue.targetValue);
      if (target && target !== 0) return Math.round((score / target) * 100);
      return 0;
    }
    const childKRs = (goals || []).filter(g => String(g.parent) === String(issue.id) && g.type === 'kr');
    if (childKRs.length === 0) return null;
    let total = 0;
    let count = 0;
    childKRs.forEach(kr => {
      const s = Number(kr.score) || 0;
      const t = Number(kr.targetValue);
      if (t && t !== 0) {
        total += s / t;
        count++;
      }
    });
    return count > 0 ? Math.round((total / count) * 100) : 0;
  };

  const progress = getProgress();

  const parentGoal = issue.parent ? getGoalById(issue.parent) : null;

  // Followers
  const followers = issue.followerIds || [];
  const isFollowing = followers.includes(currentUser?.all?.uid);

  const handleToggleFollow = () => {
    const newFollowers = isFollowing
      ? followers.filter(id => id !== currentUser.all.uid)
      : [...followers, currentUser.all.uid];
    updateIssue({ followerIds: newFollowers });
  };

  // Archive / Pause
  const handleToggleArchive = () => {
    updateIssue({ isArchived: !issue.isArchived });
  };

  const handleTogglePause = () => {
    if (issue.isPaused) {
      updateIssue({ isPaused: false, status: 'pending' });
    } else {
      updateIssue({ isPaused: true, status: 'paused' });
    }
  };

  // Child items for objectives
  const childGoals = (goals || []).filter(g => String(g.parent) === String(issue.id));
  const childKRs = childGoals.filter(g => g.type === 'kr');
  const childInitiatives = childGoals.filter(g => g.type === 'initiative');

  // Section navigation items
  const sections = [
    { key: 'updates', label: 'Check-ins', icon: 'bi-graph-up-arrow' },
    ...(isObjective ? [{ key: 'keyresults', label: 'Key Results', icon: 'bi-list-check' }] : []),
    ...(isObjective ? [{ key: 'initiatives', label: 'Initiatives', icon: 'bi-lightning' }] : []),
    ...(isKeyResult ? [{ key: 'progress', label: 'Progress', icon: 'bi-bar-chart-line' }] : []),
    ...((isKeyResult || isInitiative) ? [{ key: 'worklinked', label: 'Linked Work', icon: 'bi-link-45deg' }] : []),
    ...(issue.metrics && issue.metrics.length > 0 ? [{ key: 'metrics', label: 'Metrics', icon: 'bi-speedometer2' }] : []),
    { key: 'learning', label: 'Learnings', icon: 'bi-lightbulb' },
    { key: 'risks', label: 'Risks', icon: 'bi-exclamation-triangle' },
    { key: 'comments', label: 'Comments', icon: 'bi-chat-dots' },
  ];

  return (
    <>
      {/* Breadcrumb & Actions Bar */}
      <div className="d-flex align-items-center justify-content-between mb-5">
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-sm btn-icon btn-light" onClick={() => navigate('/goals')}>
            <i className="bi bi-arrow-left"></i>
          </button>
          {parentGoal && (
            <span className="d-flex align-items-center text-gray-500 fs-7">
              <span
                className="text-hover-primary cursor-pointer"
                onClick={() => navigate(`/goals/details?id=${parentGoal.id}`)}
              >
                {parentGoal.title}
              </span>
              <i className="bi bi-chevron-right mx-2 fs-8"></i>
            </span>
          )}
          <span className={`badge badge-${goalType.IssueStatusClass[issue.type] || 'light-primary'}`}>
            {goalType.IssueStatusCopy[issue.type] || 'Goal'}
          </span>
          {issue.isArchived && (
            <span className="badge badge-light-dark">
              <i className="bi bi-archive me-1"></i> Archived
            </span>
          )}
          {issue.isPaused && (
            <span className="badge badge-light-warning">
              <i className="bi bi-pause-circle me-1"></i> Paused
            </span>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">
          {/* Follow button */}
          <button
            className={`btn btn-sm ${isFollowing ? 'btn-light-primary' : 'btn-light'}`}
            onClick={handleToggleFollow}
            title={isFollowing ? 'Unfollow' : 'Follow to get updates'}
          >
            <i className={`bi ${isFollowing ? 'bi-bell-fill' : 'bi-bell'} me-1`}></i>
            {isFollowing ? 'Following' : 'Follow'}
            {followers.length > 0 && (
              <span className="badge badge-light ms-1">{followers.length}</span>
            )}
          </button>

          <CopyLinkButton variant="empty" className="btn btn-sm btn-light" />

          {/* More actions dropdown */}
          <div className="dropdown">
            <button className="btn btn-sm btn-light btn-icon" data-bs-toggle="dropdown">
              <i className="bi bi-three-dots"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item" onClick={handleTogglePause}>
                  <i className={`bi ${issue.isPaused ? 'bi-play-circle' : 'bi-pause-circle'} me-2`}></i>
                  {issue.isPaused ? 'Resume' : 'Pause'}
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={handleToggleArchive}>
                  <i className={`bi ${issue.isArchived ? 'bi-box-arrow-up' : 'bi-archive'} me-2`}></i>
                  {issue.isArchived ? 'Unarchive' : 'Archive'}
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <Delete issue={issue} modalClose={false} />
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="row g-5 g-xl-8">
        {/* ==================== MAIN CONTENT ==================== */}
        <div className="col-xl-8">
          <div className="card card-flush border-0 mb-5">
            <div className="card-body pt-6 pb-4">
              {/* Title */}
              <div className="mb-4">
                <Title issue={issue} updateIssue={updateIssue} InStyle={{ fontSize: '1.5rem', fontWeight: 700 }} />
              </div>

              {/* Description */}
              <div className="mb-2">
                <Description issue={issue} updateIssue={updateIssue} />
              </div>
            </div>
          </div>

          {/* Progress Hero (for Key Results) */}
          {isKeyResult && (
            <div className="card card-flush border-0 mb-5">
              <div className="card-body py-5">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-gray-700 fw-semibold fs-6">Progress</span>
                  <span className={`badge badge-light-${getScoreColor(progress)} fs-6`}>
                    {progress}%
                  </span>
                </div>
                <div className="progress h-10px w-100 mb-4">
                  <div
                    className={`progress-bar bg-${getScoreColor(progress)}`}
                    role="progressbar"
                    style={{ width: `${Math.min(progress, 100)}%`, transition: 'width 0.6s ease' }}
                  ></div>
                </div>
                <div className="d-flex flex-wrap gap-5">
                  <div className="border border-gray-300 border-dashed rounded py-3 px-4 flex-fill">
                    <div className="fs-4 fw-bold text-gray-800">
                      <InputValue issue={issue} updateIssue={updateIssue} fieldName="startValue" />
                    </div>
                    <div className="fw-semibold fs-7 text-gray-500">Start</div>
                  </div>
                  <div className="border border-gray-300 border-dashed rounded py-3 px-4 flex-fill">
                    <div className="d-flex align-items-center gap-2">
                      <span className={`fs-4 fw-bold badge badge-light-${getScoreColor(issue.score)} px-0`}>
                        {isEditingScore ? (
                          <InputDebounced
                            placeholder="0"
                            filter={/^\d{0,6}$/}
                            value={isNil(issue.score) ? '' : issue.score}
                            onChange={val => {
                              const v = val.trim() ? Number(val) : null;
                              updateIssue({ score: v });
                            }}
                            onBlur={() => setIsEditingScore(false)}
                            className="form-control form-control-flush fw-bold fs-4"
                            style={{ width: 70 }}
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() => setIsEditingScore(true)}
                            className="cursor-pointer"
                            title="Click to update current value"
                          >
                            {issue.score ?? 0}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="fw-semibold fs-7 text-gray-500">Current</div>
                  </div>
                  <div className="border border-gray-300 border-dashed rounded py-3 px-4 flex-fill">
                    <div className="fs-4 fw-bold text-gray-800">
                      <InputValue issue={issue} updateIssue={updateIssue} fieldName="targetValue" />
                    </div>
                    <div className="fw-semibold fs-7 text-gray-500">Target</div>
                  </div>
                  <div className="border border-gray-300 border-dashed rounded py-3 px-4">
                    <div className="fs-7 fw-bold text-gray-800">
                      <Select
                        variant="empty"
                        dropdownWidth={160}
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
                    <div className="fw-semibold fs-7 text-gray-500">Unit</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Hero (for Objectives) */}
          {isObjective && progress !== null && (
            <div className="card card-flush border-0 mb-5">
              <div className="card-body py-5">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-gray-700 fw-semibold fs-6">Overall Progress</span>
                  <span className={`badge badge-light-${getScoreColor(progress)} fs-6`}>
                    {progress}%
                  </span>
                </div>
                <div className="progress h-10px w-100 mb-2">
                  <div
                    className={`progress-bar bg-${getScoreColor(progress)}`}
                    role="progressbar"
                    style={{ width: `${Math.min(progress, 100)}%`, transition: 'width 0.6s ease' }}
                  ></div>
                </div>
                <div className="text-gray-500 fs-7">
                  Calculated from the average progress of {childKRs.length} key result{childKRs.length !== 1 ? 's' : ''}.
                </div>
              </div>
            </div>
          )}

          {/* Inline Key Results for Objectives */}
          {isObjective && (
            <div className="card card-flush border-0 mb-5">
              <div className="card-header pt-5 pb-0 border-0">
                <div className="card-title d-flex align-items-center">
                  <i className="bi bi-list-check fs-4 text-primary me-2"></i>
                  <h3 className="fw-bold text-gray-800 m-0 fs-5">Key Results</h3>
                  <span className="badge badge-light ms-2">{childKRs.length}</span>
                </div>
                <div className="card-toolbar">
                  <button className="btn btn-primary btn-sm" onClick={handleOpenModal}>
                    <i className="bi bi-plus me-1"></i> Add Key Result
                  </button>
                </div>
              </div>
              <div className="card-body pt-3">
                <KRTable parentGoalId={issue.id} />
                {childKRs.length === 0 && (
                  <div className="notice d-flex bg-light-warning rounded border-warning border border-dashed p-4 mt-2">
                    <i className="bi bi-lightbulb-fill fs-5 text-warning me-3 mt-1"></i>
                    <div className="text-gray-700 fs-7">
                      <strong>OKR Tip:</strong> Each objective should have 2-5 measurable key results. Key results answer "How will I know if I've achieved this objective?"
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Inline Initiatives for Objectives */}
          {isObjective && childInitiatives.length > 0 && (
            <div className="card card-flush border-0 mb-5">
              <div className="card-header pt-5 pb-0 border-0">
                <div className="card-title d-flex align-items-center">
                  <i className="bi bi-lightning fs-4 text-warning me-2"></i>
                  <h3 className="fw-bold text-gray-800 m-0 fs-5">Initiatives</h3>
                  <span className="badge badge-light ms-2">{childInitiatives.length}</span>
                </div>
              </div>
              <div className="card-body pt-3">
                <div className="d-flex flex-column gap-3">
                  {childInitiatives.map(initiative => (
                    <div
                      key={initiative.id}
                      onClick={() => navigate(`/goals/details?id=${initiative.id}`)}
                      className="border border-gray-300 border-dashed rounded p-4 cursor-pointer bg-hover-light-warning"
                      style={{ transition: 'background-color 0.15s ease' }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <i className="bi bi-lightning text-warning"></i>
                          <span className="fw-semibold text-gray-800">{initiative.title}</span>
                        </div>
                        <span className={`badge badge-${customStatus.IssueStatusClass[initiative.status] || 'secondary'}`}>
                          {customStatus.IssueStatusCopy[initiative.status] || initiative.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section Navigation */}
          <div className="card card-flush border-0">
            <div className="card-header pt-5 pb-0 border-0">
              <ul className="nav nav-stretch nav-line-tabs nav-line-tabs-2x fs-6 fw-semibold">
                {sections.map(section => (
                  <li className="nav-item" key={section.key}>
                    <button
                      className={`nav-link text-active-primary py-5 me-4 ${activeSection === section.key ? 'active' : ''}`}
                      onClick={() => setActiveSection(section.key)}
                    >
                      <i className={`bi ${section.icon} me-2`}></i>
                      {section.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-body pt-5">
              {activeSection === 'updates' && (
                <div>
                  {/* Structured Update Composer */}
                  {showUpdateComposer ? (
                    <div className="mb-5">
                      <StatusUpdateComposer
                        issue={issue}
                        updateIssue={updateIssue}
                        onCancel={() => setShowUpdateComposer(false)}
                      />
                    </div>
                  ) : (
                    <div className="mb-5">
                      <button
                        onClick={() => setShowUpdateComposer(true)}
                        className="btn btn-outline btn-outline-primary btn-active-light-primary w-100 d-flex align-items-center justify-content-center gap-2 py-4"
                      >
                        <i className="bi bi-pencil-square"></i>
                        <span>Post a status update</span>
                      </button>
                    </div>
                  )}

                  {/* Legacy check-ins */}
                  <UpdatesComponent issue={issue} updateIssue={updateIssue} object="updates" />
                </div>
              )}

              {activeSection === 'keyresults' && isObjective && (
                <div>
                  <KRTable parentGoalId={issue.id} />
                  <div className="mt-4">
                    <button className="btn btn-primary btn-sm" onClick={handleOpenModal}>
                      <i className="bi bi-plus me-1"></i> Add Key Result
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'initiatives' && isObjective && (
                <div>
                  {childInitiatives.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {childInitiatives.map(initiative => (
                        <div
                          key={initiative.id}
                          onClick={() => navigate(`/goals/details?id=${initiative.id}`)}
                          className="border border-gray-300 border-dashed rounded p-4 cursor-pointer bg-hover-light-warning"
                        >
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                              <i className="bi bi-lightning text-warning"></i>
                              <span className="fw-semibold text-gray-800">{initiative.title}</span>
                            </div>
                            <span className={`badge badge-${customStatus.IssueStatusClass[initiative.status] || 'secondary'}`}>
                              {customStatus.IssueStatusCopy[initiative.status] || initiative.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="d-flex flex-column align-items-center py-8">
                      <i className="bi bi-lightning fs-2x text-gray-300 mb-3"></i>
                      <div className="text-gray-500 fw-semibold mb-1">No initiatives yet</div>
                      <div className="text-gray-400 fs-7">Add initiatives to track the work that drives this objective.</div>
                    </div>
                  )}
                  <div className="mt-4">
                    <button className="btn btn-warning btn-sm" onClick={handleOpenModal}>
                      <i className="bi bi-plus me-1"></i> Add Initiative
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'progress' && isKeyResult && (
                <KrGraph
                  kr={issue}
                  className="card-xl-stretch mb-xl-8"
                  chartColor="primary"
                  chartHeight="300px"
                />
              )}

              {activeSection === 'worklinked' && (isKeyResult || isInitiative) && (
                <div>
                  <div className="notice d-flex bg-light-primary rounded border-primary border border-dashed p-4 mb-5">
                    <i className="bi bi-link-45deg fs-5 text-primary me-3 mt-1"></i>
                    <div className="text-gray-700 fs-7">
                      Link work items (tasks, stories, bugs) to this {isKeyResult ? 'key result' : 'initiative'} to track how execution contributes to your goal.
                    </div>
                  </div>
                  <WorkLink issueId={issue.id} />
                </div>
              )}

              {activeSection === 'metrics' && issue.metrics && issue.metrics.length > 0 && (
                <div>
                  <div className="row g-4">
                    {issue.metrics.map((metric, idx) => (
                      <div key={metric.id || idx} className="col-md-6">
                        <MetricCard metric={metric} onUpdate={(updated) => {
                          const newMetrics = [...issue.metrics];
                          newMetrics[idx] = { ...newMetrics[idx], ...updated };
                          updateIssue({ metrics: newMetrics });
                        }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'learning' && (
                <div>
                  <div className="notice d-flex bg-light-success rounded border-success border border-dashed p-4 mb-5">
                    <i className="bi bi-lightbulb-fill fs-5 text-success me-3 mt-1"></i>
                    <div className="text-gray-700 fs-7">
                      Capture insights and lessons as you work toward this goal.
                    </div>
                  </div>
                  <CommentsComponent issue={issue} updateIssue={updateIssue} object="learnings" />
                </div>
              )}

              {activeSection === 'risks' && (
                <div>
                  <div className="notice d-flex bg-light-danger rounded border-danger border border-dashed p-4 mb-5">
                    <i className="bi bi-exclamation-triangle-fill fs-5 text-danger me-3 mt-1"></i>
                    <div className="text-gray-700 fs-7">
                      Document blockers, dependencies, and risks that could prevent this goal from being achieved.
                    </div>
                  </div>
                  <CommentsComponent issue={issue} updateIssue={updateIssue} object="risks" />
                </div>
              )}

              {activeSection === 'comments' && (
                <CommentsComponent issue={issue} updateIssue={updateIssue} object="comments" />
              )}
            </div>
          </div>
        </div>

        {/* ==================== SIDEBAR ==================== */}
        <div className="col-xl-4">
          {/* Status Card */}
          <div className="card card-flush border-0 mb-5">
            <div className="card-header pt-5 pb-0 border-0">
              <h3 className="card-title fw-bold text-gray-800 fs-6">Details</h3>
            </div>
            <div className="card-body pt-4">
              <div className="mb-5">
                <label className="form-label fw-semibold text-gray-600 fs-7 mb-1">Status</label>
                <div>
                  <Status issue={issue} updateIssue={updateIssue} customStatus={customStatus} />
                </div>
              </div>

              <div className="mb-5">
                <label className="form-label fw-semibold text-gray-600 fs-7 mb-1">Type</label>
                <div>
                  <Status issue={issue} updateIssue={updateIssue} customStatus={goalType} fieldName="type" />
                </div>
              </div>

              {isObjective && (
                <div className="mb-5">
                  <label className="form-label fw-semibold text-gray-600 fs-7 mb-1">Score</label>
                  <div>
                    <span className={`badge badge-light-${getScoreColor(issue.score)} fs-6`}>
                      {isEditingScore ? (
                        <InputDebounced
                          placeholder="0"
                          filter={/^\d{0,6}$/}
                          value={isNil(issue.score) ? '' : issue.score}
                          onChange={val => {
                            const v = val.trim() ? Number(val) : null;
                            updateIssue({ score: v });
                          }}
                          onBlur={() => setIsEditingScore(false)}
                          className="form-control form-control-flush fw-bold"
                          style={{ width: 70 }}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => setIsEditingScore(true)} className="cursor-pointer" title="Click to edit">
                          {issue.score ?? 0}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Scoring method */}
              {issue.scoringMethod && (
                <div className="mb-5">
                  <label className="form-label fw-semibold text-gray-600 fs-7 mb-1">Scoring Method</label>
                  <div>
                    <Select
                      variant="empty"
                      dropdownWidth={200}
                      withClearValue={false}
                      name="scoringMethod"
                      value={issue.scoringMethod}
                      options={Object.entries(scoringMethodCopy).map(([value, label]) => ({ value, label }))}
                      onChange={val => updateIssue({ scoringMethod: val })}
                      renderValue={({ value }) => (
                        <span className="btn btn-sm btn-light">{scoringMethodCopy[value] || value}</span>
                      )}
                      renderOption={({ value }) => <span>{scoringMethodCopy[value]}</span>}
                    />
                  </div>
                </div>
              )}

              <div className="mb-5">
                <label className="form-label fw-semibold text-gray-600 fs-7 mb-1">Owner</label>
                <div>
                  <ProjectBoardIssueDetailsReporter issue={issue} updateIssue={updateIssue} projectUsers={orgUsersArray} />
                </div>
              </div>

              <div className="separator my-5"></div>

              {/* Visibility */}
              <div className="mb-5">
                <label className="form-label fw-semibold text-gray-600 fs-7 mb-1">Visibility</label>
                <div>
                  <Select
                    variant="empty"
                    dropdownWidth={200}
                    withClearValue={false}
                    name="visibility"
                    value={issue.visibility || 'public'}
                    options={Object.entries(goalVisibilityCopy).map(([value, label]) => ({ value, label }))}
                    onChange={val => updateIssue({ visibility: val })}
                    renderValue={({ value }) => (
                      <span className="btn btn-sm btn-light">
                        <i className={`bi ${value === 'public' ? 'bi-globe' : value === 'private' ? 'bi-lock' : 'bi-people'} me-1`}></i>
                        {goalVisibilityCopy[value] || 'Public'}
                      </span>
                    )}
                    renderOption={({ value }) => (
                      <span>
                        <i className={`bi ${value === 'public' ? 'bi-globe' : value === 'private' ? 'bi-lock' : 'bi-people'} me-2`}></i>
                        {goalVisibilityCopy[value]}
                      </span>
                    )}
                  />
                </div>
              </div>

              {/* Update cadence */}
              <div className="mb-5">
                <label className="form-label fw-semibold text-gray-600 fs-7 mb-1">Update Cadence</label>
                <div>
                  <Select
                    variant="empty"
                    dropdownWidth={200}
                    withClearValue={false}
                    name="updateCadence"
                    value={issue.updateCadence || 'monthly'}
                    options={Object.entries(updateCadenceCopy).map(([value, label]) => ({ value, label }))}
                    onChange={val => updateIssue({ updateCadence: val })}
                    renderValue={({ value }) => (
                      <span className="btn btn-sm btn-light">{updateCadenceCopy[value] || value}</span>
                    )}
                    renderOption={({ value }) => <span>{updateCadenceCopy[value]}</span>}
                  />
                </div>
              </div>

              <div className="separator my-5"></div>

              <div className="mb-5">
                <label className="form-label fw-semibold text-gray-600 fs-7 mb-1">Time Period</label>
                <DateSelector issue={issue} updateIssue={updateIssue} />
              </div>

              <div className="separator my-5"></div>

              <div className="mb-5">
                <label className="form-label fw-semibold text-gray-600 fs-7 mb-1">Parent Goal</label>
                <Select
                  variant="empty"
                  dropdownWidth={300}
                  withClearValue={false}
                  name="parent"
                  value={issue.parent}
                  options={goalsOptions}
                  onChange={goalId => updateIssue({ parent: goalId })}
                  renderValue={({ value: goalId }) => renderGoalOption(getGoalById(goalId), true)}
                  renderOption={({ value: goalId }) => renderGoalOption(getGoalById(goalId))}
                />
                {!issue.parent && (
                  <div className="text-gray-400 fs-8 mt-1">
                    Link to a parent objective to create your goal hierarchy.
                  </div>
                )}
              </div>

              <div className="mb-5">
                <label className="form-label fw-semibold text-gray-600 fs-7 mb-1">Tags</label>
                <TagsComponent issue={issue} updateIssue={updateIssue} />
              </div>

              {/* Followers */}
              <div className="mb-5">
                <label className="form-label fw-semibold text-gray-600 fs-7 mb-1">
                  Followers
                  <span className="badge badge-light ms-1">{followers.length}</span>
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {followers.map(followerId => {
                    const user = orgUsersArray.find(u => u.uid === followerId);
                    if (!user) return null;
                    return (
                      <div key={followerId} className="d-flex align-items-center gap-1" title={user.name || user.fName || user.email}>
                        <Avatar avatarUrl={user.photoURL} name={user.name || user.fName || ''} size={24} className="avatar-circle" />
                      </div>
                    );
                  })}
                  {followers.length === 0 && (
                    <span className="text-gray-400 fs-8">No followers yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* OKR Guide Card */}
          <div className="card card-flush bg-light-primary border-0 mb-5">
            <div className="card-body py-5">
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-book fs-4 text-primary me-2"></i>
                <h4 className="fw-bold text-gray-800 m-0 fs-6">OKR Guide</h4>
              </div>
              {isObjective ? (
                <div className="fs-7 text-gray-700">
                  <p className="mb-2">
                    <strong>Objectives</strong> should be qualitative, inspirational, and time-bound.
                  </p>
                  <ul className="ps-4 mb-0">
                    <li className="mb-1">Keep it short and memorable</li>
                    <li className="mb-1">Make it ambitious but achievable</li>
                    <li className="mb-1">Add 2-5 measurable key results</li>
                    <li>70% completion is a healthy target</li>
                  </ul>
                </div>
              ) : isInitiative ? (
                <div className="fs-7 text-gray-700">
                  <p className="mb-2">
                    <strong>Initiatives</strong> are the projects and activities that drive progress on key results and objectives.
                  </p>
                  <ul className="ps-4 mb-0">
                    <li className="mb-1">Link to a parent objective</li>
                    <li className="mb-1">Connect work items for traceability</li>
                    <li className="mb-1">Track status through regular check-ins</li>
                    <li>Focus on outputs that move the needle</li>
                  </ul>
                </div>
              ) : (
                <div className="fs-7 text-gray-700">
                  <p className="mb-2">
                    <strong>Key Results</strong> are measurable outcomes. They describe <em>how</em> you'll measure success.
                  </p>
                  <ul className="ps-4 mb-0">
                    <li className="mb-1">Must be measurable with a number</li>
                    <li className="mb-1">Set a clear start and target value</li>
                    <li className="mb-1">Update progress with regular check-ins</li>
                    <li>Link work items to track execution</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Activity Summary */}
          <div className="card card-flush border-0">
            <div className="card-body py-5">
              <div className="d-flex align-items-center mb-4">
                <i className="bi bi-activity fs-4 text-gray-500 me-2"></i>
                <h4 className="fw-bold text-gray-800 m-0 fs-6">Activity</h4>
              </div>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-gray-600 fs-7">Check-ins</span>
                  <span className="badge badge-light-primary fs-7">{issue.updates?.length || 0}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-gray-600 fs-7">Comments</span>
                  <span className="badge badge-light-info fs-7">{issue.comments?.length || 0}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-gray-600 fs-7">Learnings</span>
                  <span className="badge badge-light-success fs-7">{issue.learnings?.length || 0}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-gray-600 fs-7">Risks</span>
                  <span className="badge badge-light-danger fs-7">{issue.risks?.length || 0}</span>
                </div>
                {isObjective && (
                  <>
                    <div className="separator my-1"></div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-gray-600 fs-7">Key Results</span>
                      <span className="badge badge-light-info fs-7">{childKRs.length}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-gray-600 fs-7">Initiatives</span>
                      <span className="badge badge-light-warning fs-7">{childInitiatives.length}</span>
                    </div>
                  </>
                )}
                {issue.createdAt && (
                  <>
                    <div className="separator my-1"></div>
                    <div className="text-gray-400 fs-8">
                      Created {new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </>
                )}
                {issue.updatedAt && (
                  <div className="text-gray-400 fs-8">
                    Last updated {new Date(issue.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal show={isModalOpen} onHide={handleCloseModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {isObjective ? 'Add to Objective' : 'New Goal'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <CreateGoal
              modalClose={handleCloseModal}
              parent={isObjective ? issue.id : undefined}
              defaultType={isObjective ? 'kr' : undefined}
            />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

// MetricCard component for displaying success metrics
const MetricCard = ({ metric, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(metric.currentValue || 0);

  const progress = metric.targetValue
    ? Math.round(((metric.currentValue - metric.startValue) / (metric.targetValue - metric.startValue)) * 100)
    : 0;

  const unitSymbol = metric.unit === 'dollar' ? '$' : metric.unit === 'percent' ? '%' : '';

  const handleSave = () => {
    onUpdate({ currentValue: Number(currentValue) });
    setIsEditing(false);
  };

  return (
    <div className="card card-flush border border-gray-200">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-semibold text-gray-800 fs-6">{metric.name || 'Metric'}</span>
          <span className={`badge badge-light-${getScoreColor(Math.max(0, progress))} fs-8`}>
            {progress}%
          </span>
        </div>
        <div className="progress h-6px mb-3">
          <div
            className={`progress-bar bg-${getScoreColor(Math.max(0, progress))}`}
            style={{ width: `${Math.min(Math.max(0, progress), 100)}%` }}
          ></div>
        </div>
        <div className="d-flex justify-content-between text-gray-500 fs-8">
          <span>Start: {unitSymbol}{metric.startValue}</span>
          <span>
            Current: {isEditing ? (
              <span className="d-inline-flex gap-1">
                <input
                  type="number"
                  className="form-control form-control-sm"
                  style={{ width: 70 }}
                  value={currentValue}
                  onChange={e => setCurrentValue(e.target.value)}
                  autoFocus
                />
                <button className="btn btn-sm btn-primary py-0 px-2" onClick={handleSave}>
                  <i className="bi bi-check"></i>
                </button>
              </span>
            ) : (
              <span className="cursor-pointer text-primary" onClick={() => setIsEditing(true)}>
                {unitSymbol}{metric.currentValue}
              </span>
            )}
          </span>
          <span>Target: {unitSymbol}{metric.targetValue}</span>
        </div>
      </div>
    </div>
  );
};

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
      updateIssue({
        start: Math.floor(dates.start.getTime()),
        end: Math.floor(dates.end.getTime()),
        cadence: value,
      });
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div>
      <select
        value={issue.cadence || ''}
        onChange={handleDateSelection}
        className="form-select form-select-solid form-select-sm mb-3"
      >
        <option value="">Select time period</option>
        <option value="Yearly">Yearly {new Date().getFullYear()}</option>
        <option value="Q1">Q1 (Jan - Mar)</option>
        <option value="Q2">Q2 (Apr - Jun)</option>
        <option value="Q3">Q3 (Jul - Sep)</option>
        <option value="Q4">Q4 (Oct - Dec)</option>
        <option value="Custom">Custom dates</option>
      </select>

      {issue.start && issue.end && (
        <div className="d-flex align-items-center gap-2">
          <div className="flex-fill">
            <DatePicker
              onChange={start => updateIssue({ start })}
              value={issue.start}
              className="form-control form-control-solid form-control-sm"
            />
          </div>
          <i className="bi bi-arrow-right text-gray-400"></i>
          <div className="flex-fill">
            <DatePicker
              onChange={end => updateIssue({ end })}
              value={issue.end}
              className="form-control form-control-solid form-control-sm"
            />
          </div>
        </div>
      )}

      {issue.start && issue.end && (
        <div className="text-gray-400 fs-8 mt-1">
          {formatDate(issue.start)} - {formatDate(issue.end)}
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
