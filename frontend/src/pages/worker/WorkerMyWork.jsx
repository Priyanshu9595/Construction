import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, HardHat, Building2, CheckCircle2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

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
  if (!res.ok) throw new Error("Action failed");
  return res.json();
}

export default function WorkerMyWork() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["worker-dashboard"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/worker/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
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

  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  if (isError || !data)
    return (
      <div className="text-red-600 p-8 text-center font-bold">
        Failed to load tasks.
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          My Work
        </h1>
        <span className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 border border-blue-100">
          <HardHat size={18} /> {data.assignedTasks?.length || 0} Tasks Assigned
        </span>
      </div>

      <div className="grid gap-4">
        {data.assignedTasks?.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xl shadow-slate-200/40">
            <h3 className="text-xl font-bold text-slate-700">
              No tasks assigned to you right now.
            </h3>
          </div>
        ) : (
          data.assignedTasks?.map((t) => (
            <div
              key={t._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 hover:border-blue-300 transition-colors gap-4"
            >
              <div className="flex flex-col gap-4 flex-grow">
                <div>
                  <h4 className="font-bold text-slate-900 text-xl">
                    {t.title}
                  </h4>
                  <p className="flex items-center gap-2 mt-2 text-sm font-medium text-slate-500">
                    <Building2 size={16} /> {t.projectId?.name || "Project"}
                  </p>
                </div>

                {t.status === "in_progress" && (
                  <div className="space-y-2 max-w-sm mt-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                      <span>Completion</span>
                      <span className="text-blue-600">
                        {t.progressPercentage}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        defaultValue={t.progressPercentage}
                        onMouseUp={(e) =>
                          updateTask.mutate({
                            taskId: t._id,
                            progressPercentage: parseInt(e.currentTarget.value),
                          })
                        }
                        onTouchEnd={(e) =>
                          updateTask.mutate({
                            taskId: t._id,
                            progressPercentage: parseInt(e.currentTarget.value),
                          })
                        }
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        title="Drag to update progress"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-3 min-w-[200px]">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border text-center ${
                    t.status === "in_progress"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : t.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {t.status.replace("_", " ")}
                </span>

                <div className="w-full">
                  {t.status === "not_started" && (
                    <button
                      onClick={() =>
                        updateTask.mutate({
                          taskId: t._id,
                          status: "in_progress",
                        })
                      }
                      disabled={updateTask.isPending}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/30 w-full flex items-center justify-center gap-2"
                    >
                      {updateTask.isPending ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <>
                          <CheckCircle2 size={18} /> Accept & Start
                        </>
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
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-emerald-600/30 w-full flex items-center justify-center gap-2 mt-2"
                    >
                      {updateTask.isPending ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <>
                          <CheckCircle2 size={18} /> Mark Complete
                        </>
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
  );
}
