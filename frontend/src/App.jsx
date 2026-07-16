import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminModulePage from "./pages/admin/AdminModulePage";
import ProjectDashboard from "./pages/ProjectDashboard";
import SiteDashboard from "./pages/SiteDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import WorkerAttendance from "./pages/worker/WorkerAttendance";
import WorkerMyWork from "./pages/worker/WorkerMyWork";
import WorkerSalarySlips from "./pages/worker/WorkerSalarySlips";
import WorkerGrievances from "./pages/worker/WorkerGrievances";
import WorkerLogin from "./pages/WorkerLogin";
import PrintSalarySlip from "./pages/worker/PrintSalarySlip";
import ModulePage from "./pages/ModulePage";
import CompanyProjects from "./pages/company/CompanyProjects";
import CompanyUsers from "./pages/company/CompanyUsers";
import CompanyClients from "./pages/company/CompanyClients";
import CompanyContractors from "./pages/company/CompanyContractors";
import CompanyReports from "./pages/company/CompanyReports";
import CompanySettings from "./pages/company/CompanySettings";
import ProjectPhases from "./pages/project/ProjectPhases";
import ProjectTasks from "./pages/project/ProjectTasks";
import ProjectWorkers from "./pages/project/ProjectWorkers";
import ProjectBOQ from "./pages/project/ProjectBOQ";
import ProjectBudget from "./pages/project/ProjectBudget";
import RequireAuth from "./components/RequireAuth";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/auth/Login";

import ProjectSites from "./pages/project/ProjectSites";
import ProjectFinance from "./pages/project/ProjectFinance";
import ProjectPurchase from "./pages/project/ProjectPurchase";
import ProjectInventory from "./pages/project/ProjectInventory";
import ProjectQuality from "./pages/project/ProjectQuality";
import ProjectSafety from "./pages/project/ProjectSafety";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/worker/login" element={<WorkerLogin />} />

        {/* 1. SUPER OWNER ROUTES */}
        <Route element={<RequireAuth roles={["super_owner"]} />}>
          <Route path="/super-owner" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route
              path="companies"
              element={
                <AdminModulePage
                  module="companies"
                  title="Companies"
                  subtitle="Search, review and manage registered construction companies."
                />
              }
            />
            <Route
              path="users"
              element={
                <AdminModulePage
                  module="users"
                  title="Users"
                  subtitle="Manage platform users, roles and account access."
                />
              }
            />
            <Route
              path="logs"
              element={
                <AdminModulePage
                  module="logs"
                  title="System Logs"
                  subtitle="Review platform activities, security events and audit history."
                />
              }
            />
            <Route
              path="announcements"
              element={
                <AdminModulePage
                  module="announcements"
                  title="Announcements"
                  subtitle="Send platform-wide updates to companies and users."
                />
              }
            />
            <Route
              path="support"
              element={
                <AdminModulePage
                  module="support"
                  title="Support Tickets"
                  subtitle="Monitor open tickets, priorities and resolution workflow."
                />
              }
            />
            <Route
              path="settings"
              element={
                <AdminModulePage
                  module="settings"
                  title="Settings"
                  subtitle="Configure platform-level BuildFlow preferences."
                />
              }
            />
          </Route>
        </Route>

        {/* 2. COMPANY OWNER ROUTES */}
        <Route element={<RequireAuth roles={["company_owner"]} />}>
          <Route path="/company-owner" element={<MainLayout />}>
            <Route path="dashboard" element={<ExecutiveDashboard />} />
            <Route path="projects" element={<CompanyProjects />} />
            <Route path="users" element={<CompanyUsers />} />
            <Route path="clients" element={<CompanyClients />} />
            <Route path="contractors" element={<CompanyContractors />} />
            <Route path="reports" element={<CompanyReports />} />
            <Route path="settings" element={<CompanySettings />} />
          </Route>
        </Route>

        {/* 3. PROJECT OWNER ROUTES */}
        <Route
          element={<RequireAuth roles={["project_owner", "project_manager"]} />}
        >
          <Route path="/project-owner/:projectId" element={<MainLayout />}>
            <Route path="dashboard" element={<ProjectDashboard />} />
            <Route path="phases" element={<ProjectPhases />} />
            <Route path="tasks" element={<ProjectTasks />} />
            <Route path="workers" element={<ProjectWorkers />} />
            <Route path="boq" element={<ProjectBOQ />} />
            <Route path="budget" element={<ProjectBudget />} />
            <Route
              path="gantt"
              element={
                <ModulePage
                  title="Gantt Chart"
                  subtitle="Review project schedule, dependencies and delays."
                  backTo="../dashboard"
                />
              }
            />
            <Route path="sites" element={<ProjectSites />} />
            <Route path="sites/:siteId/dashboard" element={<SiteDashboard />} />
            <Route
              path="sites/:siteId/daily-report"
              element={
                <ModulePage
                  title="Daily Report"
                  subtitle="Record daily site progress, labour and work updates."
                  backTo="../dashboard"
                />
              }
            />
            <Route
              path="sites/:siteId/labour"
              element={
                <ModulePage
                  title="Site Labour"
                  subtitle="Track labour attendance, allocation and productivity."
                  backTo="../dashboard"
                />
              }
            />
            <Route
              path="sites/:siteId/materials"
              element={
                <ModulePage
                  title="Site Materials"
                  subtitle="Track material usage, receipts and shortages."
                  backTo="../dashboard"
                />
              }
            />
            <Route
              path="sites/:siteId/equipment"
              element={
                <ModulePage
                  title="Site Equipment"
                  subtitle="Track equipment usage, availability and logs."
                  backTo="../dashboard"
                />
              }
            />
            <Route
              path="sites/:siteId/issues"
              element={
                <ModulePage
                  title="Site Issues"
                  subtitle="Review site risks, delays and corrective actions."
                  backTo="../dashboard"
                />
              }
            />
            <Route
              path="sites/:siteId/photos"
              element={
                <ModulePage
                  title="Site Photos"
                  subtitle="View uploaded site progress photos and evidence."
                  backTo="../dashboard"
                />
              }
            />
            <Route path="finance/expenses" element={<ProjectFinance />} />
            <Route path="purchase/orders" element={<ProjectPurchase />} />
            <Route path="store/inventory" element={<ProjectInventory />} />
            <Route path="quality/inspections" element={<ProjectQuality />} />
            <Route path="safety/incidents" element={<ProjectSafety />} />
          </Route>
          <Route path="/project-owner/dashboard" element={<MainLayout />}>
            <Route
              index
              element={
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm font-bold text-slate-600">
                  Please select a project from the Company dashboard.
                </div>
              }
            />
          </Route>
        </Route>

        {/* 4. WORKER ROUTES */}
        <Route element={<RequireAuth roles={["worker"]} />}>
          <Route path="/worker" element={<MainLayout />}>
            <Route path="dashboard" element={<WorkerDashboard />} />
            <Route path="my-work" element={<WorkerMyWork />} />
            <Route path="attendance" element={<WorkerAttendance />} />
            <Route path="earnings" element={<WorkerSalarySlips />} />
            <Route path="salary-slips" element={<WorkerSalarySlips />} />
            <Route path="salary-slips/print" element={<PrintSalarySlip />} />
            <Route path="profile" element={<WorkerDashboard />} />
            <Route path="grievances" element={<WorkerGrievances />} />
            <Route path="announcements" element={<WorkerDashboard />} />
          </Route>
        </Route>

        {/* Catch-all 404 */}
        <Route
          path="*"
          element={
            <div className="flex h-screen w-full items-center justify-center flex-col gap-4 text-slate-500">
              <h1 className="text-4xl font-black text-slate-900">404</h1>
              <p>Page not found</p>
              <a href="/" className="text-blue-600 font-bold hover:underline">
                Go Home
              </a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
