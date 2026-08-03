import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ListTodo, Loader2, Calendar, UserPlus } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProjectTasks() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignModalTask, setAssignModalTask] = useState(null);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/tasks`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Project Tasks
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Detailed tasks, resource planning and dependencies.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all"
        >
          <Plus size={18} /> Add Task
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex items-center justify-center text-slate-500 font-bold">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading tasks...
          </div>
        ) : tasks?.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-bold">
            No tasks defined yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
<table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-extrabold">
              <tr>
                <th className="px-6 py-4">Task Name</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Phase</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks?.map((task) => (
                <tr
                  key={task._id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <ListTodo size={20} />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900">
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {task.taskCode}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full max-w-[120px]">
                      <div className="flex justify-between text-xs mb-1 font-bold">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-blue-600">
                          {task.progressPercentage || 0}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${task.progressPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                      {task.phaseId?.name || "Unassigned"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-700 flex items-center gap-1">
                      <Calendar size={14} />
                      {task.plannedStartDate
                        ? new Date(task.plannedStartDate).toLocaleDateString()
                        : "TBD"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-slate-100 text-slate-600">
                      {task.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      {task.assignedUserIds?.map((worker, i) => {
                        const initial =
                          typeof worker === "string"
                            ? "W"
                            : worker.firstName?.charAt(0) || "W";
                        const name =
                          typeof worker === "string"
                            ? "Worker"
                            : `${worker.firstName} ${worker.lastName}`;
                        return (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-700 z-10"
                            title={name}
                          >
                            {initial}
                          </div>
                        );
                      })}
                      {task.assignedUserIds?.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500 z-0">
                          +{task.assignedUserIds.length - 3}
                        </div>
                      )}
                      {(!task.assignedUserIds ||
                        task.assignedUserIds.length === 0) && (
                        <span className="text-xs font-semibold text-slate-400">
                          None
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setAssignModalTask(task)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Assign Workers"
                    >
                      <UserPlus size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        )}
      </div>

      {isModalOpen && (
        <AddTaskModal
          projectId={projectId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["project-tasks"] });
          }}
        />
      )}
      {assignModalTask && (
        <AssignWorkerModal
          projectId={projectId}
          task={assignModalTask}
          onClose={() => setAssignModalTask(null)}
          onSuccess={() => {
            setAssignModalTask(null);
            queryClient.invalidateQueries({ queryKey: ["project-tasks"] });
          }}
        />
      )}
    </div>
  );
}

function AddTaskModal({ projectId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    taskCode: "",
    phaseId: "",
    plannedStartDate: "",
    plannedEndDate: "",
    plannedQuantity: "",
    unit: "",
    weight: "",
    plannedLabour: "",
    plannedMaterial: "",
    plannedEquipment: "",
  });

  const { data: phases } = useQuery({
    queryKey: ["project-phases", projectId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/phases`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      if (!res.ok) return [];
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(data),
        },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create task");
      }
      return res.json();
    },
    onSuccess,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(formData);
        }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-extrabold text-slate-900">
            Add Project Task
          </h2>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              Task Title *
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Task Code
              <input
                type="text"
                value={formData.taskCode}
                onChange={(e) =>
                  setFormData({ ...formData, taskCode: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              Phase *
              <select
                required
                value={formData.phaseId}
                onChange={(e) =>
                  setFormData({ ...formData, phaseId: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 appearance-none"
              >
                <option value="">-- Select Phase --</option>
                {phases?.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Weight (%)
              <input
                type="number"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              Start Date
              <input
                type="date"
                value={formData.plannedStartDate}
                onChange={(e) =>
                  setFormData({ ...formData, plannedStartDate: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              End Date
              <input
                type="date"
                value={formData.plannedEndDate}
                onChange={(e) =>
                  setFormData({ ...formData, plannedEndDate: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">
              Resource Planning (Expected costs)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="block text-xs font-bold text-slate-700">
                Labour (₹)
                <input
                  type="number"
                  value={formData.plannedLabour}
                  onChange={(e) =>
                    setFormData({ ...formData, plannedLabour: e.target.value })
                  }
                  className="mt-1.5 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
              </label>
              <label className="block text-xs font-bold text-slate-700">
                Material (₹)
                <input
                  type="number"
                  value={formData.plannedMaterial}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      plannedMaterial: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
              </label>
              <label className="block text-xs font-bold text-slate-700">
                Equipment (₹)
                <input
                  type="number"
                  value={formData.plannedEquipment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      plannedEquipment: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
              </label>
            </div>
          </div>
          {mutation.isError && (
            <div className="text-red-600 text-sm font-bold">
              {mutation.error instanceof Error
                ? mutation.error.message
                : "Error"}
            </div>
          )}
        </div>
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
}

function AssignWorkerModal({ projectId, task, onClose, onSuccess }) {
  const initialSelected =
    task.assignedUserIds?.map((w) => (typeof w === "string" ? w : w._id)) || [];
  const [selectedWorkers, setSelectedWorkers] = useState(initialSelected);

  const { data: workers, isLoading } = useQuery({
    queryKey: ["project-workers", projectId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/workers`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      if (!res.ok) return [];
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (assignedUserIds) => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/tasks/${task._id}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ assignedUserIds }),
        },
      );
      if (!res.ok) throw new Error("Failed to assign workers");
      return res.json();
    },
    onSuccess,
  });

  const toggleWorker = (id) => {
    setSelectedWorkers((prev) =>
      prev.includes(id) ? prev.filter((wId) => wId !== id) : [...prev, id],
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-extrabold text-slate-900">
            Assign Workers
          </h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            {task.title}
          </p>
        </div>
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin text-blue-600" />
            </div>
          ) : workers?.length === 0 ? (
            <p className="text-center text-sm font-semibold text-slate-500">
              No workers found in this project.
            </p>
          ) : (
            workers?.map((worker) => (
              <label
                key={worker._id}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedWorkers.includes(worker._id) ? "border-blue-600 bg-blue-50/50" : "border-slate-100 hover:border-slate-200 bg-white"}`}
              >
                <input
                  type="checkbox"
                  checked={selectedWorkers.includes(worker._id)}
                  onChange={() => toggleWorker(worker._id)}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />

                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">
                    {worker.firstName} {worker.lastName}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    {worker.trade || "Unassigned Trade"} • {worker.employeeCode}
                  </p>
                </div>
              </label>
            ))
          )}
          {mutation.isError && (
            <p className="text-red-500 text-sm font-bold mt-2">
              Error assigning workers
            </p>
          )}
        </div>
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate(selectedWorkers)}
            disabled={mutation.isPending}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            {mutation.isPending && (
              <Loader2 size={16} className="animate-spin" />
            )}
            Save Assignments
          </button>
        </div>
      </div>
    </div>
  );
}
