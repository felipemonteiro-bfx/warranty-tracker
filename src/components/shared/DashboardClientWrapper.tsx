'use client';

import { BottomNav } from './BottomNav';
import { PWAInstaller } from './PWAInstaller';

export default function DashboardClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0e1621] pb-24 lg:pb-0">
      {children}
      <BottomNav />
      <PWAInstaller />
    </div>
  );
}
