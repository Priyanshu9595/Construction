import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ClipboardCheck, IndianRupee, Loader2, ShieldCheck } from "lucide-react";
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiGet, formatINR } from "../lib/api";

type Props = {
  title: string;
  subtitle: string;
  endpoint: string;
  accent: string;
};

export default function SimpleRoleDashboard({ title, subtitle, endpoint, accent }: Props) {
  const q = useQuery({ queryKey: [endpoint], queryFn: () => apiGet<any>(endpoint) });
  if (q.isLoading) return <State text={`Loading ${title}...`} />;
  if (q.isError || !q.data) return <State text={q.error instanceof Error ? q.error.message : `Unable to load ${title}`} error />;
  const data = q.data;
  const summary = data.summary || {};
  const cards = Object.entries(summary).slice(0, 8);
  const chartRows = data.cashflow || data.expenseCategories || data.recentOrders || data.inspections || data.incidents || data.projects || [];

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className={`text-sm font-bold ${accent}`}>{subtitle}</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900">{title}</h1>
        <p className="mt-1 text-xs text-slate-500">All cards and tables are loaded from protected MongoDB APIs.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([key, value]) => <Kpi key={key} label={labelize(key)} value={formatValue(value)} accent={accent} />)}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="mb-4 font-extrabold text-slate-900">Trend Overview</h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={normaliseChart(chartRows)}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-extrabold text-slate-900">Status Mix</h2>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={normaliseChart(chartRows).slice(0, 5)} dataKey="value" innerRadius={58} outerRadius={82}>{normaliseChart(chartRows).slice(0, 5).map((r, i) => <Cell key={r.name} fill={["#2563eb", "#f97316", "#7c3aed", "#16a34a", "#ef4444"][i % 5]} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-extrabold text-slate-900">Recent Records</h2>
        <div className="space-y-3">
          {recentRows(data).map((row: any, index: number) => <div key={row.id || row._id || index} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm"><span className="font-bold text-slate-800">{row.title || row.name || row.poNumber || row.inspectionNumber || row.incidentNumber || row.invoiceNumber || row.subject || `Record ${index + 1}`}</span><span className="font-semibold text-slate-500">{row.status || row.result || row.amount || ""}</span></div>)}
          {!recentRows(data).length ? <div className="rounded bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">No records yet.</div> : null}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent: string }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase text-slate-500">{label}</span>{label.includes("Safety") || label.includes("Quality") ? <ShieldCheck className={accent} size={18} /> : label.includes("Amount") || label.includes("Revenue") || label.includes("Pay") || label.includes("Income") || label.includes("Expense") ? <IndianRupee className={accent} size={18} /> : <ClipboardCheck className={accent} size={18} />}</div><p className={`mt-3 text-2xl font-extrabold ${accent}`}>{value}</p></div>;
}
function State({ text, error = false }: { text: string; error?: boolean }) { return <div className={`flex min-h-[420px] items-center justify-center rounded-lg border bg-white text-sm font-bold ${error ? "text-red-700" : "text-slate-600"}`}>{error ? <AlertTriangle className="mr-2" size={18} /> : <Loader2 className="mr-2 animate-spin text-blue-600" size={18} />}{text}</div>; }
function labelize(key: string) { return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()); }
function formatValue(value: unknown) { return typeof value === "number" && value > 9999 ? formatINR(value) : String(value ?? 0); }
function normaliseChart(rows: any[]) { return rows.map((row, i) => ({ name: row.date || row.name || row.project || row.status || row.poNumber || row.inspectionNumber || row.incidentNumber || `Item ${i + 1}`, value: Number(row.value ?? row.amount ?? row.totalAmount ?? row.progress ?? row.deliveryProgress ?? row.inflow ?? row.count ?? i + 1) || 0 })); }
function recentRows(data: any) { return data.recentOrders || data.inspections || data.incidents || data.projects || data.invoices || data.queries || []; }
