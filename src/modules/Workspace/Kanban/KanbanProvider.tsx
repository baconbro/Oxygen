import { KanbanBoardItem,kanbanItems } from './dummyData';
import React, {
  Dispatch,
  PropsWithChildren,
  createContext,
  useContext,
  useReducer
} from 'react';
import { ACTIONTYPE, kanbanReducer } from './KanbanReducer';

export type ConversationFilterType = 'all' | 'read' | 'unread';
interface KanbanProviderInterface {}

export interface KanbanState {
  openBoardDetailsOffcanvas: boolean;
  openAddListModal: boolean;
  boardLists: KanbanBoardItem[];
}

interface KanbanContextInterface extends KanbanState {
  kanbanDispatch: Dispatch<ACTIONTYPE>;
}

export const KanbanContext = createContext({} as KanbanContextInterface);

const useKanbanReducer = () => {
  const initState: KanbanState = {
    openBoardDetailsOffcanvas: false,
    openAddListModal: false,
    boardLists: kanbanItems
  };

  return useReducer(kanbanReducer, initState);
};

const KanbanProvider = ({
  children
}: PropsWithChildren<KanbanProviderInterface>) => {
  const [kanbanState, kanbanDispatch] = useKanbanReducer();

  return (
    <KanbanContext.Provider
      value={{
        ...kanbanState,
        kanbanDispatch
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanbanContext = () => useContext(KanbanContext);

export default KanbanProvider;
