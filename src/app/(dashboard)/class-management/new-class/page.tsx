import Link from 'next/link';
import { cookies } from 'next/headers';
import type { UserInfo } from '@/@types';
import { AddClassForm } from '@/components/class-management/add-class-form';
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

export default function NewClassPage() {
  const cookieStore = cookies();
  const userData = cookieStore.get('user_data')?.value;
  const user = userData ? JSON.parse(userData) as UserInfo : null;

  return (
    <ContentLayout userInfo={user} title='New Class'>
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
            <BreadcrumbPage className='text-black'>All Classes</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className='text-black'>New Class</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='mt-4'>
        <h1 className='mb-6 text-2xl font-semibold text-black'>
          Add new class to the student performance management system
        </h1>
        <AddClassForm />
      </div>
    </ContentLayout>
  );
}
