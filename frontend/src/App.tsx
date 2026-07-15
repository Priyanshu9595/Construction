import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProjectDashboard from "./pages/ProjectDashboard";
import SiteDashboard from "./pages/SiteDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import WorkerAttendance from "./pages/worker/WorkerAttendance";
import WorkerMyWork from "./pages/worker/WorkerMyWork";
import WorkerSalarySlips from "./pages/worker/WorkerSalarySlips";
import WorkerGrievances from "./pages/worker/WorkerGrievances";
import WorkerLogin from "./pages/WorkerLogin";
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
        <Route path="/super-owner" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="companies" element={<ModulePage title="Companies" subtitle="Search, review and manage registered construction companies." backTo="/super-owner/dashboard" />} />
          <Route path="users" element={<ModulePage title="Users" subtitle="Manage platform users, roles and account access." backTo="/super-owner/dashboard" />} />
          <Route path="plans" element={<ModulePage title="Plans & Billing" subtitle="Create subscription plans and review billing performance." backTo="/super-owner/dashboard" />} />
          <Route path="subscriptions" element={<ModulePage title="Subscriptions" subtitle="Track active subscriptions, renewals and overdue payments." backTo="/super-owner/dashboard" />} />
          <Route path="logs" element={<ModulePage title="System Logs" subtitle="Review platform activities, security events and audit history." backTo="/super-owner/dashboard" />} />
          <Route path="announcements" element={<ModulePage title="Announcements" subtitle="Send platform-wide updates to companies and users." backTo="/super-owner/dashboard" />} />
          <Route path="support" element={<ModulePage title="Support Tickets" subtitle="Monitor open tickets, priorities and resolution workflow." backTo="/super-owner/dashboard" />} />
          <Route path="settings" element={<ModulePage title="Settings" subtitle="Configure platform-level BuildFlow preferences." backTo="/super-owner/dashboard" />} />
        </Route>

        {/* 2. COMPANY OWNER ROUTES */}
        <Route path="/company-owner" element={<MainLayout />}>
          <Route path="dashboard" element={<ExecutiveDashboard />} />
          <Route path="projects" element={<CompanyProjects />} />
          <Route path="users" element={<CompanyUsers />} />
          <Route path="clients" element={<CompanyClients />} />
          <Route path="contractors" element={<CompanyContractors />} />
          <Route path="reports" element={<CompanyReports />} />
          <Route path="settings" element={<CompanySettings />} />
        </Route>

        {/* 3. PROJECT OWNER ROUTES */}
        <Route path="/project-owner/:projectId" element={<MainLayout />}>
          <Route path="dashboard" element={<ProjectDashboard />} />
          {/* Project Planning */}
          <Route path="phases" element={<ProjectPhases />} />
          <Route path="tasks" element={<ProjectTasks />} />
          <Route path="workers" element={<ProjectWorkers />} />
          <Route path="boq" element={<ProjectBOQ />} />
          <Route path="budget" element={<ProjectBudget />} />
          <Route path="gantt" element={<ModulePage title="Gantt Chart" subtitle="Review project schedule, dependencies and delays." backTo="../dashboard" />} />
          
          {/* Sites & Execution */}
          <Route path="sites" element={<ProjectSites />} />
          <Route path="sites/:siteId/dashboard" element={<SiteDashboard />} />
          <Route path="sites/:siteId/daily-report" element={<ModulePage title="Daily Report" subtitle="Record daily site progress, labour and work updates." backTo="../dashboard" />} />
          <Route path="sites/:siteId/labour" element={<ModulePage title="Site Labour" subtitle="Track labour attendance, allocation and productivity." backTo="../dashboard" />} />
          <Route path="sites/:siteId/materials" element={<ModulePage title="Site Materials" subtitle="Track material usage, receipts and shortages." backTo="../dashboard" />} />
          <Route path="sites/:siteId/equipment" element={<ModulePage title="Site Equipment" subtitle="Track equipment usage, availability and logs." backTo="../dashboard" />} />
          <Route path="sites/:siteId/issues" element={<ModulePage title="Site Issues" subtitle="Review site risks, delays and corrective actions." backTo="../dashboard" />} />
          <Route path="sites/:siteId/photos" element={<ModulePage title="Site Photos" subtitle="View uploaded site progress photos and evidence." backTo="../dashboard" />} />

          {/* Operational Modules (Permission Based) */}
          <Route path="finance/expenses" element={<ProjectFinance />} />
          <Route path="purchase/orders" element={<ProjectPurchase />} />
          <Route path="store/inventory" element={<ProjectInventory />} />
          <Route path="quality/inspections" element={<ProjectQuality />} />
          <Route path="safety/incidents" element={<ProjectSafety />} />
        </Route>

        {/* Fallback for Project Owner Dashboard if no projectId in URL */}
        <Route path="/project-owner/dashboard" element={<MainLayout />}>
          <Route index element={<div className="p-8">Please select a project from the Company dashboard.</div>} />
        </Route>

        {/* 4. WORKER ROUTES */}
        <Route path="/worker" element={<MainLayout />}>
          <Route path="dashboard" element={<WorkerDashboard />} />
          <Route path="my-work" element={<WorkerMyWork />} />
          <Route path="attendance" element={<WorkerAttendance />} />
          <Route path="earnings" element={<WorkerSalarySlips />} />
          <Route path="salary-slips" element={<WorkerSalarySlips />} />
          <Route path="profile" element={<WorkerDashboard />} />
          <Route path="grievances" element={<WorkerGrievances />} />
          <Route path="announcements" element={<WorkerDashboard />} />
        </Route>
        
        {/* Catch-all 404 */}
        <Route path="*" element={<div className="flex h-screen w-full items-center justify-center flex-col gap-4 text-slate-500"><h1 className="text-4xl font-black text-slate-900">404</h1><p>Page not found</p><a href="/" className="text-blue-600 font-bold hover:underline">Go Home</a></div>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
