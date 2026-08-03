import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Lock, AlertTriangle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const CATEGORIES = [
  "Civil Work",
  "Material",
  "Labour",
  "Contractor",
  "Equipment",
  "Electrical",
  "Plumbing",
  "Consultants",
  "Transport",
  "Overheads",
  "Contingency",
];

export default function ProjectBudget() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["project-budget", projectId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/budget`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) throw new Error("Failed to fetch budget");
      return res.json();
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/budget`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error("Failed to update budget");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-budget", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["project-dashboard", projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["company-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard"] });
    },
  });

  const freezeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/freeze-baseline`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to freeze baseline");
      }
      return res.json();
    },
    onSuccess: () => {
      alert("Baseline frozen and project started!");
      queryClient.invalidateQueries();
    },
  });

  const budget = data?.budget || {};
  const lines = data?.lines || [];

  const totalAllocated = lines.reduce(
    (acc, line) => acc + (line.allocatedAmount || 0),
    0,
  );
  const isOverBudget = totalAllocated > (budget.approvedBudget || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Project Budget & Baseline
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage financial allocations and freeze project baseline.
          </p>
        </div>
        <div className="flex gap-3">
          {budget.status !== "frozen" && (
            <button
              onClick={() => {
                if (
                  confirm(
                    "Are you sure? This will lock the budget and start the project execution.",
                  )
                ) {
                  freezeMutation.mutate();
                }
              }}
              disabled={freezeMutation.isPending || isOverBudget}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all disabled:opacity-50"
            >
              {freezeMutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Lock size={18} />
              )}
              Freeze Baseline
            </button>
          )}
        </div>
      </div>

      {freezeMutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex gap-3 font-bold text-sm">
          <AlertTriangle size={20} />
          {freezeMutation.error instanceof Error
            ? freezeMutation.error.message
            : "Error freezing baseline"}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Contract Value (Estimate)
          </h3>
          <input
            type="number"
            value={budget.contractValue || ""}
            onChange={(e) =>
              updateBudgetMutation.mutate({
                contractValue: Number(e.target.value),
              })
            }
            placeholder="0.00"
            disabled={budget.status === "frozen"}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-bold focus:border-blue-500"
          />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Approved Budget (Cost)
          </h3>
          <input
            type="number"
            value={budget.approvedBudget || ""}
            onChange={(e) =>
              updateBudgetMutation.mutate({
                approvedBudget: Number(e.target.value),
              })
            }
            placeholder="0.00"
            disabled={budget.status === "frozen"}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-bold focus:border-blue-500"
          />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Expected Profit</h3>
          <input
            type="number"
            value={budget.expectedProfit || ""}
            onChange={(e) =>
              updateBudgetMutation.mutate({
                expectedProfit: Number(e.target.value),
              })
            }
            placeholder="0.00"
            disabled={budget.status === "frozen"}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none font-bold focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Budget Allocations
            </h2>
            <p
              className={`text-sm font-bold mt-1 ${isOverBudget ? "text-red-600" : "text-slate-500"}`}
            >
              Total Allocated: ₹{totalAllocated.toLocaleString("en-IN")} / ₹
              {(budget.approvedBudget || 0).toLocaleString("en-IN")}
            </p>
          </div>
          {budget.status !== "frozen" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
            >
              <Plus size={16} /> Allocate Funds
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
<table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-extrabold">
            <tr>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Phase</th>
              <th className="px-6 py-4 text-right">Allocated Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lines.map((line) => (
              <tr key={line._id}>
                <td className="px-6 py-4 font-bold text-slate-800">
                  {line.category}
                </td>
                <td className="px-6 py-4 text-slate-600 font-semibold">
                  {line.phaseId?.name || "---"}
                </td>
                <td className="px-6 py-4 text-right font-extrabold text-blue-700">
                  ₹{line.allocatedAmount.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
            {lines.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-8 text-center text-slate-500 font-bold"
                >
                  No allocations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
</div>
      </div>

      {isModalOpen && (
        <AddAllocationModal
          projectId={projectId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["project-budget"] });
          }}
        />
      )}
    </div>
  );
}

function AddAllocationModal({ projectId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    category: "",
    allocatedAmount: "",
    phaseId: "",
  });
  const { data: phases } = useQuery({
    queryKey: ["project-phases", projectId],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/phases`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/budget/lines`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
            Allocate Budget
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <label className="block text-sm font-bold text-slate-700">
            Category *
            <select
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 appearance-none"
            >
              <option value="">-- Select Category --</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold text-slate-700">
            Phase (Optional)
            <select
              value={formData.phaseId}
              onChange={(e) =>
                setFormData({ ...formData, phaseId: e.target.value })
              }
              className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 appearance-none"
            >
              <option value="">-- None --</option>
              {phases?.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold text-slate-700">
            Amount (₹) *
            <input
              required
              type="number"
              value={formData.allocatedAmount}
              onChange={(e) =>
                setFormData({ ...formData, allocatedAmount: e.target.value })
              }
              className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
            />
          </label>
          {mutation.isError && (
            <div className="text-red-600 text-sm font-bold">
              Error saving allocation
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
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800"
          >
            Save Allocation
          </button>
        </div>
      </form>
    </div>
  );
}
