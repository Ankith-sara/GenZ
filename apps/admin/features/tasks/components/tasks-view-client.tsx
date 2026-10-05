"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  X,
  Calendar,
  ArrowRight,
  CheckCircle2,
  LayoutGrid,
  List,
  Loader2,
  Flag,
  ChevronDown,
  Check,
  AlertTriangle,
  ArrowUpDown,
  ClipboardList,
  PartyPopper,
} from "lucide-react";
import type {
  InternalTask,
  Employee,
  TaskStatus,
  TaskPriority,
  TaskEntityType,
} from "@genz/types";
import { createTaskAction, updateTaskStatusAction } from "../actions";

interface TasksViewClientProps {
  tasks: InternalTask[];
  employees: Employee[];
}

/* ─── Constants ─── */
const STATUS: Record<TaskStatus, { label: string; dot: string; chip: string }> = {
  todo: {
    label: "To do",
    dot: "bg-on-surface-variant",
    chip: "bg-surface-container text-on-surface",
  },
  in_progress: {
    label: "In progress",
    dot: "bg-warning",
    chip: "bg-warning-container text-on-warning-container",
  },
  in_review: {
    label: "In review",
    dot: "bg-[#7c3aed]",
    chip: "bg-[#ede9fe] text-[#5b21b6]",
  },
  done: {
    label: "Done",
    dot: "bg-success",
    chip: "bg-success-container text-on-success-container",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-outline",
    chip: "bg-surface-container text-on-surface-variant",
  },
};
const PRIORITY: Record<TaskPriority, { label: string; rank: number; chip: string }> = {
  urgent: {
    label: "Urgent",
    rank: 0,
    chip: "bg-error-container text-on-error-container",
  },
  high: {
    label: "High",
    rank: 1,
    chip: "bg-warning-container text-on-warning-container",
  },
  medium: {
    label: "Medium",
    rank: 2,
    chip: "bg-secondary-container text-on-secondary-container",
  },
  low: { label: "Low", rank: 3, chip: "bg-surface-container text-on-surface-variant" },
};
const BOARD: TaskStatus[] = ["todo", "in_progress", "in_review", "done"];
const NEXT: Partial<Record<TaskStatus, { to: TaskStatus; label: string }>> = {
  todo: { to: "in_progress", label: "Start" },
  in_progress: { to: "in_review", label: "Send to review" },
  in_review: { to: "done", label: "Complete" },
};
const DEPARTMENTS = [
  { id: "tech", label: "Tech" },
  { id: "seller_acquisition", label: "Seller acquisition" },
  { id: "catalog_operations", label: "Catalog operations" },
  { id: "operations", label: "Operations" },
  { id: "support", label: "Support" },
  { id: "admin", label: "Admin" },
];
const DAY = 86_400_000;
const closed = (s: TaskStatus) => s === "done" || s === "cancelled";
const dueMs = (d?: string | null) => (d ? new Date(d).getTime() : NaN);
const isOverdue = (t: InternalTask) =>
  !closed(t.status) && dueMs(t.due_date) < Date.now();
const isSoon = (t: InternalTask) => {
  const diff = dueMs(t.due_date) - Date.now();
  return !closed(t.status) && diff >= 0 && diff < 2 * DAY;
};
const fmtDue = (d?: string | null) =>
  d && !isNaN(dueMs(d))
    ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "No date";
const deptLabel = (id: string) =>
  DEPARTMENTS.find((d) => d.id === id)?.label ?? id.replace(/_/g, " ");

type SortKey = "due" | "priority" | "title";
const SORTS: { value: SortKey; label: string }[] = [
  { value: "due", label: "Due soonest" },
  { value: "priority", label: "Highest priority" },
  { value: "title", label: "Title A–Z" },
];

/* ─── Pieces ─── */
function Dropdown<T extends string>({
  value,
  onChange,
  options,
  allValue,
  icon,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  allValue?: T;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) =>
      !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const current = options.find((o) => o.value === value);
  const active = allValue !== undefined && value !== allValue;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border px-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
          active
            ? "bg-secondary-container text-on-secondary-container border-transparent"
            : "border-outline-variant text-on-surface hover:bg-surface-container-low"
        }`}
      >
        {icon}
        {current?.label}
        {current?.count !== undefined && active && (
          <span className="bg-surface-container-high/70 rounded-full px-2 text-xs tabular-nums">
            {current.count}
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className="bg-surface-container-lowest shadow-elevation-2 absolute top-12 left-0 z-30 min-w-48 rounded-xl py-2"
        >
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className="text-on-surface hover:bg-surface-container-low flex h-10 w-full cursor-pointer items-center gap-3 px-4 text-sm"
              >
                <span className="w-4">
                  {o.value === value && <Check className="text-primary h-4 w-4" />}
                </span>
                <span className="flex-1 text-left">{o.label}</span>
                {o.count !== undefined && (
                  <span className="text-on-surface-variant text-xs tabular-nums">
                    {o.count}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${PRIORITY[priority].chip}`}
    >
      <Flag className="h-2.5 w-2.5" />
      {PRIORITY[priority].label}
    </span>
  );
}

function Avatar({ name, size = 24 }: { name?: string | null; size?: number }) {
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${
        name
          ? "bg-primary text-on-primary"
          : "bg-surface-container text-on-surface-variant"
      }`}
    >
      {(name || "?")[0].toUpperCase()}
    </span>
  );
}

function Due({ task, className = "" }: { task: InternalTask; className?: string }) {
  const tone = isOverdue(task)
    ? "text-[#ef4444] font-semibold"
    : isSoon(task)
      ? "text-warning font-medium"
      : "text-on-surface-variant";
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${tone} ${className}`}>
      {isOverdue(task) ? (
        <AlertTriangle className="h-3 w-3" />
      ) : (
        <Calendar className="h-3 w-3" />
      )}
      {fmtDue(task.due_date)}
    </span>
  );
}

function FormDropdown<T extends string>({
  label,
  name,
  value,
  onChange,
  options,
  icon,
}: {
  label: string;
  name: string;
  value: T;
  onChange: (val: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode; secondary?: string }[];
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) =>
      !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const current = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative space-y-1.5">
      <label className="text-on-surface-variant text-xs font-medium">{label}</label>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low focus:border-primary flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border px-3.5 text-sm transition focus:ring-1 focus:outline-none"
      >
        <span className="flex items-center gap-2 truncate">
          {current?.icon || icon}
          <span className="text-on-surface font-medium">{current?.label}</span>
          {current?.secondary && (
            <span className="text-on-surface-variant text-xs font-normal">
              {current.secondary}
            </span>
          )}
        </span>
        <ChevronDown
          className={`text-on-surface-variant h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="border-outline-variant/60 bg-surface-container-lowest shadow-elevation-2 absolute top-full left-0 z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border py-1.5"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`hover:bg-surface-container-low flex h-10 w-full cursor-pointer items-center justify-between px-3.5 text-sm transition-colors ${
                    isSelected
                      ? "bg-secondary-container text-on-secondary-container font-medium"
                      : "text-on-surface"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {opt.icon}
                    <span>{opt.label}</span>
                    {opt.secondary && (
                      <span className="text-on-surface-variant text-xs font-normal">
                        {opt.secondary}
                      </span>
                    )}
                  </span>
                  {isSelected && <Check className="text-primary h-4 w-4 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ═══════════════ MAIN ═══════════════ */
export function TasksViewClient({
  tasks: serverTasks,
  employees,
}: TasksViewClientProps) {
  const [view, setView] = useState<"board" | "list">("board");
  const [query, setQuery] = useState("");
  const [fStatus, setFStatus] = useState<"all" | TaskStatus>("all");
  const [fPriority, setFPriority] = useState<"all" | TaskPriority>("all");
  const [fDept, setFDept] = useState("all");
  const [fAssignee, setFAssignee] = useState("all");
  const [fDue, setFDue] = useState<"any" | "attention" | "overdue" | "soon" | "none">(
    "any"
  );
  const [sort, setSort] = useState<SortKey>("due");

  const [createOpen, setCreateOpen] = useState(false);
  const [createDept, setCreateDept] = useState("tech");
  const [createAssignee, setCreateAssignee] = useState("");
  const [createPriority, setCreatePriority] = useState<TaskPriority>("medium");
  const [createDueDate, setCreateDueDate] = useState("");
  const [createEntityType, setCreateEntityType] = useState<TaskEntityType>("general");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);
  const [snack, setSnack] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, TaskStatus>>({});
  const searchRef = useRef<HTMLInputElement>(null);

  const tasks = useMemo(
    () =>
      serverTasks.map((t) => (overrides[t.id] ? { ...t, status: overrides[t.id] } : t)),
    [serverTasks, overrides]
  );

  useEffect(() => {
    if (!snack) return;
    const id = setTimeout(() => setSnack(null), 3200);
    return () => clearTimeout(id);
  }, [snack]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(tag)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSelectedId(null);
        setCreateOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const changeStatus = async (id: string, to: TaskStatus, quiet = false) => {
    const prev = tasks.find((t) => t.id === id)?.status;
    if (!prev || prev === to) return;
    setOverrides((o) => ({ ...o, [id]: to }));
    try {
      await updateTaskStatusAction(id, to);
      if (!quiet) setSnack(`Moved to ${STATUS[to].label.toLowerCase()}`);
    } catch {
      setOverrides((o) => ({ ...o, [id]: prev }));
      setSnack("Couldn't update the task. Try again.");
    }
  };

  const bulkMove = async (to: TaskStatus) => {
    const ids = Array.from(checked);
    setPending(true);
    await Promise.all(ids.map((id) => changeStatus(id, to, true)));
    setPending(false);
    setChecked(new Set());
    setSnack(`${ids.length} tasks moved to ${STATUS[to].label.toLowerCase()}`);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    try {
      await createTaskAction(new FormData(e.currentTarget));
      setCreateOpen(false);
      setCreateDept("tech");
      setCreateAssignee("");
      setCreatePriority("medium");
      setCreateDueDate("");
      setCreateEntityType("general");
      setSnack("Task created");
    } catch {
      setSnack("Couldn't create the task. Check the fields and try again.");
    } finally {
      setPending(false);
    }
  };

  /* ─── Derived data ─── */
  const assignees = useMemo(
    () =>
      Array.from(
        new Set(tasks.map((t) => t.assignee_name).filter(Boolean))
      ) as string[],
    [tasks]
  );
  const open = tasks.filter((t) => !closed(t.status));
  const stats = {
    open: open.length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    inReview: tasks.filter((t) => t.status === "in_review").length,
    done: tasks.filter((t) => t.status === "done").length,
    overdue: open.filter(isOverdue).length,
    soon: open.filter(isSoon).length,
  };
  const attention = stats.overdue + stats.soon;
  const onTrack = Math.max(open.length - attention, 0);
  const pct = (n: number) => (open.length ? (n / open.length) * 100 : 0);
  const rate = tasks.length ? Math.round((stats.done / tasks.length) * 100) : 0;

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const byDue = (a: InternalTask, b: InternalTask) => {
      const x = dueMs(a.due_date),
        y = dueMs(b.due_date);
      return (isNaN(x) ? Infinity : x) - (isNaN(y) ? Infinity : y);
    };
    return tasks
      .filter((t) => {
        if (fStatus === "all" ? t.status === "cancelled" : t.status !== fStatus)
          return false;
        if (fPriority !== "all" && t.priority !== fPriority) return false;
        if (fDept !== "all" && t.department !== fDept) return false;
        if (
          fAssignee === "unassigned"
            ? !!t.assignee_name
            : fAssignee !== "all" && t.assignee_name !== fAssignee
        )
          return false;
        if (fDue === "attention" && !(isOverdue(t) || isSoon(t))) return false;
        if (fDue === "overdue" && !isOverdue(t)) return false;
        if (fDue === "soon" && !isSoon(t)) return false;
        if (fDue === "none" && t.due_date) return false;
        return (
          !q ||
          t.title.toLowerCase().includes(q) ||
          !!t.description?.toLowerCase().includes(q) ||
          !!t.assignee_name?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) =>
        sort === "title"
          ? a.title.localeCompare(b.title)
          : sort === "priority"
            ? PRIORITY[a.priority].rank - PRIORITY[b.priority].rank || byDue(a, b)
            : byDue(a, b)
      );
  }, [tasks, query, fStatus, fPriority, fDept, fAssignee, fDue, sort]);

  const filterActive =
    fStatus !== "all" ||
    fPriority !== "all" ||
    fDept !== "all" ||
    fAssignee !== "all" ||
    fDue !== "any" ||
    !!query;
  const clearAll = () => {
    setQuery("");
    setFStatus("all");
    setFPriority("all");
    setFDept("all");
    setFAssignee("all");
    setFDue("any");
  };
  const selected = tasks.find((t) => t.id === selectedId) || null;
  const count = (fn: (t: InternalTask) => boolean) => tasks.filter(fn).length;
  const visibleCols = fStatus === "cancelled" ? (["cancelled"] as TaskStatus[]) : BOARD;
  const allChecked = filtered.length > 0 && filtered.every((t) => checked.has(t.id));

  /* ─── Board card ─── */
  const card = (task: InternalTask) => {
    const next = NEXT[task.status];
    return (
      <div
        key={task.id}
        draggable
        onDragStart={(e) => e.dataTransfer.setData("text/task-id", task.id)}
        onClick={() => setSelectedId(task.id)}
        className="bg-surface-container-lowest border-outline-variant/50 hover:shadow-elevation-1 cursor-grab rounded-xl border p-3.5 transition-shadow active:cursor-grabbing"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-on-surface-variant truncate text-xs">
            {deptLabel(task.department)}
          </span>
          <PriorityBadge priority={task.priority} />
        </div>
        <h4 className="text-on-surface mt-2 text-sm leading-snug font-medium">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-on-surface-variant mt-1 line-clamp-2 text-xs leading-relaxed">
            {task.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <Avatar name={task.assignee_name} size={22} />
            <span className="text-on-surface-variant max-w-[90px] truncate text-xs">
              {task.assignee_name || "Unassigned"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {task.due_date && <Due task={task} />}
            {next && (
              <button
                type="button"
                title={next.label}
                aria-label={next.label}
                onClick={(e) => {
                  e.stopPropagation();
                  changeStatus(task.id, next.to);
                }}
                className="bg-secondary-container text-on-secondary-container hover:bg-primary hover:text-on-primary flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const statCell = (label: string, value: number | string, hint: string) => (
    <div className="px-6 py-5">
      <p className="text-on-surface-variant text-sm">{label}</p>
      <p className="text-on-surface mt-3 text-3xl font-semibold tabular-nums">
        {value}
      </p>
      <p className="text-on-surface-variant mt-2 text-sm">{hint}</p>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-on-surface text-3xl font-normal tracking-tight sm:text-[34px]">
            Tasks
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm sm:text-base">
            Assign work, track deadlines and move tasks from to do to done.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="bg-primary text-on-primary hover:shadow-elevation-2 inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-xl px-5 text-sm font-semibold tracking-wide uppercase transition-shadow"
        >
          <Plus className="h-4 w-4" />
          Create task
        </button>
      </div>

      {/* ─── Overview: stats strip + attention card ─── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_1fr]">
        <div className="border-outline-variant/50 bg-surface-container-lowest shadow-elevation-1 md:divide-outline-variant/40 grid grid-cols-2 divide-x-0 overflow-hidden rounded-3xl border md:grid-cols-4 md:divide-x">
          {statCell("Open", stats.open, "Not completed yet")}
          {statCell("In progress", stats.inProgress, "Being worked on")}
          {statCell("In review", stats.inReview, "Waiting for sign-off")}
          {statCell("Completed", `${rate}%`, `${stats.done} of ${tasks.length} tasks`)}
        </div>

        <div
          className={`rounded-3xl p-6 ${attention > 0 ? "bg-[#ffe3d1] text-[#4a2410]" : "bg-success-container text-on-success-container"}`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            {attention > 0 ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <PartyPopper className="h-4 w-4" />
            )}
            {attention > 0 ? "Deadlines need attention" : "Deadlines on track"}
          </div>
          <p className="mt-3 text-xl leading-snug">
            {open.length === 0
              ? "No open tasks right now."
              : attention > 0
                ? `${attention} of ${open.length} open tasks are overdue or due soon`
                : `All ${open.length} open tasks are on schedule`}
          </p>
          <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-black/10">
            <span
              className="bg-[#ef4444]"
              style={{ width: `${pct(stats.overdue)}%` }}
            />
            <span className="bg-warning" style={{ width: `${pct(stats.soon)}%` }} />
            <span className="bg-success" style={{ width: `${pct(onTrack)}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span>{stats.overdue} overdue</span>
            <span>{stats.soon} due in 2 days</span>
            <span>{onTrack} on track</span>
          </div>
          {attention > 0 && (
            <button
              type="button"
              onClick={() => {
                setFDue("attention");
                setFStatus("all");
              }}
              className="mt-4 inline-flex h-10 cursor-pointer items-center rounded-full bg-[#4a2410] px-5 text-sm font-semibold text-white"
            >
              Review {attention} {attention === 1 ? "task" : "tasks"}
            </button>
          )}
        </div>
      </div>

      {/* ─── Tasks card ─── */}
      <section
        className="border-outline-variant/50 bg-surface-container-lowest shadow-elevation-1 overflow-hidden rounded-3xl border"
        aria-label="Tasks"
      >
        {/* Row 1: title, search, sort, view */}
        <div className="flex flex-wrap items-center gap-3 px-6 pt-5">
          <h2 className="text-on-surface text-2xl font-normal">Tasks</h2>
          <span className="text-on-surface-variant text-sm">
            {filtered.length === tasks.filter((t) => t.status !== "cancelled").length
              ? `${filtered.length} tasks`
              : `${filtered.length} of ${tasks.length} tasks`}
          </span>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="text-on-surface-variant pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks..."
                className="bg-surface-container text-on-surface placeholder:text-on-surface-variant/70 focus:ring-primary h-10 w-full rounded-full pr-9 pl-10 text-sm outline-none focus:ring-2"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-on-surface-variant hover:text-on-surface absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Dropdown
              value={sort}
              onChange={setSort}
              options={SORTS}
              icon={<ArrowUpDown className="h-4 w-4" />}
            />
            <div
              className="bg-surface-container inline-flex h-10 items-center rounded-full p-1"
              role="group"
              aria-label="View"
            >
              {(
                [
                  ["board", LayoutGrid, "Board"],
                  ["list", List, "List"],
                ] as const
              ).map(([k, Icon, l]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={view === k}
                  onClick={() => setView(k)}
                  className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-medium ${
                    view === k
                      ? "bg-surface-container-lowest text-on-surface shadow-xs"
                      : "text-on-surface-variant"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-4">
          <Dropdown
            value={fStatus}
            onChange={setFStatus}
            allValue="all"
            options={[
              {
                value: "all",
                label: "All statuses",
                count: count((t) => t.status !== "cancelled"),
              },
              ...(Object.keys(STATUS) as TaskStatus[]).map((s) => ({
                value: s,
                label: STATUS[s].label,
                count: count((t) => t.status === s),
              })),
            ]}
          />
          <Dropdown
            value={fPriority}
            onChange={setFPriority}
            allValue="all"
            options={[
              { value: "all", label: "All priorities", count: tasks.length },
              ...(Object.keys(PRIORITY) as TaskPriority[]).map((p) => ({
                value: p,
                label: PRIORITY[p].label,
                count: count((t) => t.priority === p),
              })),
            ]}
          />
          <Dropdown
            value={fDept}
            onChange={setFDept}
            allValue="all"
            options={[
              { value: "all", label: "All departments", count: tasks.length },
              ...DEPARTMENTS.map((d) => ({
                value: d.id,
                label: d.label,
                count: count((t) => t.department === d.id),
              })),
            ]}
          />
          <Dropdown
            value={fAssignee}
            onChange={setFAssignee}
            allValue="all"
            options={[
              { value: "all", label: "Everyone", count: tasks.length },
              {
                value: "unassigned",
                label: "Unassigned",
                count: count((t) => !t.assignee_name),
              },
              ...assignees.map((a) => ({
                value: a,
                label: a,
                count: count((t) => t.assignee_name === a),
              })),
            ]}
          />
          <Dropdown
            value={fDue}
            onChange={setFDue}
            allValue="any"
            options={[
              { value: "any", label: "Any deadline" },
              { value: "attention", label: "Needs attention", count: attention },
              { value: "overdue", label: "Overdue", count: stats.overdue },
              { value: "soon", label: "Due in 2 days", count: stats.soon },
              { value: "none", label: "No deadline", count: count((t) => !t.due_date) },
            ]}
          />
          {filterActive && (
            <button
              type="button"
              onClick={clearAll}
              className="text-primary hover:bg-primary/10 inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-medium"
            >
              <X className="h-4 w-4" />
              Clear filters
            </button>
          )}
        </div>

        {/* Bulk action bar */}
        {checked.size > 0 && (
          <div className="bg-secondary-container text-on-secondary-container mx-6 mb-4 flex flex-wrap items-center gap-3 rounded-2xl px-4 py-2.5 text-sm">
            <span className="font-semibold">{checked.size} selected</span>
            <span className="opacity-70">Move to</span>
            {BOARD.map((s) => (
              <button
                key={s}
                type="button"
                disabled={pending}
                onClick={() => bulkMove(s)}
                className="bg-surface-container-lowest text-on-surface hover:bg-primary hover:text-on-primary h-8 cursor-pointer rounded-full px-3 text-xs font-medium disabled:opacity-50"
              >
                {STATUS[s].label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setChecked(new Set())}
              className="ml-auto cursor-pointer font-medium hover:underline"
            >
              Clear
            </button>
          </div>
        )}

        {/* ─── Empty (no tasks at all) ─── */}
        {tasks.length === 0 && (
          <div className="border-outline-variant/50 flex flex-col items-center border-t px-6 py-20 text-center">
            <div className="bg-secondary-container text-on-secondary-container flex h-16 w-16 items-center justify-center rounded-full">
              <ClipboardList className="h-8 w-8" />
            </div>
            <h3 className="text-on-surface mt-4 text-xl font-normal">No tasks yet</h3>
            <p className="text-on-surface-variant mt-1 max-w-sm text-sm">
              Create the first task, give it an owner and a deadline, and it will show
              up on this board.
            </p>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="bg-primary text-on-primary mt-6 inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl px-5 text-sm font-semibold tracking-wide uppercase"
            >
              <Plus className="h-4 w-4" />
              Create task
            </button>
          </div>
        )}

        {/* ─── Board ─── */}
        {tasks.length > 0 && view === "board" && (
          <div className="border-outline-variant/50 grid grid-cols-1 gap-3 border-t p-4 md:grid-cols-2 xl:grid-cols-4">
            {visibleCols.map((col) => {
              const items = filtered.filter((t) => t.status === col);
              return (
                <div
                  key={col}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(col);
                  }}
                  onDragLeave={() => setDragOver((c) => (c === col ? null : c))}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(null);
                    const id = e.dataTransfer.getData("text/task-id");
                    if (id) changeStatus(id, col);
                  }}
                  className={`flex min-h-[360px] flex-col rounded-2xl p-3 transition-colors ${
                    dragOver === col
                      ? "bg-secondary-container/60 outline-primary outline-2 -outline-offset-2 outline-dashed"
                      : "bg-surface-container-low"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <div className="text-on-surface flex items-center gap-2 text-sm font-semibold">
                      <span className={`h-2 w-2 rounded-full ${STATUS[col].dot}`} />
                      {STATUS[col].label}
                    </div>
                    <span className="text-on-surface-variant text-xs font-medium tabular-nums">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2.5">
                    {items.map(card)}
                    {items.length === 0 && (
                      <div className="border-outline-variant/60 text-on-surface-variant flex h-24 items-center justify-center rounded-xl border border-dashed text-sm">
                        Drop tasks here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── List ─── */}
        {tasks.length > 0 && view === "list" && (
          <div className="border-outline-variant/50 overflow-x-auto border-t">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-surface-container-low/60 text-on-surface-variant text-xs font-medium tracking-wide uppercase">
                  <th className="w-12 px-5 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={allChecked}
                      onChange={() =>
                        setChecked(
                          allChecked ? new Set() : new Set(filtered.map((t) => t.id))
                        )
                      }
                      className="accent-primary h-4 w-4 cursor-pointer"
                    />
                  </th>
                  <th className="min-w-[280px] py-3">Task</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-5 py-3 text-right">Next step</th>
                </tr>
              </thead>
              <tbody className="divide-outline-variant/30 divide-y">
                {filtered.map((t) => {
                  const next = NEXT[t.status];
                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      className={`cursor-pointer ${checked.has(t.id) ? "bg-secondary-container/40" : "hover:bg-surface-container-low/60"}`}
                    >
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={`Select ${t.title}`}
                          checked={checked.has(t.id)}
                          onChange={() =>
                            setChecked((s) => {
                              const n = new Set(s);
                              if (n.has(t.id)) {
                                n.delete(t.id);
                              } else {
                                n.add(t.id);
                              }
                              return n;
                            })
                          }
                          className="accent-primary h-4 w-4 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5">
                        <p className="text-on-surface font-medium">{t.title}</p>
                        {t.description && (
                          <p className="text-on-surface-variant mt-0.5 line-clamp-1 text-xs">
                            {t.description}
                          </p>
                        )}
                      </td>
                      <td className="text-on-surface-variant px-4 py-3.5">
                        {deptLabel(t.department)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Avatar name={t.assignee_name} />
                          <span
                            className={`max-w-[120px] truncate ${t.assignee_name ? "text-on-surface" : "text-on-surface-variant italic"}`}
                          >
                            {t.assignee_name || "Unassigned"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${STATUS[t.status].chip}`}
                        >
                          {STATUS[t.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Due task={t} className="text-sm" />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {next && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              changeStatus(t.id, next.to);
                            }}
                            className="text-primary hover:bg-primary/10 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-semibold"
                          >
                            {next.label}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center px-6 py-16 text-center">
                <CheckCircle2 className="text-on-surface-variant h-10 w-10 stroke-[1.5]" />
                <h3 className="text-on-surface mt-3 text-base font-medium">
                  No tasks match these filters
                </h3>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-primary mt-2 cursor-pointer text-sm font-medium hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ─── Detail side sheet ─── */}
      {selected && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-black/30"
          onClick={() => setSelectedId(null)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            aria-label="Task details"
            className="bg-surface-container-lowest shadow-elevation-2 flex h-full w-full max-w-md flex-col rounded-l-3xl"
          >
            <div className="flex items-center justify-between px-6 pt-5">
              <span className="text-on-surface-variant text-sm">
                {deptLabel(selected.department)}
              </span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setSelectedId(null)}
                className="text-on-surface-variant hover:bg-surface-container flex h-10 w-10 cursor-pointer items-center justify-center rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
              <div>
                <h2 className="text-on-surface text-xl leading-snug font-medium">
                  {selected.title}
                </h2>
                <p className="text-on-surface-variant mt-2 text-sm leading-relaxed whitespace-pre-line">
                  {selected.description || "No description added."}
                </p>
              </div>
              <div>
                <p className="text-on-surface-variant mb-2 text-xs font-medium">
                  Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(STATUS) as TaskStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => changeStatus(selected.id, s)}
                      aria-pressed={selected.status === s}
                      className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-sm font-medium ${
                        selected.status === s
                          ? "bg-secondary-container text-on-secondary-container border-transparent"
                          : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                      }`}
                    >
                      {selected.status === s && <Check className="h-3.5 w-3.5" />}
                      {STATUS[s].label}
                    </button>
                  ))}
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-on-surface-variant text-xs">Priority</dt>
                  <dd className="mt-1">
                    <PriorityBadge priority={selected.priority} />
                  </dd>
                </div>
                <div>
                  <dt className="text-on-surface-variant text-xs">Due</dt>
                  <dd className="mt-1">
                    <Due task={selected} className="text-sm" />
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-on-surface-variant text-xs">Assignee</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <Avatar name={selected.assignee_name} size={28} />
                    <span className="text-on-surface">
                      {selected.assignee_name || "Unassigned"}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      )}

      {/* ─── Create side sheet ─── */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[2px]"
          onClick={() => setCreateOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest shadow-elevation-2 animate-in slide-in-from-right-full flex h-full w-full max-w-lg flex-col rounded-l-3xl duration-200"
          >
            {/* Header */}
            <div className="border-outline-variant/40 flex shrink-0 items-center justify-between border-b px-6 py-4">
              <h3 className="text-on-surface text-xl font-medium">Create task</h3>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setCreateOpen(false)}
                className="text-on-surface-variant hover:bg-surface-container flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form body — scrollable */}
            <form
              onSubmit={handleCreate}
              className="flex flex-1 flex-col overflow-y-auto"
            >
              <div className="flex-1 space-y-5 px-6 py-5">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-on-surface text-sm font-medium">
                    Title <span className="text-[#ef4444]">*</span>
                  </label>
                  <input
                    name="title"
                    required
                    autoFocus
                    placeholder="e.g. Implement webhook for artisan dispatch"
                    className="border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-primary h-12 w-full rounded-xl border px-4 text-sm transition focus:ring-1 focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-on-surface text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Task specifications, context, or acceptance criteria..."
                    className="border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-primary w-full rounded-xl border p-4 text-sm leading-relaxed transition focus:ring-1 focus:outline-none"
                  />
                </div>

                {/* Divider — Assignment (Department & Assign to dropdowns) */}
                <div className="border-outline-variant/40 border-t pt-5">
                  <p className="text-on-surface-variant mb-3 text-xs font-semibold tracking-wider uppercase">
                    Assignment
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormDropdown
                      label="Department"
                      name="department"
                      value={createDept}
                      onChange={setCreateDept}
                      options={DEPARTMENTS.map((d) => ({
                        value: d.id,
                        label: d.label,
                      }))}
                    />
                    <FormDropdown
                      label="Assign to"
                      name="assignedTo"
                      value={createAssignee}
                      onChange={setCreateAssignee}
                      options={[
                        {
                          value: "",
                          label: "Unassigned",
                          icon: (
                            <span className="text-on-surface-variant bg-surface-container flex h-5 w-5 items-center justify-center rounded-full text-[10px]">
                              ✕
                            </span>
                          ),
                        },
                        ...employees.map((emp) => ({
                          value: emp.id,
                          label: emp.full_name,
                          secondary: `(${deptLabel(emp.department)})`,
                          icon: <Avatar name={emp.full_name} size={20} />,
                        })),
                      ]}
                    />
                  </div>
                </div>

                {/* Divider — Scheduling & Priority (Priority dropdown & Due date) */}
                <div className="border-outline-variant/40 border-t pt-5">
                  <p className="text-on-surface-variant mb-3 text-xs font-semibold tracking-wider uppercase">
                    Scheduling &amp; Priority
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormDropdown
                      label="Priority"
                      name="priority"
                      value={createPriority}
                      onChange={(v) => setCreatePriority(v as TaskPriority)}
                      options={(Object.keys(PRIORITY) as TaskPriority[]).map((p) => ({
                        value: p,
                        label: PRIORITY[p].label,
                        icon: (
                          <Flag
                            className={`h-3.5 w-3.5 ${
                              p === "urgent"
                                ? "text-error"
                                : p === "high"
                                  ? "text-warning"
                                  : p === "medium"
                                    ? "text-primary"
                                    : "text-on-surface-variant"
                            }`}
                          />
                        ),
                      }))}
                    />
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-on-surface-variant text-xs font-medium">
                          Due date
                        </label>
                        {createDueDate && (
                          <button
                            type="button"
                            onClick={() => setCreateDueDate("")}
                            className="text-primary cursor-pointer text-[11px] font-medium hover:underline"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <input
                        name="dueDate"
                        type="date"
                        value={createDueDate}
                        onChange={(e) => setCreateDueDate(e.target.value)}
                        className="border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary h-11 w-full cursor-pointer rounded-xl border px-3.5 text-sm transition focus:ring-1 focus:outline-none"
                      />
                    </div>
                  </div>
                  {/* Quick due date presets */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {[
                      { label: "Today", days: 0 },
                      { label: "Tomorrow", days: 1 },
                      { label: "In 1 week", days: 7 },
                    ].map((preset) => {
                      const d = new Date();
                      d.setDate(d.getDate() + preset.days);
                      const iso = d.toISOString().split("T")[0];
                      const isSel = createDueDate === iso;
                      return (
                        <button
                          type="button"
                          key={preset.label}
                          onClick={() => setCreateDueDate(iso)}
                          className={`inline-flex h-7 cursor-pointer items-center rounded-full border px-2.5 text-xs font-medium transition-colors ${
                            isSel
                              ? "border-primary/40 bg-secondary-container text-on-secondary-container font-semibold"
                              : "border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low"
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section — Linked Entity (no dropdown) */}
                <div className="border-outline-variant/40 border-t pt-5">
                  <div className="mb-2.5 flex items-center justify-between">
                    <label className="text-on-surface text-xs font-semibold tracking-wider uppercase">
                      Linked Entity
                    </label>
                    <span className="text-on-surface-variant text-xs">
                      Optional link
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "general", label: "General" },
                      { id: "order", label: "Order" },
                      { id: "product", label: "Product" },
                      { id: "seller_application", label: "Seller Application" },
                      { id: "seller_onboarding", label: "Seller Onboarding" },
                      { id: "crm_lead", label: "CRM Lead" },
                      { id: "crm_deal", label: "CRM Deal" },
                      { id: "tech_feature", label: "Tech Feature" },
                    ].map((et) => {
                      const isSel = createEntityType === et.id;
                      return (
                        <button
                          type="button"
                          key={et.id}
                          onClick={() => setCreateEntityType(et.id as TaskEntityType)}
                          className={`inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border px-3 text-xs font-medium transition-all ${
                            isSel
                              ? "border-primary/40 bg-secondary-container text-on-secondary-container font-semibold shadow-xs"
                              : "border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low"
                          }`}
                        >
                          {isSel && <Check className="text-primary h-3 w-3" />}
                          {et.label}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="hidden"
                    name="relatedEntityType"
                    value={createEntityType}
                  />

                  {createEntityType !== "general" && (
                    <div className="animate-in fade-in space-y-1.5 pt-3 duration-150">
                      <label className="text-on-surface-variant text-xs font-medium">
                        Entity ID{" "}
                        <span className="text-on-surface-variant/60 text-[10px]">
                          (optional)
                        </span>
                      </label>
                      <input
                        name="relatedEntityId"
                        placeholder={`e.g. ${createEntityType}_123`}
                        className="border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary h-11 w-full rounded-xl border px-3.5 text-sm transition focus:ring-1 focus:outline-none"
                      />
                    </div>
                  )}
                  <p className="text-on-surface-variant/70 mt-2 text-xs">
                    Link this task to an order, product, application, or CRM record for
                    traceability.
                  </p>
                </div>
              </div>

              {/* Sticky footer */}
              <div className="border-outline-variant/40 flex shrink-0 items-center justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="text-on-surface border-outline-variant hover:bg-surface-container-low h-10 cursor-pointer rounded-full border px-5 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="bg-primary text-on-primary inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-6 text-sm font-medium shadow-xs transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                >
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create task
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {/* ─── Snackbar ─── */}
      {snack && (
        <div
          role="status"
          className="bg-on-surface text-surface shadow-elevation-2 fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl px-5 py-3 text-sm"
        >
          {snack}
        </div>
      )}
    </div>
  );
}
