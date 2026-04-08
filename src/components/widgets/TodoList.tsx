"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, Circle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { PRIORITY_COLORS } from "@/lib/constants";
import type { Todo } from "@/types";

const PRIORITIES: Todo["priority"][] = ["low", "medium", "high"];

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    const res = await fetch("/api/todos");
    const data = await res.json();
    setTodos(data.todos);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async () => {
    if (!newTitle.trim()) return;
    const optimistic: Todo = {
      id: Date.now(),
      title: newTitle.trim(),
      completed: false,
      priority: "medium",
      category: null,
      due_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTodos((prev) => [optimistic, ...prev]);
    setNewTitle("");

    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: optimistic.title }),
    });
    const data = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === optimistic.id ? data.todo : t)));
  };

  const toggleTodo = async (todo: Todo) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t))
    );
    await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
  };

  const cyclePriority = async (todo: Todo) => {
    const idx = PRIORITIES.indexOf(todo.priority);
    const next = PRIORITIES[(idx + 1) % PRIORITIES.length];
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, priority: next } : t))
    );
    await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: next }),
    });
  };

  const deleteTodo = async (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
  };

  const incomplete = todos.filter((t) => !t.completed);
  const completed = todos.filter((t) => t.completed);

  return (
    <div className="p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Todos</h2>
        <span className="text-xs text-[var(--text-muted)] font-medium">
          {incomplete.length} remaining
        </span>
      </div>

      {/* Add todo input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTodo();
        }}
        className="flex gap-2 mb-4"
      >
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task..."
          className="text-sm"
        />
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
            bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]
            disabled:opacity-30 transition-all duration-200 active:scale-90"
        >
          <Plus size={16} />
        </button>
      </form>

      {/* Todo items */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-[var(--border)] animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {incomplete.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onCyclePriority={cyclePriority}
                onDelete={deleteTodo}
              />
            ))}
            {completed.length > 0 && (
              <div className="pt-3 mt-3 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wider font-medium">
                  Completed ({completed.length})
                </p>
                {completed.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onCyclePriority={cyclePriority}
                    onDelete={deleteTodo}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TodoItem({
  todo,
  onToggle,
  onCyclePriority,
  onDelete,
}: {
  todo: Todo;
  onToggle: (t: Todo) => void;
  onCyclePriority: (t: Todo) => void;
  onDelete: (id: number) => void;
}) {
  const priorityStyle = PRIORITY_COLORS[todo.priority];

  return (
    <div className="group flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors">
      <button
        onClick={() => onToggle(todo)}
        className="shrink-0 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
      >
        {todo.completed ? (
          <CheckCircle2 size={18} className="text-[var(--accent-sage)]" />
        ) : (
          <Circle size={18} />
        )}
      </button>
      <button
        onClick={() => onCyclePriority(todo)}
        className={`shrink-0 w-2 h-2 rounded-full ${priorityStyle.dot} transition-colors`}
        title={`Priority: ${todo.priority}`}
      />
      <span
        className={`flex-1 text-sm truncate ${
          todo.completed ? "line-through text-[var(--text-muted)]" : ""
        }`}
      >
        {todo.title}
      </span>
      {todo.category && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider">
          {todo.category}
        </span>
      )}
      <button
        onClick={() => onDelete(todo.id)}
        className="shrink-0 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-500 transition-all"
      >
        <X size={14} />
      </button>
    </div>
  );
}
