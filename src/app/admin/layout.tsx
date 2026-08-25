"use client";

import DashboardHeader from "@/src/components/layout/dashboardLayout/DashboardHeader";
import Sidebar from "@/src/components/shared/sidebar/Sidebar";
import { ReactNode, useState } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 lg:ml-0 min-w-0 w-full flex flex-col overflow-hidden">
        <div className="w-full sticky top-0 z-30 bg-white">
          <DashboardHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>
        <div className="p-3 sm:p-4 lg:p-6 w-full overflow-y-auto h-[calc(100vh-75px)] scrollbar-hide bg-light">
          <div className="w-full max-w-full ">{children}</div>
        </div>
      </div>
    </div>
  );
}
