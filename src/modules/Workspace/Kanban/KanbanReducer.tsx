import { KanbanBoardItem } from './dummyData';
import { KanbanState } from './KanbanProvider';
import { DraggableLocation} from 'react-beautiful-dnd';
import { cloneDeep } from 'lodash';


//Action types
export const TOGGLE_DETAILS_OFFCANVAS = 'TOGGLE_DETAILS_OFFCANVAS';
export const TOGGLE_ADD_LIST_MODAL = 'TOGGLE_ADD_LIST_MODAL';
export const REMOVE_ITEM_FROM_LIST = 'REMOVE_ITEM_FROM_LIST';
export const MOVE_ITEMS = 'MOVE_ITEMS';
export const ADD_NEW_LIST = 'ADD_NEW_LIST';

//Action ts type
export type ACTIONTYPE =
  | {
      type: typeof TOGGLE_DETAILS_OFFCANVAS;
      payload?: boolean;
    }
  | {
      type: typeof TOGGLE_ADD_LIST_MODAL;
      payload?: boolean;
    }
  | {
      type: typeof REMOVE_ITEM_FROM_LIST;
      payload: { listId: string; itemIndex: number };
    }
  | {
      type: typeof MOVE_ITEMS;
      payload: { destination: DraggableLocation; source: DraggableLocation };
    }
  | {
      type: typeof ADD_NEW_LIST;
      payload: { list: KanbanBoardItem; columnNo: number };
    };

// Reducer function
export const kanbanReducer = (state: KanbanState, action: ACTIONTYPE) => {
  switch (action.type) {
    case TOGGLE_DETAILS_OFFCANVAS: {
      const { payload } = action;
      return {
        ...state,
        openBoardDetailsOffcanvas:
          payload !== undefined ? payload : !state.openBoardDetailsOffcanvas
      };
    }
    case TOGGLE_ADD_LIST_MODAL: {
      const { payload } = action;
      return {
        ...state,
        openAddListModal:
          payload !== undefined ? payload : !state.openBoardDetailsOffcanvas
      };
    }
    case REMOVE_ITEM_FROM_LIST: {
      const { payload } = action;
      return {
        ...state,
        boardLists: state.boardLists.map(list =>
          list.id === payload.listId
            ? {
                ...list,
                tasks: list.tasks.filter(
                  (task, index) => index !== payload.itemIndex
                )
              }
            : list
        )
      };
    }
    case MOVE_ITEMS: {
      const {
        payload: { destination, source }
      } = action;
      const updatedList = cloneDeep(state.boardLists);

      const task = updatedList
        .find(list => list.id === source.droppableId)
        ?.tasks.splice(source.index, 1)[0];

      if (task && destination) {
        updatedList
          .find(list => list.id === destination.droppableId)
          ?.tasks.splice(destination.index, 0, task);
      }

      return {
        ...state,
        boardLists: updatedList
      };
    }
    case ADD_NEW_LIST: {
      const {
        payload: { list, columnNo }
      } = action;

      const updatedList = [...state.boardLists];
      updatedList.splice(columnNo - 1, 1, list);

      return {
        ...state,
        boardLists: updatedList,
        openAddListModal: false
      };
    }

    default:
      return state;
  }
};
