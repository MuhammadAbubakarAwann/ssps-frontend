import Link from 'next/link';
import { ContentLayout } from '@/components/sections/content-layout';
// import { getUserByEmail } from '@/db/server-actions';
// import { auth } from '@/auth';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
// import { redirect } from 'next/navigation';
// import { getRoles } from '@/lib/utils/auth-helpers/role';
import { DashboardLanding } from '@/components/sections/dashboard-landing';

export default async function DashboardPage() {
  // const session = await auth();
  // if (!session?.user?.email) redirect('/unauthorized');

  // const allowedRoles = getRoles('ADMIN');
  // if (!allowedRoles.includes(session.user.role)) redirect('/unauthorized');

  // const result = await getUserByEmail(session.user.email);

  // if ('error' in result) redirect('/unauthorized');

  const userInfo = {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN' as const,
    image: '/default-avatar.png'
  };
  return (
    <ContentLayout userInfo={userInfo} title='Dashboard'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/'>Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <DashboardLanding />
    </ContentLayout>
  );
}
