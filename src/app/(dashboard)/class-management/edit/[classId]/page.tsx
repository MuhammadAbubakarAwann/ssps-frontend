'use client';

import { AddClassForm } from '@/components/class-management/add-class-form';
import { ContentLayout } from '@/components/sections/content-layout';

export default function EditClassPage({
  params
}: {
  params: { classId: string };
}) {
  return (
    <ContentLayout userInfo={null} title='Edit Class'>
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-slate-900 mb-2'>
              Edit Class & Students
            </h1>
            <p className='text-slate-600'>Update class details and student information</p>
          </div>

          <AddClassForm editClassId={params.classId} />
        </div>
      </div>
    </ContentLayout>
  );
}
