# Oxygen Work Management - An Open-Source Jira Alternative

<p align="center">
  <img src="https://oxgn.io/images/logo.png" alt="Oxygen agile planning" />
</p>
<h1 align="center">Oxygen  <small><sup>V1.0</sup></small></h1>

<div align="center">

Oxygen is a powerful, flexible, and open-source project management platform designed to be a compelling alternative to Jira. Built with React, Oxygen (OXGN) provides a comprehensive suite of features for agile teams to plan, track, and release software!

![quote application example](https://oxgn.io/images/kanban.jpeg)

[Try the software here](https://oxgn.io)

</div>

## Features

- **Issue Tracking:** Create, manage, and prioritize issues with customizable workflows, fields, and statuses.
- **Agile Boards:** Scrum and Kanban boards to visualize progress and manage sprints.
- **Project Planning:** Organize projects with epics, stories, and sub-tasks.
- **Sprint Management:** Plan and track sprints with velocity charts and burndown reports.
- **OKR/Goals Tracking:** Set and track objectives and key results for your team.
- **Timeline/Gantt Views:** Visualize project timelines and dependencies.
- **Open Source:** Free to use, modify, and distribute.

## Technology Stack

### Core

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3 | UI framework |
| **TypeScript** | 5.6 | Type safety |
| **Vite** | 5.4 | Build tool & dev server |
| **Firebase** | 9.9 | Backend (Firestore, Auth, Hosting) |

### State Management

| Technology | Version | Purpose |
|------------|---------|---------|
| **TanStack Query** | 5.90 | Server state & caching |
| **Zustand** | 5.0 | Client state management |
| **React Context** | - | Local component state |

### UI & Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 3.4 | Utility-first CSS (tw- prefix) |
| **Bootstrap** | 5.2 | Component library & grid |
| **SCSS** | 1.77 | Custom styling |
| **shadcn/ui patterns** | - | Accessible UI components |

### Forms & Validation

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Hook Form** | 7.71 | Form state management |
| **Zod** | 4.3 | Runtime type validation |
| **@hookform/resolvers** | 5.2 | Form-Zod integration |

### Drag & Drop

| Technology | Version | Purpose |
|------------|---------|---------|
| **dnd-kit** | 6.3 | Modern drag-and-drop |
| **react-beautiful-dnd** | 13.1 | Legacy boards (migration in progress) |

### Testing

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vitest** | 2.1 | Unit & integration testing |
| **Testing Library** | 14.3 | React component testing |
| **jsdom** | 25.0 | DOM simulation |

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Firebase CLI (for local development)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/oxygen.git
   cd oxygen
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure environment variables:**

   Create a `.env` file in the root directory:
   ```bash
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. **Start Firebase emulators (optional, for local development):**
   ```bash
   firebase emulators:start
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ui` | Run tests with Vitest UI |
| `npm run lint` | Check code for linting errors |
| `npm run lint:fix` | Fix linting errors automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run clean` | Clean build artifacts and cache |

## Project Structure

```
oxygen/
├── src/
│   ├── components/
│   │   ├── common/          # Generic reusable components
│   │   ├── ui/              # shadcn/ui-style components (Button, Card, Input, etc.)
│   │   ├── forms/           # React Hook Form components
│   │   ├── dnd/             # dnd-kit drag-and-drop components
│   │   └── partials/        # Partial/shared components
│   ├── hooks/
│   │   ├── api/             # API-related hooks
│   │   └── useZodForm.ts    # Form hook with Zod validation
│   ├── lib/
│   │   ├── queryClient.ts   # TanStack Query configuration
│   │   └── utils.ts         # Utility functions (cn, etc.)
│   ├── modules/
│   │   ├── auth/            # Authentication
│   │   ├── Goals/           # OKR/Goals management
│   │   ├── IssueDetails/    # Issue viewing/editing
│   │   ├── Workspace/       # Project workspace (board, backlog, sprints)
│   │   └── ...              # Other feature modules
│   ├── services/            # Firebase/API service layer
│   ├── stores/
│   │   └── okrStore.ts      # Zustand stores
│   ├── styles/
│   │   ├── tailwind.css     # Tailwind CSS entry point
│   │   ├── theme.ts         # Theme configuration
│   │   └── *.scss           # SCSS stylesheets
│   ├── types/
│   │   └── schemas.ts       # Zod validation schemas
│   └── index.tsx            # Application entry point
├── vite.config.ts           # Vite configuration
├── vitest.config.ts         # Vitest test configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json
```

## Architecture Overview

### State Management Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Application State                         │
├─────────────────────────────────────────────────────────────┤
│  Server State (TanStack Query)                              │
│  - Issues, Sprints, Projects                                │
│  - Automatic caching & background refetching                │
│  - Optimistic updates                                       │
├─────────────────────────────────────────────────────────────┤
│  Client State (Zustand)                                     │
│  - UI state, filters, selections                            │
│  - Cross-component state                                    │
├─────────────────────────────────────────────────────────────┤
│  Local State (React Context / useState)                     │
│  - Form state, component-specific state                     │
└─────────────────────────────────────────────────────────────┘
```

### Component Patterns

**Using the UI Components:**
```tsx
import { Button, Card, Input, Badge } from '@/components/ui'

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter task name" />
      <Badge variant="success">Active</Badge>
      <Button variant="primary" size="sm">Save</Button>
    </Card>
  )
}
```

**Using React Hook Form with Zod:**
```tsx
import { useZodForm, commonSchemas } from '@/hooks/useZodForm'
import { Form, FormInput } from '@/components/forms'
import { z } from 'zod'

const schema = z.object({
  title: commonSchemas.title,
  description: commonSchemas.description,
})

function TaskForm() {
  const form = useZodForm({ schema })

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <Form form={form} onSubmit={onSubmit}>
      <FormInput name="title" label="Title" />
      <FormInput name="description" label="Description" />
      <Button type="submit">Create Task</Button>
    </Form>
  )
}
```

**Using TanStack Query:**
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['items', workspaceId],
  queryFn: () => getItems(workspaceId, orgId),
})

// Mutating data
const queryClient = useQueryClient()
const mutation = useMutation({
  mutationFn: updateItem,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['items', workspaceId] })
  },
})
```

**Using Zustand:**
```tsx
import { useOKRStore } from '@/stores/okrStore'

function OKRComponent() {
  const { selectedOKR, selectOKR, clearSelection } = useOKRStore()

  return (
    <div>
      {selectedOKR && <span>{selectedOKR.name}</span>}
      <button onClick={clearSelection}>Clear</button>
    </div>
  )
}
```

## Styling

The project uses a hybrid styling approach:

1. **Tailwind CSS** (prefix: `tw-`) - For utility-first styling
   ```tsx
   <div className="tw-flex tw-items-center tw-gap-4 tw-p-4">
   ```

2. **Bootstrap** - For layout grid and existing components
   ```tsx
   <div className="card p-4 mb-3">
   ```

3. **SCSS** - For complex custom styles and theming
   ```scss
   .my-component {
     background-color: var(--xgn-card-bg);
     color: var(--xgn-text-color);
   }
   ```

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory with:
- Code splitting by vendor (React, Firebase, State, Calendar, Charts)
- Source maps for debugging
- Minified and tree-shaken bundles

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

## Testing

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

Tests are written using Vitest and React Testing Library. Test files should be colocated with their components or placed in `__tests__` directories.

## Motivation

Oxygen started as a personal quest for a simpler, more powerful project management system. Frustrated with the bloat and cost of existing solutions like Jira, I set out to create something truly open and efficient.

**Why Oxygen?**

- **Escape the expensive trap:** Tired of expensive licenses and complex setups? Oxygen offers a free and open alternative.
- **Built for Speed:** Oxygen is designed for a streamlined workflow, helping you focus on what matters most.
- **Your Vision, Your Way:** Customize and adapt Oxygen to perfectly match your unique needs and preferences.
- **Transparency is Key:** With Oxygen's open-source nature, you have complete control and visibility.

## Not Agile?

Oxygen uses and makes the most of agile methodology, but you don't have to be an expert to use it. You don't even have to know anything about agile to start managing your projects.

## Support

- Community support via GitHub Issues
- Documentation in the `docs/` folder

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source. See the LICENSE file for details.
