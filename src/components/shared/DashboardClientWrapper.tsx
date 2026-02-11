'use client';

import PanicProvider from "@/components/shared/PanicProvider";
import DisguiseProvider from "@/components/shared/DisguiseProvider";
import { BottomNav } from "@/components/shared/BottomNav";

export default function DashboardClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PanicProvider>
      <DisguiseProvider>
        {children}
        <BottomNav />
      </DisguiseProvider>
    </PanicProvider>
  );
}
