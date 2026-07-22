import {
  BarChart3,
  Bot,
  CircleDollarSign,
  FileText,
  FolderOpen,
  Kanban,
  LayoutDashboard,
  ListTodo,
  Settings,
  UserCircle,
  Users,
  Workflow,
} from "lucide-react";

export const NAV_SECTIONS = [
  {
    label: "Workspace",
    items: [
      { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard, available: true },
      { id: "clients", label: "Clients", Icon: Users, available: true },
      { id: "pipeline", label: "Pipeline", Icon: Kanban, available: true },
      { id: "tasks", label: "Tasks", Icon: ListTodo, description: "Keep every follow-up and commitment in one focused workspace." },
    ],
  },
  {
    label: "AI & Automation",
    items: [
      { id: "ai-assistant", label: "AI Assistant", Icon: Bot, description: "A central place for Warmline's AI-powered client work." },
      { id: "flows", label: "Flows & Automations", Icon: Workflow, description: "Build repeatable workflows that keep your CRM moving." },
    ],
  },
  {
    label: "Business",
    items: [
      { id: "files", label: "Files", Icon: FolderOpen, description: "Keep client documents and working files close to the relationship." },
      { id: "contracts", label: "Contracts", Icon: FileText, description: "Manage proposals, agreements, and signed work in one place." },
      { id: "income", label: "Income", Icon: CircleDollarSign, description: "Track the money connected to your client work." },
    ],
  },
  {
    label: "Insights",
    items: [
      { id: "reports", label: "Reports", Icon: BarChart3, description: "Turn your CRM activity into useful business insight." },
    ],
  },
];

export const BOTTOM_NAV_ITEMS = [
  { id: "settings", label: "Settings", Icon: Settings },
  { id: "profile", label: "Profile", Icon: UserCircle, description: "Manage your Warmline account and profile." },
];

export function getNavigationItem(id) {
  return [
    ...NAV_SECTIONS.flatMap((section) => section.items),
    ...BOTTOM_NAV_ITEMS,
  ].find((item) => item.id === id);
}

