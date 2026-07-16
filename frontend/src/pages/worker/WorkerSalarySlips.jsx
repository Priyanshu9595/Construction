import { useQuery } from "@tanstack/react-query";
import { Loader2, IndianRupee, Download, Calendar } from "lucide-react";
import { formatINR } from "../../lib/api";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function WorkerSalarySlips() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["worker-dashboard"], // Reuse dashboard query
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/worker/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const salarySlips = data?.salarySlips || [];
  const profile = data?.profile;

  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  if (isError)
    return (
      <div className="text-red-600 p-8 text-center font-bold">
        Failed to load salary slips.
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Salary Slips
        </h1>
        <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 border border-emerald-100">
          <IndianRupee size={18} /> {salarySlips.length} Slips
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {salarySlips.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xl shadow-slate-200/40">
            <h3 className="text-xl font-bold text-slate-700">
              No salary slips generated yet.
            </h3>
          </div>
        ) : (
          salarySlips.map((slip) => {
            const [year, month] = slip.month.split("-");
            const parsedDate = new Date(parseInt(year), parseInt(month) - 1);
            const monthName = parsedDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            });
            return (
              <div
                key={slip._id}
                className="relative flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 hover:border-emerald-300 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                    <Calendar size={16} /> {monthName}
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-widest ${slip.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {slip.paymentStatus}
                  </span>
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-baseline">
                  {formatINR(slip.netSalary)}
                </h2>

                <button
                  onClick={() =>
                    navigate("/worker/salary-slips/print", {
                      state: { slip, profile },
                    })
                  }
                  className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <Download size={16} /> Download Slip
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
