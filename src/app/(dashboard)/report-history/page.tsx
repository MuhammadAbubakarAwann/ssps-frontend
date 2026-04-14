import Link from 'next/link';
import { cookies } from 'next/headers';
import type { UserInfo } from '@/@types';
import { ReportHistoryMainData } from '@/components/report-history';
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

export default function ReportHistoryPage() {
  const cookieStore = cookies();
  const userData = cookieStore.get('user_data')?.value;
  const user = userData ? JSON.parse(userData) as UserInfo : null;

  return (
    <ContentLayout userInfo={user} title='Report History'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/dashboard' className='text-black'>
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className='text-black'>Report History</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ReportHistoryMainData />
    </ContentLayout>
  );
}
