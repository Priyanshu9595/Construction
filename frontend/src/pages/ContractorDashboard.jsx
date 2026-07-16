import { useQuery } from "@tanstack/react-query";
import { Briefcase, IndianRupee, Loader2, Users } from "lucide-react";
import { apiGet, formatINR } from "../lib/api";

export default function ContractorDashboard() {
  const q = useQuery({
    queryKey: ["contractor-dashboard"],
    queryFn: () => apiGet("/api/contractor/dashboard"),
  });
  if (q.isLoading) return <State text="Loading contractor dashboard..." />;
  if (q.isError || !q.data)
    return (
      <State
        text={
          q.error instanceof Error
            ? q.error.message
            : "Unable to load contractor dashboard"
        }
        error
      />
    );
  const s = q.data.summary;
  const cards = [
    { label: "Work Orders", value: s.totalWorkOrders, icon: Briefcase },
    { label: "In Progress", value: s.inProgress, icon: Briefcase },
    {
      label: "Outstanding",
      value: formatINR(s.outstandingPayment),
      icon: IndianRupee,
    },
    { label: "Labour Today", value: s.labourDeployedToday, icon: Users },
  ];
  return (
    <div className="space-y-5">
      <Header title="Contractor Dashboard" subtitle={q.data.contractor.name} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <Card
            key={card.label}
            label={card.label}
            value={String(card.value)}
            icon={card.icon}
          />
        ))}
      </div>
      <Panel title="Work Progress">
        {q.data.workOrders.map((wo) => (
          <div key={wo._id} className="py-3">
            <div className="flex justify-between text-sm font-bold">
              <span>{wo.title}</span>
              <span>{wo.progressPercentage}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${wo.progressPercentage}%` }}
              />
            </div>
          </div>
        ))}
      </Panel>
      <Panel title="Running Bills">
        {q.data.bills.map((bill) => (
          <div
            key={bill._id}
            className="flex justify-between rounded bg-slate-50 p-3 text-sm"
          >
            <span className="font-bold">{bill.billNumber}</span>
            <span>
              {formatINR(bill.netPayable)} / {bill.status}
            </span>
          </div>
        ))}
      </Panel>
    </div>
  );
}
function Header({ title, subtitle }) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-extrabold">{title}</h1>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}
function Card({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <Icon className="text-blue-600" />
      <p className="mt-3 text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  );
}
function Panel({ title, children }) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-extrabold">{title}</h2>
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
