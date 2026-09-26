"use client";

import { useState } from "react";
import {
  CheckSquare,
  Plus,
  Terminal,
  Clock,
  CheckCircle2,
  Layers,
  ArrowRight,
} from "lucide-react";
import type { InternalTask, Employee, TaskStatus, TaskPriority } from "@genz/types";
import { createTaskAction, updateTaskStatusAction } from "./actions";

interface TasksViewClientProps {
  tasks: InternalTask[];
  employees: Employee[];
}

export function TasksViewClient({ tasks, employees }: TasksViewClientProps) {
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await createTaskAction(formData);
    setIsSubmitting(false);
    setShowCreateModal(false);
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    setIsSubmitting(true);
    await updateTaskStatusAction(taskId, newStatus);
    setIsSubmitting(false);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesDept = selectedDept === "all" || t.department === selectedDept;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.assignee_name && t.assignee_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: "todo", label: "To Do", color: "bg-neutral-100 text-neutral-800" },
    { status: "in_progress", label: "In Progress", color: "bg-amber-100 text-amber-900" },
    { status: "in_review", label: "In Review", color: "bg-purple-100 text-purple-900" },
    { status: "done", label: "Completed", color: "bg-emerald-100 text-emerald-900" },
  ];

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 animate-pulse">URGENT</span>;
      case "high":
        return <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">HIGH</span>;
      case "medium":
        return <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-900">MEDIUM</span>;
      default:
        return <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-700">LOW</span>;
    }
  };

  const nextStatusMap: Record<TaskStatus, TaskStatus | null> = {
    todo: "in_progress",
    in_progress: "in_review",
    in_review: "done",
    done: null,
    cancelled: null,
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1A1A18]">
            Task Management & Team Workload
          </h2>
          <p className="text-xs text-[#73736E]">
            Assign and track operational and engineering tasks across the Tech team, Sourcing, and Ops.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-[#E5E5E0] bg-white p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "kanban" ? "bg-black text-white shadow-2xs" : "text-neutral-600 hover:text-black"
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "list" ? "bg-black text-white shadow-2xs" : "text-neutral-600 hover:text-black"
              }`}
            >
              List View
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            <span>Create & Assign Task</span>
          </button>
        </div>
      </div>

      {/* Department Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E5E0] pb-3">
        {[
          { id: "all", label: "All Departments", icon: Layers },
          { id: "tech", label: "Tech Team", icon: Terminal },
          { id: "seller_acquisition", label: "Seller Acquisition", icon: CheckSquare },
          { id: "operations", label: "Operations", icon: Clock },
          { id: "support", label: "Support", icon: CheckCircle2 },
        ].map((dept) => {
          const Icon = dept.icon;
          const active = selectedDept === dept.id;
          return (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                active
                  ? "bg-black text-white shadow-xs"
                  : "bg-white text-[#52524E] border border-[#E5E5E0] hover:border-black/30 hover:text-black"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{dept.label}</span>
              <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${active ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-700"}`}>
                {dept.id === "all"
                  ? tasks.length
                  : tasks.filter((t) => t.department === dept.id).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between rounded-xl border border-[#E5E5E0] bg-white p-2 px-3 shadow-2xs">
        <input
          type="text"
          placeholder="Filter tasks by title, description or assignee..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md bg-transparent text-xs text-[#1A1A18] placeholder-[#8C8C85] outline-none"
        />
        <span className="text-[11px] text-[#8C8C85]">
          Showing <strong>{filteredTasks.length}</strong> tasks
        </span>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                className="flex flex-col rounded-2xl border border-[#E5E5E0] bg-[#F7F6F2] p-3 shadow-2xs min-h-[500px]"
              >
                <div className="flex items-center justify-between border-b border-[#E5E5E0]/70 pb-2 mb-3">
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#73736E]">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-[#E5E5E0] bg-white p-3.5 shadow-2xs transition-all hover:border-black/30 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-700">
                          {task.department.replace(/_/g, " ")}
                        </span>
                        {getPriorityBadge(task.priority)}
                      </div>

                      <h4 className="mt-2 text-xs font-bold text-[#1A1A18] leading-snug">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="mt-1 text-[11px] text-[#73736E] line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-3 pt-2.5 border-t border-[#F0F0EC] flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-[#52524E]">
                          <div className="h-4 w-4 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-bold text-[9px]">
                            {(task.assignee_name || "U")[0]}
                          </div>
                          <span className="truncate max-w-[90px]">
                            {task.assignee_name || "Unassigned"}
                          </span>
                        </div>

                        {nextStatusMap[task.status] && (
                          <button
                            onClick={() => handleUpdateStatus(task.id, nextStatusMap[task.status]!)}
                            disabled={isSubmitting}
                            className="flex items-center gap-1 text-[10px] font-bold text-neutral-800 hover:text-black disabled:opacity-50"
                          >
                            <span>Advance</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-[#E5E5E0] text-center text-xs text-[#8C8C85]">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className="overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E5E5E0] bg-[#FAF8F4] text-[#73736E] font-medium">
              <tr>
                <th className="p-3.5 pl-4">Task</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Assignee</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Due Date</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0EC]">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-[#FAF8F4]/60 transition">
                  <td className="p-3.5 pl-4">
                    <p className="font-bold text-[#1A1A18]">{task.title}</p>
                    {task.description && (
                      <p className="text-[11px] text-[#73736E] line-clamp-1">{task.description}</p>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-800 uppercase">
                      {task.department.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-3.5 font-medium text-black">
                    {task.assignee_name || "Unassigned"}
                  </td>
                  <td className="p-3.5">{getPriorityBadge(task.priority)}</td>
                  <td className="p-3.5">
                    <span className="capitalize font-semibold text-neutral-800">
                      {task.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-3.5 text-[#73736E]">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No deadline"}
                  </td>
                  <td className="p-3.5 pr-4 text-right">
                    {nextStatusMap[task.status] && (
                      <button
                        onClick={() => handleUpdateStatus(task.id, nextStatusMap[task.status]!)}
                        disabled={isSubmitting}
                        className="rounded-lg bg-neutral-100 hover:bg-black hover:text-white px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-50"
                      >
                        Advance ➔
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#E5E5E0] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0F0EC] pb-3">
              <h3 className="font-bold text-black text-base">Create & Assign New Task</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700">Task Title *</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Implement webhook for artisan WhatsApp dispatch"
                  className="mt-1 w-full rounded-xl border border-[#E5E5E0] p-2.5 text-xs text-black outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">Description / Details</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Task specifications, context, or acceptance criteria..."
                  className="mt-1 w-full rounded-xl border border-[#E5E5E0] p-2 text-xs text-black outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Department</label>
                  <select
                    name="department"
                    className="mt-1 w-full rounded-xl border border-[#E5E5E0] p-2.5 text-xs text-black outline-none focus:border-black bg-white"
                  >
                    <option value="tech">Tech Team</option>
                    <option value="seller_acquisition">Seller Acquisition</option>
                    <option value="catalog_operations">Catalog Operations</option>
                    <option value="operations">Operations</option>
                    <option value="support">Support</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Assign To Employee</label>
                  <select
                    name="assignedTo"
                    className="mt-1 w-full rounded-xl border border-[#E5E5E0] p-2.5 text-xs text-black outline-none focus:border-black bg-white"
                  >
                    <option value="">Unassigned</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Priority</label>
                  <select
                    name="priority"
                    className="mt-1 w-full rounded-xl border border-[#E5E5E0] p-2.5 text-xs text-black outline-none focus:border-black bg-white"
                  >
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Due Date</label>
                  <input
                    name="dueDate"
                    type="date"
                    className="mt-1 w-full rounded-xl border border-[#E5E5E0] p-2.5 text-xs text-black outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-[#E5E5E0] px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  Create & Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
