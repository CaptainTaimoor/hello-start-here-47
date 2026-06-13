export type Role =
  | "Super Admin"
  | "Admin"
  | "Project Manager"
  | "Content Manager"
  | "Editor"
  | "Analyst"
  | "HR"
  | "Finance"
  | "IT"
  | "Viewer";

export const ALL_ROLES: Role[] = [
  "Super Admin",
  "Admin",
  "Project Manager",
  "Content Manager",
  "Editor",
  "Analyst",
  "HR",
  "Finance",
  "IT",
  "Viewer",
];

export type SheetKey =
  | "content-monitoring"
  | "daily-content"
  | "edit-plans"
  | "fpc"
  | "kpi";

export interface SheetColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "status" | "date" | "user";
  width?: number;
  options?: string[];
}

export interface SheetDef {
  key: SheetKey;
  name: string;
  description: string;
  columns: SheetColumn[];
}

export type SheetRow = Record<string, string | number> & { id: string };

export interface Channel {
  id: string;
  name: string;
  platform: "YouTube";
  status: "Active" | "Paused";
  manager: string;
  team: string[];
  mode: "API" | "Manual";
  apiConnected: boolean;
  todayCount: number;
  pendingSheets: number;
  kpiStatus: "On Track" | "At Risk" | "Off Track";
  lastUpdated: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  project?: string;
  user?: string;
  read: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  projects: string[];
  channels: string[];
  sheets: string[];
  status: "Active" | "Inactive";
  lastLogin: string;
}

export interface DashboardCardConfig {
  id: string;
  visible: boolean;
}