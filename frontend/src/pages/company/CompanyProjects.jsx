import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Building2,
  Calendar,
  IndianRupee,
  MapPin,
  Loader2,
  ShieldAlert,
  ArrowRight,
  Trash2,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function CompanyProjects() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    data: projects,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["company-projects"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/company/projects`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/company/projects/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to delete project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-projects"] });
      queryClient.invalidateQueries({ queryKey: ["company-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard"] });
    },
  });

  const handleDelete = (id, name) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/company/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update project status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-projects"] });
      queryClient.invalidateQueries({ queryKey: ["company-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard"] });
    },
  });

  const filteredProjects =
    projects?.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.clientName &&
          p.clientName.toLowerCase().includes(searchTerm.toLowerCase())),
    ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Company Projects
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage all projects under your company.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm shadow-blue-600/20"
        >
          <Plus size={18} /> Add New Project
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-10 flex items-center justify-center text-slate-500 font-bold">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading
            projects...
          </div>
        ) : isError ? (
          <div className="p-10 flex items-center justify-center text-red-500 font-bold">
            Error loading projects.
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-bold bg-slate-50 rounded-b-xl">
            No projects found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="px-6 py-4">Project Name</th>
                  <th className="px-6 py-4">Client / Location</th>
                  <th className="px-6 py-4">Budget</th>
                  <th className="px-6 py-4">Revenue</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((project) => (
                  <tr
                    key={project._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <Link
                            to={`/project-owner/${project._id}/dashboard`}
                            className="font-extrabold text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            {project.name}
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <Calendar size={12} />{" "}
                            {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700">
                        {project.clientName || "N/A"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin size={12} /> {project.location || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-slate-800 flex items-center">
                        <IndianRupee size={13} />
                        {project.budget.toLocaleString("en-IN")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className={`font-extrabold flex items-center ${project.status === "completed" ? "text-emerald-700" : "text-slate-500"}`}
                      >
                        <IndianRupee size={13} />
                        {(project.contractValue || 0).toLocaleString("en-IN")}
                      </p>
                      <p className="mt-0.5 text-[11px] font-bold text-slate-400">
                        {project.status === "completed"
                          ? "Added"
                          : "After completion"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={project.status}
                        onChange={(e) =>
                          updateStatusMutation.mutate({
                            id: project._id,
                            status: e.target.value,
                          })
                        }
                        disabled={updateStatusMutation.isPending}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wide border-none outline-none cursor-pointer
                        ${
                          project.status === "in_progress"
                            ? "bg-blue-50 text-blue-700"
                            : project.status === "completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : project.status === "on_hold"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <option value="not_started">NOT STARTED</option>
                        <option value="in_progress">IN PROGRESS</option>
                        <option value="on_hold">ON HOLD</option>
                        <option value="completed">COMPLETED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Link
                        to={`/project-owner/${project._id}/dashboard`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-white border border-blue-200 hover:bg-blue-600 hover:border-blue-600 transition-all rounded-lg"
                      >
                        Manage <ArrowRight size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(project._id, project.name)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-600 hover:text-white border border-red-200 hover:bg-red-600 hover:border-red-600 transition-all rounded-lg"
                      >
                        <Trash2 size={14} />
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
        <AddProjectModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["company-projects"] });
            queryClient.invalidateQueries({ queryKey: ["company-dashboard"] });
            queryClient.invalidateQueries({
              queryKey: ["super-admin-dashboard"],
            });
          }}
        />
      )}
    </div>
  );
}

function AddProjectModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    clientName: "",
    location: "",
    budget: "",
    contractValue: "",
    expectedProfit: "",
    projectManagerId: "",
    isCreatingPM: false,
    pmFirstName: "",
    pmLastName: "",
    pmEmail: "",
    pmPassword: "",
  });

  const { data: projectManagers } = useQuery({
    queryKey: ["company-users", "project_owner"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/company/users?role=project_owner`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) return [];
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/company/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...data,
          budget: Number(data.budget),
          contractValue: Number(data.contractValue),
          expectedProfit: Number(data.expectedProfit),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || "Failed to create project");
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
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Add New Project
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Create a new workspace for your project.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              Project Name *
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Skyline Tower"
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-semibold"
              />
            </label>
            <div className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 mt-2">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-slate-900">
                  Project Manager
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isCreatingPM}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isCreatingPM: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    Create new Manager
                  </span>
                </label>
              </div>

              {formData.isCreatingPM ? (
                <div className="grid grid-cols-2 gap-4">
                  <label className="block text-sm font-bold text-slate-700">
                    First Name *
                    <input
                      required
                      type="text"
                      value={formData.pmFirstName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pmFirstName: e.target.value,
                        })
                      }
                      className="mt-1.5 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-all"
                    />
                  </label>
                  <label className="block text-sm font-bold text-slate-700">
                    Last Name *
                    <input
                      required
                      type="text"
                      value={formData.pmLastName}
                      onChange={(e) =>
                        setFormData({ ...formData, pmLastName: e.target.value })
                      }
                      className="mt-1.5 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-all"
                    />
                  </label>
                  <label className="block text-sm font-bold text-slate-700">
                    Email (Login ID) *
                    <input
                      required
                      type="email"
                      value={formData.pmEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, pmEmail: e.target.value })
                      }
                      className="mt-1.5 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-all"
                    />
                  </label>
                  <label className="block text-sm font-bold text-slate-700">
                    Password *
                    <input
                      required
                      type="text"
                      value={formData.pmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, pmPassword: e.target.value })
                      }
                      className="mt-1.5 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-all"
                    />
                  </label>
                </div>
              ) : (
                <select
                  value={formData.projectManagerId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      projectManagerId: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 transition-all font-semibold appearance-none"
                >
                  <option value="">-- Assign Later --</option>
                  {projectManagers?.map((pm) => (
                    <option key={pm._id} value={pm._id}>
                      {pm.firstName} {pm.lastName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              Client Name
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
                placeholder="e.g. Acme Corp"
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-semibold"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Location
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="City, Area"
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-semibold"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              Estimated Budget
              <div className="relative mt-1.5">
                <IndianRupee
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-semibold"
                />
              </div>
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Revenue / Contract Value
              <div className="relative mt-1.5">
                <IndianRupee
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="number"
                  value={formData.contractValue}
                  onChange={(e) =>
                    setFormData({ ...formData, contractValue: e.target.value })
                  }
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-semibold"
                />
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                This will count as revenue only after the project is 100%
                completed.
              </p>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              Expected Profit
              <div className="relative mt-1.5">
                <IndianRupee
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="number"
                  value={formData.expectedProfit}
                  onChange={(e) =>
                    setFormData({ ...formData, expectedProfit: e.target.value })
                  }
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-semibold"
                />
              </div>
            </label>
          </div>

          {mutation.isError && (
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">
              <ShieldAlert size={18} className="mt-0.5 flex-shrink-0" />
              <p>
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "An error occurred."}
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={mutation.isPending}
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-60"
          >
            {mutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving...
              </>
            ) : (
              "Create Project"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
