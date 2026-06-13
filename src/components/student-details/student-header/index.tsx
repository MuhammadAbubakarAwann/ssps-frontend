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
      expectedCgpa?: number | string;
      classRank?: number | string;
      averageScore?: number | string;
    };
    class?: {
      id?: string;
      name?: string;
      programCode?: string;
      semesterNumber?: number;
      section?: string;
      semester?: string;
    };
    metrics?: {
      riskLevel?: string;
      riskLevelAverage?: number;
      expectedGpa?: number;
      attendanceAverage?: number;
      classRankAverage?: number;
      averageScore?: number;
      enrollmentsCount?: number;
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
          : `/api/teacher/students/${studentId}/overall-metrics`;
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

        const normalizedStudent = {
          ...payload.data.student,
          overallRiskLevel:
            payload.data.metrics?.riskLevel
            || payload.data.student.overallRiskLevel
            || 'MID',
          expectedCgpa:
            payload.data.metrics?.expectedGpa
            ?? payload.data.student.expectedCgpa,
          classRank:
            payload.data.metrics?.classRankAverage
            ?? payload.data.student.classRank,
          averageScore:
            payload.data.metrics?.averageScore
            ?? payload.data.student.averageScore
        };

        setStudentData(normalizedStudent);

        if (typeof payload.data.metrics?.attendanceAverage === 'number') {
          setAttendance(Math.round(payload.data.metrics.attendanceAverage));
        } else if (payload.data.attendanceBySubject && payload.data.attendanceBySubject.length > 0) {
          // Backward compatibility for legacy details endpoint shape.
          const avgAttendance =
            payload.data.attendanceBySubject.reduce((sum, item) => sum + item.attendancePercentage, 0) /
            payload.data.attendanceBySubject.length;
          setAttendance(Math.round(avgAttendance));
        } else {
          setAttendance(0);
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
      <div className='relative rounded-[20px] glass-card p-9 animate-pulse'>
        <div className='mb-9 flex items-start gap-10'>
          <div className='h-[150px] w-[117px] rounded-[20px] bg-white/[0.06]' />

          <div className='flex-1 space-y-4'>
            <div className='h-7 w-64 rounded-full bg-white/[0.06]' />
            <div className='h-5 w-32 rounded-full bg-white/[0.06]' />
            <div className='h-8 w-28 rounded-full bg-white/[0.06]' />
          </div>

          <div className='flex gap-5'>
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className='w-[190px] rounded-[20px] glass-card p-4 text-center space-y-3'>
                <div className='h-4 w-28 mx-auto rounded-full bg-white/[0.06]' />
                <div className='h-10 w-20 mx-auto rounded-full bg-white/[0.06]' />
              </div>
            ))}
          </div>
        </div>

        <div className='my-6 border-t border-white/10'></div>

        <div className='flex justify-start gap-6'>
          {[0, 1, 2].map((index) => (
            <div key={index} className='flex items-center gap-2.5'>
              <div className='h-6 w-6 rounded-full bg-white/[0.06]' />
              <div className='h-4 w-44 rounded-full bg-white/[0.06]' />
            </div>
          ))}
        </div>
      </div>
    );

  if (error || !studentData)
    return (
      <div className='relative rounded-[20px] glass-card p-9'>
        <div className='py-12 text-center text-[#FF8A8F]'>{error || 'Failed to load student details'}</div>
      </div>
    );

  const initials = studentData.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const expectedCgpa = Number(studentData.expectedCgpa ?? 0);
  const averageScore = Number(studentData.averageScore ?? 0);
  const classRank = Number(studentData.classRank ?? 0);

  return (
    <div className='relative rounded-[20px] glass-card p-9'>
      {/* Student Avatar and Info */}
      <div className='mb-9 flex items-start gap-10'>
        {/* Avatar */}
        <div className='flex h-[150px] w-[117px] items-center justify-center rounded-[20px] bg-gradient-to-br from-glow-blue to-glow-cyan text-[32px] font-bold text-[#04050A]'>
          {initials}
        </div>

        {/* Student Info */}
        <div className='flex-1'>
          <h2 className='mb-2 text-2xl font-bold text-fg-default'>
            {studentData.name}
          </h2>
          <p className='mb-4 text-base text-fg-text'>
            {studentData.regNo}
          </p>
          <div className='inline-block rounded-[25px] border-[1.5px] border-[#FFA30C]/40 bg-[#FFD166]/15 px-[10px] py-[5px] text-base font-bold text-[#FFA30C]'>
            {studentData.overallRiskLevel}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className='flex gap-5'>
          {/* Expected GPA */}
          <div className='w-[190px] rounded-[20px] glass-card p-4 pb-12 text-center'>
            <p className='mb-2 text-[18px] font-semibold text-fg-text'>
              EXPECTED GPA
            </p>
            <div className='flex items-baseline justify-center gap-2'>
              <span className='text-[32px] font-semibold text-fg-default'>
                {Number.isFinite(expectedCgpa) ? expectedCgpa.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>

          {/* Attendance */}
          <div className='w-[190px] rounded-[20px] glass-card p-4 text-center'>
            <p className='mb-2 text-[18px] font-semibold text-fg-text'>
              ATTENDANCE
            </p>
            <p className='text-[32px] font-semibold text-fg-default'>
              {attendance}%
            </p>
          </div>

          {/* Average Score */}
          <div className='w-[190px] rounded-[20px] glass-card p-4 text-center'>
            <p className='mb-2 text-[18px] font-semibold text-fg-text'>
              AVERAGE SCORE
            </p>
            <p className='text-[32px] font-semibold text-fg-default'>
              {Number.isFinite(averageScore) ? averageScore.toFixed(1) : '0.0'}
            </p>
          </div>

          {/* Class Rank */}
          <div className='w-[190px] rounded-[20px] glass-card p-4 text-center'>
            <p className='mb-2 text-[18px] font-semibold text-fg-text'>
              CLASS RANK
            </p>
            <p className='text-[32px] font-semibold text-fg-default'>
              {Number.isFinite(classRank) ? classRank : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className='my-6 border-t border-white/10'></div>

      {/* Contact Info */}
      <div className='flex justify-start gap-6'>
        {/* Email */}
        <div className='flex items-center gap-2.5'>
          <Mail size={24} className='text-[#7FD0FF]' />
          <span className='text-sm text-fg-text'>
            {studentData.email}
          </span>
        </div>

        {/* Phone */}
        <div className='flex items-center gap-2.5'>
          <Phone size={24} className='text-[#7FD0FF]' />
          <span className='text-sm text-fg-text'>
            {studentData.phoneNumber}
          </span>
        </div>

        {/* Location */}
        <div className='flex items-center gap-2.5'>
          <MapPin size={24} className='text-[#7FD0FF]' />
          <span className='text-sm text-fg-text'>
            {studentData.address}
          </span>
        </div>
      </div>
    </div>
  );
}
