'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import styles from './style.module.css';

interface Student {
  id: string;
  apiStudentId: string;
  name: string;
  regNo: string;
}

interface ClassStudentsApiResponse {
  success?: boolean;
  message?: string;
  data?: {
    students?: Array<{
      id?: string;
      studentId?: string;
      studentIdInt?: number;
      name?: string;
      regNo?: string;
      hasPredictionHistory?: boolean;
    }>;
  };
}

interface StudentSelectionModalProps {
  isOpen: boolean;
  classId: string;
  onStudentSelected: (student: Student) => void;
  onClose: () => void;
}

export const StudentSelectionModal = ({
  isOpen,
  classId,
  onStudentSelected,
  onClose
}: StudentSelectionModalProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !classId) return;

    setSelectedStudentId(null);

    const fetchStudents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/teacher/classes/${classId}/students/prediction-status`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        );
        const payload: ClassStudentsApiResponse = await response.json();

        if (!response.ok || !payload.success) 
          throw new Error(payload.message || 'Failed to fetch students');
        

        const studentsSource = payload.data?.students || [];

        const studentsList: Student[] = studentsSource.reduce((acc: Student[], student) => {
          const normalizedId = String(student.id || student.studentId || '').trim();
          if (!normalizedId)
            return acc;

          acc.push({
            id: normalizedId,
            apiStudentId: normalizedId,
            name: student.name || '-',
            regNo: student.regNo || '-'
          });

          return acc;
        }, []);

        if (studentsSource.length > 0 && studentsList.length === 0) 
          setError('Students were returned but no valid student id was found in the response.');
        

        setStudents(studentsList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching students');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStudents();
  }, [isOpen, classId]);

  const handleStudentSelect = (studentId: string) => {
    // Allow changing selected student - only one can be selected at a time
    setSelectedStudentId(studentId);
  };

  const handleConfirm = () => {
    if (selectedStudentId) {
      const selected = students.find((s) => s.id === selectedStudentId);
      if (selected) {
        onStudentSelected(selected);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className='m-0 text-[18px] font-semibold text-black'>
            Select Student
          </h2>
          <button
            onClick={onClose}
            className='cursor-pointer border-none bg-transparent text-2xl text-black'
          >
            ✕
          </button>
        </div>

        {isLoading && (
          <div className={styles.loadingState}>
            <div className='w-full animate-pulse space-y-3'>
              <div className='h-4 w-36 rounded-full bg-gray-200' />
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className='h-10 rounded-md bg-gray-100' />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className={styles.errorState}>
            <p className='text-[#d32f2f]'>{error}</p>
          </div>
        )}

        {!isLoading && !error && students.length === 0 && (
          <div className={styles.emptyState}>
            <p>No students found for this class.</p>
          </div>
        )}

        {!isLoading && !error && students.length > 0 && (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className='w-[50px]'>
                    <input type='radio' disabled />
                  </th>
                  <th>Name</th>
                  <th>Reg-No</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className={`${styles.row} ${selectedStudentId === student.id ? styles.selectedRow : ''}`}
                    onClick={() => handleStudentSelect(student.id)}
                  >
                    <td>
                      <input
                        type='radio'
                        checked={selectedStudentId === student.id}
                        onChange={() => handleStudentSelect(student.id)}
                      />
                    </td>
                    <td>{student.name}</td>
                    <td>{student.regNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !error && students.length > 0 && (
          <div className={styles.actions}>
            <Button
              color='gray'
              size='medium'
              variant='outline'
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              color='primary'
              size='medium'
              variant='solid'
              onClick={handleConfirm}
              disabled={!selectedStudentId}
            >
              Select Student
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
