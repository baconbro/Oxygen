# Oxgn

Open-source workspace and project management app built with React and Firebase. It features agile boards, backlog, calendar with drag/drop/resize, custom fields, voting, sprint overlays, and globally unique issue keys per workspace (e.g., MOB-123). Curated workspace avatars and user uploads support fast, visual identification.

- Live features overview
  - Workspaces: acronym (unique key), redirect via `/w/:acronym`, settings, curated and custom avatars
  - Issues: creation, editing, drag/drop priority, voting, custom fields, display keys like `ACRO-42`
  - Calendar: drag & drop, resize, background sprint events
  - Backlog/Board/Kanban/List views with consistent key display and assignees
  - Strong Firestore hygiene: transactions, optimistic updates, deep-clean to remove undefined

Quick links
- Getting started: Setup and run → [docs/getting-started.md](docs/getting-started.md)
- Architecture: App structure and data flow → [docs/architecture.md](docs/architecture.md)
- Workspaces & keys → [docs/workspaces.md](docs/workspaces.md)
- Workspace avatars → [docs/avatars.md](docs/avatars.md)
- Issues & lists → [docs/issues.md](docs/issues.md)
- Custom fields → [docs/custom-fields.md](docs/custom-fields.md)
- Calendar & sprints → [docs/calendar.md](docs/calendar.md)
- Voting → [docs/voting.md](docs/voting.md)
- Data model → [docs/data-model.md](docs/data-model.md)

Community
- Contributing guide → [CONTRIBUTING.md](../CONTRIBUTING.md)
- Code of Conduct → [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)
- Security policy → [SECURITY.md](../SECURITY.md)

License
- MIT © 2025 Oxgn Contributors. See [LICENSE](../LICENSE).
