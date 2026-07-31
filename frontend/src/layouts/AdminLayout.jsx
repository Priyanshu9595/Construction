import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  Search,
  Bell,
  Mail,
  LogOut,
  History,
  Megaphone,
  LifeBuoy,
  ChevronDown,
  HelpCircle,
} from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    // Ignore error
  }
  const userName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
    : "Amrit Raj";
  const userRole = user?.role
    ? user.role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "Super Admin";
  const userInitials =
    userName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "SA";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleGlobalSearch = (term) => {
    const query = term.trim();
    if (query.trim()) {
      navigate(`/super-owner/companies?search=${encodeURIComponent(query)}`);
    }
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/super-owner/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Companies",
      path: "/super-owner/companies",
      icon: <Building2 size={20} />,
    },
    { name: "Users", path: "/super-owner/users", icon: <Users size={20} /> },
    {
      name: "System Logs",
      path: "/super-owner/logs",
      icon: <History size={20} />,
    },
    {
      name: "Announcements",
      path: "/super-owner/announcements",
      icon: <Megaphone size={20} />,
    },
    {
      name: "Support Tickets",
      path: "/super-owner/support",
      icon: <LifeBuoy size={20} />,
    },
    {
      name: "Settings",
      path: "/super-owner/settings",
      icon: <Settings size={20} />,
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {navOpen ? (
        <button
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
        />
      ) : null}
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] shrink-0 flex-col bg-slate-900 text-slate-300 shadow-2xl shadow-slate-950/15 transition-transform duration-200 lg:static lg:z-20 lg:w-[240px] lg:translate-x-0 ${navOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-5 py-5 flex items-center gap-3">
          <h1 className="text-lg font-bold text-white tracking-tight">
            BuildFlow
          </h1>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/super-owner/dashboard" &&
                location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setNavOpen(false)}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-md text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-500/15 text-blue-500 font-bold"
                    : "hover:bg-white/10 hover:text-white"
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
        <header className="z-10 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 lg:px-8">
          <button
            onClick={() => setNavOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation"
          >
            <LayoutDashboard size={20} />
          </button>


          <div className="ml-auto flex items-center gap-3 lg:gap-5">
            <div className="flex items-center gap-3 text-slate-400">
              <button
                onClick={() => navigate("/super-owner/announcements")}
                className="h-9 w-9 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors flex items-center justify-center"
                aria-label="Messages"
              >
                <Mail size={19} />
              </button>
              <button
                onClick={() => navigate("/super-owner/logs")}
                className="h-9 w-9 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors relative flex items-center justify-center"
                aria-label="Notifications"
              >
                <Bell size={19} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <button
                onClick={() => navigate("/super-owner/support")}
                className="h-9 w-9 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors flex items-center justify-center"
                aria-label="Help"
              >
                <HelpCircle size={20} />
              </button>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex cursor-pointer items-center gap-3 group">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 group-hover:border-[#7c5bd6] transition-colors flex items-center justify-center bg-[#f3efff] text-[#7c5bd6] font-bold text-sm">
                {userInitials}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-700 leading-none group-hover:text-[#7c5bd6] transition-colors">
                  {userName}
                </p>
                <p className="text-xs text-slate-500 mt-1">{userRole}</p>
              </div>
              <ChevronDown
                size={16}
                className="text-slate-400 hidden sm:block"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar">
          <div className="mx-auto max-w-[1500px]">
            <div className="p-4 sm:p-5 lg:p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
