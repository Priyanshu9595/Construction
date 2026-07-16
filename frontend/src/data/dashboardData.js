export const companies = [
  {
    id: "cmp-afc",
    name: "AFC Constructions Pvt. Ltd.",
    owner: "Rajesh Verma",
    tier: "Enterprise",
    users: 186,
    revenue: 1100000,
    active: true,
    joinedOn: "15 May 2024",
  },
  {
    id: "cmp-green",
    name: "GreenBuild Ltd.",
    owner: "Neha Kapoor",
    tier: "Premium",
    users: 94,
    revenue: 540000,
    active: true,
    joinedOn: "15 May 2024",
  },
  {
    id: "cmp-skyline",
    name: "Skyline Developers",
    owner: "Arjun Mehta",
    tier: "Standard",
    users: 73,
    revenue: 248000,
    active: true,
    joinedOn: "15 May 2024",
  },
  {
    id: "cmp-metro",
    name: "MetroBuild Infra",
    owner: "Sara Khan",
    tier: "Basic",
    users: 41,
    revenue: 96000,
    active: false,
    joinedOn: "14 May 2024",
  },
];

export const projects = [
  {
    id: "prj-ocean",
    companyId: "cmp-afc",
    name: "Oceanview Residences",
    site: "Tower A",
    status: "In Progress",
    progress: 65,
    plannedProgress: 78,
    budget: 24500000,
    spent: 17500000,
    daysPassed: 120,
    totalDays: 210,
    delayDays: 15,
    client: "Oceanview Realty",
    profit: 33500000,
  },
  {
    id: "prj-green",
    companyId: "cmp-afc",
    name: "GreenField Villas",
    site: "Phase 2",
    status: "In Progress",
    progress: 40,
    plannedProgress: 52,
    budget: 18000000,
    spent: 8200000,
    daysPassed: 84,
    totalDays: 190,
    delayDays: 6,
    client: "GreenField Homes",
    profit: 18200000,
  },
  {
    id: "prj-sunrise",
    companyId: "cmp-afc",
    name: "Sunrise Complex",
    site: "Block C",
    status: "Completed",
    progress: 90,
    plannedProgress: 90,
    budget: 13200000,
    spent: 11800000,
    daysPassed: 180,
    totalDays: 180,
    delayDays: 0,
    client: "Sunrise Group",
    profit: 9400000,
  },
  {
    id: "prj-tech",
    companyId: "cmp-afc",
    name: "Tech Park Phase 1",
    site: "North Wing",
    status: "On Hold",
    progress: 20,
    plannedProgress: 44,
    budget: 20500000,
    spent: 5600000,
    daysPassed: 52,
    totalDays: 240,
    delayDays: 22,
    client: "TechSquare",
    profit: 7600000,
  },
  {
    id: "prj-skyline",
    companyId: "cmp-skyline",
    name: "Skyline Towers",
    site: "Tower B",
    status: "Delayed",
    progress: 58,
    plannedProgress: 71,
    budget: 22800000,
    spent: 14600000,
    daysPassed: 130,
    totalDays: 220,
    delayDays: 19,
    client: "Sky Homes",
    profit: 12100000,
  },
];

export const tasks = [
  {
    projectId: "prj-ocean",
    name: "Brick Work - 2nd Floor",
    progress: 75,
    status: "In Progress",
  },
  {
    projectId: "prj-ocean",
    name: "Plastering - Tower B",
    progress: 40,
    status: "In Progress",
  },
  {
    projectId: "prj-ocean",
    name: "Flooring - Tower A",
    progress: 20,
    status: "Pending",
  },
  {
    projectId: "prj-green",
    name: "Column Casting",
    progress: 100,
    status: "Completed",
  },
  {
    projectId: "prj-green",
    name: "Beam Shuttering",
    progress: 60,
    status: "In Progress",
  },
  {
    projectId: "prj-tech",
    name: "Foundation Audit",
    progress: 30,
    status: "Blocked",
  },
];

export const siteReports = [
  {
    projectId: "prj-ocean",
    labour: 58,
    todayWork: 75,
    materialUsed: 12,
    equipmentUsed: 5,
    temperature: 32,
    weather: "Sunny",
    tasks: [
      { name: "Column Cutting", today: 100, total: 100 },
      { name: "Beam Shuttering", today: 20, total: 60 },
      { name: "Slab Reinforcement", today: 40, total: 40 },
    ],
    checklist: [
      "Work Progress Updated",
      "Labour Attendance Taken",
      "Material Usage Added",
      "Equipment Log Updated",
      "Site Photos Uploaded",
    ],
  },
];

export const materials = [
  { name: "Cement (OPC 53)", unit: "Bag", inStock: 1250, lowStockLevel: 200 },
  { name: "Steel (TMT 12mm)", unit: "Ton", inStock: 28, lowStockLevel: 10 },
  { name: "Sand (River)", unit: "CFT", inStock: 150, lowStockLevel: 30 },
  { name: "Bricks", unit: "Nos", inStock: 5000, lowStockLevel: 500 },
  { name: "Paint (Asian)", unit: "Ltr", inStock: 200, lowStockLevel: 50 },
];

export const incidents = [
  {
    projectId: "prj-ocean",
    title: "Material Delay",
    severity: "Medium",
    date: "17 May 2024",
  },
  {
    projectId: "prj-ocean",
    title: "Drawing Approval Pending",
    severity: "High",
    date: "17 May 2024",
  },
  {
    projectId: "prj-green",
    title: "Labour Shortage",
    severity: "Low",
    date: "16 May 2024",
  },
];

export const monthlyPlatform = [
  { name: "Jan", companies: 18, projects: 22 },
  { name: "Feb", companies: 28, projects: 35 },
  { name: "Mar", companies: 38, projects: 48 },
  { name: "Apr", companies: 55, projects: 60 },
  { name: "May", companies: 45, projects: 72 },
  { name: "Jun", companies: 62, projects: 88 },
  { name: "Jul", companies: 76, projects: 108 },
];

export const projectProgressTrend = [
  { name: "Jan", planned: 8, actual: 4 },
  { name: "Feb", planned: 20, actual: 12 },
  { name: "Mar", planned: 34, actual: 22 },
  { name: "Apr", planned: 48, actual: 38 },
  { name: "May", planned: 62, actual: 48 },
  { name: "Jun", planned: 72, actual: 58 },
  { name: "Jul", planned: 82, actual: 65 },
];

export const sitePhotos = [
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1504307651254-35680f356f58?auto=format&fit=crop&q=80&w=500",
];

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getCompanyProjects(companyId) {
  return projects.filter((project) => project.companyId === companyId);
}

export function getPrimaryCompany() {
  return companies[0];
}

export function getPrimaryProject() {
  return projects[0];
}

export function getProjectReport(projectId) {
  return (
    siteReports.find((report) => report.projectId === projectId) ??
    siteReports[0]
  );
}

export function getCompanyTierSummary() {
  return companies.reduce((summary, company) => {
    const current = summary[company.tier] ?? { companies: 0, revenue: 0 };
    summary[company.tier] = {
      companies: current.companies + 1,
      revenue: current.revenue + company.revenue,
    };
    return summary;
  }, {});
}
