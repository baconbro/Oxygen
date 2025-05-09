import Filters from '../Board/Filters/filter';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useEffect, useState } from 'react';
import moment from 'moment';
import { useAuth } from '../../auth';
import { useUpdateItem } from '../../../services/itemServices';
import { useNavigate } from "react-router-dom";
import { filterIssues } from '../../../utils/issueFilterUtils';

const Calendar = () => {


  const { project, projectUsers, defaultFilters, filters, mergeFilters } = useWorkspace()
  const [items, setItems] = useState([])
  const { currentUser } = useAuth();
  const editItemMutation = useUpdateItem();
  const navigate = useNavigate();
  const filterItems = filterIssues(items, filters, currentUser.all.id);

  // Process issues to use dueDate as start when start is missing
  const processIssuesForCalendar = (issues) => {
    return issues.map(issue => {
      // If issue has no start but has dueDate, use dueDate as start
      if (!issue.start && issue.dueDate) {
        return {
          ...issue,
          start: issue.dueDate
        };
      }
      return issue;
    });
  };

  useEffect(() => {
    if (project.issues) {
      const processedIssues = processIssuesForCalendar(project.issues);
      setItems(processedIssues);
    } else {
      setItems([]);
    }
  }, [project])

  const handleEventClick = (info) => {
    navigate(`issue/${info.event.id}`)
  }
  const handleEventDrop = async (info) => {

    // Convert start date to milliseconds since the Unix epoch
    const startInMilliseconds = info.event.start.getTime();
    const endInMilliseconds = info.event.end ? info.event.end.getTime() : startInMilliseconds;

    const updatedFields = {
      start: startInMilliseconds,
      end: endInMilliseconds,
      dueDate: endInMilliseconds, // Update dueDate to match the end date
    }
    const data = {
      orgId: currentUser?.all?.currentOrg,
      field: updatedFields,
      itemId: Number(info.event.id),
      workspaceId: project.spaceId,
    }

    const mutation = await editItemMutationFunction(data);
  }

  const editItemMutationFunction = (data) => {
    const mutateItem = editItemMutation(data);
    return data;
  };

  return (
    <>
      <div className="d-flex align-items-center py-2 py-md-1">
        <Filters
          projectUsers={projectUsers}
          defaultFilters={defaultFilters}
          filters={filters}
          mergeFilters={mergeFilters}
        />
      </div>

      <div className='card kanban' >
        <div className='card-body' style={{ padding: "1rem 1rem" }}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView='dayGridMonth'
            weekends={false}
            events={filterItems}
            eventContent={renderEventContent}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth'
            }}
            eventClick={handleEventClick}
            selectable={true}
            editable={true}
            nowIndicator={true}
            now={moment().startOf('day').format('YYYY-MM-DD')}
            dayMaxEvents={true}
            eventDrop={handleEventDrop}
          />
        </div>
      </div>
    </>
  );
};

// a custom render function
function renderEventContent(eventInfo) {
  return (
    <div className="fc-event-title-container">
      <div className="fc-event-title fc-sticky">{eventInfo.event.title}
      </div>
    </div>

  )
}

export default Calendar;
