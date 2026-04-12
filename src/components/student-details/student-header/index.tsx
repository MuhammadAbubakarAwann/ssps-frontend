'use client';

import { Mail, Phone, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StudentDetailsResponse {
  success: boolean;
  data: {
    student: {
      id: string;
      name: string;
      regNo: string;
      email: string;
      phoneNumber: string;
      address: string;
      semester: string;
      overallRiskLevel: string;
      expectedCgpa: number;
      classRank: number;
      averageScore: number;
    };
    attendanceBySubject: Array<{
      classId: string;
      className: string;
      subject: string;
      attendancePercentage: number;
    }>;
  };
}

interface StudentHeaderProps {
  studentId?: string;
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT';
  semester?: string;
}

export function StudentHeader({ studentId, role = 'TEACHER', semester }: StudentHeaderProps) {
  const [studentData, setStudentData] = useState<StudentDetailsResponse['data']['student'] | null>(null);
  const [attendance, setAttendance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (semester)
          params.append('semester', semester);

        const baseUrl = role === 'STUDENT'
          ? '/api/student/details'
          : `/api/teacher/students/${studentId}/details`;
        const url = `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!response.ok)
          throw new Error(`Failed to fetch student details: ${response.statusText}`);

        const payload: StudentDetailsResponse = await response.json();

        if (!payload.success)
          throw new Error(payload.data ? 'Failed to fetch student details' : 'Invalid response format');

        setStudentData(payload.data.student);

        // Calculate average attendance from all subjects
        if (payload.data.attendanceBySubject && payload.data.attendanceBySubject.length > 0) {
          const avgAttendance =
            payload.data.attendanceBySubject.reduce((sum, item) => sum + item.attendancePercentage, 0) /
            payload.data.attendanceBySubject.length;
          setAttendance(Math.round(avgAttendance));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch student details';
        setError(message);
        console.error('Error fetching student details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (role === 'STUDENT' || studentId)
      void fetchStudentDetails();
  }, [role, studentId, semester]);

  if (isLoading)
    return (
      <div className='relative rounded-[20px] border border-black/30 bg-white p-9 shadow-[1px_1px_3px_rgba(0,0,0,0.25),-1px_-1px_3px_rgba(0,0,0,0.25)] animate-pulse'>
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
    );

  if (error || !studentData)
    return (
      <div className='relative rounded-[20px] border border-black/30 bg-white p-9 shadow-[1px_1px_3px_rgba(0,0,0,0.25),-1px_-1px_3px_rgba(0,0,0,0.25)]'>
        <div className='py-12 text-center text-red-600'>{error || 'Failed to load student details'}</div>
      </div>
    );

  const initials = studentData.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className='relative rounded-[20px] border  bg-white p-9 border-gray-300'>
      {/* Student Avatar and Info */}
      <div className='mb-9 flex items-start gap-10'>
        {/* Avatar */}
        <div className='flex h-[150px] w-[117px] items-center justify-center rounded-[20px] bg-gradient-to-r from-[#0065C4] to-[#00BEE9] text-[32px] font-bold text-white'>
          {initials}
        </div>

        {/* Student Info */}
        <div className='flex-1'>
          <h2 className='mb-2 text-2xl font-bold text-black'>
            {studentData.name}
          </h2>
          <p className='mb-4 text-base text-black/70'>
            {studentData.regNo}
          </p>
          <div className='inline-block rounded-[25px] border-[1.5px] border-[#995200] bg-[rgba(217,102,20,0.44)] px-[10px] py-[5px] text-base font-bold text-[#995200]'>
            {studentData.overallRiskLevel}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className='flex gap-5'>
          {/* Expected GPA */}
          <div className='w-[190px] rounded-[20px] border border-black/30 bg-white p-4 pb-12 text-center'>
            <p className='mb-2 text-[18px] font-semibold text-black/45'>
              EXPECTED GPA
            </p>
            <div className='flex items-baseline justify-center gap-2'>
              <span className='text-[32px] font-semibold text-black'>
                {studentData.expectedCgpa.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Attendance */}
          <div className='w-[190px] rounded-[20px] border border-black/30 bg-white p-4 text-center'>
            <p className='mb-2 text-[18px] font-semibold text-black/45'>
              ATTENDANCE
            </p>
            <p className='text-[32px] font-semibold text-black'>
              {attendance}%
            </p>
          </div>

          {/* Average Score */}
          <div className='w-[190px] rounded-[20px] border border-black/30 bg-white p-4 text-center'>
            <p className='mb-2 text-[18px] font-semibold text-black/45'>
              AVERAGE SCORE
            </p>
            <p className='text-[32px] font-semibold text-black'>
              {studentData.averageScore.toFixed(1)}
            </p>
          </div>

          {/* Class Rank */}
          <div className='w-[190px] rounded-[20px] border border-black/30 bg-white p-4 text-center'>
            <p className='mb-2 text-[18px] font-semibold text-black/45'>
              CLASS RANK
            </p>
            <p className='text-[32px] font-semibold text-black'>
              {studentData.classRank}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className='my-6 border-t border-black/30'></div>

      {/* Contact Info */}
      <div className='flex justify-start gap-6'>
        {/* Email */}
        <div className='flex items-center gap-2.5'>
          <Mail size={24} className='text-[#0084FF]' />
          <span className='text-sm text-black/70'>
            {studentData.email}
          </span>
        </div>

        {/* Phone */}
        <div className='flex items-center gap-2.5'>
          <Phone size={24} className='text-[#0084FF]' />
          <span className='text-sm text-black/70'>
            {studentData.phoneNumber}
          </span>
        </div>

        {/* Location */}
        <div className='flex items-center gap-2.5'>
          <MapPin size={24} className='text-[#0084FF]' />
          <span className='text-sm text-black/70'>
            {studentData.address}
          </span>
        </div>
      </div>
    </div>
  );
}
