import "./App.css";
import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  window.toast = toast;

  const [todos, setTodos] = useState([]);
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [newTask, setNewTask] = useState({ text: "", description: "" });
  const [sortOrder, setSortOrder] = useState("desc");
  const [editTaskId, setEditTaskId] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/todos?sort=${sortOrder}`)
      .then((res) => setTodos(res.data));
  }, [sortOrder]);

  const filteredTodos = search.trim()
    ? todos.filter((todo) => {
        const keyword = search.toLowerCase();

        const textMatch = todo.text.toLowerCase().includes(keyword);
        const descriptionMatch = todo.description
          .toLowerCase()
          .includes(keyword);
        const statusMatch = (todo.completed ? "completed" : "pending").includes(
          keyword
        );
        const dateMatch = new Date(todo.createdAt)
          .toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          })
          .toLowerCase()
          .includes(keyword);

        return textMatch || descriptionMatch || statusMatch || dateMatch;
      })
    : todos;

  const handleAddOrUpdateTask = async (e) => {
    e.preventDefault();
    try {
      if (editTaskId) {
        const res = await axios.patch(
          `http://localhost:5000/api/todos/${editTaskId}`,
          newTask
        );
        setTodos(todos.map((t) => (t._id === editTaskId ? res.data : t)));
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/todos",
          newTask
        );
        setTodos([res.data, ...todos]);
      }
      setShowDialog(false);
      setNewTask({ text: "", description: "" });
      setEditTaskId(null);
    } catch (err) {
      console.error("Error adding/updating task:", err);
    }
  };

  const handleToggleCompleted = async (todo) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/todos/${todo._id}`,
        { completed: !todo.completed }
      );
      setTodos(todos.map((t) => (t._id === todo._id ? res.data : t)));
    } catch (err) {
      console.error("Error toggling task status:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/todos/${id}`);
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const openEditDialog = (todo) => {
    setEditTaskId(todo._id);
    setNewTask({ text: todo.text, description: todo.description });
    setShowDialog(true);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-center">Task Manager</h1>

          <div className="flex items-center justify-between mb-4">
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-md w-1/2 outline-none"
            />
            <button
              onClick={() => setShowDialog(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center cursor-pointer"
            >
              <Plus size={18} className="mr-2" /> Add Task
            </button>
          </div>

          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="p-3"> Sr No</th>
                <th className="p-3">Title</th>
                <th className="p-3">Description</th>
                <th
                  className="p-3 cursor-pointer"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                >
                  Date {sortOrder === "asc" ? "↑" : "↓"}
                </th>
                <th className="p-3">Status</th>
                <th className="p-3">✏️</th>
                <th className="p-3">❌</th>
              </tr>
            </thead>
            <tbody>
              {filteredTodos.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="flex flex-col items-center justify-center py-6 text-gray-500 gap-2">
                      <span className="text-3xl">⊗</span>
                      <span className="text-lg">No todos found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTodos.map((todo, index) => (
                  <tr key={todo._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{todo.text}</td>
                    <td className="p-3">{todo.description}</td>
                    <td className="p-3">
                      {new Date(todo.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="p-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleToggleCompleted(todo)}
                          className="h-4 w-4 text-green-600 rounded border-gray-300 cursor-pointer"
                        />
                        <span>{todo.completed ? "Completed" : "Pending"}</span>
                      </label>
                    </td>
                    <td
                      className="p-3 cursor-pointer text-green-500 hover:text-green-700"
                      onClick={() => openEditDialog(todo)}
                    >
                      <Pencil size={18} />
                    </td>
                    <td
                      className="p-3 cursor-pointer text-red-500 hover:text-red-700"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this task?"
                          )
                        ) {
                          handleDelete(todo._id);
                        }
                      }}
                    >
                      <Trash2 size={18} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {showDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-96">
                <h2 className="text-xl font-semibold mb-4">
                  {editTaskId ? "Edit Task" : "Add New Task"}
                </h2>
                <form onSubmit={handleAddOrUpdateTask} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Title"
                    required
                    value={newTask.text}
                    onChange={(e) =>
                      setNewTask({ ...newTask, text: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    required
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded outline-none"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDialog(false);
                        setEditTaskId(null);
                        setNewTask({ text: "", description: "" });
                      }}
                      className=" cursor-pointer px-4 py-2 rounded bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className=" cursor-pointer px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      {editTaskId ? "Update" : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;

