import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Package, Search } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProjectInventory() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fallback to fetch materials if specific inventory endpoint doesn't exist
  const { data: materials, isLoading } = useQuery({
    queryKey: ["project-inventory", projectId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/store/inventory?projectId=${projectId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        // Fallback or empty if not accessible
        return [];
      }
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Store Inventory</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Track material stock levels, receipts, and consumption.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all"
        >
          <Plus size={18} /> Add Material
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search materials..." className="w-full bg-slate-50 border-none rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-blue-100" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex items-center justify-center text-slate-500 font-bold">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading inventory...
          </div>
        ) : materials?.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-bold">No inventory records found.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-extrabold">
              <tr>
                <th className="px-6 py-4">Material Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Current Stock</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials?.map((mat: any) => (
                <tr key={mat._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900">{mat.name || 'Unknown Material'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Code: {mat.itemCode || '---'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {mat.category || 'General'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-extrabold text-slate-800">{mat.currentStock || 0}</span> <span className="text-slate-500">{mat.unit || 'nos'}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {(mat.currentStock || 0) > 10 ? (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md text-xs font-bold uppercase">In Stock</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs font-bold uppercase">Low Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-center">
          <h2 className="text-xl font-bold">Coming Soon</h2>
          <p className="text-slate-500 mt-2">Material creation will be available shortly.</p>
          <button onClick={() => setIsModalOpen(false)} className="mt-4 px-4 py-2 bg-slate-200 rounded-lg font-bold">Close</button>
        </div>
      </div>}
    </div>
  );
}
