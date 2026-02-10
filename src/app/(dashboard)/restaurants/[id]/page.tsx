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
import RestaurantDetailClient from '@/components/restaurants/restaurant-detail-client';

interface RestaurantDetailPageProps {
  params: {
    id: string;
  };
}

export default async function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  return (
    <ContentLayout userInfo={session.user} title='Restaurant Details'>
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
            <BreadcrumbLink asChild>
              <Link href='/restaurants'>Restaurant Management</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Restaurant Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Suspense fallback={
        <div className='w-full flex items-center justify-center py-8'>
          <div className='text-[#6B7280]'>Loading restaurant details...</div>
        </div>
      }>
        <RestaurantDetailClient restaurantId={params.id} />
      </Suspense>
    </ContentLayout>
  );
}