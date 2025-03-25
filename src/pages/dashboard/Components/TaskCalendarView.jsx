import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment';
import { Dropdown } from 'react-bootstrap';
import { IssuePriorityCopy, IssueStatusCopy } from '../../../constants/issues';

export const TaskCalendarView = ({ tasks, onTaskClick, emptyComponent: EmptyComponent }) => {
  const [calendarView, setCalendarView] = useState('dayGridMonth');
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      // Format tasks for the calendar
      const formattedEvents = tasks.map(task => {
        const priorityColor = getPriorityColor(task.priority);
        
        return {
          id: task.id,
          title: task.title,
          start: task.dueDate,
          backgroundColor: priorityColor,
          borderColor: priorityColor,
          textColor: '#FFFFFF',
          classNames: [`priority-${task.priority}`],
          extendedProps: {
            projectId: task.projectId,
            priority: task.priority,
            status: task.status,
            projectName: task.projectDetails?.name
          }
        };
      });
      
      console.log('Formatted events with colors:', formattedEvents);
      setEvents(formattedEvents);
    } else {
      setEvents([]);
    }
  }, [tasks]);
  
  function getPriorityColor(priority) {
    console.log('Getting color for priority:', priority);
    
    switch(priority) {
      case 'highest': return '#D63031'; // Red
      case 'high': return '#FF9F43'; // Orange
      case 'medium': return '#FDCB6E'; // Yellow
      case 'low': return '#00B894'; // Green
      case 'lowest': return '#74B9FF'; // Blue
      default: return '#A3A6B4'; // Gray
    }
  }
  
  // Add CSS overrides for priority colors
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .priority-highest { background-color: #D63031 !important; border-color: #D63031 !important; }
      .priority-high { background-color: #FF9F43 !important; border-color: #FF9F43 !important; }
      .priority-medium { background-color: #FDCB6E !important; border-color: #FDCB6E !important; }
      .priority-low { background-color: #00B894 !important; border-color: #00B894 !important; }
      .priority-lowest { background-color: #74B9FF !important; border-color: #74B9FF !important; }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  const handleEventClick = (info) => {
    onTaskClick(
      info.event.id, 
      info.event.extendedProps.projectId
    );
  };
  
  // Creates a custom tooltip for events - simplified to match the working calendar
  const renderEventContent = (eventInfo) => {
    return (
      <div className="fc-event-title-container">
        <div className="fc-event-title fc-sticky">{eventInfo.event.title}
          {eventInfo.event.extendedProps.projectName && (
            <small className="ms-1 text-white">
              ({eventInfo.event.extendedProps.projectName})
            </small>
          )}
        </div>
      </div>
    );
  };
  
  if (!tasks || tasks.length === 0) {
    return EmptyComponent ? <EmptyComponent /> : null;
  }
  
  return (
    <div>
      <div className="d-flex justify-content-end mb-4">
        <Dropdown className="me-2">
          <Dropdown.Toggle variant="light" size="sm" id="calendar-view-dropdown">
            {calendarView === 'dayGridMonth' && 'Month'}
            {calendarView === 'dayGridWeek' && 'Week'}
            {calendarView === 'dayGridDay' && 'Day'}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setCalendarView('dayGridMonth')}>Month</Dropdown.Item>
            <Dropdown.Item onClick={() => setCalendarView('dayGridWeek')}>Week</Dropdown.Item>
            <Dropdown.Item onClick={() => setCalendarView('dayGridDay')}>Day</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView={calendarView}
        weekends={true}
        events={events}
        eventContent={renderEventContent}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '', // We're using our custom dropdown for view switching
        }}
        eventClick={handleEventClick}
        selectable={true}
        editable={false}
        nowIndicator={true}
        now={moment().startOf('day').format('YYYY-MM-DD')}
        dayMaxEvents={true}
      />
      
      <div className="mt-4 d-flex flex-wrap gap-3">
        <div className="d-flex align-items-center me-3">
          <strong className="me-2">Priority Colors:</strong>
          {Object.keys(IssuePriorityCopy).map(priority => (
            <div key={priority} className="d-flex align-items-center me-3">
              <div 
                className="rounded-circle me-1" 
                style={{ width: '12px', height: '12px', backgroundColor: getPriorityColor(priority) }}
              ></div>
              <small>{IssuePriorityCopy[priority]}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
