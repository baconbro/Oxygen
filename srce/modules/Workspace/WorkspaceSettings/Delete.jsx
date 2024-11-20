import React from 'react';
import toast from '../../../utils/toast';
import { ConfirmModal } from '../../../components/common';
import * as FirestoreService from '../../../services/firestore';
import history from '../../../utils/browserHistory';
import { useNavigate } from "react-router-dom";

const ProjectDelete = ({ project }) => {
  const navigate = useNavigate();
  const handleIssueDelete = async () => {
    try {
      await FirestoreService.deleteSpace(project.spaceId, project.org);

      history.push('/dashboard');
      navigate("/dashboard");
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <ConfirmModal
      title="Are you sure you want to delete this workspace and all content associated?"
      message="Once you delete, it's gone for good."
      confirmText="Delete workspace"
      onConfirm={handleIssueDelete}
      className="card card-flush border-0 h-md-100"
      renderLink={modal => (
        <button onClick={modal.open} className='btn btn-danger' > Delete workspace <i className='bi bi-trash'></i> </button>
      )}
    />
  );
};

export default ProjectDelete;
