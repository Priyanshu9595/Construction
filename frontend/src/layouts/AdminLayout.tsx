import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings,
  Search,
  Bell,
  Mail,
  LogOut,
  CreditCard,
  History,
  Megaphone,
  LifeBuoy,
  ChevronDown,
  HelpCircle
} from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    // Ignore error
  }
  
  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : "Amrit Raj";
  const userRole = user?.role ? user.role.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : "Super Admin";
  const userInitials = userName.split(' ').filter(Boolean).map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || "SA";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleGlobalSearch = (term: string) => {
    const query = term.trim();
    if (query.trim()) {
      navigate(`/super-owner/companies?search=${encodeURIComponent(query)}`);
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/super-owner/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Companies", path: "/super-owner/companies", icon: <Building2 size={20} /> },
    { name: "Users", path: "/super-owner/users", icon: <Users size={20} /> },
    { name: "Plans & Billing", path: "/super-owner/plans", icon: <CreditCard size={20} /> },
    { name: "Subscriptions", path: "/super-owner/subscriptions", icon: <CreditCard size={20} /> },
    { name: "System Logs", path: "/super-owner/logs", icon: <History size={20} /> },
    { name: "Announcements", path: "/super-owner/announcements", icon: <Megaphone size={20} /> },
    { name: "Support Tickets", path: "/super-owner/support", icon: <LifeBuoy size={20} /> },
    { name: "Settings", path: "/super-owner/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#f6f8fc] font-sans overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside className="w-[228px] shrink-0 bg-[#061b2d] text-slate-300 flex flex-col z-20 shadow-2xl shadow-slate-950/15">
        <div className="px-5 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#f4c430] text-[#061b2d] flex items-center justify-center">
            <Building2 size={17} strokeWidth={2.5} />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            BuildFlow
          </h1>
        </div>
        
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/super-owner/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center gap-3 py-2.5 px-3 rounded-md text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? "bg-[#2f86ef] text-white shadow-md shadow-blue-950/20" 
                    : "hover:bg-white/8 hover:text-white"
                }`}
              >
                {item.icon} {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-3 border-t border-white/10 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 py-2.5 px-3 rounded-md hover:bg-red-500/10 hover:text-red-300 text-slate-300 transition-colors text-sm font-semibold"
          >
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-[68px] bg-white border-b border-slate-200 flex items-center justify-between gap-5 px-6 lg:px-8 z-10 shrink-0">
          
          <div className="flex items-center flex-1 max-w-xl">
             <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search companies, users or projects..." 
                  aria-label="Search companies, users or projects"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleGlobalSearch(event.currentTarget.value);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f6f8fc] border border-slate-200 rounded-md text-sm text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                />
             </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3 text-slate-400">
               <button onClick={() => navigate("/super-owner/announcements")} className="h-9 w-9 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors flex items-center justify-center" aria-label="Messages"><Mail size={19} /></button>
               <button onClick={() => navigate("/super-owner/logs")} className="h-9 w-9 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors relative flex items-center justify-center" aria-label="Notifications">
                 <Bell size={19} />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
               </button>
               <button onClick={() => navigate("/super-owner/support")} className="h-9 w-9 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors flex items-center justify-center" aria-label="Help"><HelpCircle size={20} /></button>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 group-hover:border-[#7c5bd6] transition-colors flex items-center justify-center bg-[#f3efff] text-[#7c5bd6] font-bold text-sm">
                {userInitials}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-700 leading-none group-hover:text-[#7c5bd6] transition-colors">{userName}</p>
                <p className="text-xs text-slate-500 mt-1">{userRole}</p>
              </div>
              <ChevronDown size={16} className="text-slate-400 hidden sm:block" />
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-[#f6f8fc]">
          <div className="mx-auto max-w-7xl">
             <div className="p-5 lg:p-6">
               <Outlet />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
