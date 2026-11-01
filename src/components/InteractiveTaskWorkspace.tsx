"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import {
  ListTodo,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Calendar,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { analyzeTaskDeadline } from "@/lib/timeline/calculations";
import type { TaskRecord, TaskPriority, TaskStatus } from "@/types";

interface InteractiveTaskWorkspaceProps {
  eventId: string;
  tasks: TaskRecord[];
  onTasksChange: () => void;
}

export function InteractiveTaskWorkspace({
  eventId,
  tasks,
  onTasksChange,
}: InteractiveTaskWorkspaceProps) {
  // New task form state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");
  const [newDueAt, setNewDueAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit task modal/state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<TaskPriority>("medium");
  const [editDueAt, setEditDueAt] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Filters and sorting
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [sortBy, setSortBy] = useState<"deadline" | "priority" | "newest">("deadline");
  const toast = useToast();

  // Progress metrics
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const overdueCount = tasks.filter((t) => t.status !== "completed" && analyzeTaskDeadline(t.due_at).isOverdue).length;

  // Handle Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/events/${eventId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          priority: newPriority,
          status: "pending",
          due_at: newDueAt ? new Date(newDueAt).toISOString() : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create task");
      }

      setNewTitle("");
      setNewDescription("");
      setNewPriority("medium");
      setNewDueAt("");
      setIsAddingTask(false);
      toast.success("Task Created", "New milestone saved to Supabase.");
      onTasksChange();
    } catch (err: unknown) {
      toast.error("Error creating task", err instanceof Error ? err.message : "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Task Status (Optimistic with Rollback)
  const handleToggleTask = async (task: TaskRecord) => {
    const nextStatus: TaskStatus = task.status === "completed" ? "pending" : "completed";

    try {
      const res = await fetch(`/api/events/${eventId}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          status: nextStatus,
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      toast.success(
        nextStatus === "completed" ? "Task Completed! 🎉" : "Task Reopened",
        task.title
      );
      onTasksChange();
    } catch (err: unknown) {
      toast.error("Error updating task status", err instanceof Error ? err.message : "Request failed");
    }
  };

  // Start edit
  const startEditing = (task: TaskRecord) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority);
    setEditDueAt(task.due_at ? task.due_at.split("T")[0] : "");
  };

  // Save edit
  const handleSaveEdit = async (taskId: string) => {
    try {
      setIsSavingEdit(true);
      const res = await fetch(`/api/events/${eventId}/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          title: editTitle,
          description: editDescription,
          priority: editPriority,
          due_at: editDueAt ? new Date(editDueAt).toISOString() : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save task update");
      setEditingTaskId(null);
      toast.success("Task Updated", "Milestone parameters updated.");
      onTasksChange();
    } catch (err: unknown) {
      toast.error("Error updating task", err instanceof Error ? err.message : "Request failed");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to remove this task?")) return;

    try {
      const res = await fetch(`/api/events/${eventId}/tasks?taskId=${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete task");
      toast.success("Task Removed", "Milestone deleted from checklist.");
      onTasksChange();
    } catch (err: unknown) {
      toast.error("Error removing task", err instanceof Error ? err.message : "Request failed");
    }
  };

  // Apply filters and sorting
  const processedTasks = [...tasks]
    .filter((t) => {
      if (statusFilter === "pending") return t.status !== "completed";
      if (statusFilter === "completed") return t.status === "completed";
      return true;
    })
    .filter((t) => {
      if (priorityFilter === "all") return true;
      return t.priority === priorityFilter;
    })
    .sort((a, b) => {
      if (sortBy === "deadline") {
        if (!a.due_at) return 1;
        if (!b.due_at) return -1;
        return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
      }
      if (sortBy === "priority") {
        const pOrder: Record<TaskPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return pOrder[b.priority] - pOrder[a.priority];
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="space-y-6">
      {/* 1. PROGRESS METRICS HEADER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Milestone Progress</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-extrabold text-navy-900">{progressPercent}%</span>
            <span className="text-xs text-slate-500">{completedCount} of {tasks.length} Completed</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
            <div
              className="bg-brand-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Action Status</span>
          <p className="text-xl font-extrabold text-navy-900">
            {tasks.length - completedCount} <span className="text-xs font-normal text-slate-500">pending</span>
          </p>
          <span className="text-[10px] text-slate-400 block">Active operational items</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Overdue Tasks</span>
          <p className={`text-xl font-extrabold ${overdueCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {overdueCount} <span className="text-xs font-normal text-slate-500">critical</span>
          </p>
          <span className="text-[10px] text-slate-400 block">
            {overdueCount > 0 ? "Requires immediate rescheduling" : "All deadlines on schedule"}
          </span>
        </Card>
      </div>

      {/* 2. FILTER & ACTION BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === "all" ? "bg-white text-navy-900 shadow-sm" : "text-slate-600"
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === "pending" ? "bg-white text-navy-900 shadow-sm" : "text-slate-600"
              }`}
            >
              Pending ({tasks.length - completedCount})
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === "completed" ? "bg-white text-navy-900 shadow-sm" : "text-slate-600"
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="deadline">Sort: Deadline</option>
            <option value="priority">Sort: Priority</option>
            <option value="newest">Sort: Newest</option>
          </select>
        </div>

        <Button size="sm" onClick={() => setIsAddingTask(!isAddingTask)} className="gap-1.5 self-start md:self-auto">
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </Button>
      </div>

      {/* 3. ADD TASK FORM */}
      {isAddingTask && (
        <Card className="p-5 border-brand-200 bg-brand-50/20">
          <form onSubmit={handleAddTask} className="space-y-4">
            <h4 className="text-xs font-bold text-navy-900">Create Milestone Task</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Input
                label="Task Title"
                placeholder="e.g. Confirm floral centerpiece delivery"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <Input
                label="Description (Optional)"
                placeholder="Details, vendor contacts, scope"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1.5">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <Input
                label="Due Date"
                type="date"
                value={newDueAt}
                onChange={(e) => setNewDueAt(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingTask(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Save Task
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 4. TASK ITEMS LIST */}
      <div className="space-y-2">
        {processedTasks.length === 0 ? (
          <Card className="p-8 text-center space-y-2">
            <ListTodo className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-navy-900">No Tasks Match Filters</h4>
            <p className="text-xs text-slate-500">Adjust your filter options or add a new task.</p>
          </Card>
        ) : (
          processedTasks.map((task) => {
            const isEditing = editingTaskId === task.id;
            const deadline = analyzeTaskDeadline(task.due_at);
            const isDone = task.status === "completed";

            if (isEditing) {
              return (
                <Card key={task.id} className="p-4 border-brand-300 ring-1 ring-brand-300 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Input
                      label="Task Title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                    />
                    <Input
                      label="Description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1.5">Priority</label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <Input
                      label="Due Date"
                      type="date"
                      value={editDueAt}
                      onChange={(e) => setEditDueAt(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingTaskId(null)}>
                      Cancel
                    </Button>
                    <Button size="sm" isLoading={isSavingEdit} onClick={() => handleSaveEdit(task.id)}>
                      <Save className="w-3.5 h-3.5 mr-1" />
                      Save Changes
                    </Button>
                  </div>
                </Card>
              );
            }

            return (
              <Card
                key={task.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-subtle transition-all"
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => handleToggleTask(task)}
                    className="mt-0.5 text-slate-400 hover:text-brand-600 transition-colors"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                    )}
                  </button>

                  <div className="space-y-0.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`text-xs font-semibold ${isDone ? "line-through text-slate-400" : "text-navy-900"}`}>
                        {task.title}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        task.priority === "urgent" ? "bg-rose-100 text-rose-800"
                        : task.priority === "high" ? "bg-rose-50 text-rose-700"
                        : task.priority === "medium" ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-slate-500">{task.description}</p>
                    )}
                  </div>
                </div>

                {/* Right side: deadline and actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pl-8 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className={`text-[11px] font-medium flex items-center gap-1 ${
                      deadline.isOverdue && !isDone
                        ? "text-rose-600 font-bold"
                        : deadline.isUrgentSoon && !isDone
                        ? "text-amber-600 font-semibold"
                        : "text-slate-500"
                    }`}>
                      <Calendar className="w-3 h-3" />
                      <span>{deadline.formattedDue}</span>
                    </span>
                    {deadline.daysUntilDue !== null && !isDone && (
                      <span className={`text-[10px] block ${
                        deadline.isOverdue ? "text-rose-500 font-bold" : "text-slate-400"
                      }`}>
                        {deadline.isOverdue ? `${Math.abs(deadline.daysUntilDue)}d overdue` : `${deadline.daysUntilDue}d remaining`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => startEditing(task)}
                      title="Edit Task"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
