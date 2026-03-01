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
import RiderDetailClient from '@/components/riders/rider-detail-client';

interface RiderDetailPageProps {
  params: {
    id: string;
  };
}

export default async function RiderDetailPage({ params }: RiderDetailPageProps) {
  const session = await getSession();
  
  if (!session)
    redirect('/login');

  if (session.user.role !== 'ADMIN')
    redirect('/unauthorized');

  return (
    <ContentLayout userInfo={session.user} title='Rider Details'>
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
              <Link href='/riders' className='text-[#6B7280] hover:text-[#6B7280]/80'>
                Riders
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className='text-[#6B7280]' />
          <BreadcrumbItem>
            <BreadcrumbPage>Rider Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Suspense fallback={
        <div className='w-full flex items-center justify-center py-8'>
          <div className='text-[#6B7280]'>Loading rider details...</div>
        </div>
      }>
        <RiderDetailClient riderId={params.id} />
      </Suspense>
    </ContentLayout>
  );
}