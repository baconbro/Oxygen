import React, { useState, useEffect, useContext } from 'react';
import { Route, useLocation, useNavigate, useParams, Navigate, Routes } from 'react-router-dom';

import { updateArrayItemById } from '../shared/utils/javascript';
import { createQueryParamModalHelpers } from '../shared/utils/queryParamModal';
import { PageLoader, Modal } from '../shared/components';

import Board from './Board';
import IssueSearch from './IssueSearch';
import IssueCreate from './IssueCreate';
import ProjectSettings from './ProjectSettings';


import * as FirestoreService from '../App/services/firestore';
import Backlog from './Backlog';
import Roadmap from './Roadmap';
import { PageTitle } from '../../../../_oxygen/layout/core';
import IssueDetailsPage from './Board/issueDetail';
import { useAuth } from '../../auth';
import { useWorkspace } from '../App/contexts/WorkspaceProvider';
import List from './List';

const Project = () => {

  var id = useParams()
  const [data, setLocalData] = useState();
  const { project, updateProjectContext, setOrgUsers } = useWorkspace();


  //set the breadcrumbs
  //get the first element of the url
  const url = useLocation().pathname.split('/')[3];
  const issue = useLocation().pathname.split('/')[5];
  //get the url before the last element
  const url2 = useLocation().pathname.split('/').slice(0, -2).join('/');
  const accountBreadCrumbs = [

  ]
  //if url contain issue, add the issue id to the breadcrumbs
  if (useLocation().pathname.includes('issues')) {
    accountBreadCrumbs.push({

      title: url,
      path: `${url2}`,
      isSeparator: false,
      isActive: true,

    })
  }

  //set timeout to wait for data to load
  //get current time
  const time = new Date().getTime();
  const [timeout, setTimeout] = useState(time);


  useEffect(() => {
    // if it's been a minute since the last update or data is null, update again
    if (new Date().getTime() - timeout > 1000 || data == null) {
      refreshData()
      setTimeout(new Date().getTime())
    }
  }, [data, id.id]);

  //get current user data
  const { currentUser } = useAuth();

  const refreshData = async () => {
    try {
      const spaceData = await FirestoreService.getSpaceData(id.id, currentUser?.all?.currentOrg);
      const orgData = await FirestoreService.getOrgUsers(currentUser?.all?.currentOrg);
      const orgDataUsers = orgData.data().users
      setOrgUsers(orgDataUsers)

      if (spaceData) {
        const a = spaceData.data();

        if (a) {
          // For 'users'
          for (const user of a.users) {
            const userDetail = orgDataUsers[user.id];
            if (userDetail) {
              user.avatarUrl = userDetail.photoURL;
              user.name = userDetail.fName;
            }
          }

          // For 'members'
          if (a.members) {
            // Map over members to create an array of promises
            const memberPromises = a.members.map(async member => {
              try {
                const memberDetail = orgDataUsers[member.id];
                if (memberDetail) {
                  member.avatarUrl = memberDetail.photoURL;
                  member.name = memberDetail.fName;

                  return member;  // Return the modified member
                }

                return null;  // If no memberDetail available
              } catch (error) {
                console.error(`Error fetching data for member ${member.id}:`, error);
                return null;
              }
            });

            // Await all member data fetches
            const fetchedMembers = await Promise.all(memberPromises);

            // Filter out null values if you want
            const validMembers = fetchedMembers.filter(Boolean);
          }
        }

        const unsubscribe = FirestoreService.streamSubItems(currentUser.all.currentOrg, id.id,
          (querySnapshot) => {
            const items = querySnapshot.docs.map(docSnapshot => docSnapshot.data());
            setLocalData({
              project: {
                ...a,
                issues: items
              }
            });
            updateProjectContext({
              ...a,
              issues: items
            });
          },
          (error) => console.log(error)
        );

        return unsubscribe;
      } else {
        console.log('space-not-found');
      }
    } catch (error) {
      console.error(error);
    }
  }






  const match = useLocation();
  const history = useNavigate();

  const issueSearchModalHelpers = createQueryParamModalHelpers('issue-search');
  const issueCreateModalHelpers = createQueryParamModalHelpers('issue-create');

  if (!project || id.id !== project?.spaceId) return <PageLoader />;




  const updateLocalProjectIssues = (issueId, updatedFields) => {
    setLocalData(currentData => ({
      project: {
        ...currentData.project,
        issues: updateArrayItemById(currentData.project.issues, issueId, updatedFields),
      },
    }));
    updateProjectContext(currentData => ({

      ...currentData,
      issues: updateArrayItemById(currentData.issues, issueId, updatedFields),
    }));
  };

  const updateLocalProjectConfig = (updatedFields) => {
    setLocalData(currentData => ({
      project: {
        ...currentData.project, ...updatedFields
      },
    }));
    updateProjectContext(currentData => ({

      ...currentData, ...updatedFields

    }));
  };

  const workspaceSideMenu = [
    {
      position: 0,
      title: 'Board',
      to: `/workspace/${id.id}/board`,
      icon: '/media/icons/duotune/general/gen009.svg',
    },
    {
      position: 0,
      title: 'Backlog',
      to: `/workspace/${id.id}/backlog`,
      icon: '/media/icons/duotune/abstract/abs015.svg',
    },
    {
      position: 0,
      title: 'Roadmap',
      to: `/workspace/${id.id}/roadmap`,
      icon: '/media/icons/duotune/maps/map003.svg',
    },
    {
      position: 0,
      title: 'List',
      to: `/workspace/${id.id}/List`,
      icon: '/media/icons/duotune/files/fil002.svg',
    },
    {
      position: 0,
      title: 'Settings',
      to: `/workspace/${id.id}/settings`,
      icon: '/media/icons/duotune/coding/cod001.svg',
    },

  ]

  return (
    <>
      {/*   <Header
          issueSearchModalOpen={issueSearchModalHelpers.open}
          issueCreateModalOpen={issueCreateModalHelpers.open}
        /> 
          <Sidebar project={project} />*/}
      {issueSearchModalHelpers.isOpen() && (
        <Modal
          isOpen
          testid="modal:issue-search"
          width={600}
          onClose={issueSearchModalHelpers.close}
          renderContent={() => <IssueSearch project={project} />}
        />
      )}

      {issueCreateModalHelpers.isOpen() && (
        <Modal
          isOpen
          testid="modal:issue-create"
          width={800}
          withCloseIcon={false}
          onClose={issueCreateModalHelpers.close}
          renderContent={modal => (
            <IssueCreate
              project={project}
              onCreate={() => history.push(`${match.url}/board`)}
              modalClose={modal.close}
            />
          )}
        />
      )}
      <Routes>
        <Route
          path="/board/*"
          element={
            <Board
              project={project}
              updateLocalProjectIssues={updateLocalProjectIssues}
              refreshData={refreshData}
            />
          }
        />
        <Route
          path="/board/issues/:issueId/*"
          element={
            <IssueDetailsPage
              project={project}
              updateLocalProjectIssues={updateLocalProjectIssues}
              refreshData={refreshData}
            />
          }
        />
        <Route
          path="/backlog/issues/:issueId/*"
          element={
            <IssueDetailsPage
              project={project}
              updateLocalProjectIssues={updateLocalProjectIssues}
              refreshData={refreshData}
            />
          }
        />
        <Route
          path="/list/issues/:issueId/*"
          element={
            <IssueDetailsPage
              project={project}
              updateLocalProjectIssues={updateLocalProjectIssues}
              refreshData={refreshData}
            />
          }
        />
        <Route
          path="/roadmap/issues/:issueId/*"
          element={
            <IssueDetailsPage
              project={project}
              updateLocalProjectIssues={updateLocalProjectIssues}
              refreshData={refreshData}
            />
          }
        />

        <Route
          path="/backlog/*"
          element={
            <Backlog
              project={project}
              updateLocalProjectIssues={updateLocalProjectIssues}
              refreshData={refreshData}
            />
          }
        />
        <Route
          path="/roadmap/*"
          element={
            <Roadmap
              project={project}
              updateLocalProjectIssues={updateLocalProjectIssues}
              refreshData={refreshData}
            />
          }
        />
        <Route
          path="/list/*"
          element={
            <List
              project={project}
              updateLocalProjectIssues={updateLocalProjectIssues}
              refreshData={refreshData}
            />
          }
        />

        <Route
          path="/settings"
          element={
            <ProjectSettings
              project={project}
              spaceId={id.id}
              updateLocalProjectConfig={updateLocalProjectConfig}
            />
          }
        />
      </Routes>
      {id['*'] === "" && <Navigate to={`${match.pathname}/board`} replace />}
      <PageTitle breadcrumbs={accountBreadCrumbs} pageSideMenu={workspaceSideMenu}>{[project.title]}</PageTitle>

    </>

  );
};

export default Project;
