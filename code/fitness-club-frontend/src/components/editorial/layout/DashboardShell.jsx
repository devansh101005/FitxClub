/**
 * DashboardShell — composes DashboardSidebar + DashboardTopBar + main area.
 * This is the top-level wrapper for all authenticated pages (Member,
 * Trainer, Receptionist, Admin).
 *
 * Usage as a react-router layout route:
 *   <Route element={<DashboardShell roleLabel="Member" />}>
 *     <Route path="/member" element={<MemberDashboard />} />
 *     ...
 *   </Route>
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopBar from './DashboardTopBar';

export default function DashboardShell({ roleLabel, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="font-editorial text-[#1A1A1A] bg-[#FAFAF9] min-h-screen flex">
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopBar
          onMenuToggle={() => setSidebarOpen(true)}
          roleLabel={roleLabel}
        />

        <main className="flex-1 bg-[#FAFAF9]">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
