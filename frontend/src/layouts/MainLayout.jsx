import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  HardHat,
  Building2,
  Wallet,
  Users,
  Settings,
  Search,
  Bell,
  Mail,
  HelpCircle,
  FileText,
  LogOut,
  Layers,
  ListTodo,
  FileSpreadsheet,
  AlertTriangle,
  ClipboardCheck,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (name) => {
    setExpandedSections((prev) => ({ ...prev, [name]: !prev[name] }));
  };
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    // Ignore error
  }
  const userName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
    : "Admin User";
  const userRole = user?.role || "company_owner";
  const userPermissions = user?.permissions || [];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getNavItems = () => {
    if (userRole === "company_owner") {
      return [
        {
          name: "Dashboard",
          path: "/company-owner/dashboard",
          icon: <LayoutDashboard size={20} />,
        },
        {
          name: "Projects",
          path: "/company-owner/projects",
          icon: <Building2 size={20} />,
        },
        {
          name: "Users & Roles",
          path: "/company-owner/users",
          icon: <Users size={20} />,
        },
        {
          name: "Clients",
          path: "/company-owner/clients",
          icon: <Users size={20} />,
        },
        {
          name: "Contractors",
          path: "/company-owner/contractors",
          icon: <HardHat size={20} />,
        },
        {
          name: "Reports",
          path: "/company-owner/reports",
          icon: <FileText size={20} />,
        },
        {
          name: "Settings",
          path: "/company-owner/settings",
          icon: <Settings size={20} />,
        },
      ];
    }

    if (userRole === "project_owner" || userRole === "project_manager") {
      const projectIdMatch = location.pathname.match(
        /\/project-owner\/([a-zA-Z0-9_-]+)/,
      );
      const projectId =
        projectIdMatch && projectIdMatch[1] !== "dashboard"
          ? projectIdMatch[1]
          : null;

      if (!projectId) {
        return [
          {
            name: "Dashboard",
            path: "/project-owner/dashboard",
            icon: <LayoutDashboard size={20} />,
          },
        ];
      }

      const items = [
        {
          name: "Project Dashboard",
          path: `/project-owner/${projectId}/dashboard`,
          icon: <LayoutDashboard size={20} />,
        },
        {
          name: "Planning & Control",
          icon: <Layers size={20} />,
          subItems: [
            {
              name: "Phases",
              path: `/project-owner/${projectId}/phases`,
              icon: <Layers size={20} />,
            },
            {
              name: "BOQ",
              path: `/project-owner/${projectId}/boq`,
              icon: <FileSpreadsheet size={20} />,
            },
            {
              name: "Budget",
              path: `/project-owner/${projectId}/budget`,
              icon: <Wallet size={20} />,
            },
          ]
        },
        {
          name: "Execution",
          icon: <HardHat size={20} />,
          subItems: [
            {
              name: "Tasks",
              path: `/project-owner/${projectId}/tasks`,
              icon: <ListTodo size={20} />,
            },
            {
              name: "Workers",
              path: `/project-owner/${projectId}/workers`,
              icon: <Users size={20} />,
            },
            {
              name: "Site Execution",
              path: `/project-owner/${projectId}/sites`,
              icon: <HardHat size={20} />,
            },
          ]
        },
      ];

      const resourceItems = [];
      if (
        userPermissions.includes("finance.manage") ||
        userPermissions.includes("finance.view")
      ) {
        resourceItems.push({
          name: "Finance",
          path: `/project-owner/${projectId}/finance/expenses`,
          icon: <Wallet size={20} />,
        });
      }
      if (userPermissions.includes("purchase.manage")) {
        resourceItems.push({
          name: "Purchase",
          path: `/project-owner/${projectId}/purchase/orders`,
          icon: <ShoppingCart size={20} />,
        });
      }
      if (userPermissions.includes("inventory.manage")) {
        resourceItems.push({
          name: "Store Inventory",
          path: `/project-owner/${projectId}/store/inventory`,
          icon: <Building2 size={20} />,
        });
      }

      if (resourceItems.length > 0) {
        items.push({
          name: "Resources & Finance",
          icon: <Wallet size={20} />,
          subItems: resourceItems,
        });
      }

      const complianceItems = [];
      if (userPermissions.includes("quality.manage")) {
        complianceItems.push({
          name: "Quality",
          path: `/project-owner/${projectId}/quality/inspections`,
          icon: <ClipboardCheck size={20} />,
        });
      }
      if (userPermissions.includes("safety.manage")) {
        complianceItems.push({
          name: "Safety",
          path: `/project-owner/${projectId}/safety/incidents`,
          icon: <AlertTriangle size={20} />,
        });
      }

      if (complianceItems.length > 0) {
        items.push({
          name: "Compliance",
          icon: <ClipboardCheck size={20} />,
          subItems: complianceItems,
        });
      }

      return items;
    }

    if (userRole === "worker") {
      return [
        {
          name: "Dashboard",
          path: "/worker/dashboard",
          icon: <LayoutDashboard size={20} />,
        },
        {
          name: "My Work",
          path: "/worker/my-work",
          icon: <HardHat size={20} />,
        },
        {
          name: "Attendance",
          path: "/worker/attendance",
          icon: <Users size={20} />,
        },
        {
          name: "Salary Slips",
          path: "/worker/salary-slips",
          icon: <Wallet size={20} />,
        },
        {
          name: "Grievances",
          path: "/worker/grievances",
          icon: <AlertTriangle size={20} />,
        },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {navOpen ? (
        <button
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
        />
      ) : null}
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] shrink-0 flex-col bg-[#0f172a] text-slate-400 shadow-2xl transition-transform duration-200 lg:static lg:z-20 lg:w-[260px] lg:translate-x-0 ${navOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 pb-6 flex items-center gap-3">
          <h1 className="text-xl font-bold text-white tracking-tight">
            BuildFlow
          </h1>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item, index) => {
            if (item.subItems) {
              const isExpanded = expandedSections[item.name];
              const hasActiveChild = item.subItems.some(
                (sub) =>
                  location.pathname === sub.path ||
                  (sub.path !== "/" && location.pathname.startsWith(sub.path))
              );
              return (
                <div key={item.name} className="flex flex-col mb-1.5">
                  <button
                    onClick={() => toggleSection(item.name)}
                    className={`flex items-center justify-between w-full gap-3 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${hasActiveChild || isExpanded
                        ? "bg-slate-800/80 text-white shadow-sm"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">{item.icon}</div>
                      <span className="text-left text-sm leading-tight whitespace-nowrap">{item.name}</span>
                    </div>
                    <div className="shrink-0 transition-transform duration-200">
                      {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-500" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="flex flex-col gap-1 pl-3 ml-6 mt-1.5 border-l border-slate-700/60">
                      {item.subItems.map((subItem) => {
                        const isActive =
                          location.pathname === subItem.path ||
                          (subItem.path !== "/" &&
                            location.pathname.startsWith(subItem.path));
                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            onClick={() => setNavOpen(false)}
                            className={`flex items-center py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isActive
                                ? "bg-blue-500/15 text-blue-500 font-bold"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setNavOpen(false)}
                className={`flex items-center gap-3 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 mb-1.5 ${
                  isActive
                    ? "bg-blue-500/15 text-blue-500 font-bold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <div className="shrink-0">{item.icon}</div>
                <span className="text-left text-sm leading-tight whitespace-nowrap">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 text-sm font-semibold text-white">
                {userName.charAt(0)}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium text-slate-200 leading-tight">
                  {userName}
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  {userRole.replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>
            <LogOut
              size={16}
              className="text-slate-500 group-hover:text-red-400 transition-colors"
            />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 lg:px-8">
          <button
            onClick={() => setNavOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation"
          >
            <LayoutDashboard size={20} />
          </button>


          <div className="ml-auto flex items-center gap-2 lg:gap-4 relative z-20">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setMessagesOpen(false);
                }}
                className={`p-2 rounded-full transition-colors relative ${notificationsOpen ? "bg-slate-100 text-blue-600" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>

              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-900">
                        Notifications
                      </h3>
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        2 New
                      </span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                        <p className="text-sm font-semibold text-slate-900">
                          New Task Assigned
                        </p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          You have been assigned to "Site Cleanup" for today.
                        </p>
                        <p className="text-xs font-bold text-blue-600 mt-2">
                          Just now
                        </p>
                      </div>
                      <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                        <p className="text-sm font-semibold text-slate-900">
                          Salary Slip Generated
                        </p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Your salary slip for this month is ready for download.
                        </p>
                        <p className="text-xs font-bold text-blue-600 mt-2">
                          2 hours ago
                        </p>
                      </div>
                      <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                        <p className="text-sm font-semibold text-slate-900">
                          Attendance Reminder
                        </p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Don't forget to mark your check-out when leaving the
                          site.
                        </p>
                        <p className="text-xs font-bold text-slate-400 mt-2">
                          Yesterday
                        </p>
                      </div>
                    </div>
                    <div className="p-3 border-t border-slate-100 text-center bg-slate-50">
                      <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Messages Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setMessagesOpen(!messagesOpen);
                  setNotificationsOpen(false);
                }}
                className={`p-2 rounded-full transition-colors relative ${messagesOpen ? "bg-slate-100 text-blue-600" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
              >
                <Mail size={20} />
              </button>

              {messagesOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMessagesOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-900">Messages</h3>
                    </div>
                    <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <Mail size={24} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        No new messages
                      </p>
                      <p className="text-xs mt-1">You're all caught up!</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mx-2 hidden h-6 w-px bg-slate-200 lg:block"></div>
            <div className="hidden items-center gap-2 sm:flex pl-2">
              <span className="text-sm font-bold text-slate-700">{userName}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-5 lg:p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
