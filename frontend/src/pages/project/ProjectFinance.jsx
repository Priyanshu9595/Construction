import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Loader2,
  IndianRupee,
  FileText,
  ReceiptText,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProjectFinance() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["project-expenses", projectId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/operations/expenses`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) throw new Error("Failed to fetch expenses");
      return res.json();
    },
  });

  const totalAmount =
    expenses?.reduce((acc, curr) => acc + getExpenseAmount(curr), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
            Project Finance
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">
            All Project Expenses
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Labour payments, materials, petty cash, and approved expenses in one
            ledger.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700"
        >
          <Plus size={18} /> Add Expense
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Total Expenses Logged
          </p>
          <p className="mt-3 flex items-center text-3xl font-extrabold text-rose-600">
            <IndianRupee size={24} /> {totalAmount.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Expense Entries
          </p>
          <p className="mt-3 text-3xl font-extrabold text-slate-950">
            {expenses?.length || 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Labour Expense
          </p>
          <p className="mt-3 flex items-center text-3xl font-extrabold text-emerald-600">
            <IndianRupee size={24} />{" "}
            {(expenses || [])
              .filter((exp) => exp.category === "Labour")
              .reduce((sum, exp) => sum + getExpenseAmount(exp), 0)
              .toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-10 flex items-center justify-center text-slate-500 font-bold">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading
            expenses...
          </div>
        ) : expenses?.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-bold">
            No expenses logged yet.
          </div>
        ) : (
          <table className="w-full table-fixed text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-extrabold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="w-[42%] px-6 py-4">Expense Details</th>
                <th className="w-[16%] px-6 py-4">Category</th>
                <th className="w-[16%] px-6 py-4">Date</th>
                <th className="w-[12%] px-6 py-4">Status</th>
                <th className="w-[14%] px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses?.map((exp) => (
                <tr
                  key={exp._id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 font-bold text-orange-600">
                        {exp.category === "Labour" ? (
                          <ReceiptText size={20} />
                        ) : (
                          <FileText size={20} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-extrabold text-slate-900">
                          {exp.description || exp.title || "Untitled expense"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          By: {exp.incurredBy || "Admin"}
                          {exp.invoiceNumber ? ` / ${exp.invoiceNumber}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold uppercase text-slate-700">
                      {exp.category || "General"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {new Date(exp.date || exp.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold uppercase text-emerald-700">
                      {exp.status || "paid"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="flex items-center justify-end font-extrabold text-rose-600">
                      <IndianRupee size={12} />
                      {getExpenseAmount(exp).toLocaleString("en-IN")}
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
            queryClient.invalidateQueries({
              queryKey: ["project-expenses", projectId],
            });
            queryClient.invalidateQueries({
              queryKey: ["project-dashboard", projectId],
            });
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

function getExpenseAmount(exp) {
  return Number(exp?.amount || exp?.totalAmount || 0);
}

function AddModal({ projectId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Material",
    date: new Date().toISOString().split("T")[0],
  });
  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/operations/expenses`,
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
            Add New Expense
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <label className="block text-sm font-bold text-slate-700">
            Description *
            <input
              required
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              Amount (₹) *
              <input
                required
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Category
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 appearance-none"
              >
                <option>Material</option>
                <option>Labour</option>
                <option>Equipment</option>
                <option>Transport</option>
                <option>Miscellaneous</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-bold text-slate-700">
            Date
            <input
              required
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
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
            Save Expense
          </button>
        </div>
      </form>
    </div>
  );
}
