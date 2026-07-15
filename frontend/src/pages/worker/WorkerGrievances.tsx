import { AlertTriangle, Send } from "lucide-react";

export default function WorkerGrievances() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 sm:p-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Grievances</h1>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xl shadow-slate-200/40 space-y-6">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-6">
          <AlertTriangle size={48} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Report an Issue</h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto">
          The grievance reporting module is currently under development. Soon, you will be able to report issues related to safety, payments, or site conditions directly to the Project Manager.
        </p>
        
        <div className="pt-8">
          <button 
            disabled
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-8 py-4 text-sm font-bold text-slate-400 cursor-not-allowed"
          >
            <Send size={18} /> Submit a Grievance (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
