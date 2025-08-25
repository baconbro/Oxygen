import Filters from '../Board/Filters/filter';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import { useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import { useAuth } from '../../auth';
import { useUpdateItem } from '../../../services/itemServices';
import { useNavigate } from "react-router-dom";
import { filterIssues } from '../../../utils/issueFilterUtils';
import { useParams } from 'react-router-dom';
import { useGetSprints } from '../../../services/sprintServices';

const Calendar = () => {


  const { project, projectUsers, defaultFilters, filters, mergeFilters } = useWorkspace()
  const [items, setItems] = useState([])
  const { currentUser } = useAuth();
  const editItemMutation = useUpdateItem();
  const navigate = useNavigate();
  const params = useParams();
  const filterItems = filterIssues(items, filters, currentUser.all.id);
  const externalListRef = useRef(null);
  const draggableRef = useRef(null);

  // Load sprints for background highlighting
  const spaceId = project?.spaceId ?? params?.id;
  const orgId = currentUser?.all?.currentOrg;
  const { data: sprints } = useGetSprints(spaceId, orgId);

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

  // Issues without dates to show in the external list
  const unscheduledIssues = useMemo(() => {
    return (items || []).filter((issue) => !issue?.start && !issue?.dueDate);
  }, [items]);

  // Initialize FullCalendar Draggable for external issues list
  useEffect(() => {
    if (externalListRef.current) {
      // Destroy previous instance if any
      if (draggableRef.current) {
  try { draggableRef.current.destroy(); } catch (_) { }
      }
      draggableRef.current = new Draggable(externalListRef.current, {
        itemSelector: '.fc-draggable-issue',
        eventData: function (eventEl) {
          return {
            id: eventEl.getAttribute('data-id'),
            title: eventEl.getAttribute('data-title') || 'Issue',
            // For month/dayGrid, treat as all-day one-day event by default
            allDay: true,
          }
        }
      });
    }
    return () => {
      if (draggableRef.current) {
  try { draggableRef.current.destroy(); } catch (_) { }
        draggableRef.current = null;
      }
    }
  }, [externalListRef.current, unscheduledIssues.length]);

  const handleEventClick = (info) => {
    navigate(`issue/${info.event.id}`)
  }
  const handleEventDrop = async (info) => {
    const workspaceId = project?.spaceId ?? params?.id;
    const orgId = currentUser?.all?.currentOrg;
    const movedId = Number(info.event.id);
    if (!workspaceId || !orgId || Number.isNaN(movedId)) {
      console.warn('Missing identifiers for update', { workspaceId, orgId, movedId });
      try { info.revert && info.revert(); } catch (_) { }
      return;
    }
    try {
      // Convert start/end to ms for numeric fields; format dueDate as ISO string for UI components
      const startInMilliseconds = info.event.start.getTime();
      const endInMilliseconds = info.event.end ? info.event.end.getTime() : startInMilliseconds;

      const updatedFields = {
        start: startInMilliseconds,
        end: endInMilliseconds,
        dueDate: new Date(endInMilliseconds).toISOString(),
      }
      const data = {
        orgId,
        field: updatedFields,
        itemId: movedId,
        workspaceId,
      }

      await editItemMutationFunction(data);

      // Optimistically update local items so the event stays at the new position
      setItems((prev) => prev.map((it) => (
        Number(it.id) === movedId ? { ...it, ...updatedFields } : it
      )));
    } catch (e) {
      try { info.revert && info.revert(); } catch (_) { }
    }
  }

  // Persist changes when an event is resized (either end or start if resizableFromStart)
  const handleEventResize = async (info) => {
    try {
      const workspaceId = project?.spaceId ?? params?.id;
      const orgId = currentUser?.all?.currentOrg;
      const resizedId = Number(info.event.id);
      if (!workspaceId || !orgId || Number.isNaN(resizedId)) {
        console.warn('Missing identifiers for resize', { workspaceId, orgId, resizedId });
        try { info.revert && info.revert(); } catch (_) { }
        return;
      }
      const startInMilliseconds = info.event.start?.getTime?.();
      const endInMilliseconds = info.event.end ? info.event.end.getTime() : startInMilliseconds;

      const updatedFields = {
        start: startInMilliseconds,
        end: endInMilliseconds,
  dueDate: new Date(endInMilliseconds).toISOString(),
      };

      const data = {
        orgId,
        field: updatedFields,
        itemId: resizedId,
        workspaceId,
      }

      await editItemMutationFunction(data);

      // Optimistically update local items so the event reflects the resized duration
      setItems((prev) => prev.map((it) => (
        Number(it.id) === resizedId ? { ...it, ...updatedFields } : it
      )));
    } catch (_) {
      try { info.revert && info.revert(); } catch (_) { }
    }
  }

  // Handle external issue dropped onto the calendar for the first time
  const handleEventReceive = async (info) => {
    try {
      const workspaceId = project?.spaceId ?? params?.id;
      const orgId = currentUser?.all?.currentOrg;
      // info.event has id from the dragged element
      const issueId = Number(info.event.id);
      if (!workspaceId || !orgId || Number.isNaN(issueId)) {
        console.warn('Missing identifiers for receive', { workspaceId, orgId, issueId });
        try { info.revert && info.revert(); } catch (_) { }
        return;
      }
      const startInMilliseconds = info.event.start?.getTime?.() ?? Date.now();
      // All-day single day => set end equal to start for our data model
      const endInMilliseconds = startInMilliseconds;

      const updatedFields = {
        start: startInMilliseconds,
        end: endInMilliseconds,
  dueDate: new Date(endInMilliseconds).toISOString(),
      };

      const data = {
        orgId,
        field: updatedFields,
        itemId: issueId,
        workspaceId,
      };

      await editItemMutationFunction(data);

      // Optimistically update local items so the issue disappears from the sidebar
      setItems((prev) => prev.map((it) => (
        Number(it.id) === issueId ? { ...it, ...updatedFields } : it
      )));
    } catch (e) {
      // If something goes wrong, remove the added event to avoid desync
  try { info.revert && info.revert(); } catch (_) { }
    }
  }

  const editItemMutationFunction = (data) => {
    const mutateItem = editItemMutation(data);
    return data;
  };

  // Map filtered issues to FullCalendar event shape to ensure `end` is present (uses `end` or falls back to `dueDate`)
  const calendarEvents = useMemo(() => {
    return (filterItems || []).map((issue) => ({
      ...issue,
      end: issue?.end ?? issue?.dueDate ?? issue?.start, // ensure an end so resize handles show
      allDay: true, // render as all-day blocks in month view
    }));
  }, [filterItems]);

  // Map sprints to background events
  const sprintBackgroundEvents = useMemo(() => {
    const toMs = (v) => {
      if (!v && v !== 0) return undefined;
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        const d = new Date(v);
        return isNaN(d.getTime()) ? undefined : d.getTime();
      }
      if (v && typeof v.toDate === 'function') {
        // Firestore Timestamp
        return v.toDate().getTime();
      }
      return undefined;
    };
    return (sprints || [])
      .map((s) => {
        const startMs = toMs(s.start ?? s.startDate ?? s.start_at);
        const endMs = toMs(s.end ?? s.endDate ?? s.end_at ?? s.dueDate ?? s.finish_at);
        if (!startMs || !endMs) return null;
        return {
          id: `sprint_${s.id}`,
          title: s.title || s.name || 'Sprint',
          start: new Date(startMs),
          end: new Date(endMs),
          display: 'background',
          allDay: true,
          backgroundColor: 'rgba(13,110,253,0.08)', // subtle primary tint
          borderColor: 'rgba(13,110,253,0.24)',
          overlap: true,
        };
      })
      .filter(Boolean);
  }, [sprints]);

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

      <div className='card kanban'>
        <div className='card-body' style={{ padding: "1rem 1rem" }}>
          <div className="row g-4">
            <div className="col-12 col-lg-3">
              <div className="card h-100">
                <div className="card-header py-3">
                  <h6 className="mb-0">Unscheduled issues</h6>
                  <small className="text-muted">Drag onto calendar</small>
                </div>
                <div className="card-body" ref={externalListRef} style={{ maxHeight: 520, overflowY: 'auto' }}>
                  {unscheduledIssues.length === 0 && (
                    <div className="text-muted small">Nothing to schedule</div>
                  )}
                  {unscheduledIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="fc-draggable-issue border rounded p-2 mb-2 cursor-pointer bg-light"
                      data-id={issue.id}
                      data-title={issue.title}
                      title="Drag to calendar"
                    >
                      <div className="fw-semibold text-dark" style={{ fontSize: 14 }}>{issue.title}</div>
                      {issue.assigneeName && (
                        <div className="text-muted" style={{ fontSize: 12 }}>Assignee: {issue.assigneeName}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-9">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView='dayGridMonth'
                weekends={false}
                events={[...calendarEvents, ...sprintBackgroundEvents]}
                eventContent={renderEventContent}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth'
                }}
                eventClick={handleEventClick}
                selectable={true}
                editable={true}
                droppable={true}
                nowIndicator={true}
                now={moment().startOf('day').format('YYYY-MM-DD')}
                dayMaxEvents={true}
                eventDrop={handleEventDrop}
                eventReceive={handleEventReceive}
                eventResize={handleEventResize}
                eventDurationEditable={true}
                eventResizableFromStart={true}
                eventStartEditable={true}
                eventDisplay="block"
              />
            </div>
          </div>
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
