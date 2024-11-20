import { useState, useEffect, useRef } from 'react';
import { Gantt, Task, ViewMode, OnRelationChange, DateExtremity, TitleColumn } from '@wamra/gantt-task-react';
import "gantt-task-react/dist/index.css";
import { getStartEndDateForProject } from "./Tasks";
import { ViewSwitcher } from "./view-switcher";
import { intersection } from 'lodash';
import moment from 'moment';
import { useNavigate } from "react-router-dom";
import EmptyTimeline from '../../../../components/common/emptyStates/emptyTimeline';
import "@wamra/gantt-task-react/dist/style.css";
import { useAuth } from '../../../auth';
import { useUpdateItem } from '../../../../services/itemServices';
import calculateIssueListPosition from '../../../../utils/calculateIssueListPosition';
import { filterIssues } from '../../../../utils/issueFilterUtils';




interface Project {
  org: string;
  issues: any[];
  spaceId: string;
  config: any;
}

interface Filters {
  searchTerm: string;
  userIds: number[];
  myOnly: boolean;
  recent: boolean;
  viewStatus: string[];
  viewType: string[];
}

const columns = [{
  Cell: TitleColumn,
  width: 410,
  title: "Name",
  id: "Name",
}];

const ProjectBoardLists = ({ project, filters, updateLocalProjectIssues }: { project: Project, filters: Filters, updateLocalProjectIssues: any }) => {
  const currentUserId = 8908;
  //order issues by listPosition
  project.issues.sort((a, b) => (a.listPosition > b.listPosition) ? 1 : -1);

  const filteredIssues = filterIssues(project.issues, filters, currentUserId).map((issue: any) => ({
    ...issue,
    id: issue.id.toString(), // Ensure id is a string for Gantt plugin
    parent: issue.parent ? issue.parent.toString() : null,
  }));
  const key = 'start';
  const keyy = 'end';
  const name = 'name';
  const progress = 'progress';
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1)
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const editItemMutation = useUpdateItem();
  const lastClickEvent = useRef<any>(null);

  const todoListDate = filteredIssues.map((item: any) => {
    return {
      ...item,
      ...{
        [key]: item[key] = item[key] ? new Date(item[key]) : new Date()
      },
      ...{
        [keyy]: item[keyy] = item[keyy] ? new Date(item[keyy]) : tomorrow
      },
      ...{
        [name]: item[name] = item.title
      }, ...{
        [progress]: item[progress] = item[progress] ? Number(item[progress]) : 0
      },
      // Ensure dependencies[x].sourceId is defined and convert to string
      dependencies: item.dependencies?.map((dep: any) => ({
        ...dep,
        sourceId: dep.sourceId?.toString() || ''
      })),
    }
  });
  const [view, setView] = useState(ViewMode.Day);
  const [tasks, setTasks] = useState(todoListDate);

  useEffect(() => {
    filteredIssuesUpdate();
  }, [filters]);

  const filteredIssuesUpdate = () => {
    if (Object.keys(filteredIssues).length > 0) {
      setTasks(filteredIssues)
    }
  }


  const [isChecked, setIsChecked] = useState(true);
  let columnWidth = 60;
  if (view === ViewMode.Year) {
    columnWidth = 350;
  } else if (view === ViewMode.Month) {
    columnWidth = 300;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
  }
  const handleTaskDelete = (task: any) => {
    const conf = window.confirm("Are you sure about " + task.name + " ?");
    if (conf) {
      setTasks(tasks.filter((t: any) => t.id !== task.id));
    }
    return conf;
  };

  const handleTaskChange = async (task: any) => { //on move task
    let newTasks = tasks.map((t: any) => (t.id === task.id ? task : t));
    if (task.project) {
      const [start, end] = getStartEndDateForProject(newTasks, task.project);
      const project = newTasks[newTasks.findIndex((t: any) => t.id === task.project)];
      if (
        project.start.getTime() !== start.getTime() ||
        project.end.getTime() !== end.getTime()
      ) {
        const changedProject = { ...project, start, end };
        newTasks = newTasks.map((t: any) =>
          t.id === task.project ? changedProject : t
        );

      }
    }
    const updatedFields = {
      start: task.start.getTime(),
      end: task.end.getTime(),
    }
    const data = {
      orgId: currentUser?.all?.currentOrg,
      field: updatedFields,
      itemId: task.id,
      workspaceId: project.spaceId,
    }
    const mutation = await editItemMutationFunction(data);
    setTasks(newTasks);
  };

  const handleProgressChange = async (task: any) => {
    const updatedFields = { progress: task.progress.toString() }
    const data = {
      orgId: currentUser?.all?.currentOrg,
      field: updatedFields,
      itemId: task.id,
      workspaceId: project.spaceId,
    }
    const mutation = await editItemMutationFunction(data);
    setTasks(tasks.map((t: any) => (t.id === task.id ? task : t)));

  };

  const handleDblClick = (task: any) => {
    navigate(`issues/${task.id}`)
  };

  const handleSelect = (task: any, isSelected: boolean) => {
    console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
  };

  const handleExpanderClick = (task: any) => {
    setTasks(tasks.map((t: any) => (t.id === task.id ? task : t)));
    console.log("On expander click Id:" + task.id);
  };

  const handleRelationChange: OnRelationChange = async (
    from: [Task, DateExtremity, number],
    to: [Task, DateExtremity, number]
  ) => {
    if (from[0].id !== to[0].id) {
      // Check if there is already a dependency with the same A and B
      const existingDependency = from[0].dependencies?.find((dep: any) => dep.A === from[0].id && dep.B === to[0].id);

      if (existingDependency) {
        return; // Exit if dependency already exists
      }

      const newDependency = {
        A: Number(from[0].id), // ID from
        B: Number(to[0].id), // ID to
        createdAt: new Date().getTime(),
        description: '',
        id: Math.floor(Math.random() * 100000000000),
        type: 'BLOCKS',
        sourceTarget: from[1], // DateExtremity of from
        ownTarget: to[1], // DateExtremity of to
        sourceId: to[0].id// for Gantt plugin only
      };

      // Add the new dependency to the existing dependencies
      const updatedFields = {
        dependencies: [...(from[0].dependencies || []), newDependency]
      };

      const data = {
        orgId: currentUser?.all?.currentOrg,
        field: updatedFields,
        itemId: Number(from[0].id),
        workspaceId: project.spaceId,
      }
      const mutation = await editItemMutationFunction(data);
      // Update the task with the new dependencies
      setTasks(tasks.map((t: any) => (t.id === from[0].id ? { ...from[0], dependencies: updatedFields.dependencies } : t)))
    }
  };
  const editItemMutationFunction = (data: any) => {
    const mutateItem = editItemMutation(data);
    return data;
  };

  const handleClick = (event: any) => {
    lastClickEvent.current = event;
  };
  const findTaskIndex = (taskId: string) => {
      return tasks.findIndex((task: any) => task.id === taskId);
    };

  const handleMoveTaskBefore = async (event: any) => {
    if (lastClickEvent.current) {
      if (lastClickEvent.current.status != event.status) {
        lastClickEvent.current = null; // Reset the last click event
        console.log('Cannot move task with multiple status, try filter a status first');
        return null; 
      }
      //find the index of the task in the tasks array
      const taskIndexDestination = findTaskIndex(lastClickEvent.current.id);
      const taskIndexSource = findTaskIndex(event.id);
      const updatedFields = {
        listPosition: calculateIssueListPosition(
          project.issues,
          {
            "droppableId": project.config.issueStatus.find((item: { id: any; name: any; }) => item.id === event.status)?.name,
            "index": taskIndexSource
          },
          {
            "droppableId": project.config.issueStatus.find((item: { id: any; name: any; }) => item.id === lastClickEvent.current.status)?.name,
            "index": taskIndexDestination
          },

          Number(lastClickEvent.current.id),
          project.config.issueStatus),
      }
      const data = {
        orgId: currentUser?.all?.currentOrg,
        field: updatedFields,
        itemId: Number(lastClickEvent.current.id),
        workspaceId: project.spaceId,
      }
      const mutateItem = await editItemMutationFunction(data);

      // Update the task with the new dependencies
      const updatedTasks = tasks.map((t: any) => t.id === lastClickEvent.current.id ? { ...t, listPosition: updatedFields.listPosition } : t
      );
      updatedTasks.sort((a: any, b: any) => a.listPosition - b.listPosition);
      setTasks(updatedTasks);
      lastClickEvent.current = null; // Reset the last click event
    } else {
      console.log('onMoveTask event:', event);
    }
  };

  const handleMoveTaskAfter = (task: any) => {
    if (lastClickEvent.current) {
      //find the task befor in the array of tasks
      const index = tasks.findIndex((t: any) => t.id === task.id);
      if (index > 0) {
        handleMoveTaskBefore(tasks[index - 1])
      }
      return null; 
    } else {
      console.log('onMoveTask event:', task);
    }
  };

  return (
    <div className="container mt-5">
      <ViewSwitcher
        onViewModeChange={(viewMode: ViewMode) => setView(viewMode)}
        onViewListChange={setIsChecked}
        isChecked={isChecked}
      />
      {(tasks && project.issues.length > 0) ? <><Gantt
        tasks={tasks}
        viewMode={view}
        columns={columns}
        onDateChange={handleTaskChange}
        onDelete={handleTaskDelete}
        onProgressChange={handleProgressChange}
        onDoubleClick={handleDblClick}
        onRelationChange={handleRelationChange}
        onMoveTaskBefore={handleMoveTaskBefore}
        onMoveTaskAfter={handleMoveTaskAfter}
        onClick={handleClick}
        onMoveTaskInside={(task => console.log("On move task inside Id:", task))}
        onArrowDoubleClick={(task => console.log("On arrow double click Id:", task))}
      /></> : <><EmptyTimeline /></>}

    </div>
  )
}

export default ProjectBoardLists;
