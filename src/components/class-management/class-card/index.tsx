'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { Edit2, Trash2, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  semester: string;
  section: string;
  subject?: string;
  programName?: string;
  students: Student[];
  totalStudents?: number;
}

interface ClassCardProps {
  classItem: ClassItem;
  onView: () => void;
  onDelete: (classId: string) => void;
}

export function ClassCard({ classItem, onView, onDelete }: ClassCardProps) {
  const router = useRouter();
  const normalizedSemester = /^semester\s+/i.test(classItem.semester)
    ? classItem.semester
    : classItem.semester
      ? `Semester ${classItem.semester}`
      : 'Semester N/A';
  const titleText = `${classItem.programCode || classItem.name || 'N/A'}-${normalizedSemester}-${classItem.section || 'N/A'}`;
  // Display only first 5 students in the mini view
  const displayedStudents = classItem.students.slice(0, 5);
  const totalStudents = Number.isFinite(classItem.totalStudents)
    ? classItem.totalStudents ?? classItem.students.length
    : classItem.students.length;
  const remainingStudents = Math.max(totalStudents - displayedStudents.length, 0);

  return (
    <Card
      className='glass-card glass-card-hover h-full cursor-pointer overflow-hidden flex flex-col'
      onClick={onView}
    >
      {/* Header */}
      <div className='flex items-start justify-between px-4 py-4'>
        <div>
          <h3 className='text-[20px] font-bold leading-[30px] text-fg-default'>{titleText}</h3>
          <div className='mt-1 space-y-0.5 text-[12px] leading-[18px] text-fg-text'>
            {classItem.subject && <p className='font-semibold'>{classItem.subject}</p>}
          </div>
        </div>
        <div className='flex gap-2'>
          <Button
            size='small'
            variant='ghost'
            color='primary'
            className='flex items-center justify-center rounded-[5px] bg-white/[0.05] hover:bg-white/[0.08]'
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/class-management/edit/${classItem.id}`);
            }}
          >
            <Edit2 className='h-[19px] w-[19px] text-[#7FD0FF] stroke-2' />
          </Button>
          <ConfirmationDialog
            trigger={(
              <Button
                size='small'
                color='gray'
                variant='ghost'
                className='flex items-center justify-center rounded-[5px] bg-white/[0.05] hover:bg-white/[0.08]'
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Trash2 className='h-5 w-5 text-[#FF8A8F]' />
              </Button>
            )}
            title='Delete class?'
            description={`Delete "${classItem.name}" and all its students permanently? This cannot be undone.`}
            actionText='Delete'
            cancelText='Cancel'
            onConfirm={() => onDelete(classItem.id)}
          />
        </div>
      </div>

      {/* Mini Table */}
      <div className='flex-1 overflow-hidden px-3 pb-3'>
        <div className='text-xs overflow-x-auto'>
          {/* Table Header */}
          <table className='w-full border-collapse'>
            <thead>
              <tr className='h-[18px] border-b border-white/10'>
                <th className='px-1 py-1 text-left text-[10px] font-normal text-fg-text'>#</th>
                <th className='px-1 py-1 text-left text-[10px] font-normal text-fg-text'>Reg-No</th>
                <th className='px-1 py-1 text-left text-[10px] font-normal text-fg-text'>Name</th>
                <th className='px-0.5 py-1 text-center text-[10px] font-normal text-fg-text'>Q1</th>
                <th className='px-0.5 py-1 text-center text-[10px] font-normal text-fg-text'>Q2</th>
                <th className='px-0.5 py-1 text-center text-[10px] font-normal text-fg-text'>Q3</th>
                <th className='px-0.5 py-1 text-center text-[10px] font-normal text-fg-text'>Q4</th>
                <th className='px-0.5 py-1 text-center text-[10px] font-normal text-fg-text'>A1</th>
                <th className='px-0.5 py-1 text-center text-[10px] font-normal text-fg-text'>A2</th>
                <th className='px-0.5 py-1 text-center text-[10px] font-normal text-fg-text'>A3</th>
                <th className='px-0.5 py-1 text-center text-[10px] font-normal text-fg-text'>A4</th>
                <th className='px-0.5 py-1 text-center text-[10px] font-normal text-fg-text'>M</th>
                <th className='px-0.5 py-1 text-center text-[10px] font-normal text-fg-text'>A%</th>
              </tr>
            </thead>
            <tbody>
              {displayedStudents.map((student, index) => (
                <tr key={student.id} className='h-[18px] border-b border-white/5'>
                  <td className='px-1 py-0 text-left text-[10px] text-fg-text'>{index + 1}</td>
                  <td className='px-1 py-0 text-left text-[10px] text-fg-text truncate'>{student.regNo}</td>
                  <td className='px-1 py-0 text-left text-[10px] text-fg-text truncate'>{student.name}</td>
                  <td className='px-0.5 py-0 text-center text-[10px] text-fg-text'>{student.Q1}</td>
                  <td className='px-0.5 py-0 text-center text-[10px] text-fg-text'>{student.Q2}</td>
                  <td className='px-0.5 py-0 text-center text-[10px] text-fg-text'>{student.Q3}</td>
                  <td className='px-0.5 py-0 text-center text-[10px] text-fg-text'>{student.Q4}</td>
                  <td className='px-0.5 py-0 text-center text-[10px] text-fg-text'>{student.A1}</td>
                  <td className='px-0.5 py-0 text-center text-[10px] text-fg-text'>{student.A2}</td>
                  <td className='px-0.5 py-0 text-center text-[10px] text-fg-text'>{student.A3}</td>
                  <td className='px-0.5 py-0 text-center text-[10px] text-fg-text'>{student.A4}</td>
                  <td className='px-0.5 py-0 text-center text-[10px] text-fg-text'>{student.mids}</td>
                  <td className='px-0.5 py-0 text-center text-[10px] text-fg-text'>{student.att}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {remainingStudents > 0 && (
            <div className='mt-2 border-t border-white/5 py-1 text-center text-[10px] text-fg-text'>
              +{remainingStudents} more students
            </div>
          )}
        </div>
      </div>

      {/* Footer Button */}
      <div className='border-t border-white/10 px-3 py-3'>
        <Button
        color='primary'
        size='medium'
        variant='outline'
          className='w-full text-[10px] h-8 gap-1.5 flex justify-center items-center font-normal'
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Send className='w-3 h-3' />
          Send to Predictor
        </Button>
      </div>
    </Card>
  );
}
