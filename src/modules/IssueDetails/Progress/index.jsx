import React, { useState,useEffect } from 'react';
import { SectionTitle } from '../Styles';

const Progress = ({ issue, updateIssue }) => {
  const [progress, setProgress] = useState('0')

  useEffect(() => {
    if (issue.progress && issue.progress != progress){
      setProgress(issue.progress)
    }
  }, [])


  const handleChange = (event) => {
    setProgress(event.target.value);
  }
  const handleChange2 = (event) => {
    updateIssue({ progress : progress })
  }
  return (
    <>
      <h3 className="fw-bold mb-1">Progress</h3>
      <div className="d-flex flex-column mw-200px">
        <div className="d-flex align-items-center mb-2">
          <span className="text-gray-700 fs-6 fw-bold me-2">{progress}%</span>
          <span className="text-muted fs-8 me-2">Progress</span>
{/*           <span className='me-2'><i className="bi bi-hand-index-thumb-fill text-primary"></i></span>
          <span className='me-2'><i className="bi bi-check2-circle text-muted "></i></span>
          <span className='me-2'><i className="bi bi-diagram-3-fill text-muted "></i></span> */}
        </div>
        <input
          id="typeinp"
          type="range"
          min="0" max="100"
          className='form-range'
          value={progress}
          onChange={handleChange}
          onTouchEnd={handleChange2}
          onMouseUp={handleChange2}
          onKeyUp={handleChange2}
          step="5" />
        <div className="progress h-6px d-none">
          <div className="progress-bar bg-primary" role="progressbar" style={{ width: progress + '%' }} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
    </>
  );
}



export default Progress;
