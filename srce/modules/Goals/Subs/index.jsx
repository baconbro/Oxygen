import React, { useState, useCallback, useEffect } from 'react';
import Create from './Create';
import  Title  from '../../IssueDetails/Title';
import {InputDebounced } from '../../../components/common'
import { isNil } from 'lodash';
import { getScoreColor } from '../../../constants/custom';

const KrData = [
  {
    title: 'tanner',
    owner: 'linsley',
    objectiveId: 24,
    keyResultId: 1,
    status: 'In Relationship',
    score: 30,
    id: 1,
  },
  {
    title: 'tannery',
    owner: 'linsley',
    objectiveId: 24,
    keyResultId: 2,
    status: 'In Relationship',
    score: 70,
    id:2,
  },

]

const SubsComponent = ({ issue, updateIssue }) => {
  const [itemList, setItemList] = useState(issue.krs || [])
  const [isEditing, setIsEditing] = useState(false);
 

  const modalClose = () => {}

  const removeItem = (itemId) => {
    const updatedItems = itemList.filter((item) => item.id !== itemId);
    setItemList(updatedItems);
    updateIssue({krs:updatedItems})
  };
  const addItem = (newItemTitle) => {
    if (newItemTitle.trim() !== '') {
      const newItem = {
        id: Date.now(),
        title: newItemTitle.trim(),
        score:0
      };
      setItemList([...itemList, newItem]);
      updateIssue({krs:[...itemList, newItem]})
    }
  };
  const updatedKrData = (res,kr) =>{ 
    const updatedData = itemList.map((item) => {
    if (item.id === kr.id) {
      return { ...item, ...res };
    }
    return item;
  })
  setItemList(updatedData);
  updateIssue({krs:updatedData})

};
const handleTextClick = () => {
  setIsEditing(true);
};

const handleInputBlur = () => {
  setIsEditing(false);
};

  return (
    <>
    <div className="card card-flush card-px-0 h-xl-100">
    <div className="card-header border-0 pt-5">
        <h3 className="card-title align-items-start flex-column">
			<span className="card-label fw-bold text-dark">Key Results</span>

			<span className="text-muted mt-1 fw-semibold fs-7"></span>
		</h3>
        <div className="card-toolbar">   
                   
        </div>
    </div>
    <div className="card-body pt-5"> 
    {itemList && itemList.map((item, index) => (
      <>
        <div className="d-flex flex-stack" key={index}>
          <div className="text-gray-700 fw-semibold fs-6 me-2">
          <Title issue={item} updateIssue={(a)=>updatedKrData(a,item)} InStyle={{fontSize : 14}}/>
          </div>
          <div className="d-flex align-items-senter">
          <span className={`badge badge-light-${getScoreColor(item.score)} fs-base`}>
              {isEditing ? (
            renderHourInput('score', item, updateIssue, updatedKrData,handleInputBlur)):(<span onClick={handleTextClick}>{item.score}</span>)
              }
            </span>
</div>
          <div className="d-flex align-items-center">
            <span className="btn btn-icon btn-active-light btn-sm border-0" onClick={() => removeItem(item.id)}>
<i className='bi bi-trash'></i>
            </span>
          </div>

        </div>
        <div className="separator separator-dashed my-3"></div> 
        </>
      ))}  
      <Create issueId={issue.id} issue={issue} addItem={addItem} />              
                
    </div>
</div>

    </>
  )
}

const renderHourInput = (fieldName, issue, updateIssue, updatedKrData,handleInputBlur) => (
  <InputDebounced
    placeholder="Number"
    filter={/^\d{0,6}$/}
    value={isNil(issue[fieldName]) ? '' : issue[fieldName]}
    onChange={stringValue => {
      const value = stringValue.trim() ? Number(stringValue) : null;
      updatedKrData({ [fieldName]: value }, issue);
    }}
    onBlur={handleInputBlur}
  />
);



export default SubsComponent;
