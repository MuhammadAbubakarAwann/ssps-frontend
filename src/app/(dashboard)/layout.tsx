import React from 'react';
import AdminPanelLayout from '@/components/sections/admin-panel-layout';
import { cookies } from 'next/headers';

import '../globals.css';

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get user info from cookies since middleware already validated authentication
  const cookieStore = cookies();
  const userData = cookieStore.get('user_data')?.value;
  const user = userData ? JSON.parse(userData) : { role: 'ADMIN' };

  return (
    <div className='font-graphik'>
      <main>
        <AdminPanelLayout activeRole={user.role}>
          {children}
        </AdminPanelLayout>
      </main>
    </div>
  );
}
