"use client";

import { useEffect, useState } from "react";

type Task = {
  id: number;
  description: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

function statusBadge(status: string) {
  switch (status) {
    case "done":
      return {
        label: "Done",
        className: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
      };
    case "in-progress":
      return {
        label: "In progress",
        className: "bg-sky-100 text-sky-800 ring-1 ring-sky-200",
      };
    case "todo":
    default:
      return {
        label: "Todo",
        className: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
      };
  }
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    fetch("/api/tasks")
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        if (ignore) return;
        setTasks(Array.isArray(data) ? (data as Task[]) : []);
        setError(null);
      })
      .catch(err => {
        if (ignore) return;
        console.error(err);
        setTasks([]);
        setError("Failed to load tasks");
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function fetchTasks() {
    const res = await fetch("/api/tasks");
    if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.status}`);
    const data: unknown = await res.json();
    setTasks(Array.isArray(data) ? (data as Task[]) : []);
  }

  async function addTask() {
    if (!description.trim()) return;
    setError(null);

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: description.trim() }),
    });

    if (!res.ok) {
      setError("Failed to add task");
      return;
    }

    setDescription("");
    await fetchTasks();
  }

  async function updateStatus(id: number, status: string) {
    setError(null);

    const res = await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    if (!res.ok) {
      setError("Failed to update task");
      return;
    }

    await fetchTasks();
  }

  async function deleteTask(id: number) {
    setError(null);

    const res = await fetch("/api/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      setError("Failed to delete task");
      return;
    }

    await fetchTasks();
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-indigo-500/10 via-sky-500/10 to-emerald-500/10 p-6 text-slate-900 sm:p-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="bg-linear-to-r from-indigo-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent">
              Task Tracker
            </span>
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Add tasks, update progress, and mark them done.
          </p>
        </header>

        <div className="rounded-2xl border border-white/60 bg-white/90 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200"
            placeholder="New task..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <button
            className="inline-flex items-center justify-center rounded-lg bg-linear-to-r from-indigo-600 to-sky-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-sky-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            onClick={addTask}
          >
            Add task
          </button>
          </div>

        {error ? (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

          {tasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <p className="text-sm font-medium text-slate-700">No tasks yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Add your first task above.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {tasks.map(task => {
                const badge = statusBadge(task.status);
                return (
                  <li
                    key={task.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="wrap-break-word font-semibold text-slate-900">
                          {task.description}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      {task.updatedAt ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Updated {new Date(task.updatedAt).toLocaleString()}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateStatus(task.id, "todo")}
                        className="rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 ring-1 ring-amber-200 transition hover:bg-amber-100"
                        aria-label="Mark todo"
                        title="Mark todo"
                      >
                        Todo
                      </button>
                      <button
                        onClick={() => updateStatus(task.id, "in-progress")}
                        className="rounded-lg bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-800 ring-1 ring-sky-200 transition hover:bg-sky-100"
                        aria-label="Mark in progress"
                        title="Mark in progress"
                      >
                        In progress
                      </button>
                      <button
                        onClick={() => updateStatus(task.id, "done")}
                        className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200 transition hover:bg-emerald-100"
                        aria-label="Mark done"
                        title="Mark done"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-800 ring-1 ring-rose-200 transition hover:bg-rose-100"
                        aria-label="Delete"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
