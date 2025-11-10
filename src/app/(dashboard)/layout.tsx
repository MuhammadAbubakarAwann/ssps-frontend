import React from 'react';
import AdminPanelLayout from '@/components/sections/admin-panel-layout';
import { authHelper } from '@/lib/utils/auth-helpers';

import '../globals.css';

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = (await authHelper(['ADMIN']));
  return (
    <div className="font-graphik">
      <main>
        <AdminPanelLayout activeRole={user.role}>
        {/* <AdminPanelLayout activeRole={"ADMIN"}> */}
          {children}
        </AdminPanelLayout>
      </main>
    </div>
  );
}
