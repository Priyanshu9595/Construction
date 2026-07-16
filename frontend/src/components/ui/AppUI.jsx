import { AlertTriangle, ChevronRight, Loader2, Search } from "lucide-react";

const toneText = {
  slate: "text-slate-700",
  blue: "text-blue-600",
  emerald: "text-emerald-600",
  amber: "text-amber-600",
  red: "text-red-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
};

const toneBg = {
  slate: "bg-slate-100 text-slate-700",
  blue: "bg-blue-50 text-blue-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  purple: "bg-purple-50 text-purple-700",
  orange: "bg-orange-50 text-orange-700",
};

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  breadcrumbs,
  children,
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {breadcrumbs?.length ? (
          <div className="mb-3 flex flex-wrap items-center gap-1 text-xs font-bold text-slate-500">
            {breadcrumbs.map((item, index) => (
              <span
                key={`${item.label}-${index}`}
                className="inline-flex items-center gap-1"
              >
                {index > 0 ? (
                  <ChevronRight size={13} className="text-slate-300" />
                ) : null}
                {item.href ? (
                  <a className="hover:text-blue-600" href={item.href}>
                    {item.label}
                  </a>
                ) : (
                  <span>{item.label}</span>
                )}
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-xs font-extrabold uppercase tracking-wide text-blue-600">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 max-w-3xl text-sm font-medium text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>
      </section>
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const styles = {
    primary:
      "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:ring-blue-600/20",
    secondary:
      "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus:ring-slate-400/20",
    danger:
      "bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-600/20",
    ghost: "text-slate-600 hover:bg-slate-100 focus:ring-slate-400/20",
  };
  return (
    <button
      {...props}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all focus:outline-none focus:ring-4 disabled:pointer-events-none disabled:opacity-60 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function StatCard({ label, value, meta, icon: Icon, tone = "slate" }) {
  return (
    <div className="flex min-h-[128px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {Icon ? (
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneBg[tone]}`}
          >
            <Icon size={20} />
          </span>
        ) : null}
      </div>
      <div>
        <p
          className={`break-words text-2xl font-extrabold leading-tight ${toneText[tone]}`}
        >
          {value}
        </p>
        {meta ? (
          <p className="mt-1 text-sm font-semibold text-slate-500">{meta}</p>
        ) : null}
      </div>
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className = "",
}) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {title || description || actions ? (
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title ? (
              <h2 className="text-base font-extrabold text-slate-950">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm font-medium text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function LoadingState({ text = "Loading..." }) {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-sm font-bold text-slate-600">
      <Loader2 className="mr-2 animate-spin text-blue-600" size={18} />
      {text}
    </div>
  );
}

export function ErrorState({ text = "Something went wrong." }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm font-bold text-red-700">
      <AlertTriangle className="mb-2" size={22} />
      {text}
    </div>
  );
}

export function EmptyState({ title = "No records found", description }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
      <p className="text-sm font-extrabold text-slate-700">{title}</p>
      {description ? (
        <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

export function Badge({ children, tone = "slate" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide ${toneBg[tone]}`}
    >
      {children}
    </span>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1 text-xs font-bold text-red-600">{error}</p>
      ) : null}
    </label>
  );
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className={`block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 ${props.className || ""}`}
    />
  );
}

export function SelectInput(props) {
  return (
    <select
      {...props}
      className={`block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 ${props.className || ""}`}
    />
  );
}

export function TextAreaInput(props) {
  return (
    <textarea
      {...props}
      className={`block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 ${props.className || ""}`}
    />
  );
}

export function SearchBox({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        size={17}
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
}

export function TableShell({ children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
