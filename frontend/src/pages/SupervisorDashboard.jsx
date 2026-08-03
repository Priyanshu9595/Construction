import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  HardHat,
  Loader2,
  Users,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { apiGet } from "../lib/api";

export default function SupervisorDashboard() {
  const query = useQuery({
    queryKey: ["supervisor-dashboard"],
    queryFn: async () => ({
      summary: await apiGet("/api/supervisor/dashboard/summary"),
      attendance: await apiGet("/api/supervisor/dashboard/attendance"),
      trades: await apiGet("/api/supervisor/dashboard/trades"),
      allocations: await apiGet("/api/supervisor/dashboard/allocations"),
    }),
  });
  if (query.isLoading) return <State text="Loading supervisor dashboard..." />;
  if (query.isError || !query.data)
    return (
      <State
        text={
          query.error instanceof Error
            ? query.error.message
            : "Unable to load supervisor dashboard"
        }
        error
      />
    );

  const { summary, attendance, trades, allocations } = query.data;
  const cards = [
    ["Total Labour", summary.totalLabourAssigned, Users, "text-slate-900"],
    ["Present Today", summary.presentToday, CheckCircle2, "text-slate-900"],
    ["Absent Today", summary.absentToday, AlertTriangle, "text-slate-900"],
    ["On Leave", summary.onLeave, Clock, "text-slate-900"],
    ["Late Workers", summary.lateWorkers, Clock, "text-slate-900"],
    ["Overtime", summary.overtimeWorkers, Clock, "text-slate-900"],
    ["Active Tasks", summary.activeTasks, HardHat, "text-slate-900"],
    [
      "Shortage Alerts",
      summary.labourShortageAlerts,
      AlertTriangle,
      "text-slate-900",
    ],
  ];
  const colors = ["#22c55e", "#ef4444", "#f59e0b", "#3b82f6", "#a855f7"];

  return (
    <div className="space-y-5">
      <Header
        title="Site Supervisor Dashboard"
        subtitle="Labour attendance, allocation, overtime and productivity from MongoDB."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, color]) => (
          <Card
            key={label}
            label={label}
            value={value}
            icon={Icon}
            color={color}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Today's Attendance Chart">
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendance}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={62}
                  outerRadius={86}
                >
                  {attendance.map((row, index) => (
                    <Cell
                      key={row.status}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Labour by Trade" className="xl:col-span-2">
          <div className="overflow-x-auto">
<table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-slate-500">
                <th className="py-2 text-left">Trade</th>
                <th>Assigned</th>
                <th>Present</th>
                <th>Required</th>
                <th>Shortage</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((row) => (
                <tr key={row.trade} className="border-b border-slate-50">
                  <td className="py-3 font-bold">{row.trade}</td>
                  <td className="text-center">{row.assigned}</td>
                  <td className="text-center">{row.present}</td>
                  <td className="text-center">{row.required}</td>
                  <td
                    className={`text-center font-bold ${row.shortage > 0 ? "text-red-600" : "text-emerald-600"}`}
                  >
                    {row.shortage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        </Panel>
      </div>
      <Panel title="Labour Allocation">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {allocations.map((row) => (
            <div
              key={row._id}
              className="rounded-lg border border-slate-100 p-3 text-sm"
            >
              <p className="font-bold text-slate-800">
                {row.workerId?.name || "Worker"}
              </p>
              <p className="text-xs text-slate-500">
                {row.workerId?.trade} / {row.taskId?.title}
              </p>
              <p className="mt-2 font-semibold text-blue-600">{row.status}</p>
            </div>
          ))}
          {!allocations.length ? (
            <Empty text="No allocations found for today." />
          ) : null}
        </div>
      </Panel>
    </div>
  );
}

function Header({ title, subtitle }) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
      <p className="text-sm font-medium text-slate-500">{subtitle}</p>
    </div>
  );
}
function Card({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex justify-between">
        <span className="text-xs font-bold uppercase text-slate-500">
          {label}
        </span>
        <Icon className={color} size={18} />
      </div>
      <p className={`mt-3 text-3xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}
function Panel({ title, className = "", children }) {
  return (
    <div className={`rounded-lg border bg-white p-5 shadow-sm ${className}`}>
      <h2 className="mb-4 font-extrabold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}
function State({ text, error = false }) {
  return (
    <div
      className={`flex min-h-[420px] items-center justify-center rounded-lg border bg-white text-sm font-bold ${error ? "text-red-700" : "text-slate-600"}`}
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
    <div className="rounded bg-slate-50 p-4 text-center text-sm font-bold text-slate-500">
      {text}
    </div>
  );
}
