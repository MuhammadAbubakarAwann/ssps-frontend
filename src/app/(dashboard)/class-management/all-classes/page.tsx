import Link from 'next/link';
import { cookies } from 'next/headers';
import type { UserInfo } from '@/@types';
import { ClassManagementMainData } from '@/components/class-management/class-management-main-data';
import { ContentLayout } from '@/components/sections/content-layout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

export const dynamic = 'force-dynamic';

export default function AllClassesPage() {
  const cookieStore = cookies();
  const userData = cookieStore.get('user_data')?.value;
  const user = userData ? JSON.parse(userData) as UserInfo : null;

  return (
    <ContentLayout userInfo={user} title='All Classes'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/dashboard'>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>All Classes</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ClassManagementMainData />
    </ContentLayout>
  );
}
