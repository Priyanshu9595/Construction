import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, IndianRupee, FileText } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProjectFinance() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["project-expenses", projectId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/operations/expenses`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch expenses");
      return res.json();
    },
  });

  const totalAmount = expenses?.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Finance & Expenses</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Track project budgets, petty cash, and approved expenses.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all"
        >
          <Plus size={18} /> Add Expense
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
        <span className="font-bold text-slate-700">Total Expenses Logged</span>
        <span className="text-xl font-extrabold text-rose-600 flex items-center">
          <IndianRupee size={20} /> {totalAmount.toLocaleString('en-IN')}
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex items-center justify-center text-slate-500 font-bold">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading expenses...
          </div>
        ) : expenses?.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-bold">No expenses logged yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-extrabold">
              <tr>
                <th className="px-6 py-4">Expense Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses?.map((exp: any) => (
                <tr key={exp._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900">{exp.description}</p>
                        <p className="text-xs text-slate-500 mt-0.5">By: {exp.incurredBy || 'Admin'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold uppercase">{exp.category || 'General'}</span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {new Date(exp.date || exp.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-extrabold text-rose-600 flex items-center justify-end"><IndianRupee size={12}/>{exp.amount?.toLocaleString('en-IN') || 0}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && <AddModal projectId={projectId!} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); queryClient.invalidateQueries({ queryKey: ["project-expenses"] }); }} />}
    </div>
  );
}

function AddModal({ projectId, onClose, onSuccess }: { projectId: string, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({ description: "", amount: "", category: "Material", date: new Date().toISOString().split('T')[0] });
  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/operations/expenses`, {
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
          <h2 className="text-xl font-extrabold text-slate-900">Add New Expense</h2>
        </div>
        <div className="p-6 space-y-4">
          <label className="block text-sm font-bold text-slate-700">Description *
            <input required type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">Amount (₹) *
              <input required type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" />
            </label>
            <label className="block text-sm font-bold text-slate-700">Category
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 appearance-none">
                <option>Material</option>
                <option>Labour</option>
                <option>Equipment</option>
                <option>Transport</option>
                <option>Miscellaneous</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-bold text-slate-700">Date
            <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" />
          </label>
        </div>
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 mt-auto">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700">Save Expense</button>
        </div>
      </form>
    </div>
  );
}
