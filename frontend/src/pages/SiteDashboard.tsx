import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CircleDashed, CloudSun, HardHat, Loader2, Package, Truck, Users } from "lucide-react";
import { useParams } from "react-router-dom";
import { apiGet, formatDate } from "../lib/api";

type SiteDashboardData = {
  project: { id: string; name: string };
  site: { _id: string; name: string };
  date: string;
  weather?: string;
  temperature?: number;
  kpis: { labourToday: number; workProgressToday: number; materialsUsed: number; equipmentUsed: number; openIssues: number; pendingInspections: number };
  checklist: Array<{ label: string; status: "completed" | "pending" | "not_required" }>;
  photos: Array<{ _id: string; url: string; caption?: string; category: string; uploadedAt: string }>;
  tasks: Array<{ _id: string; title: string; location?: string; progressPercentage: number; status: string }>;
  issues: Array<{ _id: string; title: string; severity: string; status: string }>;
};

export default function SiteDashboard() {
  const { projectId, siteId } = useParams();
  const dashboard = useQuery({
    queryKey: ["site-dashboard", projectId, siteId],
    enabled: Boolean(projectId && siteId),
    queryFn: () => apiGet<SiteDashboardData>(`/api/projects/${projectId}/sites/${siteId}/dashboard`),
  });

  if (dashboard.isLoading) return <StateCard text="Loading site dashboard..." />;
  if (dashboard.isError || !dashboard.data) return <StateCard text={dashboard.error instanceof Error ? dashboard.error.message : "Unable to load site dashboard"} error />;

  const data = dashboard.data;
  const cards = [
    { label: "Today's Labour", value: data.kpis.labourToday, icon: Users, color: "text-slate-900" },
    { label: "Today's Work", value: `${data.kpis.workProgressToday}%`, icon: HardHat, color: "text-blue-600" },
    { label: "Materials Used", value: data.kpis.materialsUsed, icon: Package, color: "text-slate-900" },
    { label: "Equipment Used", value: data.kpis.equipmentUsed, icon: Truck, color: "text-slate-900" },
    { label: "Open Issues", value: data.kpis.openIssues, icon: CircleDashed, color: "text-orange-600" },
    { label: "Pending Inspections", value: data.kpis.pendingInspections, icon: CheckCircle2, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-teal-600">Site Engineer Dashboard</p>
          <h1 className="text-2xl font-extrabold text-slate-900">{data.project.name} - {data.site.name}</h1>
          <p className="mt-1 text-xs text-slate-500">Daily execution, labour, material, equipment, photos and issues.</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1"><CloudSun size={16} className="text-orange-500" />{data.temperature ?? "-"}°C</span>
          <span>{data.weather || "Weather not submitted"}</span>
          <span>{formatDate(data.date)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                <Icon size={18} />
              </div>
              <p className={`mt-3 text-3xl font-extrabold ${item.color}`}>{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Today's Site Report Checklist">
          <div className="space-y-3">
            {data.checklist.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  {item.status === "completed" ? <CheckCircle2 size={16} className="text-emerald-600" /> : <CircleDashed size={16} className="text-amber-500" />}
                  {item.label}
                </span>
                <span className="text-xs font-extrabold uppercase text-slate-400">{item.status}</span>
              </div>
            ))}
          </div>
          <button className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">Complete Daily Report</button>
        </Panel>

        <Panel title="Site Photos" className="xl:col-span-2">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {data.photos.map((photo) => (
              <div key={photo._id} className="overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                <img src={photo.url} alt={photo.caption || photo.category} className="aspect-[4/3] h-full w-full object-cover" />
              </div>
            ))}
            {!data.photos.length ? <Empty text="No site photos uploaded." /> : null}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel title="Today's Tasks">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500"><th className="pb-3 text-left">Task</th><th className="pb-3 text-right">Progress</th><th className="pb-3 text-right">Status</th></tr></thead>
            <tbody>
              {data.tasks.map((task) => (
                <tr key={task._id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 font-bold text-slate-700">{task.title}</td>
                  <td className="py-3 text-right font-semibold">{task.progressPercentage}%</td>
                  <td className="py-3 text-right font-extrabold text-emerald-600">{task.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.tasks.length ? <Empty text="No tasks assigned to this site." /> : null}
        </Panel>

        <Panel title="Site Issues">
          <div className="space-y-3">
            {data.issues.map((issue) => (
              <div key={issue._id} className="flex items-center justify-between gap-3 rounded-md bg-orange-50 px-3 py-2 text-sm">
                <span className="font-bold text-orange-900">{issue.title}</span>
                <span className="text-xs font-extrabold text-orange-700">{issue.severity} / {issue.status}</span>
              </div>
            ))}
            {!data.issues.length ? <Empty text="No open site issues." /> : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return <div className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm ${className}`}><h2 className="mb-4 text-base font-extrabold text-slate-900">{title}</h2>{children}</div>;
}
function StateCard({ text, error = false }: { text: string; error?: boolean }) {
  return <div className={`flex min-h-[420px] items-center justify-center rounded-lg border bg-white text-sm font-bold ${error ? "border-red-200 text-red-700" : "border-slate-200 text-slate-600"}`}>{!error ? <Loader2 className="mr-2 animate-spin text-blue-600" size={18} /> : null}{text}</div>;
}
function Empty({ text }: { text: string }) {
  return <div className="rounded-md bg-slate-50 px-3 py-4 text-center text-sm font-bold text-slate-500">{text}</div>;
}
