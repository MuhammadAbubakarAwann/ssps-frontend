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
    return <div>Loading...</div>;
  

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
