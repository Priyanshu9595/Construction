import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  CalendarDays,
  IndianRupee,
  Loader2,
  LogIn,
  LogOut,
  Info as InfoIcon,
  HardHat,
  ListTodo,
  Wallet,
  Building2,
} from "lucide-react";
import { formatINR } from "../lib/api";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function WorkerDashboard() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["worker-dashboard"],
    queryFn: () => workerGet("/api/worker/dashboard"),
  });
  const updateTask = useMutation({
    mutationFn: (params) =>
      workerAction(
        `/api/worker/tasks/${params.taskId}/status`,
        "PATCH",
        params,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["worker-dashboard"] }),
  });
  const checkIn = useMutation({
    mutationFn: () => workerAction("/api/worker/attendance/check-in"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["worker-dashboard"] }),
  });
  const checkOut = useMutation({
    mutationFn: () => workerAction("/api/worker/attendance/check-out"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["worker-dashboard"] }),
  });

  if (query.isLoading) return <State text="Loading worker portal..." />;
  if (query.isError || !query.data)
    return (
      <State
        text={
          query.error instanceof Error
            ? query.error.message
            : "Unable to load worker portal"
        }
        error
      />
    );

  const data = query.data;
  const isCheckedIn =
    data.todayAttendance?.status === "present" &&
    !data.todayAttendance?.checkOutAt;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 pb-20">
      {/* Header Profile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-5 sm:p-6 text-white shadow-md">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-blue-600/20 to-transparent"></div>
        <div className="absolute -top-4 -right-4 p-4 opacity-10 text-white">
          <Briefcase size={100} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Namaste, {data.profile.name.split(" ")[0]}
            </h1>
            <span className="hidden sm:inline-flex items-center rounded-full bg-slate-800 border border-slate-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Labour Portal
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-400">
            <span className="flex items-center gap-1.5">
              <HardHat size={16} className="text-blue-400" />{" "}
              {data.profile.trade || "Worker"}
            </span>
            <span className="flex items-center gap-1.5">
              <InfoIcon size={16} className="text-blue-400" /> ID:{" "}
              {data.profile.workerCode || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => checkIn.mutate()}
          disabled={isCheckedIn || checkIn.isPending}
          className={`relative overflow-hidden rounded-2xl p-4 font-bold text-lg shadow-sm transition-all ${!isCheckedIn ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white hover:shadow-blue-500/25 hover:-translate-y-1" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
        >
          <div className="flex items-center justify-center gap-2">
            {checkIn.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <LogIn />
            )}{" "}
            Check In to Site
          </div>
          {checkIn.isError && (
            <div className="text-red-200 text-xs mt-1 absolute bottom-1 left-0 w-full text-center">
              Failed to check in
            </div>
          )}
        </button>
        <button
          onClick={() => checkOut.mutate()}
          disabled={!isCheckedIn || checkOut.isPending}
          className={`relative overflow-hidden rounded-2xl p-4 font-bold text-lg shadow-sm transition-all ${isCheckedIn ? "bg-gradient-to-b from-red-500 to-red-600 text-white hover:shadow-red-500/25 hover:-translate-y-1" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
        >
          <div className="flex items-center justify-center gap-2">
            {checkOut.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <LogOut />
            )}{" "}
            Check Out
          </div>
          {checkOut.isError && (
            <div className="text-red-200 text-xs mt-1 absolute bottom-1 left-0 w-full text-center">
              Failed to check out
            </div>
          )}
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InfoCard
          icon={CalendarDays}
          color="text-emerald-500"
          bg="bg-emerald-50"
          label="Today's Status"
          value={
            data.todayAttendance?.status === "present"
              ? "Present"
              : "Not marked"
          }
        />
        <InfoCard
          icon={Briefcase}
          color="text-indigo-500"
          bg="bg-indigo-50"
          label="Current Task"
          value={
            data.todayWork?.taskId?.title ||
            data.assignedTasks?.find((t) => t.status === "in_progress")
              ?.title ||
            "No work allocated yet"
          }
        />
        <InfoCard
          icon={IndianRupee}
          color="text-amber-500"
          bg="bg-amber-50"
          label="Estimated Earnings"
          value={formatINR(data.currentSalary?.netSalary || 0)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Assigned Tasks */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ListTodo className="text-blue-600" /> My Assigned Tasks
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-y-auto h-[185px] flex flex-col gap-px bg-slate-100 custom-scrollbar">
            {!data.assignedTasks || data.assignedTasks.length === 0 ? (
              <div className="bg-white p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                  <ListTodo className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-500 font-bold">
                  You have no pending tasks.
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Enjoy your free time!
                </p>
              </div>
            ) : (
              data.assignedTasks.map((t) => (
                <div
                  key={t._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-50 transition-colors gap-4"
                >
                  <div className="flex flex-col gap-4 flex-grow">
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">
                        {t.title}
                      </h4>
                      <p className="flex items-center gap-2 mt-1 text-sm font-medium text-slate-500">
                        <Building2 size={14} /> {t.projectId?.name || "Project"}
                      </p>
                    </div>
                    {t.status === "in_progress" && (
                      <div className="space-y-2 max-w-sm mt-2">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                          <span>Completion</span>
                          <span className="text-blue-600">
                            {t.progressPercentage || 0}%
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            defaultValue={t.progressPercentage || 0}
                            onMouseUp={(e) =>
                              updateTask.mutate({
                                taskId: t._id,
                                progressPercentage: parseInt(
                                  e.currentTarget.value,
                                ),
                              })
                            }
                            onTouchEnd={(e) =>
                              updateTask.mutate({
                                taskId: t._id,
                                progressPercentage: parseInt(
                                  e.currentTarget.value,
                                ),
                              })
                            }
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            title="Drag to update progress"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3 min-w-[140px]">
                    <span
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border text-center ${
                        t.status === "in_progress"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : t.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-blue-50 text-blue-700 border-blue-100"
                      }`}
                    >
                      {t.status.replace("_", " ")}
                    </span>

                    <div className="w-full flex justify-end">
                      {t.status === "not_started" && (
                        <button
                          onClick={() =>
                            updateTask.mutate({
                              taskId: t._id,
                              status: "in_progress",
                            })
                          }
                          disabled={updateTask.isPending}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors w-full"
                        >
                          {updateTask.isPending ? (
                            <Loader2
                              className="animate-spin mx-auto"
                              size={16}
                            />
                          ) : (
                            "Accept & Start"
                          )}
                        </button>
                      )}
                      {t.status === "in_progress" && (
                        <button
                          onClick={() =>
                            updateTask.mutate({
                              taskId: t._id,
                              status: "completed",
                            })
                          }
                          disabled={updateTask.isPending}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors w-full"
                        >
                          {updateTask.isPending ? (
                            <Loader2
                              className="animate-spin mx-auto"
                              size={16}
                            />
                          ) : (
                            "Mark Complete"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Salary Slips */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Wallet className="text-emerald-600" /> Recent Salary Slips
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-y-scroll h-[185px] flex flex-col gap-px bg-slate-100 custom-scrollbar">
            {!data.salarySlips || data.salarySlips.length === 0 ? (
              <div className="bg-white p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                  <Wallet className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-500 font-bold">
                  No salary slips generated yet.
                </p>
              </div>
            ) : (
              data.salarySlips.map((slip) => (
                <div
                  key={slip._id}
                  className="bg-white p-5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">
                      {slip.month}
                    </h3>
                    <p className="text-sm font-semibold text-slate-500 mt-1">
                      Paid on{" "}
                      {slip.paymentDate
                        ? new Date(slip.paymentDate).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-lg">
                      {formatINR(slip.netSalary)}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700">
                      {slip.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

async function workerAction(path, method = "POST", body) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Action failed");
  }
  return res.json();
}
async function workerGet(path) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

function InfoCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40 transition-transform hover:-translate-y-1">
      <div
        className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center mb-4`}
      >
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-black text-slate-900 truncate">
        {value}
      </p>
    </div>
  );
}

function State({ text, error = false }) {
  return (
    <div
      className={`flex min-h-[420px] items-center justify-center rounded-lg bg-slate-50 text-sm font-bold ${error ? "text-red-700" : "text-slate-600"}`}
    >
      {!error ? (
        <Loader2 className="mr-2 animate-spin text-blue-600" size={18} />
      ) : null}
      {text}
    </div>
  );
}
