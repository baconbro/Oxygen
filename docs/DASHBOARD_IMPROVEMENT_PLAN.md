# Dashboard Improvement Plan
## Making Oxygen's Dashboard World-Class for Knowledge Workers

### Current State Analysis

The existing dashboard provides:
- User greeting with avatar
- "My Work" widget (assigned tasks with filters)
- Last week metrics (completed/edited/new items)
- List and calendar view options

**What's missing compared to Notion, Jira, Linear, Asana, Monday.com, and Jira Align:**

---

## Recommended Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Search Bar / Command Palette]                    [Quick Create] [+]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  FOCUS TODAY                                          [Expand]  │   │
│  │  ─────────────────────────────────────────────────────────────  │   │
│  │  🔴 3 Overdue  │  🟡 5 Due Today  │  🟢 8 Due This Week          │   │
│  │                                                                  │   │
│  │  □ Fix authentication bug          PROJ-123    Due today   P1   │   │
│  │  □ Review PR #456                  CORE-89     Due today   P2   │   │
│  │  □ Update documentation            DOCS-12     Overdue     P2   │   │
│  │  [Show all 8 items...]                                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────┐  ┌────────────────────────────────┐   │
│  │  SPRINT PROGRESS           │  │  GOALS & OKRs                  │   │
│  │  Sprint 24 • 5 days left   │  │                                │   │
│  │  ████████████░░░░░ 72%     │  │  Q1 Revenue ████████░░ 80%     │   │
│  │                            │  │  Ship v2.0  ██████████ 100%    │   │
│  │  Done: 18  In Progress: 5  │  │  Team OKR   ██████░░░░ 60%     │   │
│  │  To Do: 4  Blocked: 1      │  │                                │   │
│  └────────────────────────────┘  └────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────┐  ┌────────────────────────────────┐   │
│  │  RECENTLY VIEWED           │  │  ACTIVITY FEED                 │   │
│  │                            │  │                                │   │
│  │  📄 API Integration        │  │  Alice commented on PROJ-123   │   │
│  │  📄 Dashboard Redesign     │  │  Bob moved CORE-89 to Done     │   │
│  │  📄 Sprint Planning        │  │  You were mentioned in DOCS-12 │   │
│  │  📄 Bug Report #789        │  │  New task assigned to you      │   │
│  │  [View all...]             │  │  [View all activity...]        │   │
│  └────────────────────────────┘  └────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  MY WORK                                         [List][Cal]    │   │
│  │  ─────────────────────────────────────────────────────────────  │   │
│  │  [Filters: Due Date ▼] [Project ▼] [Priority ▼] [Status ▼]     │   │
│  │                                                                  │   │
│  │  Task                    Project     Status      Priority  Due   │   │
│  │  ─────────────────────────────────────────────────────────────  │   │
│  │  Fix auth bug            Core        In Review   High      Mar 6 │   │
│  │  Update API docs         Docs        To Do       Medium    Mar 8 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────┐  ┌────────────────────────────────┐   │
│  │  BLOCKED ITEMS             │  │  WAITING FOR REVIEW            │   │
│  │  Items waiting on others   │  │  Your PRs & tasks for review   │   │
│  │                            │  │                                │   │
│  │  ⚠️ API Integration        │  │  ⏳ PR #456 - 2 days           │   │
│  │     Blocked by: Bob        │  │  ⏳ PROJ-101 - 1 day           │   │
│  └────────────────────────────┘  └────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  QUICK STATS                                                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │ 12       │  │ 8        │  │ 5        │  │ 94%      │        │   │
│  │  │ Completed│  │ Edited   │  │ Created  │  │ On-time  │        │   │
│  │  │ this week│  │ this week│  │ this week│  │ rate     │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Priority 1: Essential Widgets (High Impact)

### 1. Focus Today Widget
**What it does:** Shows the most critical items requiring attention RIGHT NOW

**Features:**
- Overdue items (red alert)
- Due today items (yellow)
- Due this week items (green)
- Quick checkbox to mark complete without navigation
- Drag to reorder priority
- "Focus mode" that shows ONLY these items

**Why it matters (from Jira/Linear/Notion):**
> "When I log in, I need to know what's on fire, what needs attention today, and what's coming up. Don't make me filter or search."

**Data needed:**
```javascript
// New service: getFocusItems(userId, orgId)
{
  overdue: [...],      // Items past due date
  dueToday: [...],     // Items due today
  dueThisWeek: [...],  // Items due within 7 days
  totalCount: 16
}
```

---

### 2. Recently Viewed Widget
**What it does:** Quick access to items you've been working on

**Features:**
- Last 10-15 items viewed
- Shows item type icon, title, project
- Click to navigate instantly
- Timestamp of last view
- Pin favorite items to top

**Why it matters (from Jira/Confluence/Notion):**
> "80% of my work involves items I've already touched. Don't make me search for them again."

**Data needed:**
- Track item views in Firestore: `users/{uid}/recentViews`
- Store: `{ itemId, projectId, viewedAt, title }`

---

### 3. Sprint/Iteration Progress Widget
**What it does:** Shows current sprint status at a glance

**Features:**
- Sprint name and days remaining
- Progress bar (% complete)
- Breakdown: Done / In Progress / To Do / Blocked
- Burndown mini-chart (optional)
- Quick link to sprint board

**Why it matters (from Jira/Azure DevOps):**
> "I need to know if we're on track for the sprint without opening the board."

**Data needed:**
```javascript
// Use existing sprintServices.js
{
  sprintName: "Sprint 24",
  daysRemaining: 5,
  totalItems: 27,
  completed: 18,
  inProgress: 5,
  blocked: 1,
  percentComplete: 72
}
```

---

### 4. Activity Feed Widget
**What it does:** Real-time feed of relevant team activity

**Features:**
- Items assigned to you
- Mentions (@username)
- Comments on your items
- Status changes on watched items
- Team members completing tasks
- Configurable notification preferences

**Why it matters (from Slack/Linear/Notion):**
> "Keep me in the loop without overwhelming me. Show what matters to my work."

**Data needed:**
- New collection: `organisation/{orgId}/activityFeed`
- Or use existing `issueHistory` aggregated

---

### 5. Goals/OKR Progress Widget
**What it does:** Strategic alignment - see how daily work connects to goals

**Features:**
- Current quarter's OKRs/Goals
- Progress bars for each objective
- Key results completion status
- Link to full goals page
- Connection between tasks and goals

**Why it matters (from Jira Align/Asana/Monday.com):**
> "Help me see the bigger picture. My tasks should connect to something meaningful."

**Data needed:**
- Already exists in `okrServices.js`
- Surface top 3-5 relevant goals

---

## Priority 2: Efficiency Features (Medium Impact)

### 6. Quick Create Floating Action Button
**What it does:** Create items from anywhere without navigation

**Features:**
- Floating button (bottom-right) or header button
- Opens modal with smart defaults
- Pre-fill project based on context
- Keyboard shortcut (Cmd/Ctrl + K or N)
- Quick create vs. full create mode

**Implementation:**
```jsx
// Global component in MasterLayout
<QuickCreateButton />
<QuickCreateModal />
```

---

### 7. Global Search / Command Palette
**What it does:** Find anything instantly (Linear-style)

**Features:**
- Cmd/Ctrl + K to open
- Search items, projects, people, goals
- Recent searches
- Quick actions (create, navigate, filter)
- Fuzzy matching

**Why it matters (from Linear/Notion/VS Code):**
> "The fastest users never touch the mouse. Give me a command palette."

---

### 8. Blocked Items Widget
**What it does:** Surface items that can't progress

**Features:**
- Items with "blocked" status
- Items with unresolved dependencies
- Show who/what is blocking
- Quick action to unblock or reassign

**Why it matters (from Jira/Asana):**
> "Blocked items are invisible killers of productivity. Make them visible."

---

### 9. Waiting for Review Widget
**What it does:** Items you've submitted that need others' attention

**Features:**
- Tasks in review status assigned to others
- PRs awaiting review
- Days waiting indicator
- Nudge/ping option

**Why it matters:**
> "I need to know if my work is stuck in someone else's queue."

---

### 10. Favorites/Starred Widget
**What it does:** Pin important items for quick access

**Features:**
- Star any item, project, or goal
- Appears in dashboard widget
- Drag to reorder
- Categories/folders for favorites

**Data needed:**
- `users/{uid}/favorites` collection

---

## Priority 3: Advanced Features (Nice to Have)

### 11. Workload Indicator
**What it does:** Shows your capacity and team's capacity

**Features:**
- Your assigned items count vs. capacity
- Visual indicator (green/yellow/red)
- Team workload overview (for managers)
- Suggest redistribution

---

### 12. Time Tracking Summary
**What it does:** Where you spent time this week

**Features:**
- Hours logged per project
- Hours logged per task type
- Comparison to estimates
- Trends over time

---

### 13. Upcoming Deadlines Calendar
**What it does:** Visual calendar of approaching deadlines

**Features:**
- Mini calendar view
- Color-coded by project
- Click to expand day details
- Sync with external calendars

---

### 14. Team Standup Summary
**What it does:** Quick view of what team members are working on

**Features:**
- Each team member's current task
- Yesterday's completions
- Today's focus
- Blockers reported

---

### 15. Dashboard Customization
**What it does:** Let users personalize their dashboard

**Features:**
- Drag to reorder widgets
- Show/hide widgets
- Widget size options
- Save layout preferences
- Multiple dashboard presets

**Data needed:**
- `users/{uid}/dashboardConfig`

---

## Implementation Roadmap

### Phase 1 (Week 1-2) - Quick Wins
1. ✅ Focus Today Widget - Highest impact
2. ✅ Recently Viewed Widget - Easy to implement
3. ✅ Quick Create Button - User productivity boost

### Phase 2 (Week 3-4) - Core Features
4. Sprint Progress Widget
5. Activity Feed Widget
6. Blocked Items Widget

### Phase 3 (Week 5-6) - Strategic Features
7. Goals/OKR Progress Widget
8. Global Search / Command Palette
9. Waiting for Review Widget

### Phase 4 (Week 7-8) - Polish
10. Dashboard Customization
11. Favorites Widget
12. Workload Indicator

---

## Technical Implementation Notes

### New Services Needed:
```
src/services/
├── dashboardServices.js (extend)
│   ├── getFocusItems()
│   ├── getRecentlyViewed()
│   ├── getBlockedItems()
│   ├── getWaitingForReview()
│   └── getActivityFeed()
└── userPreferencesServices.js (new)
    ├── getUserFavorites()
    ├── getDashboardConfig()
    └── trackItemView()
```

### New Components Needed:
```
src/pages/dashboard/Components/
├── FocusToday.jsx
├── RecentlyViewed.jsx
├── SprintProgress.jsx
├── ActivityFeed.jsx
├── GoalsProgress.jsx
├── BlockedItems.jsx
├── WaitingForReview.jsx
├── Favorites.jsx
├── QuickCreate/
│   ├── QuickCreateButton.jsx
│   └── QuickCreateModal.jsx
└── CommandPalette/
    ├── CommandPalette.jsx
    └── CommandPaletteProvider.jsx
```

### Data Model Additions:
```
users/{uid}/
├── recentViews/          # Recently viewed items
├── favorites/            # Starred items
└── dashboardConfig       # Layout preferences

organisation/{orgId}/
└── activityFeed/         # Team activity stream
```

---

## Competitive Analysis Summary

| Feature | Jira | Linear | Notion | Asana | Monday | Oxygen (Current) | Oxygen (Proposed) |
|---------|------|--------|--------|-------|--------|-----------------|-------------------|
| Focus/Today View | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Recently Viewed | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Sprint Progress | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Activity Feed | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Goals/OKRs | ✅ (Align) | ❌ | ❌ | ✅ | ✅ | Separate page | ✅ |
| Quick Create | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Command Palette | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Blocked Items | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Customization | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| My Work | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Success Metrics

After implementation, measure:
1. **Time to first action** - How quickly users start working after login
2. **Navigation depth** - Fewer clicks to reach important items
3. **Feature adoption** - Usage of new widgets
4. **User satisfaction** - Survey/NPS scores
5. **Task completion rate** - More tasks completed per session

---

## Key Design Principles

1. **Show, don't make search** - Surface critical info automatically
2. **Progressive disclosure** - Summary first, details on demand
3. **Personalization** - Adapt to user's work patterns
4. **Keyboard-first** - Power users should never need a mouse
5. **Real-time** - Activity feed and status should update live
6. **Actionable** - Every widget should have clear next actions
7. **Mobile-friendly** - Works on all screen sizes
