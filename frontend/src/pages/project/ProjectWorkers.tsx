import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, UserPlus, HardHat, Mail, Phone, IndianRupee } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProjectWorkers() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: workers, isLoading } = useQuery({
    queryKey: ["project-workers", projectId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/workers`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch workers");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Project Workers & Team</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage labours, contractors, and tradesmen assigned to this project.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all"
        >
          <UserPlus size={18} /> Add Worker
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex items-center justify-center text-slate-500 font-bold">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading workers...
          </div>
        ) : workers?.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-bold">No workers found in this project.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-extrabold">
              <tr>
                <th className="px-6 py-4">Worker Profile</th>
                <th className="px-6 py-4">Trade</th>
                <th className="px-6 py-4">Daily Wage</th>
                <th className="px-6 py-4">Skill Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workers?.map((worker: any) => (
                <tr key={worker._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
                        {worker.firstName?.charAt(0) || worker.email?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900">{worker.firstName} {worker.lastName}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail size={12} /> {worker.email}
                        </p>
                        {worker.employeeCode && (
                          <p className="text-xs text-slate-500 mt-0.5">ID: {worker.employeeCode}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                      {worker.trade || 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-700 flex items-center gap-1">
                      <IndianRupee size={14}/> {worker.dailyWage || 0}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-blue-50 text-blue-600">
                      {worker.skillLevel ? worker.skillLevel.replace('_', ' ') : 'skilled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && <AddWorkerModal projectId={projectId!} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); queryClient.invalidateQueries({ queryKey: ["project-workers"] }); }} />}
    </div>
  );
}

function AddWorkerModal({ projectId, onClose, onSuccess }: { projectId: string, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", trade: "", dailyWage: "", employeeCode: ""
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/workers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create worker");
      }
      return res.json();
    },
    onSuccess,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-extrabold text-slate-900">Add New Worker</h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">Worker will be created and assigned to this project.</p>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">First Name *
              <input required type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" />
            </label>
            <label className="block text-sm font-bold text-slate-700">Last Name *
              <input required type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">Email (for Login) *
              <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" />
            </label>
            <label className="block text-sm font-bold text-slate-700">Password (for Login) *
              <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" minLength={6} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">Trade / Profession
              <input type="text" placeholder="e.g. Mason, Electrician" value={formData.trade} onChange={(e) => setFormData({...formData, trade: e.target.value})} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" />
            </label>
            <label className="block text-sm font-bold text-slate-700">Daily Wage (₹)
              <input type="number" value={formData.dailyWage} onChange={(e) => setFormData({...formData, dailyWage: e.target.value})} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" />
            </label>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700">Employee Code / Worker ID
              <input type="text" value={formData.employeeCode} onChange={(e) => setFormData({...formData, employeeCode: e.target.value})} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" />
            </label>
          </div>
          {mutation.isError && <div className="text-red-600 text-sm font-bold">{mutation.error instanceof Error ? mutation.error.message : 'Error creating worker'}</div>}
        </div>
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 mt-auto">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            {mutation.isPending && <Loader2 size={16} className="animate-spin" />} Create Worker
          </button>
        </div>
      </form>
    </div>
  );
}
