import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  Panel,
  SearchBox,
  StatCard,
  TableShell,
} from "../../components/ui/AppUI";
import { apiGet, formatDate } from "../../lib/api";

export default function AdminModulePage({ module, title, subtitle }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: ["admin-module", module],
    queryFn: () => apiGet(`/api/admin/modules/${module}`),
  });

  const rows = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized || !query.data) return query.data?.rows || [];
    return query.data.rows.filter((row) =>
      row.cells.join(" ").toLowerCase().includes(normalized),
    );
  }, [query.data, search]);

  if (query.isLoading)
    return <LoadingState text={`Loading ${title.toLowerCase()}...`} />;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        text={
          query.error instanceof Error
            ? query.error.message
            : `Unable to load ${title.toLowerCase()}`
        }
      />
    );
  }

  return (
    <PageShell
      eyebrow="BuildFlow Module"
      title={title}
      description={subtitle}
      actions={
        <>
          <Button
            onClick={() => navigate("/super-owner/dashboard")}
            variant="secondary"
          >
            <ArrowLeft size={16} /> Dashboard
          </Button>
          <Button onClick={() => query.refetch()}>
            <RefreshCw size={16} /> Refresh
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {query.data.stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            tone={stat.tone || "slate"}
          />
        ))}
      </div>

      <Panel
        title={query.data.title}
        description={`${rows.length} of ${query.data.rows.length} records shown`}
        actions={
          <div className="w-full sm:w-72">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder={`Search ${title.toLowerCase()}...`}
            />
          </div>
        }
      >
        {rows.length ? (
          <TableShell>
            <div className="overflow-x-auto">
<table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {query.data.columns.map((column) => (
                    <th key={column} className="px-4 py-3 font-extrabold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    {row.cells.map((cell, index) => (
                      <td
                        key={`${row.id}-${query.data.columns[index]}`}
                        className="px-4 py-3 font-semibold text-slate-700"
                      >
                        <CellValue
                          value={cell}
                          column={query.data.columns[index]}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
</div>
          </TableShell>
        ) : (
          <EmptyState
            title={
              query.data.emptyTitle ||
              (search ? "No records match this search." : "No records found.")
            }
            description={
              query.data.emptyDescription ||
              "Live data will appear here when records are available."
            }
          />
        )}
      </Panel>
    </PageShell>
  );
}

function CellValue({ value, column }) {
  const text = value == null || value === "" ? "-" : String(value);
  const normalizedColumn = column.toLowerCase();
  const normalized = text.toLowerCase();

  if (
    normalizedColumn.includes("date") ||
    normalizedColumn.includes("joined") ||
    normalizedColumn.includes("created") ||
    normalizedColumn.includes("login")
  ) {
    return <span>{text === "-" ? "-" : formatDate(text)}</span>;
  }

  if (["status", "priority"].some((key) => normalizedColumn.includes(key))) {
    const tone = ["active", "paid", "resolved", "closed", "low"].includes(
      normalized,
    )
      ? "emerald"
      : ["critical", "blocked", "inactive"].includes(normalized)
        ? "red"
        : ["open", "pending", "high", "medium", "in_progress"].includes(
              normalized,
            )
          ? "amber"
          : "slate";
    return <Badge tone={tone}>{text.replace(/_/g, " ")}</Badge>;
  }

  return <span>{text}</span>;
}
