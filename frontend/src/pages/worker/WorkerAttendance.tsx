import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, MapPin, Loader2, Building2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type AttendanceRecord = {
  _id: string;
  attendanceDate: string;
  checkInAt?: string;
  checkOutAt?: string;
  status: string;
  totalWorkingMinutes: number;
  projectId?: { name: string };
};

export default function WorkerAttendance() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["worker-attendance-history"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/worker/attendance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load attendance history");
      return res.json() as Promise<AttendanceRecord[]>;
    }
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  if (isError) return <div className="text-red-600 p-8 text-center font-bold">{error.message}</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Attendance History</h1>
        <span className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 border border-blue-100">
          <CalendarDays size={18} /> {data?.length || 0} Records
        </span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase font-black text-xs tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-5">Date</th>
                <th className="p-5">Project</th>
                <th className="p-5">Status</th>
                <th className="p-5">Check In</th>
                <th className="p-5">Check Out</th>
                <th className="p-5">Hours Worked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-semibold">No attendance records found.</td></tr>
              ) : (
                data?.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-5 font-bold text-slate-900">{new Date(record.attendanceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="p-5 font-semibold text-slate-600 flex items-center gap-2">
                      <Building2 size={16} className="text-slate-400" />
                      {record.projectId?.name || '-'}
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-wider ${record.status === 'present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-5 font-medium text-slate-600">
                      {record.checkInAt ? (
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-emerald-500" /> {new Date(record.checkInAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      ) : '-'}
                    </td>
                    <td className="p-5 font-medium text-slate-600">
                      {record.checkOutAt ? (
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-red-500" /> {new Date(record.checkOutAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      ) : '-'}
                    </td>
                    <td className="p-5 font-bold text-slate-700">
                      {record.totalWorkingMinutes ? `${(record.totalWorkingMinutes / 60).toFixed(1)} hrs` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
