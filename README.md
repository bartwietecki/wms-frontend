# WMS Frontend

A React + TypeScript single-page application for the Workforce Management
System (WMS), built with Vite. It provides role-based dashboards for
employees and admins, talks to a Spring Boot REST API, and is secured with
Keycloak (OIDC).

## Related Repositories

- **Backend** -> [wms-backend](https://github.com/bartwietecki/wms-backend)
  (Spring Boot REST API)

## Project Overview

WMS is a small internal tool for tracking how employees spend their working
time and for managing time off.

- **Employee Panel** - log work entries, request leave, track monthly hours,
  and submit monthly reports.
- **Admin Panel** - manage the employee directory and review/approve work
  entries, leave requests and monthly reports.

Access to each panel is controlled by the roles in the user's Keycloak JWT.

## Architecture at a Glance

```
Employee / Admin
    │
    ▼
React Frontend             - SPA built with Vite, role-based routing
    │                         (Employee Panel / Admin Panel)
    │
    ├── Keycloak (OIDC)      - login & token issuance
    │
    │  Authorization: Bearer <JWT>
    ▼
Spring Boot Backend          - REST API
    │
    ▼
PostgreSQL
```

## Features

### Employee

- Log, edit and delete work entries; track monthly hours on a dashboard.
- Submit leave requests (holiday/sick) and view their status.
- Preview, submit and download monthly work reports as PDF.
- View and edit personal profile.

### Admin

- Review and approve/reject work entries, leave requests and monthly reports.
- Manage the employee directory (create, edit, delete, search).
- View dashboard metrics (pending approvals, active employees, employees on leave).

## Technology Stack

| Category         | Technology |
|------------------|------------|
| Language         | TypeScript 5.9 (strict mode) |
| Framework        | React 19, React Router 7 |
| Build tool       | Vite 7 |
| Authentication   | Keycloak (`keycloak-js`, OIDC + PKCE) |
| Styling          | Plain CSS with design tokens, no CSS framework |
| Containerization | Docker, nginx |

## Design Decisions

A few notable choices made in this project:

- **Keycloak + OIDC** - login and session handling are delegated entirely to
  Keycloak; the frontend never sees a password and only deals with tokens.
- **Authorization Code flow with PKCE** - the recommended OIDC flow for
  public clients such as a browser SPA, configured via `keycloak-js`.
- **Route guards (`RequireRole`)** - each panel (`/admin/*`, `/employee/*`) is
  wrapped in a guard that checks the roles in the JWT and redirects users to
  the panel they're allowed to see.
- **Typed API layer** - all backend calls go through small typed functions
  per domain (`src/api/admin`, `src/api/employee`) built on a single shared
  `http` client, instead of calling `fetch` directly from components.
- **Shared UI components** - cards, status badges, page headers and empty
  states are reused across both panels for a consistent look.

## Running with Docker

The frontend can be built as a standalone Docker image using the included
`Dockerfile`.

For the full stack (frontend, backend, Keycloak, PostgreSQL) via Docker
Compose, see [wms-backend](https://github.com/bartwietecki/wms-backend).
