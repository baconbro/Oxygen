import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../modules/auth';
import { useGetSpaceByAcronym } from '../services/workspaceServices';

const WorkspaceAcronymRedirect: React.FC = () => {
  const { acronym } = useParams();
  const { currentUser } = useAuth();
  const orgId = currentUser?.all?.currentOrg;
  const { data, status } = useGetSpaceByAcronym(acronym as string, orgId);

  if (!acronym) return <Navigate to='/error/404' />;
  if (status === 'loading') return null; // Let MasterLayout progress bar show
  if (!data) return <Navigate to='/error/404' />;

  // Navigate to the workspace board by default
  return <Navigate to={`/workspace/${data.id}/board`} replace />;
};

export default WorkspaceAcronymRedirect;
