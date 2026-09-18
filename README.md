# Tasks REST API — Node.js + SQLite

A simple REST API for a tasks table containing:

- `id`
- `title`
- `done`

## Project structure

```text
tasks-api/
├── server.js
├── test.js
├── package.json
├── README.md
├── .gitignore
└── tasks.db          # created automatically after the app/test is run
```

## Important database behavior

You do **not** need to manually create `tasks.db`.

When a new person gets the project and runs it, the application automatically creates:

```text
tasks.db
```

and creates the `tasks` table if it does not already exist.

The database is local to that person's copy of the project. It is therefore not necessary to commit `tasks.db` to Git.

## Install

Open a terminal inside the project:

```bash
npm install
```

## Start the API

```bash
npm start
```

The API will run at:

```text
http://localhost:3000
```

## Run all endpoint tests

In another terminal:

```bash
npm test
```

The test program automatically clears the tasks table before testing, then tests every endpoint.

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check that the API is running |
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/:id` | Get one task |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Replace/update a task |
| PATCH | `/api/tasks/:id` | Partially update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

## Example requests

### Create a task

```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Finish my Node.js project",
  "done": false
}
```

### Update a task with PUT

```http
PUT /api/tasks/1
Content-Type: application/json

{
  "title": "Finish my Node.js project",
  "done": true
}
```

### Partially update with PATCH

```http
PATCH /api/tasks/1
Content-Type: application/json

{
  "done": true
}
```

### Delete a task

```http
DELETE /api/tasks/1
```

## Testing

The project uses `supertest` so the endpoints can be tested without manually opening a browser or Postman.

Run:

```bash
npm test
```

You should see output similar to:

```text
Running Tasks API endpoint tests...

✓ GET  /api/health
✓ GET  /api/tasks
✓ POST /api/tasks
✓ GET  /api/tasks/:id
✓ PUT  /api/tasks/:id
✓ PATCH /api/tasks/:id
✓ POST /api/tasks validation
✓ GET  /api/tasks/:id 404 handling
✓ DELETE /api/tasks/:id
✓ DELETE verification

All endpoint tests passed. ✓
```

## Git usage

Because each person should have their own local SQLite database, `tasks.db` is not required in Git.

The `.gitignore` file intentionally does not track it if you add this line:

```text
tasks.db
```

If you want the database to be completely local, add `tasks.db` to `.gitignore`.
