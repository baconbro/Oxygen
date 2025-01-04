 export const groupTasksByParent = (tasks) => {
    const topLevelTasks = [];
    const taskMap = new Map();
  
    // Group tasks by their parent IDs
    tasks.forEach((task) => {
      task.subRows = []; // Initialize subRows for each task
  
      if (!task.parent) {
        topLevelTasks.push(task);
      } else {
        if (!taskMap.has(task.parent)) {
          // If parent task is not in taskMap, create a placeholder object
          // with only the subRows property to hold the child tasks until the parent is found
          taskMap.set(task.parent, { subRows: [] });
        }
        taskMap.get(task.parent).subRows.push(task);
      }
    });
  
    // Recursive function to assign subRows to their parent tasks
    const assignSubRows = (task) => {
      if (taskMap.has(task.id)) {
        task.subRows = taskMap.get(task.id).subRows;
        taskMap.delete(task.id); // Remove the task from the taskMap to avoid unnecessary recursion
        task.subRows.forEach(assignSubRows); // Recursively assign subRows for the current task's children
      }
    };
  
    // Assign subRows to topLevelTasks
    topLevelTasks.forEach(assignSubRows);
  
    // If there are any remaining tasks in taskMap, they are top-level tasks without a parent
    const remainingTasks = Array.from(taskMap.values());
    topLevelTasks.push(...remainingTasks);
    return topLevelTasks;
  };