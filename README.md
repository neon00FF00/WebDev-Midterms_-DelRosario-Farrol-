# PulseDesk

PulseDesk is a full-stack IT incident management desk for reporting, tracking, and resolving operational issues.

## Features

- JWT authentication with bcryptjs password hashing
- Zod request validation
- Incident create, list, update, and delete operations
- React Context API and `useReducer` state management
- Severity levels: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- Incident statuses: `OPEN`, `IN_PROGRESS`, `RESOLVED`

## Stack

- Backend: Node.js, Express, TypeScript, JWT, bcryptjs, Zod
- Frontend: React, TypeScript, Vite, Lucide React

## Project Structure

```text
PulseDesk/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── validate.ts
│   │   ├── schemas/
│   │   │   ├── incident.ts
│   │   │   └── incident.schema.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── IncidentContext.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── README.md
└── readme
```

## Requirements

- Node.js 18 or newer
- npm

## Run Locally

Start the backend in one terminal:

```powershell
cd backend
npm install
npm run dev
```

The API runs at `http://localhost:5000`.

Start the frontend in a second terminal:

```powershell
cd frontend
npm install
npm start
```

The client runs at `http://localhost:3000`.

## Using the App

1. Open `http://localhost:3000`.
2. Register a user account with an email and password.
3. Sign in and create an incident with a title, description, and severity.
4. Update an incident status or delete it from the dashboard.

## API Routes

| Method | Route | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | Register a user and return a JWT |
| `POST` | `/api/auth/login` | No | Authenticate a user and return a JWT |
| `GET` | `/api/incidents` | Bearer token | List incidents |
| `POST` | `/api/incidents` | Bearer token | Create an incident |
| `PUT` | `/api/incidents/:id` | Bearer token | Update an incident |
| `DELETE` | `/api/incidents/:id` | Bearer token | Delete an incident |

## Build Checks

```powershell
cd backend
npm run build

cd ..\frontend
npm run build
```

## Storage Note

The backend currently uses in-memory arrays for users and incidents. All data is reset when the backend process restarts. A database should be added before production use.
