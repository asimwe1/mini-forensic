"use client";

import { LabSidebar } from "@/components/lab-sidebar";
import { DashboardFooter } from "@/components/dashboard-footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProtectedRoute from "./protected-route";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex h-screen bg-background">
          <LabSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
                {children}
              </div>
            </main>
            <DashboardFooter />
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
