import { useState,useEffect } from 'react';
import { InputDebounced } from '../../../components/common';
import { isNil } from 'lodash';


const DetailsPrioritization = ({ issue, updateIssue }) => {
  const [reach, setReach] = useState(issue.reach || 0);
  const [impact, setImpact] = useState(issue.impact || 0);
  const [confidence, setConfidence] = useState(issue.confidence || 0);
  const [effort, setEffort] = useState(issue.effort || 0);
  const [riceScore, setRiceScore] = useState(issue.riceScore || 0);

  useEffect(() => {
    calculateRiceScore()
  }, [issue.reach , issue.impact , issue.confidence , issue.effort]);

  // Function to calculate the RICE score
  const calculateRiceScore = () => {
    if (issue.reach && issue.impact && issue.confidence && issue.effort) {
    const score = (issue.reach * issue.impact * issue.confidence) / issue.effort;
    updateIssue({ rice : Math.round(score) });
    setRiceScore(Math.round(score));
  } else {
    setRiceScore(0);
  }
  //return Math.round(score); // Round the score to 0 decimal places
  };

  return (
    <div className="mt-5">
      <h1 className="mb-4">RICE Prioritization</h1>
      <div className="mb-3">
        <label className="form-label">
          Reach:
          {renderHourInput('reach', issue, updateIssue,calculateRiceScore)}
        </label>
      </div>
      <div className="mb-3">
        <label className="form-label">
          Impact:
          {renderHourInput('impact', issue, updateIssue,calculateRiceScore)}
        </label>
      </div>
      <div className="mb-3">
        <label className="form-label">
          Confidence:
          {renderHourInput('confidence', issue, updateIssue,calculateRiceScore)}
        </label>
      </div>
      <div className="mb-3">
        <label className="form-label">
          Effort:
          {renderHourInput('effort', issue, updateIssue,calculateRiceScore)}
        </label>
      </div>
      <div className="mt-4">
        <h4>RICE Score: {riceScore}</h4>
      </div>
    </div>
  );
};




 /*  <>

  <div className="card-header pt-5 d-flex flex-column h-100">
  <div className="d-flex flex-stack mb-6">
                                        
                            <div className="flex-shrink-0 me-5">
                                <span className="text-gray-400 fs-7 fw-bold me-2 d-block lh-1 pb-1">Rice</span>

                                <span className="text-gray-800 fs-1 fw-bold">999</span>
                            </div>
                         

                            <span className="badge badge-light-primary flex-shrink-0 align-self-center py-3 px-4 fs-7">RICE</span>
                        </div>
    </div>
    <div className="card-body pt-6">
    <div className="rating">
    <label className="btn btn-light fw-bold btn-sm rating-label me-3" >
        Reach
    </label>
    <input className="rating-input" name="rating" value="0" checked type="radio" id="xgn_rating_input_0"/>

    <label className="rating-label me-1" for="xgn_rating_input_1">
    <i className="bi bi-circle-fill fs-1"></i>
    </label>
    <input className="rating-input" name="rating" value="1" type="radio" id="xgn_rating_input_1"/>
 
    <label className="rating-label me-1" for="xgn_rating_input_2">
    <i className="bi bi-circle-fill fs-1"></i>
    </label>
    <input className="rating-input" name="rating" value="2" type="radio" id="xgn_rating_input_2"/>

    <label className="rating-label me-1" for="xgn_rating_input_3">
    <i className="bi bi-circle-fill fs-1"></i>
    </label>
    <input className="rating-input" name="rating" value="3" type="radio" id="xgn_rating_input_3"/>
 
    <label className="rating-label me-1" for="xgn_rating_input_4">
    <i className="bi bi-circle-fill fs-1"></i>
    </label>
    <input className="rating-input" name="rating" value="4" type="radio" id="xgn_rating_input_4"/>

    <label className="rating-label me-1" for="xgn_rating_input_5">
    <i className="bi bi-circle-fill fs-1"></i>
    </label>
    <input className="rating-input" name="rating" value="5" type="radio" id="xgn_rating_input_5"/>

</div>
 

    </div>
  </>
); */

const Dot = ({ active }) => (
  <i
  className={`bi bi-circle-fill fs-1 ${active ? 'text-primary' : 'text-light'}`}
  style={{ margin: '0 2px' }}
/>
);

const Dots = ({ count }) => {
  const dots = new Array(10).fill(null).map((_, index) => <Dot key={index} active={index < count} />);
  return <div>{dots}</div>;
};

const renderHourInput = (fieldName, issue, updateIssue,calculateRiceScore) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
  <InputDebounced
    placeholder="Number"
    filter={/^(?:10|\d{1}|)$|^$/}
    value={isNil(issue[fieldName]) ? '' : issue[fieldName]}
    onChange={stringValue => {
      const value = stringValue.trim() ? Number(stringValue) : null;
      updateIssue({ [fieldName]: value });
    }}
    className="form-control form-control-solid "
  />
  <Dots count={issue[fieldName] || 0} />
  </div>
);


export default DetailsPrioritization;
