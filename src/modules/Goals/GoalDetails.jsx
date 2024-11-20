import React, { Fragment, useState, useEffect } from 'react';

import { CopyLinkButton, } from '../../components/common';

import Loader from '../IssueDetails/Loader';

import Delete from './Delete';
import Title from '../IssueDetails/Title';
import Description from '../IssueDetails/Description';

import Status from '../IssueDetails/Status';

import ProjectBoardIssueDetailsReporter from '../IssueDetails/Reporter';

import TagsComponent from '../IssueDetails/Tags';
import SubsComponent from './Subs';

import { useAuth } from '../auth';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceProvider';
import { Modal } from 'react-bootstrap'
import { InputDebounced } from '../../components/common'
import { isNil } from 'lodash';
import DatePicker from '../../components/common/DatePicker';
import { toAbsoluteUrl } from '../../utils'
import { customStatus, getScoreColor } from '../../constants/custom';
import { useUpdateOKR } from '../../services/okrServices';



const GoalDetails = ({
}) => {
  const initUsers = []


  const [data, setData] = useState()
  const [comments, setComments] = useState([])
  const { currentGoal, setCurrentGoal, orgUsers } = useWorkspace();
  const [showCreateAppModal, setShowCreateAppModal] = useState(false)
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const editOKRMutation = useUpdateOKR();

  //transform orgUsers into an array of objects
  const orgUsersArray = Object.keys(orgUsers).map((key) => {
    return { ...orgUsers[key] }
  })



  //get current user data
  const { currentUser } = useAuth();
  var id = useParams()

  //if currentGoal changes, update the data
  useEffect(() => {
    setData(currentGoal)
  }, [currentGoal])

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
        <div className='card-toolbar' style={{ cursor: 'pointer' }} onClick={() => (navigate(`/goals`))}><i className='bi bi-arrow-left-square-fill fs-6 text-muted me-1'></i>  Back to goals</div>
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
          <div className='col-xl-8 mb-5 mb-xl-10'>
            <div className=" flex-wrap d-grid gap-5 px-9 mb-5">
              <h3 className="card-title fw-bolder text-gray-800">
                <Title issue={issue} updateIssue={updateIssue} InStyle={{}} /></h3>
            </div>
            <div className="flex-wrap gap-5 px-9 mb-5">
              <Description issue={issue} updateIssue={updateIssue} />
            </div>


            <div className="flex-wrap gap-5 px-9 mb-5">
              <SubsComponent issue={issue} updateIssue={updateIssue} />

            </div>
            {/*             <div className="flex-wrap gap-5 px-9 mb-5">
              <button className="btn btn-custom btn-primary w-100"
                data-bs-toggle="modal" data-bs-target="#modal_workItem"
                data-bs-trigger='hover'
                data-bs-dismiss-='click'
                onClick={() => setShowCreateAppModal(true)}
              >
                <span className="btn-label">Link work item </span>
                <span className="svg-icon btn-icon svg-icon-2">
                  <i className="bi bi-link"></i>
                </span>
              </button>
              <Modal
                id='modal_workItem'
                tabIndex={-1}
                aria-hidden='true'
                dialogClassName='modal-dialog modal-dialog-centered mw-900px'
                show={showCreateAppModal}
                onHide={() => setShowCreateAppModal(false)}
                animation={false}>
                <div className='modal-content rounded'>
                  <div className="modal-header pb-0 border-0 justify-content-end">

                    <div className="btn btn-sm btn-icon btn-active-color-primary" onClick={() => setShowCreateAppModal(false)}>

                      <span className="svg-icon svg-icon-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <rect opacity="0.5" x="6" y="17.3137" width="16" height="2" rx="1" transform="rotate(-45 6 17.3137)" fill="currentColor"></rect>
                          <rect x="7.41422" y="6" width="16" height="2" rx="1" transform="rotate(45 7.41422 6)" fill="currentColor"></rect>
                        </svg>
                      </span>

                    </div>

                  </div>
                  <div className='modal-body scroll-y px-10 px-lg-15 pt-0 pb-15'>
                    <div className="mb-13 text-center">
                      {<TaskDependencies issue={issue} updateIssue={updateIssue} modalClose={modalClose} scope={"workItems"} />}
                    </div>
                  </div>
                </div>
              </Modal>
            </div> */}
          </div>
          <div className='col-xl-4 mb-xl-10'>
            <div className='card'>
              <div className='card-body pt-6'>
                <div className="me-md-2">
                  <Status issue={issue} updateIssue={updateIssue} customStatus={customStatus} />
                </div>
              </div>
            </div>
            <div className='card card-flush bgi-no-repeat bgi-size-contain bgi-position-x-end '
              style={{
                backgroundPosition: 'right',
                backgroundImage: `url("${toAbsoluteUrl('/media/svg/shapes/wave-bg-dark.svg')}")`,
              }}
            >
              <div className='card-body pt-6'>
                <div className="me-md-2">
                  <h3 className="fw-bold mb-1">Score</h3>
                  <span className={`fs-4hx badge badge-light-${getScoreColor(issue.score)} fs-base`}>
                    {isEditing ? (
                      renderHourInput('score', issue, updateIssue, handleInputBlur)) : (<span onClick={handleTextClick}>{issue.score}</span>)
                    }
                  </span>
                </div>

              </div>
            </div>
            <div className='card'>
              <div className='card-body pt-6'>
                <div className="">
                </div>
                <div className="me-md-2">
                  <ProjectBoardIssueDetailsReporter issue={issue} updateIssue={updateIssue} projectUsers={orgUsersArray} />
                </div>

              </div>
            </div>
            <div className='card'>
              <div className='card-body pt-6'>
                <div className="">
                  <h3 className="fw-bold mb-1">Cadence</h3>
                  {DateSelector()}

                </div>

              </div>
            </div>
            <div className='card'>
              <div className='card-body pt-6'>
                <TagsComponent issue={issue} updateIssue={updateIssue} />
              </div>
            </div>
          </div>
        </div>


      </div>
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

export default GoalDetails;
