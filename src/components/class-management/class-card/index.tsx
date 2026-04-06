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
  semester: string;
  section: string;
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
  // Display only first 5 students in the mini view
  const displayedStudents = classItem.students.slice(0, 5);
  const totalStudents = Number.isFinite(classItem.totalStudents)
    ? classItem.totalStudents ?? classItem.students.length
    : classItem.students.length;
  const remainingStudents = Math.max(totalStudents - displayedStudents.length, 0);

  return (
    <Card className='overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col rounded-[10px]'
      style={{ 
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(0, 0, 0, 0.18)'
      }}
      onClick={onView}>
      {/* Header */}
      <div className='px-4 py-4 flex justify-between items-start' style={{ backgroundColor: '#FFFFFF' }}>
        <div>
          <h3 className='font-semibold text-[20px] leading-[30px]' style={{ color: '#000000' }}>{classItem.name}</h3>
        </div>
        <div className='flex gap-2'>
          <Button
            size='small'
            variant='ghost'
            className='rounded flex items-center justify-center'
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.43)',
              borderRadius: '5px'
            }}
            onClick={(e) => {
              e.stopPropagation();
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
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Trash2 className='w-5 h-5' style={{ color: '#000000' }} />
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
      <div className='flex-1 overflow-hidden px-3 pb-3' style={{ backgroundColor: '#FFFFFF' }}>
        <div className='text-xs overflow-x-auto'>
          {/* Table Header */}
          <table className='w-full' style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ 
                borderBottom: '1px solid rgba(0, 0, 0, 0.5)',
                height: '18px'
              }}>
                <th className='text-left px-1 py-1 text-[10px] font-normal' style={{ color: '#000000' }}>#</th>
                <th className='text-left px-1 py-1 text-[10px] font-normal' style={{ color: '#000000' }}>Reg-No</th>
                <th className='text-left px-1 py-1 text-[10px] font-normal' style={{ color: '#000000' }}>Name</th>
                <th className='text-center px-0.5 py-1 text-[10px] font-normal' style={{ color: '#000000' }}>Q1</th>
                <th className='text-center px-0.5 py-1 text-[10px] font-normal' style={{ color: '#000000' }}>Q2</th>
                <th className='text-center px-0.5 py-1 text-[10px] font-normal' style={{ color: '#000000' }}>Q3</th>
                <th className='text-center px-0.5 py-1 text-[10px] font-normal' style={{ color: '#000000' }}>Q4</th>
                <th className='text-center px-0.5 py-1 text-[10px] font-normal' style={{ color: '#000000' }}>A1</th>
                <th className='text-center px-0.5 py-1 text-[10px] font-normal' style={{ color: '#000000' }}>A2</th>
                <th className='text-center px-0.5 py-1 text-[10px] font-normal' style={{ color: '#000000' }}>A3</th>
                <th className='text-center px-0.5 py-1 text-[10px] font-normal' style={{ color: '#000000' }}>A4</th>
                <th className='text-center px-0.5 py-1 text-[10px] font-normal' style={{ color: '#000000' }}>M</th>
                <th className='text-center px-0.5 py-1 text-[10px] font-normal' style={{ color: '#000000' }}>A%</th>
              </tr>
            </thead>
            <tbody>
              {displayedStudents.map((student, index) => (
                <tr key={student.id} style={{ 
                  borderBottom: '1px solid rgba(0, 0, 0, 0.17)',
                  height: '18px'
                }}>
                  <td className='text-left px-1 py-0 text-[10px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{index + 1}</td>
                  <td className='text-left px-1 py-0 text-[10px] truncate' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.regNo}</td>
                  <td className='text-left px-1 py-0 text-[10px] truncate' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.name}</td>
                  <td className='text-center px-0.5 py-0 text-[10px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.Q1}</td>
                  <td className='text-center px-0.5 py-0 text-[10px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.Q2}</td>
                  <td className='text-center px-0.5 py-0 text-[10px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.Q3}</td>
                  <td className='text-center px-0.5 py-0 text-[10px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.Q4}</td>
                  <td className='text-center px-0.5 py-0 text-[10px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.A1}</td>
                  <td className='text-center px-0.5 py-0 text-[10px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.A2}</td>
                  <td className='text-center px-0.5 py-0 text-[10px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.A3}</td>
                  <td className='text-center px-0.5 py-0 text-[10px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.A4}</td>
                  <td className='text-center px-0.5 py-0 text-[10px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.mids}</td>
                  <td className='text-center px-0.5 py-0 text-[10px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>{student.att}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {remainingStudents > 0 && (
            <div className='text-[10px] text-center mt-2 py-1' style={{ borderTop: '1px solid rgba(0, 0, 0, 0.17)', color: 'rgba(0, 0, 0, 0.5)' }}>
              +{remainingStudents} more students
            </div>
          )}
        </div>
      </div>

      {/* Footer Button */}
      <div className='px-3 py-3' style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid rgba(0, 0, 0, 0.18)' }}>
        <Button
          className='w-full text-[10px] h-8 gap-1.5 flex justify-center items-center font-normal'
          style={{ 
            backgroundColor: '#FFFFFF', 
            color: '#000000', 
            border: '1px solid rgba(0, 0, 0, 0.18)',
            borderRadius: '5px'
          }}
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
