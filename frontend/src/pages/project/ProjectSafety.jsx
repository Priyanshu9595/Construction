import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, AlertTriangle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProjectSafety() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: incidents, isLoading } = useQuery({
    queryKey: ["project-safety", projectId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/operations/safety`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) throw new Error("Failed to fetch safety incidents");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Site Safety
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Log safety walks, near-misses and accident reports.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all"
        >
          <Plus size={18} /> Report Incident
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex items-center justify-center text-slate-500 font-bold">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading
            records...
          </div>
        ) : incidents?.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-bold">
            No safety incidents reported. Safe working!
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-extrabold">
              <tr>
                <th className="px-6 py-4">Incident Details</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incidents?.map((inc) => (
                <tr
                  key={inc._id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900">
                          {inc.description || "Unknown Incident"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Reported by: {inc.reportedBy?.name || "Admin"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {new Date(
                      inc.incidentDate || inc.createdAt,
                    ).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                        inc.severity === "Critical"
                          ? "bg-red-100 text-red-800"
                          : inc.severity === "High"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {inc.severity || "Minor"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                        inc.status === "Resolved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {inc.status || "Open"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <AddModal
          projectId={projectId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["project-safety"] });
          }}
        />
      )}
    </div>
  );
}

function AddModal({ projectId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    description: "",
    severity: "Minor",
    status: "Open",
    incidentDate: new Date().toISOString().slice(0, 16),
  });
  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/operations/safety`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("token")
              ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
              : {}),
          },
          body: JSON.stringify(data),
        },
      );
      if (!res.ok) throw new Error(await res.text());
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
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-extrabold text-slate-900">
            Report Incident
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <label className="block text-sm font-bold text-slate-700">
            Description *
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              rows={3}
            ></textarea>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              Severity
              <select
                value={formData.severity}
                onChange={(e) =>
                  setFormData({ ...formData, severity: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 appearance-none"
              >
                <option>Minor</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Status
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 appearance-none"
              >
                <option>Open</option>
                <option>Under Investigation</option>
                <option>Resolved</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-bold text-slate-700">
            Date & Time
            <input
              required
              type="datetime-local"
              value={formData.incidentDate}
              onChange={(e) =>
                setFormData({ ...formData, incidentDate: e.target.value })
              }
              className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
            />
          </label>
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
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700"
          >
            Report Incident
          </button>
        </div>
      </form>
    </div>
  );
}
