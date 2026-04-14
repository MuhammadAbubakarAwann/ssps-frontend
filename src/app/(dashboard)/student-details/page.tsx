import Link from 'next/link';
import { StudentDetailsMainData } from '@/components/student-details';
import { ContentLayout } from '@/components/sections/content-layout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { cookies } from 'next/headers';
import type { UserInfo } from '@/@types';

export const dynamic = 'force-dynamic';

export default function StudentDetailsPage() {
  const cookieStore = cookies();
  const userData = cookieStore.get('user_data')?.value;
  const user = userData ? (JSON.parse(userData) as UserInfo) : null;

  return (
    <ContentLayout userInfo={user} title='Student Details'>
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
            <BreadcrumbPage className='text-black'>
              Student Details
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className='mt-4'>
        <h1 className='mb-6 text-[20px] font-semibold text-black'>
          See student detailed overview, performance, predictions and
          recommendations
        </h1>

        <StudentDetailsMainData />
      </div>
    </ContentLayout>
  );
}
