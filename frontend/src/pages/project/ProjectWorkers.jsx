import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  UserPlus,
  Mail,
  IndianRupee,
  Wallet,
  History,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProjectWorkers() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [historyWorker, setHistoryWorker] = useState(null);

  const { data: workers, isLoading } = useQuery({
    queryKey: ["project-workers", projectId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/workers`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) throw new Error("Failed to fetch workers");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Project Workers & Team
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage labours, contractors, and tradesmen assigned to this project.
          </p>
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
            <Loader2 className="animate-spin mr-2" size={20} /> Loading
            workers...
          </div>
        ) : workers?.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-bold">
            No workers found in this project.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-extrabold">
              <tr>
                <th className="px-6 py-4">Worker Profile</th>
                <th className="px-6 py-4">Trade</th>
                <th className="px-6 py-4">Daily Wage</th>
                <th className="px-6 py-4">Skill Level</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workers?.map((worker) => (
                <tr
                  key={worker._id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
                        {worker.firstName?.charAt(0) || worker.email?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900">
                          {worker.firstName} {worker.lastName}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail size={12} /> {worker.email}
                        </p>
                        {worker.employeeCode && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            ID: {worker.employeeCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                      {worker.trade || "Unassigned"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-700 flex items-center gap-1">
                      <IndianRupee size={14} /> {worker.dailyWage || 0}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-blue-50 text-blue-600">
                      {worker.skillLevel
                        ? worker.skillLevel.replace("_", " ")
                        : "skilled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setHistoryWorker(worker)}
                        className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <History size={14} /> History
                      </button>
                      <button
                        onClick={() => setSelectedWorker(worker)}
                        className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Wallet size={14} /> Pay
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <AddWorkerModal
          projectId={projectId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["project-workers"] });
          }}
        />
      )}
      {selectedWorker && (
        <PayWorkerModal
          projectId={projectId}
          worker={selectedWorker}
          onClose={() => setSelectedWorker(null)}
          onSuccess={() => {
            setSelectedWorker(null);
            queryClient.invalidateQueries({ queryKey: ["project-workers"] });
            queryClient.invalidateQueries({
              queryKey: ["worker-payments", selectedWorker._id],
            });
            queryClient.invalidateQueries({
              queryKey: ["project-expenses", projectId],
            });
            queryClient.invalidateQueries({
              queryKey: ["project-dashboard", projectId],
            });
            queryClient.invalidateQueries({
              queryKey: ["super-admin-dashboard"],
            });
            queryClient.invalidateQueries({ queryKey: ["company-dashboard"] });
          }}
        />
      )}
      {historyWorker && (
        <WorkerPaymentHistoryModal
          projectId={projectId}
          worker={historyWorker}
          onClose={() => setHistoryWorker(null)}
        />
      )}
    </div>
  );
}

function AddWorkerModal({ projectId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    trade: "",
    dailyWage: "",
    employeeCode: "",
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/workers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(data),
        },
      );
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(formData);
        }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-extrabold text-slate-900">
            Add New Worker
          </h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Worker will be created and assigned to this project.
          </p>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              First Name *
              <input
                required
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Last Name *
              <input
                required
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              Email (for Login) *
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Password (for Login) *
              <input
                required
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
                minLength={6}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              Trade / Profession
              <input
                type="text"
                placeholder="e.g. Mason, Electrician"
                value={formData.trade}
                onChange={(e) =>
                  setFormData({ ...formData, trade: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Daily Wage (₹)
              <input
                type="number"
                value={formData.dailyWage}
                onChange={(e) =>
                  setFormData({ ...formData, dailyWage: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700">
              Employee Code / Worker ID
              <input
                type="text"
                value={formData.employeeCode}
                onChange={(e) =>
                  setFormData({ ...formData, employeeCode: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
          </div>
          {mutation.isError && (
            <div className="text-red-600 text-sm font-bold">
              {mutation.error instanceof Error
                ? mutation.error.message
                : "Error creating worker"}
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
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            {mutation.isPending && (
              <Loader2 size={16} className="animate-spin" />
            )}{" "}
            Create Worker
          </button>
        </div>
      </form>
    </div>
  );
}

function PayWorkerModal({ projectId, worker, onClose, onSuccess }) {
  const defaultDate = formatLocalDate(new Date());
  const [formData, setFormData] = useState({
    workDate: defaultDate,
    daysWorked: 0,
    grossSalary: 0,
    deductions: 0,
  });
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);

  useEffect(() => {
    async function fetchAttendance() {
      setIsLoadingAttendance(true);
      setAlreadyPaid(false);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/api/projects/${projectId}/workers/${worker._id}/attendance-summary?date=${formData.workDate}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        if (res.ok) {
          const data = await res.json();
          if (data.alreadyPaid) {
            setAlreadyPaid(true);
            setPaidAmount(data.paidAmount || 0);
            setFormData((prev) => ({
              ...prev,
              daysWorked: data.daysWorked || 0,
              grossSalary: 0,
              deductions: 0,
            }));
          } else {
            const fetchedDays = data.daysWorked || 0;
            setFormData((prev) => ({
              ...prev,
              daysWorked: fetchedDays,
              grossSalary: fetchedDays * (worker.dailyWage || 0),
            }));
          }
        }
      } catch (e) {
        console.error("Failed to fetch attendance summary", e);
      } finally {
        setIsLoadingAttendance(false);
      }
    }
    fetchAttendance();
  }, [formData.workDate, projectId, worker._id, worker.dailyWage]);

  const netSalary = Math.max(
    0,
    Number(formData.grossSalary) - Number(formData.deductions),
  );

  const mutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/workers/${worker._id}/pay`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ ...data, month: data.workDate, netSalary }),
        },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to record payment");
      }
      return res.json();
    },
    onSuccess,
  });

  const handleDaysChange = (days) => {
    setFormData((prev) => ({
      ...prev,
      daysWorked: days,
      grossSalary: days * (worker.dailyWage || 0),
    }));
  };

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
            Record Payment
          </h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Generate a salary slip for {worker.firstName} {worker.lastName}.
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              Work Date
              <input
                required
                type="date"
                value={formData.workDate}
                onChange={(e) =>
                  setFormData({ ...formData, workDate: e.target.value })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Days Worked{" "}
              {isLoadingAttendance && (
                <Loader2
                  size={14}
                  className="inline animate-spin ml-1 text-blue-500"
                />
              )}
              <input
                disabled={alreadyPaid}
                required
                type="number"
                step="0.5"
                min="0"
                max="31"
                value={formData.daysWorked}
                onChange={(e) => handleDaysChange(Number(e.target.value))}
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-bold text-slate-700">
              Gross Salary (₹)
              <input
                disabled={alreadyPaid}
                required
                type="number"
                value={formData.grossSalary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    grossSalary: Number(e.target.value),
                  })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Deductions / Advances (₹)
              <input
                disabled={alreadyPaid}
                required
                type="number"
                value={formData.deductions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deductions: Number(e.target.value),
                  })
                }
                className="mt-1.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </label>
          </div>

          {alreadyPaid ? (
            <div className="bg-amber-50 rounded-xl p-4 flex flex-col gap-1 border border-amber-200">
              <span className="font-bold text-amber-800">
                Payment Already Settled
              </span>
              <span className="text-sm font-medium text-amber-700">
                A payment of ₹{paidAmount} was already made for this date.
              </span>
              <div className="flex justify-between mt-2 pt-2 border-t border-amber-200/50">
                <span className="font-bold text-slate-600">Due Amount</span>
                <span className="text-xl font-extrabold text-slate-400">
                  ₹0
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 rounded-xl p-4 flex items-center justify-between border border-emerald-100">
              <span className="font-bold text-emerald-800">
                Net Payable Amount
              </span>
              <span className="text-xl font-extrabold text-emerald-700">
                ₹{netSalary}
              </span>
            </div>
          )}

          {!alreadyPaid && (
            <p className="text-xs font-semibold text-slate-500 text-center">
              Calculated at a daily wage of ₹{worker.dailyWage || 0}
            </p>
          )}

          {mutation.isError && (
            <div className="text-red-600 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100">
              {mutation.error instanceof Error
                ? mutation.error.message
                : "Error recording payment"}
            </div>
          )}
        </div>
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200"
          >
            Cancel
          </button>
          {!alreadyPaid && (
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
            >
              {mutation.isPending && (
                <Loader2 size={16} className="animate-spin" />
              )}{" "}
              Confirm Payment
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function WorkerPaymentHistoryModal({ projectId, worker, onClose }) {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["worker-payments", worker._id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/projects/${projectId}/workers/${worker._id}/payments`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) throw new Error("Failed to fetch payments");
      return res.json();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Payment History
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Past salary slips for {worker.firstName} {worker.lastName}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-0 overflow-y-auto">
          {isLoading ? (
            <div className="p-10 flex items-center justify-center text-slate-500 font-bold">
              <Loader2 className="animate-spin mr-2" size={20} /> Loading
              history...
            </div>
          ) : payments?.length === 0 ? (
            <div className="p-10 text-center text-slate-500 font-bold">
              No payment history found for this worker.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4">Payment Date</th>
                  <th className="px-6 py-4">Gross</th>
                  <th className="px-6 py-4">Deductions</th>
                  <th className="px-6 py-4 text-emerald-700">Net Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments?.map((payment) => (
                  <tr
                    key={payment._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {payment.month}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {payment.paymentDate
                        ? new Date(payment.paymentDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      ₹{payment.grossSalary}
                    </td>
                    <td className="px-6 py-4 text-red-600">
                      ₹{payment.deductions}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-emerald-600">
                      ₹{payment.netSalary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-200 hover:bg-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
