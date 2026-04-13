'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Edit2, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';

interface Student {
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
}

interface ClassItem {
  id: string;
  name: string;
  programCode?: string;
  programName?: string;
  subject?: string;
  courseCode?: string;
  courseName?: string;
  code?: string;
  semester: string;
  section: string;
  students: Student[];
  totalStudents?: number;
}

interface ClassDetailModalProps {
  classItem: ClassItem;
  onClose: () => void;
  onDelete: (classId: string) => void;
}

export function ClassDetailModal({ classItem, onClose, onDelete }: ClassDetailModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [classDetails, setClassDetails] = useState<ClassItem>(classItem);

  const displayClass = useMemo(() => classDetails || classItem, [classDetails, classItem]);
  const normalizedSemester = /^semester\s+/i.test(displayClass.semester)
    ? displayClass.semester
    : displayClass.semester
      ? `Semester ${displayClass.semester}`
      : 'Semester N/A';
  const displayTitle = `${displayClass.programCode || displayClass.name || 'N/A'}-${normalizedSemester}-${displayClass.section || 'N/A'}`;
  const displaySubject = displayClass.subject
    || [displayClass.courseCode, displayClass.courseName].filter(Boolean).join(' ')
    || '';

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await fetch(`/api/teacher/classes/${classItem.id}`, {
          method: 'GET',
          credentials: 'include'
        });

        const payload: Record<string, unknown> = await response.json();

        if (!response.ok)
          throw new Error(String(payload?.message || 'Failed to load class details'));

        const responseData = payload.data && typeof payload.data === 'object'
          ? (payload.data as Record<string, unknown>)
          : payload;

        const classData = responseData.class && typeof responseData.class === 'object'
          ? (responseData.class as Record<string, unknown>)
          : responseData;

        const students = Array.isArray(responseData.students)
          ? responseData.students
          : Array.isArray(classData.students)
            ? classData.students
            : Array.isArray(classData.topStudents)
              ? classData.topStudents
              : [];

        setClassDetails({
          id: String(classData.id ?? classItem.id),
          name: String(classData.name || classItem.name || 'Unnamed Class'),
          programCode: String(classData.programCode || classItem.programCode || classData.name || ''),
          programName: String(classData.programName || classItem.programName || ''),
          subject: String(classData.subject || classItem.subject || ''),
          courseCode: String(classData.courseCode || ''),
          courseName: String(classData.courseName || ''),
          code: typeof classData.code === 'string' ? classData.code : classItem.code,
          semester: String(classData.semester || classItem.semester || ''),
          section: String(classData.section || classItem.section || ''),
          totalStudents: Number(classData.totalStudents ?? students.length) || students.length,
          students: students
            .filter((student): student is Record<string, unknown> => typeof student === 'object' && student !== null)
            .map((student, index) => ({
              id: Number(student.id) || index + 1,
              regNo: String(student.regNo || student.registrationNo || '-'),
              name: String(student.name || '-'),
              Q1: Number(student.quiz1 ?? student.Q1) || 0,
              Q2: Number(student.quiz2 ?? student.Q2) || 0,
              Q3: Number(student.quiz3 ?? student.Q3) || 0,
              Q4: Number(student.quiz4 ?? student.Q4) || 0,
              Q5: Number(student.quiz5 ?? student.Q5) || 0,
              A1: Number(student.assignment1 ?? student.A1) || 0,
              A2: Number(student.assignment2 ?? student.A2) || 0,
              A3: Number(student.assignment3 ?? student.A3) || 0,
              A4: Number(student.assignment4 ?? student.A4) || 0,
              mids: Number(student.midsPercentage ?? student.mids) || 0,
              att: typeof student.attendancePercentage === 'string'
                ? student.attendancePercentage
                : `${Number(student.attendancePercentage ?? student.att ?? 0) || 0}%`
            }))
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load class details';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDetails();
  }, [classItem]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
      <div
        className='overflow-hidden max-w-6xl w-full min-h-[620px] max-h-[90vh] flex flex-col shadow-2xl rounded-[10px]'
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(0, 0, 0, 0.18)'
        }}
      >
        {/* Header */}
        <div
          className='flex justify-between items-start px-4 py-4'
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div>
            <h2
              className='font-bold text-[24px] leading-[32px]'
              style={{ color: '#000000' }}
            >
              {displayTitle}
            </h2>
            <div className='text-[12px] mt-1 space-y-0.5' style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
              {displaySubject && <p className='font-semibold'>{displaySubject}</p>}
              <p>{(displayClass.totalStudents ?? displayClass.students.length) || 0} students enrolled</p>
            </div>
          </div>
          <div className='flex gap-2 items-center'>
            <Button
              size='small'
              color='gray'
              variant='ghost'
              className='rounded flex items-center justify-center'
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.33)',
                borderRadius: '5px'
              }}
              onClick={() => {
                onClose();
                router.push(`/class-management/edit/${classItem.id}`);
              }}
            >
              <Edit2 className='w-[19px] h-[19px]' style={{ color: '#000000', strokeWidth: '2px' }} />
            </Button>
            <ConfirmationDialog
              trigger={(
                <Button
                  size='small'
                  color='gray'
                  variant='ghost'
                  className='rounded flex items-center justify-center'
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.33)',
                    borderRadius: '5px'
                  }}
                >
                  <Trash2 className='w-5 h-5' style={{ color: '#000000' }} />
                </Button>
              )}
              title='Delete class?'
              description={`Delete "${displayClass.name}" and all its students permanently? This cannot be undone.`}
              actionText='Delete'
              cancelText='Cancel'
              onConfirm={() => onDelete(classItem.id)}
            />
            <Button
              size='small'
              color='gray'
              variant='ghost'
              className='w-10 h-10 p-0'
              onClick={onClose}
            >
              <X className='w-5 h-5' />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto px-3 pb-3' style={{ backgroundColor: '#FFFFFF' }}>
          {isLoading ? (
            <div className='animate-pulse space-y-3 py-3'>
              <div className='h-6 w-52 rounded-full bg-gray-200' />
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div key={index} className='h-7 rounded-md bg-gray-100' />
              ))}
            </div>
          ) : errorMessage ? (
            <div className='py-10 text-center text-red-500'>{errorMessage}</div>
          ) : (
          <div className='text-sm'>
            <table className='w-full' style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.5)' }}>
                  <th className='text-left px-2 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>#</th>
                  <th className='text-left px-2 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>Reg-No</th>
                  <th className='text-left px-2 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>Name</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>Q1</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>Q2</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>Q3</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>Q4</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>Q5</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>A1</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>A2</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>A3</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>A4</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>Mids</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>Att</th>
                </tr>
              </thead>
              <tbody>
                {displayClass.students.map((student, index) => (
                  <tr key={student.id} style={{
                    borderBottom: '1px solid rgba(0, 0, 0, 0.17)',
                    height: '22px'
                  }}>
                    <td className='text-left px-2 py-1 text-[14px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{index + 1}</td>
                    <td className='text-left px-2 py-1 text-[14px] truncate' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.regNo}</td>
                    <td className='text-left px-2 py-1 text-[14px] truncate' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.name}</td>
                    <td className='text-center px-1 py-1 text-[14px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.Q1}</td>
                    <td className='text-center px-1 py-1 text-[14px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.Q2}</td>
                    <td className='text-center px-1 py-1 text-[14px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.Q3}</td>
                    <td className='text-center px-1 py-1 text-[14px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.Q4}</td>
                    <td className='text-center px-1 py-1 text-[14px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.Q5}</td>
                    <td className='text-center px-1 py-1 text-[14px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.A1}</td>
                    <td className='text-center px-1 py-1 text-[14px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.A2}</td>
                    <td className='text-center px-1 py-1 text-[14px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.A3}</td>
                    <td className='text-center px-1 py-1 text-[14px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.A4}</td>
                    <td className='text-center px-1 py-1 text-[14px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.mids}</td>
                    <td className='text-center px-1 py-1 text-[14px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.att}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Footer */}
        <div className='px-3 py-3 flex justify-between' style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid rgba(0, 0, 0, 0.18)' }}>
          <Button
            color='gray'
            size='small'
            variant='outline'
            className='w-full max-w-[120px] text-[12px] h-9 font-normal'
            style={{
              backgroundColor: '#FFFFFF',
              color: '#000000',
              border: '1px solid rgba(0, 0, 0, 0.18)',
              borderRadius: '5px'
            }}
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            color='gray'
            size='small'
            variant='outline'
            className='w-full max-w-[180px] text-[12px] h-9 gap-1.5 flex justify-center items-center font-normal'
            style={{
              backgroundColor: '#FFFFFF',
              color: '#000000',
              border: '1px solid rgba(0, 0, 0, 0.18)',
              borderRadius: '5px'
            }}
          >
            <Send className='w-3.5 h-3.5' />
            Send to Predictor
          </Button>
        </div>
      </div>
    </div>
  );
}
