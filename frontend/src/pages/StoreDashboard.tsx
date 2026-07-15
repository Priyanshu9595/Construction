import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Boxes, IndianRupee, Loader2 } from "lucide-react";
import { apiGet, formatINR } from "../lib/api";

type Data = { store: { name: string }; summary: { totalMaterialItems: number; inStock: number; lowStock: number; outOfStock: number; stockValue: number }; inventory: Array<{ materialId: string; materialCode: string; materialName: string; category?: string; unit?: string; received: number; issued: number; availableStock: number; reorderLevel: number; status: string; stockValue: number }> };

export default function StoreDashboard() {
  const q = useQuery({ queryKey: ["store-dashboard"], queryFn: () => apiGet<Data>("/api/store/dashboard") });
  if (q.isLoading) return <State text="Loading store dashboard..." />;
  if (q.isError || !q.data) return <State text={q.error instanceof Error ? q.error.message : "Unable to load store dashboard"} error />;
  const s = q.data.summary;
  const cards = [
    { label: "Total Materials", value: s.totalMaterialItems, icon: Boxes },
    { label: "In Stock", value: s.inStock, icon: Boxes },
    { label: "Low Stock", value: s.lowStock, icon: AlertTriangle },
    { label: "Stock Value", value: formatINR(s.stockValue), icon: IndianRupee },
  ];
  return <div className="space-y-5"><div className="rounded-lg border bg-white p-5 shadow-sm"><h1 className="text-2xl font-extrabold">Store Manager Dashboard</h1><p className="text-sm text-slate-500">{q.data.store.name}</p></div><div className="grid grid-cols-1 gap-4 md:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <div key={card.label} className="rounded-lg border bg-white p-4 shadow-sm"><Icon className="text-blue-600" /><p className="mt-3 text-xs font-bold uppercase text-slate-500">{card.label}</p><p className="text-2xl font-extrabold">{String(card.value)}</p></div>; })}</div><div className="rounded-lg border bg-white p-5 shadow-sm"><h2 className="mb-4 font-extrabold">Stock Overview</h2><table className="w-full text-sm"><thead><tr className="border-b text-xs uppercase text-slate-500"><th className="py-2 text-left">Material</th><th>Received</th><th>Issued</th><th>Available</th><th>Status</th><th>Value</th></tr></thead><tbody>{q.data.inventory.map((row) => <tr key={row.materialId} className="border-b border-slate-50"><td className="py-3 font-bold">{row.materialName}</td><td className="text-center">{row.received}</td><td className="text-center">{row.issued}</td><td className="text-center">{row.availableStock}</td><td className="text-center font-bold">{row.status}</td><td className="text-right">{formatINR(row.stockValue)}</td></tr>)}</tbody></table></div></div>;
}
function State({ text, error = false }: { text: string; error?: boolean }) { return <div className={`flex min-h-[420px] items-center justify-center rounded-lg border bg-white text-sm font-bold ${error ? "text-red-700" : "text-slate-600"}`}>{!error ? <Loader2 className="mr-2 animate-spin text-blue-600" size={18} /> : null}{text}</div>; }
