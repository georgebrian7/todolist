 # Task API

A small in-memory CRUD API for managing a to-do list, built with Node.js and Express as part of the FlyRank Internship Backend Track (Week 2, Assignment A1). Supports creating, reading, updating, and deleting tasks, with interactive documentation served through Swagger UI.

## How to run it

```bash
npm install
node server.js
```

The server starts on `http://localhost:3000`.

## Endpoints

| Method | Path          | Description        |
|--------|---------------|---------------------|
| GET    | `/`           | API info            |
| GET    | `/health`     | Health check         |
| GET    | `/tasks`      | List all tasks       |
| GET    | `/tasks/:id`  | Get one task by id   |
| POST   | `/tasks`      | Create a new task     |
| PUT    | `/tasks/:id`  | Update a task by id   |
| DELETE | `/tasks/:id`  | Delete a task by id   |

## Example request

```
$ curl -i http://localhost:3000/tasks/1
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":1,"title":"cleaning","done":false}
```

## Swagger UI

Interactive API docs are served at `http://localhost:3000/docs`. Every endpoint listed above can be tried directly from the browser.

![Swagger UI screenshot]

<img src="/image.png" alt="mysql" width="500" height="500"/>

Exploring the database directly

The database can be opened and queried by hand in DB Browser for SQLite. Example query run in Stage 4:

sql
SELECT * FROM tasks WHERE done = 1;

This returned only the tasks marked as completed — confirming the API and DB Browser read and write the exact same file, with no syncing step involved: a change made in one is visible in the other instantly.