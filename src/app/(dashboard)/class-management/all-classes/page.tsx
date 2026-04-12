'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ClassCard } from '@/components/class-management/class-card';
import { ClassDetailModal } from '@/components/class-management/class-detail-modal';
import { Plus } from 'lucide-react';
import { ContentLayout } from '@/components/sections/content-layout';
import { showToast } from '@/components/ui/toaster';

type Student = {
  id: number;
  regNo: string;
  name: string;
  Q1: number;
  Q2: number;
  Q3: number;
  Q4: number;
  Q5: number;
  A1: number;
  A2: number;
  A3: number;
  A4: number;
  mids: number;
  att: string;
};

type ClassItem = {
  id: string;
  name: string;
  semester: string;
  section: string;
  students: Student[];
  totalStudents?: number;
};

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolveClassId(raw: Record<string, unknown>): string {
  const nestedClassId = raw.class && typeof raw.class === 'object'
    ? (raw.class as Record<string, unknown>).id
    : undefined;

  const classId = raw.id ?? raw.classId ?? raw.classID ?? nestedClassId;
  return classId == null ? '' : String(classId);
}

function toAttendance(value: unknown): string {
  if (typeof value === 'string' && value.includes('%'))
    return value;

  return `${toNumber(value)}%`;
}

function mapStudent(student: Record<string, unknown>, index: number): Student {
  return {
    id: toNumber(student.id) || index + 1,
    regNo: String(student.regNo || student.registrationNo || '-'),
    name: String(student.name || '-'),
    Q1: toNumber(student.quiz1 ?? student.Q1),
    Q2: toNumber(student.quiz2 ?? student.Q2),
    Q3: toNumber(student.quiz3 ?? student.Q3),
    Q4: toNumber(student.quiz4 ?? student.Q4),
    Q5: toNumber(student.quiz5 ?? student.Q5),
    A1: toNumber(student.assignment1 ?? student.A1),
    A2: toNumber(student.assignment2 ?? student.A2),
    A3: toNumber(student.assignment3 ?? student.A3),
    A4: toNumber(student.assignment4 ?? student.A4),
    mids: toNumber(student.midsPercentage ?? student.mids),
    att: toAttendance(student.attendancePercentage ?? student.att)
  };
}

function mapClass(raw: Record<string, unknown>): ClassItem {
  const topStudents = Array.isArray(raw.topStudents)
    ? raw.topStudents
    : Array.isArray(raw.students)
      ? raw.students
      : [];

  const totalStudents =
    Number(raw.totalStudents ?? raw.totalStudentsCount ?? raw.studentsCount ?? raw.studentCount);

  return {
    id: resolveClassId(raw),
    name: String(raw.name || 'Unnamed Class'),
    semester: String(raw.semester || ''),
    section: String(raw.section || ''),
    students: topStudents
      .filter((student): student is Record<string, unknown> => typeof student === 'object' && student !== null)
      .map(mapStudent),
    totalStudents: Number.isFinite(totalStudents) ? totalStudents : undefined
  };
}

function extractClasses(payload: Record<string, unknown>): ClassItem[] {
  const classes =
    (Array.isArray(payload.data) ? payload.data : null) ||
    (payload.data &&
    typeof payload.data === 'object' &&
    Array.isArray((payload.data as Record<string, unknown>).classes)
      ? ((payload.data as Record<string, unknown>).classes as unknown[])
      : null) ||
    (Array.isArray(payload.classes) ? payload.classes : []);

  return classes
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map(mapClass);
}

export default function ClassManagementPage() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await fetch('/api/teacher/classes', {
          method: 'GET',
          credentials: 'include'
        });

        const payload: Record<string, unknown> = await response.json();

        if (!response.ok)
          throw new Error(String(payload?.message || 'Failed to fetch classes'));

        setClasses(extractClasses(payload));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch classes';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadClasses();
  }, []);

  const handleDeleteClass = async (classId: string) => {
    if (!classId) {
      showToast.error('Invalid class id. Please refresh and try again.');
      return;
    }

    try {
      const response = await fetch(`/api/teacher/classes/${classId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const payload: Record<string, unknown> = await response.json();

      if (!response.ok || !payload?.success)
        throw new Error(String(payload?.message || 'Failed to delete class'));

      setClasses((prev) => prev.filter((item) => item.id !== classId));
      setSelectedClass((prev) => (prev?.id === classId ? null : prev));

      showToast.success(String(payload?.message || 'Class deleted successfully'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete class';
      showToast.error(message);
    }
  };

  return (
    <ContentLayout userInfo={null} title='Dashboard'>
      <div className=''>
        <div className='max-w-7xl mx-auto'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href='/'>Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>All Classes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className='mb-8 flex justify-between items-start'>
            <div>
              <h1 className='text-3xl font-bold text-slate-900 mb-2'>
                Manage classes to predict data for all classes
              </h1>
              <p className='text-slate-600'>Monitor and manage student performance across all classes</p>
            </div>
            <Button
              className='gap-2 '
              color='primary'
              size='medium'
              variant='solid'
              onClick={() => router.push('/class-management/new-class')}
            >
              <Plus className='w-5 h-5' />
              Add New Class
            </Button>
          </div>

          {isLoading ? (
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 animate-pulse'>
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className='rounded-xl border border-gray-200 bg-white p-5 space-y-3'>
                    <div className='h-5 w-40 rounded-full bg-gray-200' />
                    <div className='h-4 w-32 rounded-full bg-gray-200' />
                    <div className='h-3 w-full rounded-full bg-gray-200' />
                    <div className='h-3 w-5/6 rounded-full bg-gray-200' />
                  </div>
                ))}
              </div>
          ) : errorMessage ? (
            <div className='py-8 text-center text-red-500'>{errorMessage}</div>
          ) : classes.length === 0 ? (
            <div className='py-8 text-center text-slate-600'>No classes found.</div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'>
              {classes.map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  classItem={classItem}
                  onView={() => setSelectedClass(classItem)}
                  onDelete={handleDeleteClass}
                />
              ))}
            </div>
          )}
        </div>

        {selectedClass && (
          <ClassDetailModal
            classItem={selectedClass}
            onClose={() => setSelectedClass(null)}
            onDelete={handleDeleteClass}
          />
        )}
      </div>
    </ContentLayout>
  );
}
