import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, ShoppingCart, IndianRupee } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProjectPurchase() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: pos, isLoading } = useQuery({
    queryKey: ["project-pos", projectId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/operations/purchase-orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch purchase orders");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Purchase Orders</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage vendor POs, material requests and procurement.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all"
        >
          <Plus size={18} /> Create PO
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex items-center justify-center text-slate-500 font-bold">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading purchase orders...
          </div>
        ) : pos?.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-bold">No purchase orders created yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-extrabold">
              <tr>
                <th className="px-6 py-4">PO Number & Vendor</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pos?.map((po: any) => (
                <tr key={po._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <ShoppingCart size={20} />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900">{po.poNumber || 'Draft PO'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Vendor: {po.vendorId?.name || 'Unknown'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {new Date(po.poDate || po.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs font-bold uppercase">{po.status || 'Pending'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-extrabold text-blue-700 flex items-center justify-end"><IndianRupee size={12}/>{po.totalAmount?.toLocaleString('en-IN') || 0}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && <AddModal projectId={projectId!} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); queryClient.invalidateQueries({ queryKey: ["project-pos"] }); }} />}
    </div>
  );
}

function AddModal({ projectId, onClose, onSuccess }: { projectId: string, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({ poNumber: "", totalAmount: "", status: "pending", poDate: new Date().toISOString().split('T')[0] });
  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/operations/purchase-orders`, {
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
          <h2 className="text-xl font-extrabold text-slate-900">Create Purchase Order</h2>
        </div>
        <div className="p-6 space-y-4">
          <label className="block text-sm font-bold text-slate-700">PO Number *
            <input required type="text" value={formData.poNumber} onChange={(e) => setFormData({...formData, poNumber: e.target.value})} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">Total Amount (₹) *
              <input required type="number" step="0.01" value={formData.totalAmount} onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" />
            </label>
            <label className="block text-sm font-bold text-slate-700">Date
              <input required type="date" value={formData.poDate} onChange={(e) => setFormData({...formData, poDate: e.target.value})} className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500" />
            </label>
          </div>
        </div>
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 mt-auto">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700">Save PO</button>
        </div>
      </form>
    </div>
  );
}
