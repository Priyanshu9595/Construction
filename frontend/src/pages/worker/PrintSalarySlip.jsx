import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Building2, IndianRupee, Printer, ArrowLeft } from "lucide-react";

export default function PrintSalarySlip() {
  const location = useLocation();
  const navigate = useNavigate();
  const slip = location.state?.slip;
  const profile = location.state?.profile;

  useEffect(() => {
    if (slip) {
      // Optional: Auto-trigger print after short delay
      // const timer = setTimeout(() => window.print(), 500);
      // return () => clearTimeout(timer);
    }
  }, [slip]);
  if (!slip) return <Navigate to="/worker/salary-slips" />;

  const [year, month] = slip.month.split("-");
  const parsedDate = new Date(parseInt(year), parseInt(month) - 1);
  const monthName = parsedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const paymentDateStr = slip.paymentDate
    ? new Date(slip.paymentDate).toLocaleDateString()
    : "-";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 print:p-0 print:bg-white font-sans text-slate-900">
      {/* Non-printable action bar */}
      <div className="max-w-3xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm transition-all"
        >
          <Printer size={18} /> Print as PDF
        </button>
      </div>

      {/* Printable Area */}
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-8 sm:p-12 shadow-sm print:border-none print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center print:bg-slate-900"
              style={{
                printColorAdjust: "exact",
                WebkitPrintColorAdjust: "exact",
              }}
            >
              <Building2 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                BuildFlow
              </h1>
              <p className="text-sm font-semibold text-slate-500 tracking-widest uppercase">
                Salary Slip
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-slate-900 uppercase tracking-widest">
              {monthName}
            </p>
            <p className="text-sm font-bold text-slate-500 mt-1">
              Paid on: {paymentDateStr}
            </p>
          </div>
        </div>

        {/* Employee Details */}
        <div
          className="grid grid-cols-2 gap-6 mb-10 p-6 bg-slate-50 rounded-xl border border-slate-100 print:bg-slate-50"
          style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Employee Name
            </p>
            <p className="text-lg font-extrabold text-slate-900">
              {profile?.name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Employee ID
            </p>
            <p className="text-lg font-extrabold text-slate-900">
              {profile?.workerCode || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Trade / Role
            </p>
            <p className="text-lg font-extrabold text-slate-900">
              {profile?.trade || "Worker"}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Daily Wage
            </p>
            <p className="text-lg font-extrabold text-slate-900 flex items-center gap-0.5">
              <IndianRupee size={16} /> {profile?.dailyWage || "0"}
            </p>
          </div>
        </div>

        {/* Earnings & Deductions */}
        <div className="mb-10 border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr
                className="bg-slate-900 text-white print:bg-slate-900"
                style={{
                  printColorAdjust: "exact",
                  WebkitPrintColorAdjust: "exact",
                }}
              >
                <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs">
                  Earnings
                </th>
                <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs text-right">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold">
              <tr>
                <td className="py-4 px-6 text-slate-600">
                  Gross Salary (Basic + Allowances + Overtime)
                </td>
                <td className="py-4 px-6 text-slate-900 text-right flex justify-end items-center gap-1">
                  <IndianRupee size={14} />{" "}
                  {slip.grossSalary || slip.netSalary || 0}
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-slate-600">
                  Deductions (Advances / Penalties)
                </td>
                <td className="py-4 px-6 text-red-600 text-right flex justify-end items-center gap-1">
                  - <IndianRupee size={14} /> {slip.deductions || 0}
                </td>
              </tr>
            </tbody>
          </table>
          <div
            className="bg-emerald-50 px-6 py-5 flex items-center justify-between border-t border-emerald-100 print:bg-emerald-50 print:border-emerald-200"
            style={{
              printColorAdjust: "exact",
              WebkitPrintColorAdjust: "exact",
            }}
          >
            <span className="font-extrabold text-emerald-900 uppercase tracking-widest">
              Net Payable Salary
            </span>
            <span className="text-2xl font-black text-emerald-700 flex items-center gap-1">
              <IndianRupee size={20} /> {slip.netSalary || 0}
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-end mt-20 pt-8 border-t border-slate-200 text-sm font-semibold text-slate-500">
          <div>
            <p className="uppercase tracking-widest text-xs font-bold text-slate-400 mb-1">
              Status
            </p>
            <span className="inline-block px-3 py-1 rounded text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 print:border print:border-slate-300">
              {slip.paymentStatus}
            </span>
          </div>
          <div className="text-right">
            <div className="w-40 border-b border-slate-300 mb-2"></div>
            <p className="uppercase tracking-widest text-xs font-bold text-slate-400">
              Authorized Signatory
            </p>
          </div>
        </div>

        <div className="text-center mt-12 text-xs font-medium text-slate-400">
          This is a system generated document and does not require a physical
          signature.
        </div>
      </div>
    </div>
  );
}
