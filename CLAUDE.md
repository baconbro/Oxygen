# CLAUDE.md - AI Assistant Guide for Oxygen

## Project Overview

Oxygen is an open-source work management platform and Jira alternative built with React and Firebase. It provides issue tracking, agile boards (Scrum/Kanban), project planning with epics and stories, sprint management, OKR/goals tracking, and work package management.

**Live Demo:** https://oxgn.io

## Technology Stack

- **Frontend:** React 18, TypeScript (mixed with JavaScript)
- **State Management:** React Query, React Context, Redux Toolkit
- **Backend:** Firebase (Firestore, Authentication, Hosting)
- **Styling:** SCSS with Bootstrap 5, CSS variables for theming
- **Build Tool:** Create React App (react-scripts)
- **UI Libraries:** React Bootstrap, FullCalendar, Gantt charts, Quill editor, React Beautiful DnD

## Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Format code with Prettier
npm run format

# Check formatting
npm run lint

# Start Firebase emulators (for local development)
firebase emulators:start

# Deploy to Firebase
firebase deploy --only hosting
```

## Project Structure

```
/home/user/Oxygen/
├── src/
│   ├── App.tsx              # Root app component with providers
│   ├── index.tsx            # Entry point
│   ├── components/          # Shared/reusable components
│   │   ├── common/          # Generic UI components (Avatar, Button, Modal, Form, etc.)
│   │   ├── partials/        # Partial components
│   │   └── ErrorBoundary.jsx
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.jsx  # Authentication context
│   │   └── WorkspaceProvider.jsx  # Workspace state context
│   ├── hooks/               # Custom React hooks
│   │   ├── api/             # API-related hooks
│   │   └── *.js             # Utility hooks
│   ├── i18n/                # Internationalization
│   ├── layout/              # Layout components (MasterLayout, sidebars)
│   ├── modules/             # Feature modules (main business logic)
│   │   ├── auth/            # Authentication (login, register)
│   │   ├── admin/           # Admin panel
│   │   ├── Goals/           # OKR/Goals management
│   │   ├── home/            # Dashboard home
│   │   ├── IssueDetails/    # Issue viewing/editing (23 subcomponents)
│   │   ├── Org/             # Organization management
│   │   ├── Workspace/       # Project/workspace features (board, backlog, sprints)
│   │   ├── User/            # User profile management
│   │   ├── accounts/        # Account settings
│   │   ├── onboarding/      # New user onboarding
│   │   └── errors/          # Error pages
│   ├── pages/               # Page-level components
│   ├── redux/               # Redux store configuration
│   ├── routing/             # React Router configuration
│   │   ├── AppRoutes.tsx    # Public routes
│   │   └── PrivateRoutes.tsx # Authenticated routes
│   ├── services/            # Firebase/API service layer
│   │   ├── firestore.js     # Core Firebase operations
│   │   ├── itemServices.js  # Issue/task CRUD
│   │   ├── sprintServices.js # Sprint management
│   │   ├── okrServices.js   # OKR/Goals services
│   │   ├── workspaceServices.js # Workspace CRUD
│   │   ├── workPackageServices.js # Work packages
│   │   └── userServices.js  # User management
│   ├── styles/              # SCSS styles
│   │   ├── core/            # Core styling (variables, mixins, components)
│   │   └── layout/          # Layout-specific styles
│   └── utils/               # Utility functions
├── public/                  # Static assets
├── docs/                    # Documentation
└── package.json
```

## Key Modules

### IssueDetails (`/src/modules/IssueDetails/`)
The most complex module with 23+ subcomponents for viewing/editing issues:
- Title, Description, Status, Priority selectors
- Checklist management
- Sub-issues (SubsComponent)
- Task dependencies
- Comments, attachments

### Workspace (`/src/modules/Workspace/`)
Project workspace with multiple views:
- Board (Kanban with drag-and-drop)
- Backlog
- Sprints
- Timeline/Gantt
- Calendar
- List view

### Goals (`/src/modules/Goals/`)
OKR and objectives tracking with progress measurement.

## Firebase/Firestore Data Model

```
organisation/
└── {orgId}/
    └── spaces/
        └── {spaceId}/
            ├── config (issueStatus, issueType, workspaceConfig)
            ├── items/ (issues/tasks)
            ├── sprints/
            │   └── tickets/ (sprint-task associations)
            ├── workpackages/
            ├── goals/
            ├── userviews/
            └── issueHistory/

users/
└── {uid}/ (user profiles)
```

## Code Conventions

### File Naming
- React components: PascalCase (e.g., `IssueDetails.jsx`, `WorkspaceProvider.jsx`)
- Services: camelCase with "Services" suffix (e.g., `itemServices.js`)
- Hooks: camelCase with "use" prefix (e.g., `useQueryString.js`)
- Styles: underscore prefix for partials (e.g., `_variables.scss`)

### Component Patterns

**Functional Components with Hooks:**
```jsx
import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceProvider';
import { useGetItems } from '../services/itemServices';

const MyComponent = ({ prop1, prop2 }) => {
  const { project, filters } = useWorkspace();
  const { data, isLoading } = useGetItems(workspaceId, orgId);

  // Component logic
  return <div>...</div>;
};
```

### State Management Patterns

**1. React Query for Server State:**
```jsx
import { useQuery, useMutation, useQueryClient } from 'react-query';

// Fetching
const { data, isLoading, error } = useQuery(
  ['items', workspaceId],
  () => getItems(workspaceId, orgId)
);

// Mutating with cache invalidation
const queryClient = useQueryClient();
const mutation = useMutation(updateItem, {
  onSuccess: () => queryClient.invalidateQueries(['items', workspaceId])
});
```

**2. WorkspaceContext for Workspace State:**
```jsx
import { useWorkspace } from '../contexts/WorkspaceProvider';

const { project, filters, mergeFilters, workspaceConfig } = useWorkspace();
```

**3. AuthContext for Authentication:**
```jsx
import { useAuth } from '../modules/auth';

const { currentUser, logout } = useAuth();
```

### Service Layer Pattern

Services in `/src/services/` follow this structure:
1. Core Firebase functions (direct Firestore operations)
2. React Query hooks (wrapped for data fetching/mutations)
3. Always use services instead of direct Firebase calls in components

```jsx
// In services/itemServices.js
export const getItems = async (workspaceId, orgId) => {
  // Firestore query
};

export const useGetItems = (workspaceId, orgId) => {
  return useQuery(['items', workspaceId], () => getItems(workspaceId, orgId));
};
```

### Styling Conventions

**CSS Variables for Theming:**
```scss
// Use CSS variables for theme-aware colors
.my-component {
  background-color: var(--xgn-card-bg);
  color: var(--xgn-text-color);
  border-color: var(--xgn-border-color);
}
```

**Bootstrap Classes:**
```jsx
// Use Bootstrap utility classes
<div className="card p-4 mb-3">
  <div className="d-flex align-items-center justify-content-between">
    <span className="fw-bold fs-6 text-gray-800">Title</span>
  </div>
</div>
```

**Theme Mode Support:**
```scss
@include theme-light() {
  // Light theme styles
}

@include theme-dark() {
  // Dark theme styles
}
```

## Common UI Patterns

### Modal Pattern
```jsx
<div className="modal-dialog modal-dialog-centered">
  <div className="modal-content">
    <div className="modal-header">
      <h2 className="fw-bolder">Title</h2>
      <button className="btn-close" onClick={onClose}></button>
    </div>
    <div className="modal-body">{/* Content */}</div>
    <div className="modal-footer">{/* Actions */}</div>
  </div>
</div>
```

### Card Pattern
```jsx
<div className="card">
  <div className="card-header">
    <div className="card-title">Title</div>
    <div className="card-toolbar">{/* Actions */}</div>
  </div>
  <div className="card-body">{/* Content */}</div>
</div>
```

### Table Pattern
```jsx
<table className="table align-middle table-row-dashed fs-6 gy-5">
  <thead>
    <tr className="text-start text-muted fw-bolder fs-7 text-uppercase gs-0">
      <th>Column</th>
    </tr>
  </thead>
  <tbody>{/* Rows */}</tbody>
</table>
```

## Routing

Routes are defined in `/src/routing/`:
- `/dashboard` - Main dashboard
- `/workspace` - Workspace list
- `/workspace/:id/*` - Workspace views (board, backlog, etc.)
- `/w/:acronym` - Workspace by acronym redirect
- `/goals` - Goals list
- `/goals/details/*` - Goal details
- `/people/myaccount/*` - Account settings
- `/admin/*` - Admin panel

## Environment Configuration

Create a `.env` file with Firebase configuration:
```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Development Guidelines

### Adding a New Feature
1. Create service functions in appropriate `/src/services/` file
2. Create React Query hooks for data operations
3. Implement UI components in the relevant module
4. Connect components to services using hooks
5. Add routing if needed in `PrivateRoutes.tsx`
6. Follow existing styling patterns

### Adding a New Component
1. Create in appropriate module directory or `/src/components/common/`
2. Use functional components with hooks
3. Follow existing prop patterns
4. Use Bootstrap classes and CSS variables for styling
5. Ensure theme compatibility (light/dark modes)

### Working with Issues/Items
- Issues are stored in Firestore under `organisation/{orgId}/spaces/{spaceId}/items`
- Use `itemServices.js` for CRUD operations
- Key fields: `id`, `title`, `description`, `status`, `priority`, `type`, `userIds`, `sprintId`

### Working with Sprints
- Sprints stored under `spaces/{spaceId}/sprints`
- Sprint-ticket associations in `sprints/{sprintId}/tickets`
- Use `sprintServices.js` for operations

## Testing

```bash
npm test
```

Uses Jest and React Testing Library. Test files should be colocated with components or in `__tests__` directories.

## Important Notes

1. **Mixed TypeScript/JavaScript:** The codebase uses both `.ts/.tsx` and `.js/.jsx` files. TypeScript is configured but not strictly enforced everywhere.

2. **React Query Cache:** Always invalidate relevant queries after mutations to keep UI in sync.

3. **Firebase Security:** Follow Firestore security rules. Never expose sensitive data in client code.

4. **Performance:** Use React.memo, useMemo, and useCallback for expensive operations. Implement lazy loading for routes.

5. **Styling:** Always check both light and dark themes when making style changes.

6. **Error Handling:** Implement error boundaries and handle Firebase operation errors gracefully.
