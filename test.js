const request = require("supertest");
const fs = require("fs");
const path = require("path");

const { app, db, DB_FILE } = require("./server");

function check(condition, message) {
  if (!condition) throw new Error(message);
}

async function runTests() {
  console.log("\nRunning Tasks API endpoint tests...\n");

  // Start each test run with a clean local database.
  // In normal use, tasks.db is created automatically if it does not exist.
  await new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("DELETE FROM tasks", (err) => err ? reject(err) : resolve());
    });
  });

  let taskId;

  // 1. Health endpoint
  let response = await request(app).get("/api/health");
  check(response.status === 200, "GET /api/health failed");
  check(response.body.status === "ok", "Health response is incorrect");
  console.log("✓ GET  /api/health");

  // 2. GET all tasks - initially empty
  response = await request(app).get("/api/tasks");
  check(response.status === 200, "GET /api/tasks failed");
  check(Array.isArray(response.body), "GET /api/tasks should return an array");
  console.log("✓ GET  /api/tasks");

  // 3. POST task
  response = await request(app)
    .post("/api/tasks")
    .send({ title: "Learn Node.js", done: false });

  check(response.status === 201, "POST /api/tasks failed");
  check(response.body.title === "Learn Node.js", "Created task title is incorrect");
  check(response.body.done === false, "Created task done value is incorrect");
  taskId = response.body.id;
  console.log("✓ POST /api/tasks");

  // 4. GET one task
  response = await request(app).get(`/api/tasks/${taskId}`);
  check(response.status === 200, "GET /api/tasks/:id failed");
  check(response.body.id === taskId, "Returned task ID is incorrect");
  console.log("✓ GET  /api/tasks/:id");

  // 5. PUT task
  response = await request(app)
    .put(`/api/tasks/${taskId}`)
    .send({ title: "Learn Express and SQLite", done: true });

  check(response.status === 200, "PUT /api/tasks/:id failed");
  check(response.body.done === true, "PUT did not update done");
  check(response.body.title === "Learn Express and SQLite", "PUT did not update title");
  console.log("✓ PUT  /api/tasks/:id");

  // 6. PATCH task
  response = await request(app)
    .patch(`/api/tasks/${taskId}`)
    .send({ done: false });

  check(response.status === 200, "PATCH /api/tasks/:id failed");
  check(response.body.done === false, "PATCH did not update done");
  check(response.body.title === "Learn Express and SQLite", "PATCH changed title unexpectedly");
  console.log("✓ PATCH /api/tasks/:id");

  // 7. Validation test
  response = await request(app)
    .post("/api/tasks")
    .send({ title: "" });

  check(response.status === 400, "Validation endpoint behavior failed");
  console.log("✓ POST /api/tasks validation");

  // 8. Not-found test
  response = await request(app).get("/api/tasks/999999");
  check(response.status === 404, "Not-found behavior failed");
  console.log("✓ GET  /api/tasks/:id 404 handling");

  // 9. DELETE task
  response = await request(app).delete(`/api/tasks/${taskId}`);
  check(response.status === 204, "DELETE /api/tasks/:id failed");
  console.log("✓ DELETE /api/tasks/:id");

  // 10. Confirm deletion
  response = await request(app).get(`/api/tasks/${taskId}`);
  check(response.status === 404, "Deleted task still exists");
  console.log("✓ DELETE verification");

  console.log("\nAll endpoint tests passed. ✓\n");
}

runTests()
  .catch((error) => {
    console.error("\nTEST FAILED:", error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    setTimeout(() => db.close(), 100);
  });