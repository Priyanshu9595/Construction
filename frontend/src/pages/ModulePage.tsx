import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ModulePageProps = {
  title: string;
  subtitle?: string;
  backTo?: string;
};

export default function ModulePage({ title, subtitle = "This module is connected to the BuildFlow workflow.", backTo = "/app" }: ModulePageProps) {
  const navigate = useNavigate();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-blue-600">BuildFlow Module</p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-950">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(backTo)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} /> Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {["Live data", "Role access", "Audit ready"].map((label) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-extrabold text-slate-800">{label}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Use the sidebar or dashboard actions to continue working in this area.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
