import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Building2, MapPin } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProjectSites() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: sites, isLoading } = useQuery({
    queryKey: ["project-sites", projectId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/operations/sites`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) throw new Error("Failed to fetch sites");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Site Execution Hub
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage physical locations, site dashboards, and daily operations.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all"
        >
          <Plus size={18} /> Add Site
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-10 flex items-center justify-center text-slate-500 font-bold">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading sites...
          </div>
        ) : sites?.length === 0 ? (
          <div className="col-span-full p-10 text-center text-slate-500 font-bold bg-white border border-slate-200 rounded-xl">
            No sites created yet.
          </div>
        ) : (
          sites?.map((site) => (
            <Link
              key={site._id}
              to={`../sites/${site._id}/dashboard`}
              className="group block bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:border-blue-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                    {site.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin size={12} /> {site.location || "No location set"}
                  </p>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  View Dashboard →
                </span>
                <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                  {site.status || "Active"}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {isModalOpen && (
        <AddModal
          projectId={projectId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["project-sites"] });
          }}
        />
      )}
    </div>
  );
}

function AddModal({ projectId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    status: "active",
  });
  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/operations/sites`,
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
            Add New Site
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <label className="block text-sm font-bold text-slate-700">
            Site Name *
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
            Location
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
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
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700"
          >
            Save Site
          </button>
        </div>
      </form>
    </div>
  );
}
