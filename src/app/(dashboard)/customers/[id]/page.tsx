import { Suspense } from 'react';
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
import CustomerDetailClient from '@/components/customers/customer-detail-client';

interface CustomerDetailPageProps {
  params: {
    id: string;
  };
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const session = await getSession();
  
  if (!session)
    redirect('/login');

  if (session.user.role !== 'ADMIN')
    redirect('/unauthorized');

  return (
    <ContentLayout userInfo={session.user} title='Customer Details'>
      <Breadcrumb className='w-full'>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/' className='text-[#FABB17] hover:text-[#FABB17]/80'>
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className='text-[#6B7280]' />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/customers' className='text-[#6B7280] hover:text-[#6B7280]/80'>
                Customers
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className='text-[#6B7280]' />
          <BreadcrumbItem>
            <BreadcrumbPage>Customer Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Suspense fallback={
        <div className='w-full flex items-center justify-center py-8'>
          <div className='text-[#6B7280]'>Loading customer details...</div>
        </div>
      }>
        <CustomerDetailClient customerId={params.id} />
      </Suspense>
    </ContentLayout>
  );
}