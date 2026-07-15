import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
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
  ShoppingCart
} from "lucide-react";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    // Ignore error
  }
  
  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : "Admin User";
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
        { name: "Dashboard", path: "/company-owner/dashboard", icon: <LayoutDashboard size={20} /> },
        { name: "Projects", path: "/company-owner/projects", icon: <Building2 size={20} /> },
        { name: "Users & Roles", path: "/company-owner/users", icon: <Users size={20} /> },
        { name: "Clients", path: "/company-owner/clients", icon: <Users size={20} /> },
        { name: "Contractors", path: "/company-owner/contractors", icon: <HardHat size={20} /> },
        { name: "Reports", path: "/company-owner/reports", icon: <FileText size={20} /> },
        { name: "Settings", path: "/company-owner/settings", icon: <Settings size={20} /> },
      ];
    }

    if (userRole === "project_owner" || userRole === "project_manager") {
      const projectIdMatch = location.pathname.match(/\/project-owner\/([a-zA-Z0-9_-]+)/);
      const projectId = projectIdMatch && projectIdMatch[1] !== 'dashboard' ? projectIdMatch[1] : null;

      if (!projectId) {
        return [{ name: "Dashboard", path: "/project-owner/dashboard", icon: <LayoutDashboard size={20} /> }];
      }

      const items = [
        { name: "Project Dashboard", path: `/project-owner/${projectId}/dashboard`, icon: <LayoutDashboard size={20} /> },
        { name: "Phases", path: `/project-owner/${projectId}/phases`, icon: <Layers size={20} /> },
        { name: "Tasks", path: `/project-owner/${projectId}/tasks`, icon: <ListTodo size={20} /> },
        { name: "Workers", path: `/project-owner/${projectId}/workers`, icon: <Users size={20} /> },
        { name: "BOQ", path: `/project-owner/${projectId}/boq`, icon: <FileSpreadsheet size={20} /> },
        { name: "Budget", path: `/project-owner/${projectId}/budget`, icon: <Wallet size={20} /> },
        { name: "Site Execution", path: `/project-owner/${projectId}/sites`, icon: <HardHat size={20} /> },
      ];

      if (userPermissions.includes("finance.manage") || userPermissions.includes("finance.view")) {
        items.push({ name: "Finance", path: `/project-owner/${projectId}/finance/expenses`, icon: <Wallet size={20} /> });
      }
      if (userPermissions.includes("purchase.manage")) {
        items.push({ name: "Purchase", path: `/project-owner/${projectId}/purchase/orders`, icon: <ShoppingCart size={20} /> });
      }
      if (userPermissions.includes("inventory.manage")) {
        items.push({ name: "Store Inventory", path: `/project-owner/${projectId}/store/inventory`, icon: <Building2 size={20} /> });
      }
      if (userPermissions.includes("quality.manage")) {
        items.push({ name: "Quality", path: `/project-owner/${projectId}/quality/inspections`, icon: <ClipboardCheck size={20} /> });
      }
      if (userPermissions.includes("safety.manage")) {
        items.push({ name: "Safety", path: `/project-owner/${projectId}/safety/incidents`, icon: <AlertTriangle size={20} /> });
      }
      
      return items;
    }

    if (userRole === "worker") {
      return [
        { name: "Dashboard", path: "/worker/dashboard", icon: <LayoutDashboard size={20} /> },
        { name: "My Work", path: "/worker/my-work", icon: <HardHat size={20} /> },
        { name: "Attendance", path: "/worker/attendance", icon: <Users size={20} /> },
        { name: "Salary Slips", path: "/worker/salary-slips", icon: <Wallet size={20} /> },
        { name: "Grievances", path: "/worker/grievances", icon: <AlertTriangle size={20} /> },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] shrink-0 bg-[#0f172a] text-slate-400 flex flex-col z-20">
        <div className="p-6 pb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="text-white" size={18} />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            BuildFlow
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center gap-3 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                    : "hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {item.icon} {item.name}
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
                  {userRole.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            <LogOut size={16} className="text-slate-500 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search projects, tasks, or users..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-sm transition-all"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <Mail size={20} />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2">
              <HelpCircle size={20} />
              <span className="text-sm font-medium">Help</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
