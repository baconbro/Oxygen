export const templateSimpleTaskTracker =
{
    "issueStatus": [
        {
            "id": "1",
            "name": "To do"
        },
        {
            "id": "2",
            "name": "In progress"
        },
        {
            "id": "3",
            "name": "Done"
        }
    ],
    "issueType": {
        "0": {
            "color": "#00c982",
            "name": "Task",
            "icon": "check2-square",
            "id": "type1"
        },
        "1": {
            "color": "#4086f4",
            "name": "Note",
            "icon": "sticky",
            "id": "type2"
        },
        "2": {
            "color": "#f4c537",
            "name": "Reminder",
            "icon": "bell",
            "id": "type3"
        }
    },
    "board": {
        "rice": false,
        "doneColumn": "3",
        "columnHeaderBadge": "itemsnumber"
    }
}
