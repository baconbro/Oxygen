import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useMergeState from '../hooks/mergeState';
import { useAuth } from '../modules/auth';

const WorkspaceContext = React.createContext();

export function useWorkspace() {
  return useContext(WorkspaceContext)
}

export function WorkspaceProvider({ children }) {
  const [cards, setCards] = useState([]);
  const [projectUsers, setProjectUsers] = useState([]);
  const [orgUsers, setOrgUsers] = useState([]);
  const [project, setProject] = useState();
  const [currentGoal, setCurrentGoal] = useState([]);
  const [highLevelWorkItems, setHighLevelWorkItems] = useState();
  const [workspaceConfig, setWorkspaceConfig] = useState();
  const [goals, setGoals] = useState([]);
  const location = useLocation();
  const { currentUser } = useAuth();

  const defaultFilters = {
    searchTerm: '',
    userIds: [],
    myOnly: false,
    recent: false,
    groupBy: 'None',
    viewType: [],
    viewStatus: [],
    hideOld: 30,
    sprint: '',
    wpkg : '',
  };

  const [filters, mergeFilters] = useMergeState(defaultFilters);

  // Load filters from URL when location changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlFilters = {};
    
    if (searchParams.has('search')) urlFilters.searchTerm = searchParams.get('search');
    if (searchParams.has('users')) urlFilters.userIds = searchParams.get('users').split(',');
    if (searchParams.has('recent')) urlFilters.recent = searchParams.get('recent') === 'true';
    if (searchParams.has('myOnly')) urlFilters.myOnly = searchParams.get('myOnly') === 'true';
    if (searchParams.has('types')) urlFilters.viewType = searchParams.get('types').split(',');
    if (searchParams.has('status')) urlFilters.viewStatus = searchParams.get('status').split(',');
    if (searchParams.has('hideOld')) urlFilters.hideOld = parseInt(searchParams.get('hideOld'));
    if (searchParams.has('sprint')) urlFilters.sprint = searchParams.get('sprint');
    if (searchParams.has('wpkg')) urlFilters.wpkg = searchParams.get('wpkg');
    
    if (Object.keys(urlFilters).length > 0) {
      mergeFilters(urlFilters);
    }
  }, [location.search]);



  const addCard = card => {
    setCards([...cards, card]);
  };

  const assignCard = (cardId, userId) => {
    const updatedCards = cards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          assignedTo: userId,
        };
      }
      return card;
    });
    setCards(updatedCards);
  };
  
  const updateProjectContext = project => {
    setProject(project);
    setWorkspaceConfig(project.config);
  };


  const contextValue = {
    cards,
    projectUsers,
    orgUsers,
    project,
    currentGoal,
    highLevelWorkItems,
    defaultFilters,
    filters,
    mergeFilters,
    workspaceConfig,
    goals,
    setHighLevelWorkItems,
    setCurrentGoal,
    updateProjectContext,
    setOrgUsers,
    addCard,
    assignCard,
    setProjectUsers,
    setWorkspaceConfig,
    setGoals,
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}
