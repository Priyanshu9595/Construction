import { useQuery } from "@tanstack/react-query";
import { Loader2, Download, BarChart2, PieChart, TrendingUp, IndianRupee } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function CompanyReports() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["company-performance"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/dashboard/company-performance`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return res.json();
    },
  });

  const reportsList = [
    { title: "Financial Overview (MTD)", icon: <IndianRupee size={24} className="text-emerald-500" />, desc: "Monthly revenue, expenses, and profit margins." },
    { title: "Project Status Report", icon: <BarChart2 size={24} className="text-blue-500" />, desc: "Detailed breakdown of all active projects." },
    { title: "Labour Productivity", icon: <TrendingUp size={24} className="text-orange-500" />, desc: "Attendance vs output correlation." },
    { title: "Material Consumption", icon: <PieChart size={24} className="text-purple-500" />, desc: "Stock levels, shortages, and GRN summaries." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Company Reports</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Generate and download company-wide analytics and summaries.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reportsList.map((report, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    {report.icon}
                  </div>
                  <button className="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50">
                    <Download size={20} />
                  </button>
                </div>
                <h3 className="mt-4 font-extrabold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{report.title}</h3>
                <p className="mt-1 text-sm text-slate-500 font-medium">{report.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-extrabold text-slate-900 mb-4">Quick Summary</h2>
            {isLoading ? (
               <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-400" /></div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs font-bold text-slate-500 uppercase">Total Active Projects</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.projects?.active || 0}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <p className="text-xs font-bold text-emerald-600 uppercase">Total Expected Profit</p>
                  <p className="text-2xl font-extrabold text-emerald-700 mt-1 flex items-center"><IndianRupee size={20}/>{metrics?.financials?.expectedProfit?.toLocaleString('en-IN') || 0}</p>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl">
                  <p className="text-xs font-bold text-rose-600 uppercase">Total Expenses</p>
                  <p className="text-2xl font-extrabold text-rose-700 mt-1 flex items-center"><IndianRupee size={20}/>{metrics?.financials?.totalExpenses?.toLocaleString('en-IN') || 0}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
