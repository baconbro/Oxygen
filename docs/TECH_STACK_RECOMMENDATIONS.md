# Technology Stack Recommendations for Oxygen

> **Analysis Date:** January 2026
> **Current Stack Analysis Score:** 5.3/10
> **Recommended Stack Projected Score:** 8.5/10

---

## Executive Summary

Oxygen is a solid React-based work management platform with good architectural foundations but suffering from **technical debt**, **inconsistent patterns**, and **aging tooling**. This document recommends a modernized technology stack that will:

- **Improve developer experience** with faster builds and better tooling
- **Enhance performance** with modern rendering patterns and optimizations
- **Increase reliability** with type safety and comprehensive testing
- **Future-proof the application** with actively maintained, industry-standard tools

---

## Current Stack Assessment

### What's Working Well

| Component | Status | Notes |
|-----------|--------|-------|
| React 18 | ✅ Good | Modern concurrent features available |
| React Query | ✅ Good | Solid server state management |
| Firebase/Firestore | ✅ Good | Scalable, real-time capable |
| Feature-based architecture | ✅ Good | Clear module separation |
| Bootstrap 5 | ⚠️ Adequate | Works but limits design flexibility |

### Critical Issues Identified

| Issue | Severity | Impact |
|-------|----------|--------|
| Zero test coverage | 🔴 Critical | No confidence in changes, high regression risk |
| Create React App (deprecated) | 🔴 Critical | No longer maintained, security risks |
| Mixed TypeScript/JavaScript | 🟠 High | Type safety gaps, inconsistent DX |
| Mixed styling approaches (4+) | 🟠 High | Bundle bloat, maintenance overhead |
| Oversized components (800+ lines) | 🟠 High | Hard to maintain and test |
| Redux underutilization | 🟡 Medium | Unnecessary complexity |
| 165 console statements | 🟡 Medium | Debug code in production |
| No lazy loading strategy | 🟡 Medium | Slower initial load times |

---

## Recommended Technology Stack

### 1. Build Tooling: **Vite** (Replace Create React App)

**Current:** Create React App (react-scripts 5.0.1) - **DEPRECATED**

**Recommended:** Vite 5.x

```bash
# Migration command
npm create vite@latest oxygen-next -- --template react-ts
```

**Why Vite:**

| Aspect | CRA | Vite | Improvement |
|--------|-----|------|-------------|
| Dev server cold start | 30-60s | <1s | **60x faster** |
| Hot Module Replacement | 2-5s | <50ms | **100x faster** |
| Production build | 2-5 min | 30-60s | **4x faster** |
| Bundle size analysis | External plugin | Built-in | Native support |
| ES Modules | Webpack bundled | Native ESM | Modern standard |
| Active maintenance | ❌ Deprecated | ✅ Very active | Future-proof |

**Configuration:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          'charts': ['apexcharts', 'react-apexcharts'],
          'calendar': ['@fullcalendar/react', '@fullcalendar/daygrid'],
          'dnd': ['react-beautiful-dnd'],
        }
      }
    }
  }
})
```

---

### 2. Language: **Full TypeScript Migration**

**Current:** Mixed TypeScript (35%) / JavaScript (65%)

**Recommended:** 100% TypeScript with strict mode

**Migration Strategy:**
```json
// tsconfig.json - Stricter configuration
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "allowJs": false,  // Enforce TS-only after migration
    "skipLibCheck": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx"
  }
}
```

**Priority Files to Migrate:**
1. `/src/services/*.js` → TypeScript with Firestore types
2. `/src/contexts/*.jsx` → TypeScript with proper generics
3. `/src/modules/IssueDetails/*.jsx` → TypeScript interfaces
4. `/src/modules/Workspace/*.jsx` → TypeScript interfaces

**Type Definitions for Firestore:**
```typescript
// src/types/firestore.ts
interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: Priority;
  type: IssueType;
  userIds: string[];
  sprintId?: string;
  parentId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Sprint {
  id: string;
  name: string;
  goal?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'planning' | 'active' | 'completed';
}

interface Workspace {
  id: string;
  name: string;
  acronym: string;
  config: WorkspaceConfig;
}
```

---

### 3. State Management: **Zustand + TanStack Query**

**Current:** Redux Toolkit (underutilized) + React Query 3 + Context API (overloaded)

**Recommended:** Zustand 4.x + TanStack Query 5.x

**Why This Combination:**

| Current | Recommended | Benefit |
|---------|-------------|---------|
| Redux Toolkit (1 slice) | Zustand | 90% less boilerplate, no reducers needed |
| React Query 3 | TanStack Query 5 | Better caching, suspense support, smaller bundle |
| Multiple Contexts | Zustand stores | Granular updates, no provider nesting |

**Zustand Store Example:**
```typescript
// src/stores/workspaceStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface WorkspaceState {
  currentWorkspace: Workspace | null
  filters: WorkspaceFilters
  viewMode: 'board' | 'list' | 'timeline'

  // Actions
  setWorkspace: (workspace: Workspace) => void
  updateFilters: (filters: Partial<WorkspaceFilters>) => void
  setViewMode: (mode: ViewMode) => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  devtools(
    persist(
      (set) => ({
        currentWorkspace: null,
        filters: defaultFilters,
        viewMode: 'board',

        setWorkspace: (workspace) => set({ currentWorkspace: workspace }),
        updateFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters }
        })),
        setViewMode: (mode) => set({ viewMode: mode }),
      }),
      { name: 'workspace-storage' }
    )
  )
)
```

**TanStack Query 5 Configuration:**
```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes (renamed from cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})
```

---

### 4. Styling: **Tailwind CSS + CSS Modules**

**Current:** SCSS (157 files) + Bootstrap 5 + Styled Components + Emotion (4 systems!)

**Recommended:** Tailwind CSS 3.4 + CSS Modules for complex components

**Why Tailwind:**

| Aspect | Current (Mixed) | Tailwind | Improvement |
|--------|-----------------|----------|-------------|
| Bundle size | ~200KB CSS | ~10-30KB | **85% smaller** |
| Consistency | 4 approaches | 1 approach | Unified system |
| Dark mode | Manual CSS vars | Built-in | Native support |
| Developer speed | Moderate | Very fast | Utility-first |
| Design system | Bootstrap constraints | Fully customizable | More flexibility |

**Tailwind Configuration:**
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        // Map existing CSS variables
        card: 'var(--xgn-card-bg)',
        text: 'var(--xgn-text-color)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config
```

**Component Migration Example:**
```tsx
// Before (Bootstrap + SCSS)
<div className="card p-4 mb-3">
  <div className="d-flex align-items-center justify-content-between">
    <span className="fw-bold fs-6 text-gray-800">Title</span>
  </div>
</div>

// After (Tailwind)
<div className="rounded-lg bg-white dark:bg-gray-800 p-4 mb-3 shadow-sm">
  <div className="flex items-center justify-between">
    <span className="font-bold text-base text-gray-800 dark:text-gray-200">Title</span>
  </div>
</div>
```

---

### 5. UI Component Library: **Radix UI + shadcn/ui**

**Current:** React Bootstrap (beta version)

**Recommended:** Radix UI primitives + shadcn/ui components

**Why This Stack:**

| Aspect | React Bootstrap | Radix + shadcn/ui | Benefit |
|--------|-----------------|-------------------|---------|
| Accessibility | Basic | WAI-ARIA compliant | Better a11y |
| Customization | Limited by Bootstrap | Full control | Design freedom |
| Bundle size | Includes Bootstrap JS | Tree-shakeable | Smaller bundle |
| Headless option | No | Yes (Radix) | Maximum flexibility |
| TypeScript | Partial | Full | Type safety |

**Example Components:**
```typescript
// src/components/ui/button.tsx (shadcn/ui pattern)
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
  {
    variants: {
      variant: {
        default: 'bg-primary-500 text-white hover:bg-primary-600',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
}
```

---

### 6. Testing: **Vitest + Testing Library + Playwright**

**Current:** Jest (via CRA) with 0 test files

**Recommended:** Vitest + React Testing Library + Playwright

**Testing Pyramid:**
```
         /\
        /  \  E2E Tests (Playwright)
       /----\  10% - Critical user journeys
      /      \
     /--------\  Integration Tests
    /          \  30% - Component interactions
   /-----------\
  /             \  Unit Tests (Vitest)
 /---------------\ 60% - Functions, hooks, utilities
```

**Vitest Configuration:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
      }
    },
  },
})
```

**Test Example:**
```typescript
// src/modules/IssueDetails/__tests__/IssueDetails.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { IssueDetails } from '../IssueDetails'

describe('IssueDetails', () => {
  it('renders issue title and allows editing', async () => {
    const mockIssue = { id: '1', title: 'Test Issue', status: 'todo' }
    const onUpdate = vi.fn()

    render(<IssueDetails issue={mockIssue} onUpdate={onUpdate} />)

    expect(screen.getByText('Test Issue')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    await userEvent.clear(screen.getByRole('textbox'))
    await userEvent.type(screen.getByRole('textbox'), 'Updated Title')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith({ ...mockIssue, title: 'Updated Title' })
    })
  })
})
```

**Playwright E2E Configuration:**
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

### 7. Forms: **React Hook Form + Zod**

**Current:** Formik + Yup

**Recommended:** React Hook Form 7.x + Zod

**Why:**

| Aspect | Formik + Yup | React Hook Form + Zod | Improvement |
|--------|--------------|----------------------|-------------|
| Re-renders | On every change | Only on submit/blur | **10x fewer** |
| Bundle size | ~45KB | ~25KB | **45% smaller** |
| TypeScript | Partial | First-class | Better types |
| Validation | Yup schema | Zod (TS-native) | Type inference |

**Example:**
```typescript
// src/modules/IssueDetails/IssueForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const issueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'blocked']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assigneeIds: z.array(z.string()).optional(),
})

type IssueFormData = z.infer<typeof issueSchema>

export function IssueForm({ issue, onSubmit }: IssueFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: issue,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
      {/* ... */}
    </form>
  )
}
```

---

### 8. Rich Text Editor: **Tiptap**

**Current:** Quill 1.3.7 (old, limited extensibility)

**Recommended:** Tiptap 2.x

**Why Tiptap:**

| Aspect | Quill | Tiptap | Benefit |
|--------|-------|--------|---------|
| React integration | Wrapper only | Native React | Better DX |
| Extensibility | Limited | Highly extensible | Custom features |
| Collaboration | Requires plugins | Built-in Yjs support | Real-time editing |
| TypeScript | No | Yes | Type safety |
| Maintenance | Stale | Very active | Future-proof |

**Example:**
```typescript
// src/components/Editor/RichTextEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'

export function RichTextEditor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write description...' }),
      Link.configure({ openOnClick: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  return (
    <div className="prose prose-sm max-w-none">
      <EditorContent editor={editor} />
    </div>
  )
}
```

---

### 9. Drag and Drop: **dnd-kit**

**Current:** react-beautiful-dnd 13.1.0 (Atlassian deprecated)

**Recommended:** @dnd-kit/core 6.x

**Why dnd-kit:**

| Aspect | react-beautiful-dnd | dnd-kit | Benefit |
|--------|---------------------|---------|---------|
| Maintenance | Deprecated by Atlassian | Actively maintained | Future-proof |
| Bundle size | 42KB | 15KB | **65% smaller** |
| Accessibility | Good | Excellent | Better a11y |
| Touch support | Limited | First-class | Mobile-friendly |
| Flexibility | Opinionated | Modular | More control |

**Example:**
```typescript
// src/modules/Workspace/Board/KanbanBoard.tsx
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

export function KanbanBoard({ columns, issues }: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto">
        {columns.map((column) => (
          <SortableContext
            key={column.id}
            items={column.issueIds}
            strategy={verticalListSortingStrategy}
          >
            <Column column={column} issues={issues} />
          </SortableContext>
        ))}
      </div>
      <DragOverlay>{/* Active item preview */}</DragOverlay>
    </DndContext>
  )
}
```

---

### 10. Charts: **Recharts or Tremor**

**Current:** ApexCharts

**Recommended:** Recharts 2.x or Tremor (for dashboard components)

**Why:**

| Aspect | ApexCharts | Recharts / Tremor | Benefit |
|--------|------------|-------------------|---------|
| React-native | Wrapper | Native React | Better integration |
| Bundle size | 450KB+ | ~100KB | **75% smaller** |
| Customization | Config-based | Component-based | More flexible |
| TypeScript | Partial | Full | Type safety |

---

### 11. Routing: **TanStack Router (Optional)**

**Current:** React Router 6.3.0

**Options:**
1. **Keep React Router 6** - Update to latest (6.21+), add type safety
2. **Migrate to TanStack Router** - Full type safety, better data loading

**If Staying with React Router:**
```typescript
// Upgrade and add type-safe routes
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Dashboard /> },
      {
        path: 'workspace/:id',
        element: <Workspace />,
        loader: workspaceLoader,
        children: [
          { path: 'board', element: <Board /> },
          { path: 'backlog', element: <Backlog /> },
          { path: 'sprints', element: <Sprints /> },
        ]
      },
    ],
  },
])
```

---

### 12. Backend Considerations: **Firebase + Edge Functions**

**Current:** Firebase (Firestore, Auth, Storage, Hosting)

**Recommended Enhancements:**

1. **Firebase with Modern Patterns:**
```typescript
// Use modular Firebase SDK (already v9, but improve patterns)
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore'
import { converter } from './firestoreConverters'

// Type-safe Firestore with converters
const issuesRef = collection(db, 'issues').withConverter(issueConverter)
```

2. **Consider Supabase for New Projects** (Alternative):
   - PostgreSQL with real-time subscriptions
   - Better query capabilities
   - Row-level security
   - Built-in edge functions

3. **Add Firebase App Check:**
```typescript
// Protect Firebase resources from abuse
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('your-recaptcha-key'),
  isTokenAutoRefreshEnabled: true,
})
```

---

## Migration Roadmap

### Phase 1: Foundation (2-4 weeks)
- [ ] Migrate from CRA to Vite
- [ ] Set up Vitest and write initial tests
- [ ] Configure stricter TypeScript
- [ ] Set up ESLint + Prettier with strict rules

### Phase 2: Core Libraries (4-6 weeks)
- [ ] Upgrade React Query to TanStack Query 5
- [ ] Replace Redux with Zustand
- [ ] Migrate services to TypeScript
- [ ] Add Zod schemas for Firestore types

### Phase 3: UI Modernization (6-8 weeks)
- [ ] Integrate Tailwind CSS alongside existing styles
- [ ] Set up shadcn/ui component library
- [ ] Gradually migrate components from Bootstrap
- [ ] Replace Quill with Tiptap

### Phase 4: Enhanced Features (4-6 weeks)
- [ ] Replace react-beautiful-dnd with dnd-kit
- [ ] Migrate forms to React Hook Form + Zod
- [ ] Replace ApexCharts with Recharts
- [ ] Add Playwright E2E tests

### Phase 5: Cleanup (2-4 weeks)
- [ ] Remove legacy dependencies
- [ ] Delete unused SCSS files
- [ ] Remove 165 console statements
- [ ] Final type coverage improvements

---

## Dependency Comparison

### Before (Current)

```json
{
  "dependencies": {
    "react": "18.0.0",
    "react-scripts": "5.0.1",
    "react-query": "3.38.0",
    "@reduxjs/toolkit": "2.2.5",
    "react-bootstrap": "2.5.0-beta.1",
    "bootstrap": "5.2.0-beta1",
    "formik": "2.2.9",
    "yup": "0.32.11",
    "quill": "1.3.7",
    "react-beautiful-dnd": "13.1.0",
    "apexcharts": "3.35.0",
    "styled-components": "5.3.5",
    "@emotion/react": "11.13.3",
    "sass": "1.50.1"
    // ... 80+ more
  }
}
```

### After (Recommended)

```json
{
  "dependencies": {
    "react": "18.3.0",
    "@tanstack/react-query": "5.x",
    "zustand": "4.x",
    "@tiptap/react": "2.x",
    "@dnd-kit/core": "6.x",
    "react-hook-form": "7.x",
    "zod": "3.x",
    "recharts": "2.x",
    "@radix-ui/react-*": "latest"
  },
  "devDependencies": {
    "vite": "5.x",
    "@vitejs/plugin-react-swc": "3.x",
    "vitest": "1.x",
    "@playwright/test": "1.x",
    "tailwindcss": "3.4.x",
    "typescript": "5.x"
  }
}
```

### Bundle Size Comparison (Estimated)

| Category | Current | Recommended | Savings |
|----------|---------|-------------|---------|
| Build tooling | CRA ~2MB | Vite ~200KB | 90% |
| State management | Redux ~40KB | Zustand ~3KB | 92% |
| Styling | Bootstrap+SCSS ~200KB | Tailwind ~30KB | 85% |
| Forms | Formik+Yup ~45KB | RHF+Zod ~25KB | 44% |
| DnD | rbd ~42KB | dnd-kit ~15KB | 65% |
| Editor | Quill ~150KB | Tiptap ~100KB | 33% |
| Charts | ApexCharts ~450KB | Recharts ~100KB | 78% |

**Total estimated savings: 40-60% bundle size reduction**

---

## New Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "typecheck": "tsc --noEmit",
    "prepare": "husky install"
  }
}
```

---

## Summary: Key Wins

| Area | Current Pain | Solution | Outcome |
|------|--------------|----------|---------|
| **Build Speed** | 30-60s cold starts | Vite | <1s cold starts |
| **Type Safety** | Mixed TS/JS, many `any` | Full TypeScript + Zod | Catch bugs at compile time |
| **Testing** | Zero coverage | Vitest + Playwright | 70%+ coverage target |
| **Bundle Size** | ~2MB+ | Modern stack | ~800KB-1MB |
| **DX** | Slow feedback loops | HMR, better tooling | Instant feedback |
| **Maintainability** | 4 styling systems | Tailwind only | Consistent patterns |
| **Future-proofing** | Deprecated dependencies | Active libraries | Long-term support |

---

## Conclusion

This modernization will transform Oxygen from a functional but aging codebase into a maintainable, performant, and future-proof application. The recommended stack prioritizes:

1. **Developer Experience** - Faster builds, better types, modern tooling
2. **Performance** - Smaller bundles, fewer re-renders, optimized loading
3. **Reliability** - Comprehensive testing, type safety, error handling
4. **Maintainability** - Consistent patterns, fewer dependencies, active maintenance

The migration can be done incrementally, allowing the team to continue feature development while modernizing the foundation.
