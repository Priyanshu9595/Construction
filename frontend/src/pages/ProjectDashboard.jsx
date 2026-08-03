import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  FileText,
  IndianRupee,
  Loader2,
  Users,
} from "lucide-react";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useParams } from "react-router-dom";
import { apiGet, formatINR } from "../lib/api";

export default function ProjectDashboard() {
  const params = useParams();
  const projectId = params.projectId || "missing";
  const dashboard = useQuery({
    queryKey: ["project-dashboard", projectId],
    enabled: projectId !== "missing",
    queryFn: async () => ({
      summary: await apiGet(`/api/projects/${projectId}/dashboard/summary`),
      progress: await apiGet(`/api/projects/${projectId}/dashboard/progress`),
      budget: await apiGet(`/api/projects/${projectId}/dashboard/budget`),
      tasks: await apiGet(`/api/projects/${projectId}/dashboard/tasks`),
      milestones: await apiGet(
        `/api/projects/${projectId}/dashboard/milestones`,
      ),
      issues: await apiGet(`/api/projects/${projectId}/dashboard/issues`),
    }),
  });

  if (dashboard.isLoading)
    return <StateCard text="Loading project dashboard..." />;
  if (dashboard.isError || !dashboard.data)
    return (
      <StateCard
        text={
          dashboard.error instanceof Error
            ? dashboard.error.message
            : "Unable to load project dashboard"
        }
        error
      />
    );

  const { summary, progress, budget, tasks, milestones, issues } =
    dashboard.data;
  const budgetData = [
    { name: "Expense", value: budget.expense, color: "#3b82f6" },
    { name: "Committed", value: budget.committedCost, color: "#f97316" },
    {
      name: "Net Cash",
      value: Math.max(
        0,
        budget.revenue - budget.expense - budget.committedCost,
      ),
      color: "#22c55e",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
          Project Manager Dashboard
        </p>
        <div className="mt-1 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
              {summary.project.name}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {summary.project.clientName || "No client"} /{" "}
              {summary.project.location || "No location"}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-right">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Approved Budget
            </p>
            <p className="text-sm font-extrabold text-slate-900">
              {formatINR(summary.project.approvedBudget || 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3">
        {[
          [
            "Overall Progress",
            `${summary.overallProgress}%`,
            "text-slate-900",
          ],
          ["Total Expenses", formatINR(summary.totalExpenses), "text-slate-900"],
          ["Budget Used", `${summary.budgetUsed}%`, "text-slate-900"],
          [
            "Days Passed",
            summary.totalDays
              ? `${summary.daysPassed} / ${summary.totalDays}`
              : "Not scheduled",
            "text-slate-900",
          ],
          [
            "Delay",
            summary.delayDays ? `${summary.delayDays} Days` : "On Schedule",
            "text-slate-900",
          ],
          ["Labour Present", summary.labourPresentToday, "text-slate-900"],
          ["Pending Tasks", summary.pendingTasks, "text-slate-900"],
          ["Open Issues", summary.openIssues, "text-slate-900"],
          ["Pending Approvals", summary.pendingApprovals, "text-slate-900"],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="flex h-full flex-col justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm"
          >
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              {label}
            </span>
            <span className={`text-[22px] font-bold leading-none tracking-tight ${color}`}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="mb-4 text-base font-extrabold text-slate-900">
            Project Progress
          </h2>
          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progress}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="planned"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#22c55e"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-extrabold text-slate-900">
            Financial Overview
          </h2>
          <div className="h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetData}
                  innerRadius={54}
                  outerRadius={76}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {budgetData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatINR(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-sm font-semibold">
            <div className="flex justify-between">
              <span className="text-slate-500">Actual Revenue</span>
              <span>{formatINR(budget.revenue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Expenses</span>
              <span>{formatINR(budget.expense || 0)}</span>
            </div>
            <div
              className={`flex justify-between font-bold ${budget.revenue - budget.expense < 0 ? "text-red-600" : "text-emerald-600"}`}
            >
              <span>Net Cash</span>
              <span>{formatINR(budget.revenue - budget.expense)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Recent Tasks" className="xl:col-span-2">
          {tasks.map((task) => (
            <ProgressRow
              key={task._id}
              label={task.title}
              value={task.progressPercentage}
              status={task.status}
            />
          ))}
          {!tasks.length ? <Empty text="No tasks found." /> : null}
        </Panel>
        <Panel title="Upcoming Milestones">
          {milestones.map((item) => (
            <ProgressRow
              key={item._id}
              label={item.title}
              value={item.progress}
              status={item.status}
            />
          ))}
          {!milestones.length ? <Empty text="No milestones found." /> : null}
        </Panel>
      </div>

      <Panel title="Project Risks and Issues">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {issues.map((issue) => (
            <div
              key={issue._id}
              className="rounded-md bg-orange-50 p-3 text-sm"
            >
              <p className="font-bold text-orange-900">{issue.title}</p>
              <p className="text-xs font-semibold text-orange-700">
                {issue.severity} / {issue.status}
              </p>
            </div>
          ))}
          {!issues.length ? <Empty text="No open issues." /> : null}
        </div>
      </Panel>

      <Panel title="Linked Workflow">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {[
            { icon: Users, label: "Site labour updates progress" },
            { icon: IndianRupee, label: "Material usage updates budget" },
            { icon: AlertCircle, label: "Issues update delay risk" },
            { icon: FileText, label: "Reports update approvals" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-md bg-slate-50 p-3 text-sm font-bold text-slate-700"
              >
                <Icon size={18} className="text-blue-600" />
                {item.label}
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function ProgressRow({ label, value, status }) {
  return (
    <div className="grid grid-cols-[1fr_110px_90px] items-center gap-3 py-2 text-sm">
      <div className="truncate font-bold text-slate-700">{label}</div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-right text-xs font-extrabold text-slate-500">
        {status}
      </span>
    </div>
  );
}
function Panel({ title, className = "", children }) {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      <h2 className="mb-4 text-base font-extrabold text-slate-900">{title}</h2>
      {children}
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
