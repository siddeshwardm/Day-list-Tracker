# Task Tracker

A simple Task Tracker built with Next.js App Router. Create tasks, update status, and delete items. Tasks are persisted to a local JSON file so the app works without a database.

## Features

- Add a task
- Update status (`todo` → `in-progress` → `done`)
- Delete a task
- File-based persistence via `tasks.json`

## Tech Stack

- Next.js (App Router)
- Tailwind CSS
- Route handlers under `app/api/*`

## Getting Started

### Prerequisites

- Node.js 18+ recommended

### Install

```bash
npm install
```

### Run (development)

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — create production build
- `npm run start` — run production server (after build)
- `npm run lint` — lint the codebase

## API

All task operations are handled by `app/api/tasks/route.js`.

### `GET /api/tasks`

Returns an array of tasks.

### `POST /api/tasks`

Creates a new task.

Request body:

```json
{ "description": "Buy milk" }
```

### `PUT /api/tasks`

Updates a task status.

Request body:

```json
{ "id": 1, "status": "in-progress" }
```

### `DELETE /api/tasks`

Deletes a task.

Request body:

```json
{ "id": 1 }
```

## Data Storage Notes

- Tasks are stored in a JSON file at the project root: `tasks.json`.
- This approach is great for demos and local development.
- If you deploy to a serverless platform (or multiple instances), file writes may not persist as expected. For production, replace the file storage with a database.

## Project Structure (high level)

```text
app/
	page.tsx            # UI
	api/
		tasks/route.js    # API handlers (GET/POST/PUT/DELETE)
tasks.json            # File-based data store
```
