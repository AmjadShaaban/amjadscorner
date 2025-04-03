"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/lib/state";

export default function TodoPage() {
  const { user } = useAuthStore();
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      axios.get("/api/todos").then((res) => {
        setTodos(res.data);
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await axios.post("/api/todos", { title });
      setTodos([...todos, res.data]);
      setTitle("");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add todo");
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      const res = await axios.put(
        "/api/todos",
        { id, completed: !completed },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setTodos(todos.map((todo) => (todo._id === id ? res.data : todo)));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update todo");
    }
  };

  const handleDelete = async (id: string) => {
    setTodoToDelete(id);
  };

  const confirmDelete = async () => {
    if (!todoToDelete) return;
    try {
      await axios.delete("/api/todos", {
        data: { id: todoToDelete },
        headers: { "Content-Type": "application/json" },
      });
      setTodos(todos.filter((todo) => todo._id !== todoToDelete));
      setTodoToDelete(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete todo");
    }
  };

  if (!user) return <p className="text-white">Please log in to view todos.</p>;

  return (
    <div className="max-w-md mx-auto mt-8">
      {todoToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white">
          <div className="bg-white p-4 rounded shadow">
            <p>Are you sure you want to delete this todo?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setTodoToDelete(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4 text-white">
        Your Todos, {user.email}
      </h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a todo"
          className="w-full p-2 border rounded text-black"
        />
        <button
          type="submit"
          className="mt-2 w-full p-2 bg-blue-500 text-white rounded"
        >
          Add
        </button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li
            key={todo._id}
            className="p-2 border-b border-gray-600 flex items-center justify-between text-white"
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo._id, todo.completed)}
                className="mr-2"
              />
              <span
                className={todo.completed ? "line-through text-gray-500" : ""}
              >
                {todo.title}
              </span>
            </div>
            <button
              onClick={() => handleDelete(todo._id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          </li>
        ))}{" "}
      </ul>
    </div>
  );
}
