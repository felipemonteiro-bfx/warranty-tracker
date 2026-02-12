'use client';

import ChatLayout from '@/components/messaging/ChatLayout';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Redirect to login if needed, though middleware should handle this
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0e1621]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4c94d5]"></div>
      </div>
    );
  }

  return <ChatLayout />;
}