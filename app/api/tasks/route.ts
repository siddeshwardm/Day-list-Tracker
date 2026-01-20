import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

type TaskStatus = "todo" | "in-progress" | "done";

type Task = {
  id: number;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

const filePath = path.join(process.cwd(), "tasks.json");

function ensureTasksFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]), "utf-8");
  }
}

function readTasks(): Task[] {
  ensureTasksFile();

  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) return [];
  return parsed as Task[];
}

function writeTasks(tasks: Task[]) {
  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), "utf-8");
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === "todo" || value === "in-progress" || value === "done";
}

export async function GET() {
  return NextResponse.json(readTasks());
}

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const { description } = body as { description?: unknown };
  if (typeof description !== "string" || !description.trim()) {
    return NextResponse.json(
      { message: "description is required" },
      { status: 400 },
    );
  }

  const tasks = readTasks();
  const now = new Date().toISOString();

  const lastId = tasks.length ? tasks[tasks.length - 1]!.id : 0;
  const newTask: Task = {
    id: lastId + 1,
    description: description.trim(),
    status: "todo",
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(newTask);
  writeTasks(tasks);

  return NextResponse.json(newTask);
}

export async function PUT(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const { id, status } = body as { id?: unknown; status?: unknown };
  if (typeof id !== "number" || !Number.isFinite(id)) {
    return NextResponse.json({ message: "id must be a number" }, { status: 400 });
  }
  if (!isTaskStatus(status)) {
    return NextResponse.json(
      { message: "status must be todo | in-progress | done" },
      { status: 400 },
    );
  }

  const tasks = readTasks();
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  task.status = status;
  task.updatedAt = new Date().toISOString();
  writeTasks(tasks);

  return NextResponse.json(task);
}

export async function DELETE(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const { id } = body as { id?: unknown };
  if (typeof id !== "number" || !Number.isFinite(id)) {
    return NextResponse.json({ message: "id must be a number" }, { status: 400 });
  }

  const tasks = readTasks();
  const nextTasks = tasks.filter(t => t.id !== id);
  writeTasks(nextTasks);

  return NextResponse.json({ success: true });
}
