# Oxygen Architecture Overview

## Introduction

Oxygen is an open-source work management platform built with React and Firebase. This document provides an overview of the system architecture, key modules, and how they interact.

## System Architecture

Oxygen follows a client-side architecture with Firebase as the backend:

```
┌─────────────────┐     ┌───────────────┐     ┌───────────────────┐
│                 │     │               │     │                   │
│  React Frontend │────▶│ Service Layer │────▶│ Firebase Backend  │
│                 │     │               │     │                   │
└─────────────────┘     └───────────────┘     └───────────────────┘
```

### Key Components

1. **React Frontend**: UI components, state management, and routing
2. **Service Layer**: Abstraction for Firebase interactions
3. **Firebase Backend**: Firestore for data storage, Authentication for user management

## Module Structure

The codebase is organized into the following key modules:

- `/src/modules/`: Contains feature-specific components and logic
  - `/auth/`: Authentication related components
  - `/admin/`: Admin panel components
  - `/Goals/`: OKR and goals tracking
  - `/home/`: Dashboard components
  - `/IssueDetails/`: Issue viewing and editing
  - `/Org/`: Organization management
  - `/Workspace/`: Project workspace components

- `/src/services/`: Service layer for backend interactions
  - `firestore.js`: Core Firebase interactions
  - `itemServices.js`: Issue management services
  - `okrServices.js`: OKR related services
  - `workspaceServices.js`: Workspace management
  - `userServices.js`: User management
  - `sprintServices.js`: Sprint management

- `/src/styles/`: Global styling using SCSS
  - `/core/`: Core styling elements
  - `/layout/`: Layout-specific styles

## Data Flow

1. **User Interaction**: User interacts with React components
2. **Service Calls**: Components call services using React Query
3. **Firebase Operations**: Services perform CRUD operations on Firestore
4. **State Updates**: React Query manages cache and triggers UI updates

## State Management

Oxygen uses a combination of:

1. **React Query**: For server state management
2. **React Context**: For global application state
3. **Component State**: For local UI state

## Authentication Flow

```
┌─────────┐     ┌─────────────┐     ┌───────────────┐     ┌─────────────┐
│         │     │             │     │               │     │             │
│  Login  │────▶│  Firebase   │────▶│  Store Token  │────▶│  Redirect   │
│  Form   │     │  Auth API   │     │  in Storage   │     │  to App     │
│         │     │             │     │               │     │             │
└─────────┘     └─────────────┘     └───────────────┘     └─────────────┘
```

## Deployment Architecture

Oxygen is designed to be deployed on Firebase Hosting with Firebase services:

```
┌─────────────────────┐
│                     │
│  Firebase Hosting   │
│                     │
└─────┬───────────────┘
      │
      │
┌─────▼───────────────┐     ┌───────────────────┐
│                     │     │                   │
│  Firebase Auth      │     │  Firebase         │
│                     │     │  Firestore        │
└─────────────────────┘     └───────────────────┘
```

## Future Architecture Considerations

1. **API Layer**: Introduction of a server-side API for more complex operations
2. **Microservices**: Breaking down functionality into microservices
3. **Real-time Collaboration**: Enhanced WebSocket support for real-time features

## References

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Query Documentation](https://react-query.tanstack.com/)
