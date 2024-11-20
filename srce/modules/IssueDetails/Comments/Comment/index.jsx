import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';

import { formatDateTimeConversational } from '../../../../utils/dateTime';
import { ConfirmModal } from '../../../../components/common';

import BodyForm from '../BodyForm';
import {
  Comment,
  UserAvatar,
  Content,
  Username,
  CreatedAt,
  Body,
  EditLink,
  DeleteLink,
} from './Styles';
import { useAuth } from '../../../auth';

//firebase
import * as FirestoreService from '../../../../services/firestore';

const propTypes = {
  comment: PropTypes.object.isRequired,
  //fetchIssue: PropTypes.func.isRequired,
};

const ProjectBoardIssueDetailsComment = ({ comment, fetchIssue }) => {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isUpdating, setUpdating] = useState(false);
  const initComment = comment;
  const [body, setBody] = useState(initComment.body);
  const {currentUser} = useAuth();

  const handleCommentDelete = async () => {
    try {
      await FirestoreService.deletComment(currentUser?.all?.currentOrg,comment,comment.issueId)
    } catch (error) {
      
    }
  };

  const handleCommentUpdate = async () => {
    try {
      setUpdating(true);
      await FirestoreService.editComment(currentUser?.all?.currentOrg,comment,comment.issueId,body)
      //await api.put(`/comments/${comment.id}`, { body });
      //await fetchIssue();
      setUpdating(false);
      setFormOpen(false);
    } catch (error) {
      
    }
  };

  return (
    <Comment data-testid="issue-comment">
    <div className="mb-7">
        
          <div className="d-flex mb-5">
           
              <div className="avatar avatar-45px me-5">
              <UserAvatar name={comment.user.name} avatarUrl={comment.user.avatarUrl} />   
              </div>
          
              <div className="d-flex flex-column flex-row-fluid">
              
                  <div className="d-flex align-items-center flex-wrap mb-1">
                      <a href="#" className="text-gray-800 text-hover-primary fw-bold me-2">{comment.user.name}</a>

                      <span className="text-gray-400 fw-semibold fs-7">
                        {formatDateTimeConversational(comment.createdAt)}
                        {comment.editedAt ? ( <span> - edited</span>) : (<span></span>)}  
                        </span>
                     
                     {isFormOpen ? (<span></span>) :( <span className="ms-auto text-gray-400 text-hover-primary fw-semibold fs-7"><ConfirmModal
            title="Are you sure you want to delete this comment?"
            message="Once you delete, it's gone for good."
            confirmText="Delete comment"
            onConfirm={handleCommentDelete}
            className="card card-flush border-0 h-md-100"
            renderLink={modal => <DeleteLink onClick={modal.open}>Delete</DeleteLink>}
          /> -  <EditLink onClick={() => setFormOpen(true)}>Edit</EditLink> </span>)}
                  </div>
                
                  <span className="text-gray-800 fs-7 fw-normal pt-1">
                  {isFormOpen ? (
        <BodyForm
          value={body}
          onChange={setBody}
          isWorking={isUpdating}
          onSubmit={handleCommentUpdate}
          onCancel={() => setFormOpen(false)}
        />
      ) : (
        <Fragment>
          
            {comment.body}
          
          

        </Fragment>
      )}
                      
                  </span>
                 
              </div>
          </div>

      </div>
    
    <Content>
      <Username></Username>
      <CreatedAt></CreatedAt>

      
    </Content>
  </Comment>
  );
};

ProjectBoardIssueDetailsComment.propTypes = propTypes;

export default ProjectBoardIssueDetailsComment;
