//components/sidebar/menu.ts
import {
  Home,
  Users,
  FolderKanban,
  FileText,
  Settings,
  User,
} from "lucide-react";

export const adminMenu = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const clientMenu = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];
