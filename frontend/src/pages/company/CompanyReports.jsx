import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Download,
  BarChart2,
  PieChart,
  TrendingUp,
  IndianRupee,
} from "lucide-react";
import { Button, PageShell, Panel, StatCard } from "../../components/ui/AppUI";
import { apiGet, formatINR } from "../../lib/api";

export default function CompanyReports() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["company-performance"],
    queryFn: async () => ({
      summary: await apiGet("/api/company/dashboard/summary"),
      financial: await apiGet("/api/company/dashboard/financial-overview"),
      recent: await apiGet("/api/company/dashboard/recent-projects"),
    }),
  });

  const reportsList = [
    {
      title: "Financial Overview (MTD)",
      icon: <IndianRupee size={24} className="text-emerald-500" />,
      desc: "Monthly revenue, expenses, and profit margins.",
    },
    {
      title: "Project Status Report",
      icon: <BarChart2 size={24} className="text-blue-500" />,
      desc: "Detailed breakdown of all active projects.",
    },
    {
      title: "Labour Productivity",
      icon: <TrendingUp size={24} className="text-orange-500" />,
      desc: "Attendance vs output correlation.",
    },
    {
      title: "Material Consumption",
      icon: <PieChart size={24} className="text-purple-500" />,
      desc: "Stock levels, shortages, and GRN summaries.",
    },
  ];

  return (
    <PageShell
      eyebrow="Company Workspace"
      title="Company Reports"
      description="Generate and download company-wide analytics and summaries."
      actions={
        <Button variant="secondary">
          <Download size={16} /> Export Summary
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Active Projects"
          value={metrics?.summary?.inProgress || 0}
          tone="blue"
        />
        <StatCard
          label="Total Budget"
          value={formatINR(metrics?.financial?.totalBudget || 0)}
          tone="slate"
        />
        <StatCard
          label="Total Expenses"
          value={formatINR(metrics?.financial?.totalExpenses || 0)}
          tone="red"
        />
        <StatCard
          label="Net Cash"
          value={formatINR(metrics?.financial?.totalExpectedProfit || 0)}
          tone={
            (metrics?.financial?.totalExpectedProfit || 0) < 0
              ? "red"
              : "emerald"
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reportsList.map((report, idx) => (
              <div
                key={idx}
                className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    {report.icon}
                  </div>
                  <button className="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50">
                    <Download size={20} />
                  </button>
                </div>
                <h3 className="mt-4 font-extrabold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                  {report.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500 font-medium">
                  {report.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Panel title="Quick Summary">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Total Active Projects
                  </p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">
                    {metrics?.summary?.inProgress || 0}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <p className="text-xs font-bold text-emerald-600 uppercase">
                    Net Cash
                  </p>
                  <p className="text-2xl font-extrabold text-emerald-700 mt-1 flex items-center">
                    <IndianRupee size={20} />
                    {(
                      metrics?.financial?.totalExpectedProfit || 0
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl">
                  <p className="text-xs font-bold text-rose-600 uppercase">
                    Total Expenses
                  </p>
                  <p className="text-2xl font-extrabold text-rose-700 mt-1 flex items-center">
                    <IndianRupee size={20} />
                    {(metrics?.financial?.totalExpenses || 0).toLocaleString(
                      "en-IN",
                    )}
                  </p>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </PageShell>
  );
}
