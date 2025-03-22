# Oxygen Services Documentation

## Overview

Oxygen uses a service layer pattern to abstract interactions with Firebase. This document provides details on the key services and their functionality.

## Service Structure

Services in Oxygen follow a consistent pattern:

1. **Core Firebase Functions**: Direct Firebase interactions
2. **React Query Hooks**: Wrapper hooks for data fetching and mutations
3. **Utility Functions**: Helper functions for data transformations

## Authentication Services

Located in `/src/services/firestore.js` and used through the `/src/modules/auth` context.

### Key Functions

| Function | Description |
|----------|-------------|
| `loginWithEmail` | Authenticates a user with email and password |
| `sendPasswordReset` | Sends a password reset email |
| `logout` | Signs out the current user |
| `editUser` | Updates user profile information |

### Example Usage

```jsx
import { useAuth } from '../../modules/auth';

const { currentUser, logout } = useAuth();
```

## Item Services

Located in `/src/services/itemServices.js` - manages issues/tasks.

### Key Functions

| Function | Description |
|----------|-------------|
| `getItems` | Fetches items for a workspace |
| `updateItem` | Updates an existing item |
| `addItem` | Creates a new item |
| `deleteItem` | Removes an item |

### React Query Hooks

| Hook | Description |
|------|-------------|
| `useGetItems` | Hook to fetch items |
| `useUpdateItem` | Hook to update an item |
| `useAddItem` | Hook to create an item |
| `useDeleteItem` | Hook to delete an item |

### Example Usage

```jsx
import { useGetItems, useUpdateItem } from '../services/itemServices';

// Fetch items
const { data: items, isLoading } = useGetItems(workspaceId, orgId);

// Update an item
const updateItemMutation = useUpdateItem();
updateItemMutation({ orgId, field: { status: 'DONE' }, itemId: '123', workspaceId });
```

## Workspace Services

Located in `/src/services/workspaceServices.js` - manages workspaces/spaces.

### Key Functions

| Function | Description |
|----------|-------------|
| `getSpaces` | Fetches all workspaces for an organization |
| `getSpace` | Fetches a specific workspace |
| `createSpace` | Creates a new workspace |
| `editSpace` | Updates an existing workspace |
| `deleteSpace` | Removes a workspace |

### React Query Hooks

| Hook | Description |
|------|-------------|
| `useGetSpaces` | Hook to fetch workspaces |
| `useGetSpace` | Hook to fetch a specific workspace |

## OKR Services

Located in `/src/services/okrServices.js` - manages Objectives and Key Results.

### Key Functions

| Function | Description |
|----------|-------------|
| `fetchOKRs` | Fetches OKRs for an organization |
| `addOKR` | Creates a new OKR |
| `updateOKR` | Updates an existing OKR |
| `deleteOKR` | Removes an OKR |

### React Query Hooks

| Hook | Description |
|------|-------------|
| `useFetchOKRs` | Hook to fetch OKRs |
| `useAddOKR` | Hook to create an OKR |
| `useUpdateOKR` | Hook to update an OKR |
| `useDeleteOKR` | Hook to delete an OKR |

## Sprint Services

Located in `/src/services/sprintServices.js` - manages sprints.

### Key Functions

| Function | Description |
|----------|-------------|
| `getSprints` | Fetches sprints for a workspace |
| `addSprint` | Creates a new sprint |
| `addTicketToSprint` | Adds a ticket to a sprint |
| `removeTicketFromSprint` | Removes a ticket from a sprint |

### React Query Hooks

| Hook | Description |
|------|-------------|
| `useGetSprints` | Hook to fetch sprints |
| `useAddSprint` | Hook to create a sprint |

## Work Package Services

Located in `/src/services/workPackageServices.js` - manages work packages.

### Key Functions

| Function | Description |
|----------|-------------|
| `getWorkPackages` | Fetches work packages |
| `updateWorkPackage` | Updates a work package |
| `addWorkPackage` | Creates a new work package |
| `deleteWorkPackage` | Removes a work package |

### React Query Hooks

| Hook | Description |
|------|-------------|
| `useGetWorkPackages` | Hook to fetch work packages |
| `useUpdateWorkPackage` | Hook to update a work package |
| `useAddWorkPackage` | Hook to create a work package |
| `useDeleteWorkPackage` | Hook to delete a work package |

## User View Services

Located in `/src/services/userViewServices.js` - manages user view preferences.

### Key Functions

| Function | Description |
|----------|-------------|
| `getUserViews` | Fetches user view preferences |
| `addUserView` | Creates or updates a user view |

### React Query Hooks

| Hook | Description |
|------|-------------|
| `useGetUserViews` | Hook to fetch user views |
| `useAddUserView` | Hook to create/update user views |

## API Utilities

Located in `/src/utils/api.js` - provides HTTP request abstractions.

### Key Functions

| Function | Description |
|----------|-------------|
| `get` | Performs a GET request |
| `post` | Performs a POST request |
| `put` | Performs a PUT request |
| `patch` | Performs a PATCH request |
| `delete` | Performs a DELETE request |
| `optimisticUpdate` | Performs optimistic updates with rollback on failure |

## Best Practices

1. **Use React Query Hooks**: Prefer using the provided React Query hooks over direct service calls
2. **Error Handling**: Always handle errors from service calls
3. **Loading States**: Display appropriate loading states while data is being fetched
4. **Optimistic Updates**: Use optimistic updates for better user experience
5. **Cache Invalidation**: Properly invalidate caches when data changes
