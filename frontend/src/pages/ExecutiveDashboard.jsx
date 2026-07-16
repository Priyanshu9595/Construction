import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Loader2,
  PauseCircle,
} from "lucide-react";
import { apiGet, formatINR } from "../lib/api";

export default function ExecutiveDashboard() {
  const dashboard = useQuery({
    queryKey: ["company-dashboard"],
    queryFn: async () => ({
      summary: await apiGet("/api/company/dashboard/summary"),
      recent: await apiGet("/api/company/dashboard/recent-projects"),
      alerts: await apiGet("/api/company/dashboard/alerts"),
      financial: await apiGet("/api/company/dashboard/financial-overview"),
    }),
  });

  if (dashboard.isLoading)
    return <StateCard text="Loading company dashboard..." />;
  if (dashboard.isError || !dashboard.data)
    return (
      <StateCard
        text={
          dashboard.error instanceof Error
            ? dashboard.error.message
            : "Unable to load company dashboard"
        }
        error
      />
    );

  const { summary, recent, alerts, financial } = dashboard.data;
  const kpis = [
    {
      label: "Total Projects",
      value: summary.totalProjects,
      icon: Building2,
      color: "text-blue-600",
    },
    {
      label: "In Progress",
      value: summary.inProgress,
      icon: Clock3,
      color: "text-emerald-600",
    },
    {
      label: "Completed",
      value: summary.completed,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      label: "On Hold",
      value: summary.onHold,
      icon: PauseCircle,
      color: "text-orange-600",
    },
    {
      label: "Delayed",
      value: summary.delayed,
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      label: "Employees",
      value: summary.activeEmployees,
      icon: Building2,
      color: "text-purple-600",
    },
    {
      label: "Total Expenses",
      value: formatINR(financial.totalExpenses),
      icon: IndianRupee,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">
          Company Owner / Admin Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
          Company Performance Overview
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          All values are calculated from company-scoped MongoDB records.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-7">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {kpi.label}
                </span>
                <Icon className={kpi.color} size={18} />
              </div>
              <p className={`mt-3 text-3xl font-extrabold ${kpi.color}`}>
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      <div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-extrabold text-slate-900">
            Recent Projects
          </h2>
          <div className="space-y-3">
            {recent.map((project) => (
              <div
                key={project.id}
                className="rounded-md border border-slate-100 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {project.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {project.clientName ||
                        project.location ||
                        "No client/location"}
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">
                    {project.progress}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
            {!recent.length ? <Empty text="No projects found." /> : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-extrabold text-slate-900">
            Tasks Requiring Attention
          </h2>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={`${alert.description}-${index}`}
                className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2 font-bold text-slate-700">
                  <AlertTriangle
                    size={16}
                    className={
                      alert.severity === "critical"
                        ? "text-red-600"
                        : "text-orange-500"
                    }
                  />
                  {alert.description}
                </span>
                <span className="text-xs font-extrabold text-blue-600">
                  {alert.cta}
                </span>
              </div>
            ))}
            {!alerts.length ? <Empty text="No alerts need attention." /> : null}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-extrabold text-slate-900">
            Company Overview
          </h2>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            {[
              ["Total Budget", financial.totalBudget],
              ["Total Expenses", financial.totalExpenses],
              ["Committed Cost", financial.totalCommittedCost],
              ["Actual Revenue", financial.totalExpectedRevenue],
              ["Net Cash", financial.totalExpectedProfit],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-500">{label}</p>
                <p className="mt-2 flex items-center text-sm font-extrabold text-slate-900">
                  <IndianRupee size={13} />
                  {formatINR(value).replace("₹", "")}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm font-bold text-emerald-600">
            Profit margin {financial.profitMargin}%
          </p>
        </div>
      </div>
    </div>
  );
}

function StateCard({ text, error = false }) {
  return (
    <div
      className={`flex min-h-[420px] items-center justify-center rounded-lg border bg-white text-sm font-bold ${error ? "border-red-200 text-red-700" : "border-slate-200 text-slate-600"}`}
    >
      {!error ? (
        <Loader2 className="mr-2 animate-spin text-blue-600" size={18} />
      ) : null}
      {text}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-4 text-center text-sm font-bold text-slate-500">
      {text}
    </div>
  );
}
