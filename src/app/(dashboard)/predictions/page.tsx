import Link from 'next/link';
import { cookies } from 'next/headers';
import type { UserInfo } from '@/@types';
import { PredictionsMainData } from '@/components/predictions/predictions-main-data';
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

export default function PredictionsPage() {
  const cookieStore = cookies();
  const userData = cookieStore.get('user_data')?.value;
  const user = userData ? JSON.parse(userData) as UserInfo : null;

  return (
    <ContentLayout userInfo={user} title='Predictions'>
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
            <BreadcrumbPage className='text-black'>Predictions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PredictionsMainData />
    </ContentLayout>
  );
}
