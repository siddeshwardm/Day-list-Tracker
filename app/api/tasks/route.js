import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "tasks.json");

function readTasks() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeTasks(tasks) {
  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
}

export async function GET() {
  const tasks = readTasks();
  return Response.json(tasks);
}

export async function POST(req) {
  const { description } = await req.json();
  const tasks = readTasks();

  const now = new Date().toISOString();

  const newTask = {
    id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
    description,
    status: "todo",
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(newTask);
  writeTasks(tasks);

  return Response.json(newTask);
}

export async function PUT(req) {
  const { id, status } = await req.json();
  const tasks = readTasks();

  const task = tasks.find(t => t.id === id);
  if (!task) return new Response("Not found", { status: 404 });

  task.status = status;
  task.updatedAt = new Date().toISOString();

  writeTasks(tasks);
  return Response.json(task);
}

export async function DELETE(req) {
  const { id } = await req.json();
  const tasks = readTasks().filter(t => t.id !== id);

  writeTasks(tasks);
  return Response.json({ success: true });
}
