'use client';

import { BottomNav } from './BottomNav';
import { PWAInstaller } from './PWAInstaller';

export default function DashboardClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
      <PWAInstaller />
    </>
  );
}
