import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, ClipboardCheck } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProjectQuality() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: inspections, isLoading } = useQuery({
    queryKey: ["project-quality", projectId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/operations/quality`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch quality inspections");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quality Control</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage QA/QC checklists, inspections and NCRs.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all"
        >
          <Plus size={18} /> New Inspection
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex items-center justify-center text-slate-500 font-bold">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading inspections...
          </div>
        ) : inspections?.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-bold">No quality inspections logged yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-extrabold">
              <tr>
                <th className="px-6 py-4">Inspection Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Result</th>
                <th className="px-6 py-4 text-right">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inspections?.map((insp: any) => (
                <tr key={insp._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <ClipboardCheck size={20} />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900">{insp.inspectionType || 'General Check'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Inspector: {insp.inspectorId?.name || 'Admin'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {new Date(insp.inspectionDate || insp.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                      insp.result === 'Passed' ? 'bg-emerald-100 text-emerald-800' : 
                      insp.result === 'Failed' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {insp.result || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500 text-xs font-medium">
                    {insp.remarks || '---'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && <AddModal projectId={projectId!} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); queryClient.invalidateQueries({ queryKey: ["project-quality"] }); }} />}
    </div>
  );
}

function AddModal({ projectId, onClose, onSuccess }: { projectId: string, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({ inspectionType: "", result: "Pending", remarks: "", inspectionDate: new Date().toISOString().split('T')[0] });
  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/operations/quality`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}) },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-extrabold text-slate-900">Log Inspection</h2>
        </div>
        <div className="p-6 space-y-4">
          <label className="block text-sm font-bold text-slate-700">Inspection Type *
            <input required type="text" value={formData.inspectionType} onChange={(e) => setFormData({...formData, inspectionType: e.target.value})} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">Result
              <select value={formData.result} onChange={(e) => setFormData({...formData, result: e.target.value})} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 appearance-none">
                <option>Pending</option>
                <option>Passed</option>
                <option>Failed</option>
                <option>Conditional</option>
              </select>
            </label>
            <label className="block text-sm font-bold text-slate-700">Date
              <input required type="date" value={formData.inspectionDate} onChange={(e) => setFormData({...formData, inspectionDate: e.target.value})} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" />
            </label>
          </div>
          <label className="block text-sm font-bold text-slate-700">Remarks
            <textarea value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" rows={3}></textarea>
          </label>
        </div>
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 mt-auto">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700">Save Record</button>
        </div>
      </form>
    </div>
  );
}
