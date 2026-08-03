import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Layers, Loader2, Calendar } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProjectPhases() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: phases, isLoading } = useQuery({
    queryKey: ["project-phases", projectId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/phases`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) throw new Error("Failed to fetch phases");
      return res.json();
    },
  });

  const totalWeight =
    phases?.reduce((acc, curr) => acc + (curr.weight || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Project Phases
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Define major stages of the project. Total weight must be exactly
            100%.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all"
        >
          <Plus size={18} /> Add Phase
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-700">Total Phase Weight</h3>
          <span
            className={`font-extrabold ${totalWeight === 100 ? "text-emerald-600" : "text-amber-600"}`}
          >
            {totalWeight}% / 100%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${totalWeight === 100 ? "bg-emerald-500" : totalWeight > 100 ? "bg-red-500" : "bg-blue-500"}`}
            style={{ width: `${Math.min(totalWeight, 100)}%` }}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex items-center justify-center text-slate-500 font-bold">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading
            phases...
          </div>
        ) : phases?.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-bold">
            No phases defined yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
<table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-extrabold">
              <tr>
                <th className="px-6 py-4">Phase Code & Name</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Weight</th>
                <th className="px-6 py-4">Responsible Team</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {phases?.map((phase) => (
                <tr
                  key={phase._id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Layers size={20} />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900">
                          {phase.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {phase.code}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-700 flex items-center gap-1">
                      <Calendar size={14} />
                      {phase.plannedStartDate
                        ? new Date(phase.plannedStartDate).toLocaleDateString()
                        : "TBD"}
                      {" - "}
                      {phase.plannedEndDate
                        ? new Date(phase.plannedEndDate).toLocaleDateString()
                        : "TBD"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {phase.weight}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-700">
                      {phase.responsibleTeam || "Unassigned"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-slate-100 text-slate-600">
                      {phase.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        )}
      </div>

      {isModalOpen && (
        <AddPhaseModal
          projectId={projectId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["project-phases"] });
          }}
        />
      )}
    </div>
  );
}

function AddPhaseModal({ projectId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    plannedStartDate: "",
    plannedEndDate: "",
    weight: "",
    responsibleTeam: "",
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/phases`,
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
        throw new Error(err.message || "Failed to create phase");
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
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-extrabold text-slate-900">
            Add Project Phase
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              Phase Name *
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Phase Code *
              <input
                required
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              Weight (%) *
              <input
                required
                type="number"
                min="0"
                max="100"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Responsible Team
              <input
                type="text"
                value={formData.responsibleTeam}
                onChange={(e) =>
                  setFormData({ ...formData, responsibleTeam: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
          </div>
          {mutation.isError && (
            <div className="text-red-600 text-sm font-bold">
              {mutation.error instanceof Error
                ? mutation.error.message
                : "Error"}
            </div>
          )}
        </div>
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
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
            Create Phase
          </button>
        </div>
      </form>
    </div>
  );
}
