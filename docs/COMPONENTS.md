# Oxygen Components Documentation

## Overview

Oxygen implements a component-based architecture using React. This document outlines the key components, their structure, and usage patterns.

## Component Organization

Components are organized in several ways:

1. **Module-based**: Components specific to a feature are located in `/src/modules/{module-name}`
2. **Common Components**: Reusable components are in `/src/components/common`
3. **Layout Components**: Layout-related components in various layout directories

## Key UI Components

### Issue Management Components

#### Issue Details (`/src/modules/IssueDetails/index.jsx`)

Displays and allows editing of an issue's details.

**Props:**
- `issue`: The issue data object
- `modalClose`: Function to close the modal
- `projectUsers`: Array of users in the project

**Example Usage:**
```jsx
<ProjectBoardIssueDetails 
  issue={selectedIssue}
  modalClose={() => setIsModalOpen(false)}
  projectUsers={workspace.users}
/>
```

**Key Subcomponents:**
- `Title`: Issue title editor
- `Description`: Rich text description editor
- `Status`: Status selector
- `Priority`: Priority selector
- `Checklist`: Task checklist management
- `SubsComponent`: Sub-issues management
- `TaskDependencies`: Issue dependencies manager

#### Board View (`/src/modules/Workspace/Board/Lists/dnd/board/item.jsx`)

Kanban board item component used in the board view.

**Props:**
- `item`: The issue data object
- `parentIssue`: Optional parent issue (for sub-issues)

**Features:**
- Drag and drop support
- Progress indicator
- Tags display
- Due date information
- Work package information

### Goal Management Components

#### Goal Details (`/src/modules/Goals/GoalDetails.jsx`)

Displays and allows editing of goal/OKR details.

**Props:**
- `issue`: The goal data object
- `updateIssue`: Function to update the goal

**Key Features:**
- Tab-based interface
- Description editing
- Progress tracking
- Date management

### Navigation Components

#### Sidebar (`/src/modules/Org/Sidebar.jsx` and `/src/modules/home/Sidebar/index.jsx`)

Navigation sidebar components for different sections of the application.

**Features:**
- Collapsible menu
- Icon and text display
- Active state indication

## Form Components

Oxygen uses custom form components for consistent UI and validation:

- `Form`: Base form component with validation support
- `Select`: Enhanced select dropdown
- `Dropdown`: Custom dropdown component
- `TextEditor`: Rich text editor for descriptions
- `DateSelector`: Date selection component

## UI Patterns

### Modal Pattern

```jsx
<div className="modal-dialog modal-dialog-centered">
  <div className="modal-content">
    <div className="modal-header">
      <h2 className="fw-bolder">Title</h2>
      <button className="btn-close"></button>
    </div>
    <div className="modal-body">
      {/* Content */}
    </div>
    <div className="modal-footer">
      {/* Actions */}
    </div>
  </div>
</div>
```

### Card Pattern

```jsx
<div className="card">
  <div className="card-header">
    <div className="card-title">
      {/* Title */}
    </div>
    <div className="card-toolbar">
      {/* Actions */}
    </div>
  </div>
  <div className="card-body">
    {/* Content */}
  </div>
  <div className="card-footer">
    {/* Footer */}
  </div>
</div>
```

### Progress Indicator Pattern

```jsx
<div className="progress h-6px w-100 bg-light-success">
  <div
    className="progress-bar bg-primary"
    role="progressbar"
    style={{ width: `${progress}%` }}
    aria-valuenow={progress}
    aria-valuemin="0"
    aria-valuemax="100"
  ></div>
</div>
<span className="text-gray-500 fw-semibold">
  {progress}%
</span>
```

## Status and Badge Components

### Status Component

Used to display status with appropriate styling:

```jsx
<Status className={`btn btn-${statusClass}`} color={status}>
  {statusText}
</Status>
```

### Badge Component

For displaying metadata like tags, counts, etc.:

```jsx
<div className="badge badge-light me-2">
  <i className="bi bi-tags me-2"></i>
  {tagName}
</div>
```

## Table Components

For displaying tabular data with sorting, filtering, and pagination:

```jsx
<table className="table align-middle table-row-dashed fs-6 gy-5">
  <thead>
    <tr className="text-start text-muted fw-bolder fs-7 text-uppercase gs-0">
      <th>Column 1</th>
      <th>Column 2</th>
    </tr>
  </thead>
  <tbody>
    {data.map(item => (
      <tr key={item.id}>
        <td>{item.field1}</td>
        <td>{item.field2}</td>
      </tr>
    ))}
  </tbody>
</table>
```

## Best Practices

1. **Component Composition**: Break down complex components into smaller, reusable parts
2. **Prop Validation**: Use PropTypes for component prop validation
3. **Controlled Components**: Prefer controlled components for form elements
4. **State Management**: Use appropriate state management based on component needs
5. **Performance**: Implement performance optimizations like memoization for expensive components
6. **Accessibility**: Ensure components meet accessibility standards
7. **Responsive Design**: Make components responsive to different screen sizes
