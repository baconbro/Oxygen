
export interface KanbanBoardTask {
  id: string;
  status: {
    label: string;
    icon: string;
    color: string;
  };
  title: string;
  desctiption?: string;
  priority: 'High' | 'Low' | 'Medium';
  coverImage?: string;
  completedTasks?: number[];
  attachments?: number;
  date?: Date | string;
  members?: any[];
  listPosition?: number;
  progress?: number;
  tags?: string[];
  dueDate?: Date | string;
  storypoint?: number;
  tsize?: string;
  type?: number;

}

export interface KanbanBoard {
  id: number;
  title: string;
  category: string;
  coverImage?: string;
  totalTasks: number;
  comments: number;
  deadlines: number;
  users: any[];
}

export interface KanbanBoardItem {
  id: string;
  title: string;
  borderColor: string;
  isCollapsed?: boolean;
  tasks: KanbanBoardTask[];
}



export const kanbanItems: KanbanBoardItem[] =  [
  {
  id: '1',
  title: 'Backlog',
  borderColor: '#ff5733',
  isCollapsed: false,
  tasks: [
    {
      id: '1',
      status: {
        label: 'Task',
        icon: 'faTasks',
        color: 'info'
      },
      title: 'Plan the project roadmap for Q3',
      priority: 'High'
    },
    {
      id: '2',
      status: {
        label: 'Enhancement',
        icon: 'faPlusCircle',
        color: 'success'
      },
      title: 'Improve the user interface for the dashboard',
      priority: 'Medium'
    },
    {
      id: '3',
      status: {
        label: 'Research',
        icon: 'faSearch',
        color: 'primary'
      },
      title: 'Conduct market analysis for the new product line',
      priority: 'Low'
    }
  ]
},
{
  id: '2',
  title: 'In Progress',
  borderColor: '#33c1ff',
  tasks: [
    {
      id: '4',
      status: {
        label: 'Bug',
        icon: 'faBug',
        color: 'danger'
      },
      title: 'Fix login issues on the mobile app',
      coverImage: 'kanban2',
      attachments: 10,
      members: [],
      priority: 'High'
    },
    {
      id: '5',
      status: {
        label: 'Task',
        icon: 'faTasks',
        color: 'info'
      },
      title: 'Write documentation for the API',
      date: 'Feb 10',
      members: [],
      priority: 'Medium'
    }
  ]
},
{
  id: '3',
  title: 'Testing',
  borderColor: '#ff33a1',
  tasks: [
    {
      id: '6',
      status: {
        label: 'Bug',
        icon: 'faBug',
        color: 'danger'
      },
      title: 'Test the new payment gateway integration',
      date: 'Feb 15',
      members: [],
      priority: 'High'
    },
    {
      id: '7',
      status: {
        label: 'Task',
        icon: 'faTasks',
        color: 'info'
      },
      title: 'Review code for the new feature branch',
      completedTasks: [10, 2],
      members: [],
      priority: 'Medium'
    },
    {
      id: '8',
      status: {
        label: 'Enhancement',
        icon: 'faPlusCircle',
        color: 'success'
      },
      title: 'Optimize database queries for performance',
      date: 'Mar 1',
      attachments: 5,
      priority: 'Low'
    },
    {
      id: '9',
      status: {
        label: 'Research',
        icon: 'faSearch',
        color: 'primary'
      },
      title: 'Analyze user feedback from the beta release',
      date: 'Mar 5',
      attachments: 8,
      coverImage: 'graph',
      priority: 'Medium'
    }
  ]
},
{
  id: '4',
  title: 'Review',
  borderColor: '#33ff57',
  tasks: [
    {
      id: '10',
      status: {
        label: 'Task',
        icon: 'faTasks',
        color: 'info'
      },
      title: 'Review the design mockups for the new feature',
      attachments: 12,
      members: [],
      priority: 'High'
    },
    {
      id: '11',
      status: {
        label: 'Enhancement',
        icon: 'faPlusCircle',
        color: 'success'
      },
      title: 'Update the user guide with the latest changes',
      completedTasks: [15, 10],
      members: [],
      priority: 'Medium'
    },
    {
      id: '12',
      status: {
        label: 'Research',
        icon: 'faSearch',
        color: 'primary'
      },
      title: 'Evaluate new technologies for the upcoming project',
      attachments: 7,
      priority: 'Low'
    },
    {
      id: '13',
      status: {
        label: 'Task',
        icon: 'faTasks',
        color: 'info'
      },
      title: 'Prepare the release notes for the next version',
      attachments: 10,
      coverImage: 'notes',
      priority: 'Medium'
    }
  ]
},
{
  id: '5',
  title: 'Done',
  borderColor: '#8e44ad',
  tasks: [
    {
      id: '14',
      status: {
        label: 'Task',
        icon: 'faTasks',
        color: 'info'
      },
      title: 'Deploy the new version to production',
      attachments: 5,
      members: [],
      priority: 'High'
    },
    {
      id: '15',
      status: {
        label: 'Bug',
        icon: 'faBug',
        color: 'danger'
      },
      title: 'Resolve the issue with the email notifications',
      attachments: 3,
      coverImage: 'email',
      members: [],
      priority: 'Medium'
    },
    {
      id: '16',
      status: {
        label: 'Enhancement',
        icon: 'faPlusCircle',
        color: 'success'
      },
      title: 'Add new features to the admin dashboard',
      attachments: 8,
      members: [],
      priority: 'Low'
    }
  ]
}
];




export const kanbanActivities = [
  {
    id: '1',
    task: '<span class="fw-bold"> John Doe </span> Moved the task <a href="#!">"Implement new feature" </a>from <span class="fw-bold">In Progress</span> to <span class="fw-bold">Review</span>',
    time: '09:30 AM',
    date: 'September 15, 2022',
    icon: 'faArrowRight',
    iconColor: 'success'
  },
  {
    id: '2',
    task: '<span class="fw-bold"> Jane Smith </span> Attached design_mockup.png to the task <a href="#!">"Update UI" </a>',
    time: '11:15 AM',
    date: 'September 15, 2022',
    icon: 'faPaperclip',
    iconColor: 'primary'
  },
  {
    id: '3',
    task: '<span class="fw-bold"> Michael Brown </span> Moved the task <a href="#!">"Fix login bug" </a>from <span class="fw-bold">To Do</span> to <span class="fw-bold">In Progress</span>',
    time: '02:45 PM',
    date: 'September 15, 2022',
    icon: 'faArrowRight',
    iconColor: 'warning'
  },
  {
    id: '4',
    task: '<span class="fw-bold"> Emily Davis </span> Commented on the task <a href="#!">"Improve performance" </a>',
    time: '04:20 PM',
    date: 'September 15, 2022',
    icon: 'faComment',
    iconColor: 'info'
  }
];
//here is the data for the roadmap format for the roadmap component with GANTT package
export const roadmapData = [
  {
      "id": 990855132102,
      "status": "1",
      "description": "<p>when on a view like, a kanban, and you filter, you can save this view as a custom view in your right bar to share it with team or anyone with access</p>",
      "updatedAt": 1710721926512,
      "createdAt": 1710721851069,
      "users": [],
      "title": "add custom view",
      "userIds": [],
      "listPosition": 54,
      "reporterId": 8908,
      "priority": "",
      "projectId": "Gy1ATjeQZRIbzjPJbslD",
      "type": "type3",
      "start": "2024-10-31T02:20:21.351Z",
      "end": "2024-11-01T02:20:21.351Z",
      "name": "add custom view",
      "progress": 0,
      "dependencies": [{
        "sourceId": 863826408529, // equal B in dependencies collection
        "sourceTarget": "endOfTask",
        "ownTarget": "startOfTask"
      }],
  },
  {
      "id": 863826408529,
      "rice": 40,
      "type": "task",
      "dueDate": "2023-06-08T04:00:00Z",
      "title": "Add board name somewhere when in a board",
      "userIds": [],
      "createdAt": 1680466294748,
      "effort": 2,
      "users": [],
      "reporterId": "0x2Xe5ColheHJ8qTa05RktB4B8o2",
      "description": "",
      "start": "2023-06-24T07:33:22.814Z",
      "status": "done",
      "listPosition": -18,
      "reach": 8,
      "impact": 1,
      "confidence": 10,
      "projectId": "Gy1ATjeQZRIbzjPJbslD",
      "priority": "",
      "progress": 43,
      "updatedAt": 1711069367100,
      "end": "2023-06-26T02:18:22.814Z",
      "name": "Add board name somewhere when in a board"
  },
  {
      "id": 990855132169,
      "users": [],
      "reporterId": "0x2Xe5ColheHJ8qTa05RktB4B8o2",
      "type": "type4",
      "comments": [
          {
              "createdAt": 1728824112090,
              "body": "Pensez a comment le faire, pour el moment aucune idee",
              "issueId": 990855132169,
              "id": 660701729465,
              "user": {
                  "email": "bob@mesetudes.ca",
                  "name": "boby",
                  "avatarUrl": "",
                   }
          }
      ],
      "updatedAt": 1728838580187,
      "listPosition": -26.2509765625,
      "title": "Documentation de Oxygen",
      "tags": [
          {
              "value": "1.1"
          }
      ],
      "userIds": [],
      "createdAt": 1728824048564,
      "description": "<p>Documentation de l'open source sur github</p>",
      "projectId": "Gy1ATjeQZRIbzjPJbslD",
      "status": "3",
      "priority": "",
      "start": "2024-10-31T02:20:21.351Z",
      "end": "2024-11-01T02:20:21.351Z",
      "name": "Documentation de Oxygen",
      "progress": 0
  },
  {
      "id": 990855132086,
      "users": [],
      "description": "<p>when the appFramework is selected, then send config value to the create project value</p>",
      "reporterId": 0,
      "priority": "",
      "type": "Type1",
      "projectId": "Gy1ATjeQZRIbzjPJbslD",
      "listPosition": 0,
      "progress": 30,
      "updatedAt": 1708914154307,
      "createdAt": 1697933395227,
      "title": "Template : Software developement",
      "userIds": [],
      "parent": 990855132081,
      "status": "done",
      "start": "2024-10-31T02:20:21.351Z",
      "end": "2024-11-01T02:20:21.351Z",
      "name": "Template : Software developement"
  },
  {
      "id": 721073571653,
      "projectId": "Gy1ATjeQZRIbzjPJbslD",
      "type": "bug",
      "priority": "",
      "reporterId": 8908,
      "users": [],
      "userIds": [],
      "listPosition": -2,
      "title": "Loading error at sign in - Nothing on dashboard",
      "status": "done",
      "createdAt": 1680537011050,
      "updatedAt": 1680576024939,
      "description": "",
      "start": "2024-10-31T02:20:21.351Z",
      "end": "2024-11-01T02:20:21.351Z",
      "name": "Loading error at sign in - Nothing on dashboard",
      "progress": 0
  },
  {
      "id": 990855132060,
      "createdAt": 1689164497372,
      "listPosition": 50,
      "users": [],
      "priority": "",
      "projectId": "Gy1ATjeQZRIbzjPJbslD",
      "status": "done",
      "userIds": [],
      "description": "",
      "updatedAt": 1689543742909,
      "reporterId": 0,
      "title": "filter",
      "parent": 990855132042,
      "type": "task",
      "start": "2024-10-31T02:20:21.351Z",
      "end": "2024-11-01T02:20:21.351Z",
      "name": "filter",
      "progress": 0
  },
  {
      "id": 990855132100,
      "reporterId": 8908,
      "createdAt": 1710346012826,
      "title": "Shared tags ( list ) and custom color for tags",
      "userIds": [],
      "tags": [
          {
              "value": "Tags"
          }
      ],
      "listPosition": 52,
      "description": "",
      "status": "1",
      "priority": "",
      "users": [],
      "updatedAt": 1710346023530,
      "projectId": "Gy1ATjeQZRIbzjPJbslD",
      "type": "type3",
      "start": "2024-10-31T02:20:21.351Z",
      "end": "2024-11-01T02:20:21.351Z",
      "name": "Shared tags ( list ) and custom color for tags",
      "progress": 0
  },
  {
      "id": 58410170387,
      "priority": "",
      "reporterId": 8908,
      "updatedAt": 1711069274211,
      "userIds": [],
      "users": [],
      "projectId": "Gy1ATjeQZRIbzjPJbslD",
      "status": "1",
      "description": "",
      "type": "type5",
      "createdAt": 1680963754336,
      "title": "Burndown charts",
      "listPosition": 41,
      "tags": [
          {
              "value": "reporting"
          }
      ],
      "start": "2024-10-31T02:20:21.351Z",
      "end": "2024-11-01T02:20:21.351Z",
      "name": "Burndown charts",
      "progress": 0
  },
  {
      "id": 990855132081,
      "end": "2024-01-25T18:42:30.908Z",
      "projectId": "Gy1ATjeQZRIbzjPJbslD",
      "start": "2024-01-22T03:52:30.909Z",
      "reporterId": "0x2Xe5ColheHJ8qTa05RktB4B8o2",
      "type": "epic",
      "priority": "",
      "title": "Template for home categories",
      "listPosition": -27,
      "userIds": [],
      "description": "",
      "status": "done",
      "users": [],
      "createdAt": 1697244519016,
      "updatedAt": 1709259168624,
      "name": "Template for home categories",
      "progress": 0
  },
  {
      "id": 990855132115,
      "updatedAt": 1722255475984,
      "reporterId": 0,
      "projectId": "Gy1ATjeQZRIbzjPJbslD",
      "users": [
          {
              "avatarUrl": "",
                 "email": "bob@mesetudes.ca",
              "role": "owner",
              "id": "0x2Xe5ColheHJ8qTa05RktB4B8o2",
              "name": "Bob"
          }
      ],
      "title": "Add redux for state management ",
      "tags": [
          {
              "value": "Architecture"
          }
      ],
      "parent": 990855132096,
      "type": "type4",
      "description": "",
      "userIds": [
          "0x2Xe5ColheHJ8qTa05RktB4B8o2"
      ],
      "priority": "4",
      "createdAt": 1712523098093,
      "listPosition": -40,
      "progress": 50,
      "status": "done",
      "start": "2024-10-31T02:20:21.351Z",
      "end": "2024-11-01T02:20:21.351Z",
      "name": "Add redux for state management "
  },
/* {
  id: 'task-2',
  name: 'Develop Login Feature',
  type: 'task',
  start: '2024-11-11',
  end: '2024-11-20',
  progress: 30,
  assignees: ['Michael Brown'],
  dependencies: ['task-1'],
  styles: {
    backgroundColor: '#e0e0e0',
    progressColor: '#ff9800'
  }
} */
];

//here the data for the dependencies collection
export const dependencies = [{
"A":990855132179,
"B":990855132159,
"createdAt":1730382946997,
"description":"",
"id":91821613769,
"type":"BLOCKS",
"sourceTarget": "endOfTask", // by default
"ownTarget": "startOfTask" // by default
},
{
  "A":9090908,
  "B":990855132159,
  "createdAt":1730382946997,
  "description":"",
  "id":91821613769,
  "type":"BLOCKS",
  "sourceTarget": "endOfTask", // by default
  "ownTarget": "startOfTask" // by default
  }]


