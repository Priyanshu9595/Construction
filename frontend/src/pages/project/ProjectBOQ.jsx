import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  FileSpreadsheet,
  Loader2,
  IndianRupee,
  Upload,
  Trash2,
  Edit2,
} from "lucide-react";
import Papa from "papaparse";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProjectBOQ() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const fileInputRef = useRef(null);

  const { data: boqItems, isLoading } = useQuery({
    queryKey: ["project-boq", projectId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/boq`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch BOQ");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId) => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/boq/${itemId}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) throw new Error("Failed to delete BOQ");
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["project-boq"] }),
  });

  const bulkMutation = useMutation({
    mutationFn: async (items) => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/boq/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ items }),
        },
      );
      if (!res.ok) throw new Error("Failed to upload BOQ");
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["project-boq"] }),
  });

  const totalAmount =
    boqItems?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedItems = results.data.map((row) => ({
          name: row.Name || row.name || "Untitled Item",
          itemCode: row.ItemCode || row.itemCode || row.code || "",
          quantity: parseFloat(row.Quantity || row.quantity || "0"),
          unit: row.Unit || row.unit || "NOS",
          rate: parseFloat(row.Rate || row.rate || "0"),
        }));
        bulkMutation.mutate(parsedItems);
      },
      error: (error) => {
        alert("Error parsing CSV: " + error.message);
      },
    });
    // reset input
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Bill of Quantities (BOQ)
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage project planned work items and commercial records.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={bulkMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all"
          >
            {bulkMutation.isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Upload size={18} />
            )}{" "}
            Upload CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all"
          >
            <Plus size={18} /> Add Item
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
        <span className="font-bold text-slate-700">Total BOQ Amount</span>
        <span className="text-xl font-extrabold text-slate-900 flex items-center">
          <IndianRupee size={20} /> {totalAmount.toLocaleString("en-IN")}
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex items-center justify-center text-slate-500 font-bold">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading BOQ...
          </div>
        ) : boqItems?.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-bold">
            No BOQ items added yet.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-extrabold">
              <tr>
                <th className="px-6 py-4">Item Name & Details</th>
                <th className="px-6 py-4">Linked Phase/Task</th>
                <th className="px-6 py-4">Quantity / Progress</th>
                <th className="px-6 py-4 text-right">Rate</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {boqItems?.map((item) => {
                const progressPct =
                  item.quantity > 0
                    ? Math.min(
                        100,
                        Math.round(
                          ((item.actualQuantity || 0) / item.quantity) * 100,
                        ),
                      )
                    : 0;
                return (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                          <FileSpreadsheet size={20} />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.itemCode || "No code"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700">
                        {item.phaseId?.name || "---"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.taskId?.title || "---"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-[150px]">
                        <div className="flex justify-between text-xs mb-1 font-bold">
                          <span className="text-slate-800">
                            {item.actualQuantity || 0} / {item.quantity}{" "}
                            {item.unit}
                          </span>
                          <span className="text-emerald-600">
                            {progressPct}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-slate-800 flex items-center justify-end">
                        <IndianRupee size={12} />
                        {item.rate.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-extrabold text-blue-700 flex items-center justify-end">
                        <IndianRupee size={12} />
                        {item.amount.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setEditItem(item)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this BOQ item?",
                              )
                            ) {
                              deleteMutation.mutate(item._id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {(isModalOpen || editItem) && (
        <BOQModal
          projectId={projectId}
          initialData={editItem}
          onClose={() => {
            setIsModalOpen(false);
            setEditItem(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditItem(null);
            queryClient.invalidateQueries({ queryKey: ["project-boq"] });
          }}
        />
      )}
    </div>
  );
}

function BOQModal({ projectId, initialData, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    itemCode: initialData?.itemCode || "",
    quantity: initialData?.quantity || "",
    unit: initialData?.unit || "",
    rate: initialData?.rate || "",
    phaseId: initialData?.phaseId?._id || "",
    taskId: initialData?.taskId?._id || "",
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

  const { data: tasks } = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/tasks`,
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
      const url = initialData
        ? `${API_BASE_URL}/api/projects/${projectId}/boq/${initialData._id}`
        : `${API_BASE_URL}/api/projects/${projectId}/boq`;
      const res = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
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
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-extrabold text-slate-900">
            {initialData ? "Edit BOQ Item" : "Add BOQ Item"}
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              Item Name *
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
              Item Code
              <input
                type="text"
                value={formData.itemCode}
                onChange={(e) =>
                  setFormData({ ...formData, itemCode: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              Quantity *
              <input
                required
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Unit *
              <input
                required
                type="text"
                placeholder="e.g. Cu.m"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Rate (₹) *
              <input
                required
                type="number"
                step="0.01"
                value={formData.rate}
                onChange={(e) =>
                  setFormData({ ...formData, rate: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              Link Phase
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
              Link Task
              <select
                value={formData.taskId}
                onChange={(e) =>
                  setFormData({ ...formData, taskId: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 appearance-none"
              >
                <option value="">-- None --</option>
                {tasks
                  ?.filter(
                    (t) =>
                      !formData.phaseId || t.phaseId?._id === formData.phaseId,
                  )
                  .map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          {mutation.isError && (
            <div className="text-red-600 text-sm font-bold">
              Error saving BOQ
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
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700"
          >
            {initialData ? "Update Item" : "Save Item"}
          </button>
        </div>
      </form>
    </div>
  );
}
