'use client';

import Link from 'next/link';
import { ContentLayout } from '@/components/sections/content-layout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { AddClassForm } from '@/components/class-management/add-class-form';
import { useEffect, useState } from 'react';

export default function NewClassPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user info from localStorage (client side)
    const userData = localStorage.getItem('user_data');
    if (userData) 
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    
    setIsLoading(false);
  }, []);

  if (isLoading) 
    return (
      <ContentLayout userInfo={user} title='New Class'>
        <div className='mt-8 space-y-6 animate-pulse'>
          <div className='h-7 w-2/3 rounded-full bg-gray-200' />
          <div className='rounded-[10px] border border-gray-200 bg-white p-6 space-y-5'>
            <div className='h-5 w-36 rounded-full bg-gray-200' />
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4'>
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className='space-y-2'>
                  <div className='h-4 w-24 rounded-full bg-gray-200' />
                  <div className='h-10 rounded-md bg-gray-200' />
                </div>
              ))}
            </div>
            <div className='h-48 rounded-md bg-gray-100' />
          </div>
        </div>
      </ContentLayout>
    );
  

  return (
    <ContentLayout userInfo={user} title='New Class'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/dashboard' style={{ color: '#000000' }}>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ color: '#000000' }}>All Classes</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ color: '#000000' }}>New Class</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='mt-8'>
        <h1 className='text-2xl font-semibold mb-6' style={{ color: '#000000' }}>
          Add new class to the student performance management system
        </h1>
        <AddClassForm />
      </div>
    </ContentLayout>
  );
}
