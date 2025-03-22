# Oxygen Development Guide

## Overview

This guide provides best practices, patterns, and processes for developing Oxygen. It covers key aspects like setup, coding standards, Git workflow, and testing.

## Development Environment Setup

### Prerequisites

- Node.js 14+ and npm/yarn
- Firebase CLI
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/baconbro/oxygen.git
   cd oxygen
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up Firebase:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init emulators
   ```

4. Create `.env` file with Firebase configuration:
   ```
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

5. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

6. Start Firebase emulators:
   ```bash
   firebase emulators:start
   ```

## Project Structure

```
/src
├── components/       # Shared components
├── contexts/         # React contexts for state management
├── hooks/            # Custom React hooks
├── modules/          # Feature modules
├── pages/            # Page components
├── services/         # Service layer for API interactions
├── styles/           # Global styles and theme
└── utils/            # Utility functions
```

## Coding Standards

### JavaScript/React

- Use functional components with hooks
- Follow React's best practices for performance
- Use PropTypes for component props validation
- Implement error boundaries for robust error handling

### Firebase Interaction

- Always use the service layer for Firebase interactions
- Implement proper error handling for all Firebase operations
- Use React Query for data fetching and caching
- Follow the Firestore security rules for secure data access

### Styling

- Use the SCSS variables and mixins from the styling system
- Follow the BEM naming convention for custom components
- Ensure components work in both light and dark themes
- Use responsive design patterns for all components

## State Management

Oxygen uses a combination of:

1. **React Query** for server state
2. **React Context** for global application state
3. **Local Component State** for UI state

### React Query Example

```jsx
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getItems, updateItem } from '../services/itemServices';

// Fetch data
const { data, isLoading, error } = useQuery(['items', workspaceId], 
  () => getItems(workspaceId, orgId));

// Update data
const queryClient = useQueryClient();
const mutation = useMutation(updateItem, {
  onSuccess: () => {
    queryClient.invalidateQueries(['items', workspaceId]);
  }
});

// Usage
mutation.mutate({ orgId, field: { status: 'DONE' }, itemId });
```

### Context Example

```jsx
import { useWorkspace } from '../contexts/WorkspaceProvider';

// Access workspace context
const { project, updateProjectContext } = useWorkspace();

// Update context
updateProjectContext({ ...project, title: 'New Title' });
```

## Feature Development Workflow

1. **Issue Creation**: Create or assign an issue for the feature
2. **Branch Creation**: Create a feature branch from main
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Development**: Implement the feature following the coding standards
4. **Testing**: Write tests and manually test the feature
5. **Pull Request**: Create a pull request with detailed description
6. **Code Review**: Address review comments
7. **Merge**: Merge the feature branch into main
8. **Deployment**: Deploy to staging/production

## Testing

### Unit Testing

Use Jest and React Testing Library for unit tests:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import YourComponent from './YourComponent';

test('renders correctly', () => {
  render(<YourComponent />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});

test('handles click event', () => {
  const mockFn = jest.fn();
  render(<YourComponent onClick={mockFn} />);
  fireEvent.click(screen.getByRole('button'));
  expect(mockFn).toHaveBeenCalledTimes(1);
});
```

### Integration Testing

Test interactions between components:

```jsx
test('form submission works', async () => {
  render(<YourForm />);
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'Test User' }
  });
  fireEvent.click(screen.getByText('Submit'));
  
  // Wait for success message
  expect(await screen.findByText('Form submitted successfully')).toBeInTheDocument();
});
```

## Common Patterns

### Creating a New Feature

1. Create necessary service functions in appropriate service files
2. Create React Query hooks for data fetching and mutations
3. Implement UI components following the component structure
4. Connect components to services using hooks
5. Add routing if needed
6. Add tests for the feature

### Adding a New Component

1. Create the component in the appropriate module directory
2. Define PropTypes for the component
3. Implement the component using existing UI patterns
4. Create styles following the styling guide
5. Test the component
6. Document the component

## Performance Optimization

1. **Memoization**: Use React.memo, useMemo and useCallback
2. **Code Splitting**: Implement lazy loading for routes
3. **Query Optimization**: Use appropriate React Query settings
4. **Bundle Size**: Monitor and optimize bundle size
5. **Virtualization**: Use virtualization for long lists

## Deployment

### Building for Production

```bash
npm run build
# or
yarn build
```

### Deploying to Firebase

```bash
firebase deploy --only hosting
# or for all services
firebase deploy
```

## Troubleshooting

### Common Issues

1. **Firebase Connection Issues**:
   - Check Firebase configuration in .env
   - Ensure Firebase rules allow the operations

2. **React Query Cache Issues**:
   - Properly invalidate queries when data changes
   - Use appropriate staleTime and cacheTime settings

3. **Styling Issues**:
   - Check for theme compatibility
   - Ensure responsive design works on all screen sizes

## References

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Query Documentation](https://react-query.tanstack.com/)
- [SCSS Documentation](https://sass-lang.com/documentation)
- [Oxygen GitHub Repository](https://github.com/baconbro/oxygen)
