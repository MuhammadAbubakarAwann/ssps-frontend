import Link from 'next/link';
import { ContentLayout } from '@/components/sections/content-layout';
import { getSession } from '@/lib/auth-service';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { redirect } from 'next/navigation';
import RestaurantManagementClient from '@/components/restaurants/restaurant-management-client';

export const dynamic = 'force-dynamic';

export default async function RestaurantManagementPage() {
  const session = await getSession();
  
  if (!session) 
    redirect('/login');
  

  if (session.user.role !== 'ADMIN') 
    redirect('/unauthorized');
  

  return (
    <ContentLayout userInfo={session.user} title='Restaurant Management'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/'>Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/dashboard'>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Restaurant Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <RestaurantManagementClient />
    </ContentLayout>
  );
}
