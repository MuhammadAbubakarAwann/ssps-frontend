'use client';

import { useEffect, useMemo, useState } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { StudentHeader } from '@/components/student-details/student-header';
import { StudentTabs } from '@/components/student-details/student-tabs';
import { SubjectPerformance } from '@/components/student-details/student-performance';
import { GPATrendChart } from '@/components/student-details/gpa-trend-chart';
import { PerformanceTab } from '@/components/student-details/student-tabs/performance';
import { PredictionsTab } from '@/components/student-details/student-tabs/predictions';
import { RecommendationsTab } from '@/components/student-details/student-tabs/recommendations';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type RoleName = 'ADMIN' | 'TEACHER' | 'STUDENT';

type SessionUser = {
  id: string;
  role: RoleName;
  name?: string | null;
  email?: string | null;
};

type ClassOption = {
  id: string;
  name: string;
};

type StudentOption = {
  id: string;
  name: string;
  regNo: string;
};

type ClassesResponse = {
  success?: boolean;
  message?: string;
  data?: {
    classes?: Array<{
      id: string | number;
      name: string;
    }>;
  };
};

type ClassStudentsResponse = {
  success?: boolean;
  message?: string;
  data?: {
    students?: Array<{
      id?: string | number;
      studentId?: string | number;
      userId?: string | number;
      name?: string;
      regNo?: string;
    }>;
  };
};

export default function StudentDetailsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [selectionError, setSelectionError] = useState<string>('');

  const queryStudentId = searchParams.get('studentId') || searchParams.get('id') || '';
  const semester = searchParams.get('semester') || undefined;

  const isStudentRole = sessionUser?.role === 'STUDENT';

  const resolvedStudentId = useMemo(() => {
    if (isStudentRole)
      return sessionUser?.id || '';

    return selectedStudentId || queryStudentId;
  }, [isStudentRole, queryStudentId, selectedStudentId, sessionUser?.id]);

  // Avoid showing "Please select a student" while auto-selection is still resolving.
  const isInitializingSelection = useMemo(() => {
    if (isStudentRole)
      return false;

    if (queryStudentId)
      return false;

    if (isLoadingClasses || isLoadingStudents)
      return true;

    if (!selectedClassId)
      return true;

    if (students.length > 0 && !selectedStudentId)
      return true;

    return false;
  }, [
    isStudentRole,
    queryStudentId,
    isLoadingClasses,
    isLoadingStudents,
    selectedClassId,
    selectedStudentId,
    students.length
  ]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsLoadingUser(true);
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const payload = await response.json() as { success?: boolean; user?: SessionUser; message?: string };

        if (!response.ok || !payload.success || !payload.user)
          throw new Error(payload.message || 'Failed to resolve current user');

        setSessionUser(payload.user);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load user session';
        setSelectionError(message);
      } finally {
        setIsLoadingUser(false);
      }
    };

    void fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (isLoadingUser || !sessionUser || sessionUser.role === 'STUDENT')
      return;

    const fetchClasses = async () => {
      try {
        setIsLoadingClasses(true);
        setSelectionError('');

        const response = await fetch('/api/teacher/classes/names', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const payload: ClassesResponse = await response.json();

        if (!response.ok || !payload.success)
          throw new Error(payload.message || 'Failed to fetch classes');

        const list = (payload.data?.classes || []).map((item) => ({
          id: String(item.id),
          name: item.name
        }));

        setClasses(list);

        const nextClassId = queryStudentId ? '' : (list[0]?.id || '');
        setSelectedClassId((current) => current || nextClassId);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch classes';
        setSelectionError(message);
      } finally {
        setIsLoadingClasses(false);
      }
    };

    void fetchClasses();
  }, [isLoadingUser, queryStudentId, sessionUser]);

  useEffect(() => {
    if (isLoadingUser || !sessionUser || sessionUser.role === 'STUDENT' || !selectedClassId)
      return;

    const fetchStudents = async () => {
      try {
        setIsLoadingStudents(true);
        setSelectionError('');

        const response = await fetch(`/api/teacher/classes/${selectedClassId}/students/prediction-status`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const payload: ClassStudentsResponse = await response.json();

        if (!response.ok || !payload.success)
          throw new Error(payload.message || 'Failed to fetch class students');

        const mapped = (payload.data?.students || []).reduce<StudentOption[]>((acc, item) => {
          // Prefer canonical student id for downstream student-scoped APIs.
          const rawId = item.studentId ?? item.id ?? item.userId;
          const normalizedId = rawId == null ? '' : String(rawId).trim();

          if (!normalizedId)
            return acc;

          acc.push({
            id: normalizedId,
            name: item.name || '-',
            regNo: item.regNo || '-'
          });

          return acc;
        }, []);

        setStudents(mapped);
        setSelectedStudentId((current) => current || mapped[0]?.id || '');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch students';
        setSelectionError(message);
        setStudents([]);
        setSelectedStudentId('');
      } finally {
        setIsLoadingStudents(false);
      }
    };

    void fetchStudents();
  }, [isLoadingUser, selectedClassId, sessionUser]);

  const gpaTrend = [
    { semester: 'sem 1', gpa: 3.0 },
    { semester: 'sem 2', gpa: 3.1 },
    { semester: 'sem 3', gpa: 3.03 },
    { semester: 'sem 4', gpa: 3.13 },
    { semester: 'sem 5', gpa: 3.25 },
    { semester: 'sem 6', gpa: 3.1 },
    { semester: 'sem 7', gpa: 3.3 },
    { semester: 'Sep 8', gpa: 3.28 }
  ];

  const loadingSkeleton = (
    <div className='min-h-screen bg-[#F1F1F1] p-6'>
      <div className='mx-auto max-w-[1200px] space-y-6 animate-pulse'>
        <div className='h-4 w-40 rounded-full bg-gray-200' />
        <div className='h-6 w-2/3 rounded-full bg-gray-200' />

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='h-10 rounded-[7px] border border-gray-200 bg-gray-100' />
          <div className='h-10 rounded-[7px] border border-gray-200 bg-gray-100' />
        </div>

        <div className='relative rounded-[20px] border border-black/20 bg-white p-9'>
          <div className='mb-9 flex items-start gap-10'>
            <div className='h-[150px] w-[117px] rounded-[20px] bg-gray-200' />

            <div className='flex-1 space-y-4'>
              <div className='h-7 w-64 rounded-full bg-gray-200' />
              <div className='h-5 w-32 rounded-full bg-gray-200' />
              <div className='h-8 w-28 rounded-full bg-gray-200' />
            </div>

            <div className='flex gap-5'>
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className='w-[190px] rounded-[20px] border border-black/20 bg-gray-50 p-4 text-center space-y-3'>
                  <div className='h-4 w-28 mx-auto rounded-full bg-gray-200' />
                  <div className='h-10 w-20 mx-auto rounded-full bg-gray-200' />
                </div>
              ))}
            </div>
          </div>

          <div className='my-6 border-t border-black/20'></div>

          <div className='flex justify-start gap-6'>
            {[0, 1, 2].map((index) => (
              <div key={index} className='flex items-center gap-2.5'>
                <div className='h-6 w-6 rounded-full bg-gray-200' />
                <div className='h-4 w-44 rounded-full bg-gray-200' />
              </div>
            ))}
          </div>
        </div>

        <div className='flex flex-col gap-4'>
          <div className='flex gap-5 border-b border-black/20 pb-3'>
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className='h-5 w-28 rounded-full bg-gray-200' />
            ))}
          </div>

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <div className='rounded-[20px] border border-black/20 bg-white p-6 space-y-4'>
              <div className='h-5 w-48 rounded-full bg-gray-200' />
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className='space-y-3 rounded-xl border border-gray-200 p-4'>
                  <div className='h-4 w-36 rounded-full bg-gray-200' />
                  <div className='h-2 w-full rounded-full bg-gray-200' />
                  <div className='h-3 w-24 rounded-full bg-gray-200' />
                </div>
              ))}
            </div>

            <div className='rounded-[20px] border border-black/20 bg-white p-6 space-y-4'>
              <div className='h-5 w-40 rounded-full bg-gray-200' />
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className='space-y-3 rounded-xl border border-gray-200 p-4'>
                  <div className='h-4 w-40 rounded-full bg-gray-200' />
                  <div className='h-4 w-3/4 rounded-full bg-gray-200' />
                  <div className='h-3 w-32 rounded-full bg-gray-200' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoadingUser)
    return loadingSkeleton;

  if (selectionError)
    return <div className='p-6 text-red-600'>{selectionError}</div>;

  if (isInitializingSelection)
    return loadingSkeleton;

  if (!isStudentRole && !resolvedStudentId)
    return <div className='p-6 text-red-600'>Please select a student to continue.</div>;

  return (
    <div className='min-h-screen bg-[#F1F1F1] p-6'>
      <div className='mx-auto max-w-[1200px]'>
        {/* Breadcrumb */}
        <Breadcrumb className='mb-8'>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href='/dashboard' className='text-black'>Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className='text-black'>New Class</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Title */}
        <h1 className='mb-6 text-[20px] font-semibold text-black'>
          See student detailed overview, performance, predictions and recommendations
        </h1>

        {!isStudentRole && (
          <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <label className='mb-2 block text-sm font-medium text-black'>Select Class</label>
              <select
                className='h-10 w-full rounded-[7px] border border-black/30 bg-white px-3 text-sm text-black outline-none'
                value={selectedClassId}
                onChange={(event) => {
                  setSelectedClassId(event.target.value);
                  setSelectedStudentId('');
                }}
                disabled={isLoadingClasses}
              >
                {classes.length === 0 && <option value=''>{isLoadingClasses ? 'Loading classes...' : 'No classes found'}</option>}
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium text-black'>Select Student</label>
              <select
                className='h-10 w-full rounded-[7px] border border-black/30 bg-white px-3 text-sm text-black outline-none'
                value={selectedStudentId}
                onChange={(event) => setSelectedStudentId(event.target.value)}
                disabled={!selectedClassId || isLoadingStudents}
              >
                {students.length === 0 && <option value=''>{isLoadingStudents ? 'Loading students...' : 'No students found'}</option>}
                {students.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.regNo})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Student Header Card */}
        <StudentHeader
          studentId={resolvedStudentId || undefined}
          role={sessionUser?.role || 'TEACHER'}
          semester={semester}
        />

        {/* Tabs */}
        <div className='mt-6'>
          <StudentTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className='mt-6 flex flex-col gap-6'>
              <SubjectPerformance
                studentId={resolvedStudentId || undefined}
                role={sessionUser?.role || 'TEACHER'}
                semester={semester}
              />
              <GPATrendChart data={gpaTrend} />
            </div>
          )}

          {activeTab === 'performance' && (
            <div className='mt-6'>
              <PerformanceTab
                studentId={resolvedStudentId || undefined}
                role={sessionUser?.role || 'TEACHER'}
                semester={semester}
              />
            </div>
          )}

          {activeTab === 'predictions' && (
            <div className='mt-6'>
              <PredictionsTab
                studentId={resolvedStudentId || undefined}
                role={sessionUser?.role || 'TEACHER'}
                semester={semester}
              />
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className='mt-6'>
              <RecommendationsTab
                studentId={resolvedStudentId || undefined}
                role={sessionUser?.role || 'TEACHER'}
                semester={semester}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
