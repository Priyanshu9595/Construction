import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronDown,
  Download,
  Edit3,
  Eye,
  FileText,
  IndianRupee,
  Loader2,
  Megaphone,
  MoreHorizontal,
  Plus,
  Search,
  ShieldAlert,
  Ticket,
  Trash2,
  Users,
  TrendingDown,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const emptyExpenseForm = {
  title: "",
  category: "Other",
  amount: 0,
  description: "",
};

const emptyCompanyForm = {
  companyName: "",
  email: "",
  phone: "",
  address: "",
  status: "pending",
  ownerFirstName: "",
  ownerLastName: "",
  ownerEmail: "",
  ownerPassword: "123456",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [companyModal, setCompanyModal] = useState(null);
  const [expenseModal, setExpenseModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [dateFilter, setDateFilter] = useState("Last 30 Days");
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["super-admin-dashboard"],
    queryFn: fetchDashboard,
  });
  const saveCompany = useMutation({
    mutationFn: (form) => saveCompanyRequest(form),
    onSuccess: () => {
      setCompanyModal(null);
      queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard"] });
    },
  });

  const saveExpense = useMutation({
    mutationFn: (form) => saveExpenseRequest(form),
    onSuccess: () => {
      setExpenseModal(false);
      queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard"] });
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/admin/companies/${id}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete company");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[560px] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
          <Loader2 className="animate-spin text-blue-600" size={20} />
          Loading live platform dashboard...
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
        {error instanceof Error
          ? error.message
          : "Unable to load dashboard data"}
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Companies",
      value: data.stats.totalCompanies,
      meta: `+${data.stats.companiesThisMonth} this month`,
      icon: Building2,
      color: "text-slate-500",
      bg: "bg-slate-100",
    },
    {
      label: "Active Companies",
      value: data.stats.activeCompanies,
      meta: `${data.stats.activationRate}% activation rate`,
      icon: CheckCircle2,
      color: "text-slate-500",
      bg: "bg-slate-100",
    },
    {
      label: "Total Users",
      value: data.stats.totalUsers,
      meta: `+${data.stats.usersThisMonth} this month`,
      icon: Users,
      color: "text-slate-500",
      bg: "bg-slate-100",
    },
    {
      label: "Total Projects",
      value: data.stats.totalProjects,
      meta: `+${data.stats.projectsThisMonth} this month`,
      icon: FileText,
      color: "text-slate-500",
      bg: "bg-slate-100",
    },
    {
      label: "All Co. Expenses",
      value: data.financials.totalCompanyExpenses,
      meta: `Total across platform`,
      icon: IndianRupee,
      color: "text-slate-500",
      bg: "bg-slate-100",
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative">
            <div className="absolute -left-5 top-0 h-full w-1 rounded-r-lg bg-blue-600"></div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Super Admin Workspace
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm">
              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="bg-transparent outline-none cursor-pointer"
                aria-label="Date filter"
              >
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>
              <ChevronDown size={16} className="text-slate-400" />
            </div>
            <button
              onClick={() => exportDashboardCsv(data)}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <Download size={16} className="text-blue-600" /> Export Report
            </button>
            <button
              onClick={() => setCompanyModal(emptyCompanyForm)}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <Plus size={17} /> Add Company
            </button>
          </div>
        </div>
      </section>

      <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-75">
        <PerformanceCards
          performance={data.performance}
          companyExpenses={data.financials.totalCompanyExpenses}
        />
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group relative flex h-full flex-col justify-center gap-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {card.label}
                  </span>
                  <span className="text-[22px] font-bold leading-none tracking-tight text-slate-900">
                    {card.value.toLocaleString("en-IN")}
                  </span>
                </div>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${card.bg} ${card.color}`}
                >
                  <Icon size={16} strokeWidth={2.5} />
                </span>
              </div>
              <p
                className={`relative z-10 mt-1 flex items-center gap-1.5 text-[10px] font-bold ${card.color}`}
              >
                <div className={`h-1.5 w-1.5 rounded-full bg-current`} />
                {card.meta}
              </p>
            </div>
          );
        })}
      </section>

      <section className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-950">
              Platform Growth
            </h2>
            <div className="flex rounded-lg bg-slate-100 p-1">
              <button className="rounded-md bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
                Companies
              </button>
            </div>
          </div>
          <div className="h-[280px] sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.platformGrowth}
                margin={{ top: 12, right: 18, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="companyGrowth"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#e5e7eb"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    border: "none",
                    borderRadius: 10,
                    boxShadow: "0 12px 28px rgb(15 23 42 / 0.14)",
                  }}
                />
                <Area
                  type="linear"
                  dataKey="companies"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#companyGrowth)"
                  dot={{
                    r: 4,
                    fill: "#fff",
                    stroke: "#2563eb",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px] animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
        <RecentCompaniesTable
          companies={data.recentCompanies}
          onView={setSelectedCompany}
          onDelete={(company) => deleteCompanyMutation.mutate(company.id)}
          onEdit={(company) =>
            setCompanyModal({
              id: company.id,
              companyName: company.company,
              email: company.email,
              phone: company.phone,
              address: company.address,
              status: company.status,
              ownerFirstName: company.ownerFirstName,
              ownerLastName: company.ownerLastName,
              ownerEmail: company.ownerEmail,
              ownerPassword: "",
            })
          }
        />

        <div className="space-y-5">
          <QuickActions
            onAction={(action) => {
              if (action === "Add New Company")
                setCompanyModal(emptyCompanyForm);
              if (action === "Add Platform Expense") setExpenseModal(true);
              if (action === "Manage Users") navigate("/super-owner/users");
              if (action === "Send Announcement")
                navigate("/super-owner/announcements");
              if (action === "View Support Tickets")
                navigate("/super-owner/support");
              if (action === "Download Platform Report")
                exportDashboardCsv(data);
            }}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-500 pb-12">
        <RecentActivity activities={data.recentActivity} />
        <AttentionAlerts alerts={data.alerts} />
      </section>
      {companyModal ? (
        <CompanyModal
          form={companyModal}
          isSaving={saveCompany.isPending}
          error={
            saveCompany.error instanceof Error ? saveCompany.error.message : ""
          }
          onClose={() => setCompanyModal(null)}
          onSubmit={(form) => saveCompany.mutate(form)}
        />
      ) : null}
      {expenseModal ? (
        <ExpenseModal
          isSaving={saveExpense.isPending}
          error={
            saveExpense.error instanceof Error ? saveExpense.error.message : ""
          }
          onClose={() => setExpenseModal(false)}
          onSubmit={(form) => saveExpense.mutate(form)}
        />
      ) : null}
      {selectedCompany ? (
        <CompanyDetailsModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      ) : null}
    </div>
  );
}

async function fetchDashboard() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unable to load dashboard data");
  }
  return data;
}

async function saveCompanyRequest(form) {
  const token = localStorage.getItem("token");
  const payload = Object.fromEntries(
    Object.entries(form).filter(([key, value]) => key !== "id" && value !== ""),
  );
  const response = await fetch(
    `${API_BASE_URL}/api/admin/companies${form.id ? `/${form.id}` : ""}`,
    {
      method: form.id ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    },
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Unable to save company");
  }
  return data;
}

async function saveExpenseRequest(form) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/api/admin/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(form),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Unable to save expense");
  }
  return data;
}

function RecentCompaniesTable({ companies, onView, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const statusOptions = useMemo(
    () =>
      Array.from(new Set(companies.map((company) => company.status))).filter(
        Boolean,
      ),
    [companies],
  );
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = [company.company, company.owner, company.status]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-white p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950">
            Recent Companies
          </h2>
          <a
            href="/super-owner/companies"
            className="mt-1 inline-block text-sm font-bold text-blue-600"
          >
            View All Companies
          </a>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm font-semibold outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              placeholder="Search company"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="all">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {[
                "Company",
                "Owner",
                "Users",
                "Projects",
                "Joined Date",
                "Status",
                "Actions",
              ].map((head) => (
                <th key={head} className="px-5 py-3 font-extrabold">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-50 last:border-0"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-xs font-extrabold text-blue-700">
                      {row.initials || "--"}
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {row.company}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-600">
                  {row.owner || "Not assigned"}
                </td>
                <td className="px-5 py-4 font-bold text-slate-700">
                  {row.users}
                </td>
                <td className="px-5 py-4 font-bold text-slate-700">
                  {row.projects}
                </td>
                <td className="px-5 py-4 font-semibold text-slate-600">
                  {formatDate(row.joinedDate)}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${getStatusClass(row.status)}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <button
                      onClick={() => onView(row)}
                      aria-label={`View ${row.company}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(row)}
                      aria-label={`Edit ${row.company}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this company?",
                          )
                        )
                          onDelete(row);
                      }}
                      aria-label={`Delete ${row.company}`}
                      className="hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => onView(row)}
                      aria-label={`More actions for ${row.company}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      <MoreHorizontal size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filteredCompanies.length ? (
        <EmptyState
          message={
            companies.length
              ? "No companies match these filters."
              : "No companies found in database."
          }
        />
      ) : null}
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm font-bold text-slate-500">
        <span>
          Showing {filteredCompanies.length} of {companies.length} recent
          companies
        </span>
        <div className="flex gap-2">
          <button
            disabled
            className="rounded-md border border-slate-200 px-3 py-1.5 opacity-50"
          >
            Prev
          </button>
          <button className="rounded-md bg-blue-600 px-3 py-1.5 text-white">
            1
          </button>
          <button
            disabled
            className="rounded-md border border-slate-200 px-3 py-1.5 opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickActions({ onAction }) {
  const actions = [
    [Plus, "Add New Company"],
    [TrendingDown, "Add Platform Expense"],
    [Users, "Manage Users"],
    [Megaphone, "Send Announcement"],
    [Ticket, "View Support Tickets"],
    [Download, "Download Platform Report"],
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-extrabold text-slate-950">Quick Actions</h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {actions.map(([ActionIcon, label]) => (
          <button
            key={label}
            onClick={() => onAction(label)}
            className="flex min-h-[72px] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-left text-xs font-extrabold text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <ActionIcon size={15} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CompanyModal({ form, isSaving, error, onClose, onSubmit }) {
  const [draft, setDraft] = useState(form);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(draft);
        }}
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {draft.id ? "Edit Company Details" : "Register New Company"}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Provide company information and set up the owner account.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          <div className="space-y-8">
            {/* Company Info Section */}
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-slate-400">
                <Building2 size={16} /> Company Information
              </h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextInput
                  label="Company Name"
                  value={draft.companyName}
                  onChange={(value) =>
                    setDraft({ ...draft, companyName: value })
                  }
                  required
                  placeholder="e.g. Acme Constructions"
                />
                <TextInput
                  label="Official Email"
                  value={draft.email}
                  onChange={(value) => setDraft({ ...draft, email: value })}
                  type="email"
                  required={!draft.id}
                  placeholder="company@example.com"
                />
                <TextInput
                  label="Phone Number"
                  value={draft.phone}
                  onChange={(value) => setDraft({ ...draft, phone: value })}
                  placeholder="+91 98765 43210"
                />
                <label className="text-sm font-bold text-slate-700">
                  Account Status
                  <div className="relative mt-1.5">
                    <select
                      value={draft.status}
                      onChange={(event) =>
                        setDraft({ ...draft, status: event.target.value })
                      }
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="pending">Pending Onboarding</option>
                      <option value="active">Active</option>
                      <option value="blocked">Blocked / Suspended</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </label>
                <div className="sm:col-span-2">
                  <TextInput
                    label="Full Address"
                    value={draft.address}
                    onChange={(value) => setDraft({ ...draft, address: value })}
                    placeholder="123 Building St, City, Country"
                  />
                </div>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Owner Section */}
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-slate-400">
                <Users size={16} /> Owner Account
              </h3>
              <div className="rounded-xl border border-blue-100 bg-gradient-to-b from-blue-50/50 to-white p-5">
                <div className="mb-5">
                  <p className="text-sm font-bold text-slate-800">
                    {draft.id
                      ? "Assign / Update Owner Details"
                      : "Primary Owner Login"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {draft.id
                      ? "Change these fields to transfer ownership to another user or update the current owner's email address."
                      : "This user will have full access to manage the company workspace."}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput
                    label="First Name"
                    value={draft.ownerFirstName}
                    onChange={(value) =>
                      setDraft({ ...draft, ownerFirstName: value })
                    }
                    placeholder="John"
                  />
                  <TextInput
                    label="Last Name"
                    value={draft.ownerLastName}
                    onChange={(value) =>
                      setDraft({ ...draft, ownerLastName: value })
                    }
                    placeholder="Doe"
                  />
                  <TextInput
                    label="Owner Email"
                    value={draft.ownerEmail}
                    onChange={(value) =>
                      setDraft({ ...draft, ownerEmail: value })
                    }
                    type="email"
                    placeholder="owner@example.com"
                  />
                  <TextInput
                    label="Temporary Password"
                    value={draft.ownerPassword}
                    onChange={(value) =>
                      setDraft({ ...draft, ownerPassword: value })
                    }
                    placeholder={
                      draft.id
                        ? "Leave blank to keep current"
                        : "Secure password"
                    }
                  />
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50/50 px-3 py-2 text-xs font-semibold text-blue-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  If owner email is blank, the company's official email will be
                  used for the owner login.
                </div>
              </div>
            </section>
          </div>
          {error ? (
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">
              <ShieldAlert size={18} className="mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-5">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 focus:ring-4 focus:ring-blue-600/20 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />{" "}
                  {draft.id ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>{draft.id ? "Save Changes" : "Create Company"}</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
      />
    </label>
  );
}

function CompanyDetailsModal({ company, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {company.company}
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Company overview
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
        <div className="mt-5 space-y-3 text-sm">
          <Detail label="Owner" value={company.owner || "Not assigned"} />
          <Detail label="Users" value={String(company.users)} />
          <Detail label="Projects" value={String(company.projects)} />
          <Detail label="Joined" value={formatDate(company.joinedDate)} />
          <Detail label="Status" value={company.status} />
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
      <span className="font-bold text-slate-500">{label}</span>
      <span className="font-extrabold text-slate-800">{value}</span>
    </div>
  );
}

function exportDashboardCsv(data) {
  const rows = [
    ["Metric", "Value"],
    ["Total Companies", data.stats.totalCompanies],
    ["Active Companies", data.stats.activeCompanies],
    ["Total Users", data.stats.totalUsers],
    ["Total Projects", data.stats.totalProjects],
    ["Monthly Revenue", data.performance.monthlyRevenue],
    ["Active Support Tickets", data.performance.activeSupportTickets],
    [],
    ["Company", "Owner", "Users", "Projects", "Status"],
    ...data.recentCompanies.map((company) => [
      company.company,
      company.owner,
      company.users,
      company.projects,
      company.status,
    ]),
  ];
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `buildflow-super-admin-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function RecentActivity({ activities }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-extrabold text-slate-950">
        Recent Platform Activity
      </h2>
      <EmptyAwareList
        isEmpty={!activities.length}
        message="No platform activity yet."
      >
        <div className="mt-4 space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
              <div>
                <p className="text-sm font-bold text-slate-700">
                  {activity.message}
                </p>
                <p className="text-xs font-semibold text-slate-400">
                  {relativeTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </EmptyAwareList>
    </div>
  );
}

function AttentionAlerts({ alerts }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-extrabold text-slate-950">
        Requires Attention
      </h2>
      <div className="mt-4 space-y-3">
        {alerts.map((alert) => {
          const AlertIcon =
            alert.severity === "danger" ? ShieldAlert : AlertTriangle;
          return (
            <div
              key={alert.key}
              className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"
            >
              <AlertIcon
                size={17}
                className={
                  alert.severity === "danger"
                    ? "text-red-600"
                    : "text-amber-600"
                }
              />
              {alert.count} {alert.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PerformanceCards({ performance, companyExpenses }) {
  const allExpenses = companyExpenses + performance.monthlyExpenses;
  const cards = [
    [
      "Platform Uptime",
      `${performance.platformUptime}%`,
      performance.platformUptime >= 99
        ? "All systems operational"
        : "Review system health",
      "text-slate-900",
    ],
    [
      "Total Revenue",
      formatCompactINR(performance.monthlyRevenue),
      `${performance.revenueGrowth}% from last month`,
      "text-slate-900",
    ],
    [
      "All Expenses",
      formatCompactINR(allExpenses),
      "Company + platform expenses",
      "text-slate-900",
    ],
    [
      "Net Profit",
      formatCompactINR(performance.netProfit),
      "Revenue - Expense",
      "text-slate-900",
    ],
    [
      "Active Support Tickets",
      performance.activeSupportTickets.toString(),
      `${performance.criticalSupportTickets} marked critical`,
      "text-slate-900",
    ],
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {cards.map(([label, value, meta, color]) => (
        <div
          key={label}
          className="flex min-h-[126px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className={`mt-2 break-words text-2xl font-extrabold ${color}`}>
            {value}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">{meta}</p>
        </div>
      ))}
    </div>
  );
}

function EmptyAwareList({ isEmpty, message, children }) {
  return isEmpty ? <EmptyState message={message} /> : <>{children}</>;
}

function EmptyState({ message }) {
  return (
    <div className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">
      {message}
    </div>
  );
}

function getStatusClass(status) {
  const normalized = status.toLowerCase();
  if (normalized === "active") return "bg-emerald-50 text-emerald-700";
  if (normalized === "pending") return "bg-amber-50 text-amber-700";
  if (normalized === "blocked" || normalized === "suspended")
    return "bg-red-50 text-red-700";
  return "bg-slate-100 text-slate-700";
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactINR(value) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} Lakh`;
  return formatINR(value);
}

function relativeTime(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

function ExpenseModal({ isSaving, error, onClose, onSubmit }) {
  const [draft, setDraft] = useState(emptyExpenseForm);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(draft);
        }}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Add Platform Expense
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Record a new platform expense.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-4">
          <TextInput
            label="Expense Title"
            value={draft.title}
            onChange={(value) => setDraft({ ...draft, title: value })}
            required
            placeholder="e.g. AWS Hosting"
          />

          <label className="text-sm font-bold text-slate-700 block">
            Category
            <div className="relative mt-1.5">
              <select
                value={draft.category}
                onChange={(event) =>
                  setDraft({ ...draft, category: event.target.value })
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="Server">Server</option>
                <option value="Salary">Salary</option>
                <option value="Marketing">Marketing</option>
                <option value="Legal">Legal</option>
                <option value="Software">Software</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </label>

          <label className="block text-sm font-bold text-slate-700">
            Amount (INR) <span className="text-red-500">*</span>
            <input
              type="number"
              value={draft.amount || ""}
              required
              min={1}
              onChange={(event) =>
                setDraft({ ...draft, amount: Number(event.target.value) })
              }
              placeholder="0.00"
              className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </label>
          <TextInput
            label="Description (Optional)"
            value={draft.description}
            onChange={(value) => setDraft({ ...draft, description: value })}
            placeholder="More details..."
          />

          {error ? (
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">
              <ShieldAlert size={18} className="mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-60"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}{" "}
            Save Expense
          </button>
        </div>
      </form>
    </div>
  );
}
