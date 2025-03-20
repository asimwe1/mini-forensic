"use client";

import { LabSidebar } from "@/components/lab-sidebar";
import { DashboardFooter } from "@/components/dashboard-footer";
import { SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <LabSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
          <DashboardFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}
