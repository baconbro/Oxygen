import React from 'react';
import PropTypes from 'prop-types';

import { Button, ConfirmModal } from '../../components/common';


import { useAuth } from '../auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDeleteOKR } from '../../services/okrServices';

const propTypes = {
  issue: PropTypes.object.isRequired,
  //fetchProject: PropTypes.func.isRequired,
  //modalClose: PropTypes.func.isRequired,
};

const ProjectBoardIssueDetailsDelete = ({ issue, fetchProject, modalClose }) => {
  const {currentUser} = useAuth();
  const location = useLocation();
  const path = '/goals';
  const navigate = useNavigate();
  const deleteOKRMutation = useDeleteOKR();

  const handleIssueDelete = async () => {
    try {
      deleteOKRMutation({
        orgId: currentUser?.all?.currentOrg,
        itemId: issue.id,
      }
      );
      //modalClose();
      navigate(path);
    } catch (error) {
      ;
    }
  };

  return (
    <ConfirmModal
      title="Are you sure you want to delete this ?"
      message="Once you delete, it's gone for good."
      confirmText="Delete"
      onConfirm={handleIssueDelete}
      className="card card-flush border-0 h-md-100"
      renderLink={modal => (
        <Button icon="trash" iconSize={19} variant="empty" onClick={modal.open} className=" btn btn-sm" />
      )}
    />
  );
};

ProjectBoardIssueDetailsDelete.propTypes = propTypes;

export default ProjectBoardIssueDetailsDelete;
