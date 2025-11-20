"use client";

import { BrokerTask } from "@/lib/crm-storage";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";

interface TaskListProps {
  tasks: BrokerTask[];
  onTaskUpdate: () => void;
}

export default function TaskList({ tasks, onTaskUpdate }: TaskListProps) {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const handleToggleComplete = async (task: BrokerTask) => {
    setUpdatingTaskId(task.id);
    
    try {
      const newStatus = task.status === "completed" ? "pending" : "completed";
      
      const response = await fetch("/api/crm/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: task.id,
          status: newStatus,
        }),
      });

      if (response.ok) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "medium":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "low":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-3.5 h-3.5" />;
      case "medium":
        return <Clock className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  const isOverdue = (task: BrokerTask) => {
    if (!task.due_date || task.status === "completed") return false;
    return new Date(task.due_date) < new Date();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-sm">No tasks yet</p>
      </div>
    );
  }

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="space-y-6">
      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Pending ({pendingTasks.length})
          </h4>
          <div className="space-y-2">
            {pendingTasks.map((task) => {
              const overdue = isOverdue(task);
              return (
                <div
                  key={task.id}
                  className={`bg-white/[0.02] rounded-lg p-4 border transition-all ${
                    overdue
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      disabled={updatingTaskId === task.id}
                      className="text-gray-400 hover:text-orange-400 transition-colors mt-0.5 disabled:opacity-50"
                    >
                      <Circle className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h5 className="text-white font-medium">{task.title}</h5>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {task.priority !== "low" && (
                            <span className={`px-2 py-1 rounded text-xs font-medium border flex items-center space-x-1 ${getPriorityColor(task.priority)}`}>
                              {getPriorityIcon(task.priority)}
                              <span className="capitalize">{task.priority}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                      )}
                      
                      {task.due_date && (
                        <div className="flex items-center space-x-1.5 mt-2">
                          <Clock className={`w-3.5 h-3.5 ${overdue ? "text-red-400" : "text-gray-400"}`} />
                          <span className={`text-xs ${overdue ? "text-red-400 font-medium" : "text-gray-400"}`}>
                            {overdue ? "Overdue: " : "Due: "}
                            {formatDate(task.due_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Completed ({completedTasks.length})
          </h4>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white/[0.02] rounded-lg p-4 border border-white/5 opacity-60"
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    disabled={updatingTaskId === task.id}
                    className="text-green-400 hover:text-gray-400 transition-colors mt-0.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="text-white font-medium line-through">{task.title}</h5>
                    {task.completed_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Completed {formatDate(task.completed_at)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

