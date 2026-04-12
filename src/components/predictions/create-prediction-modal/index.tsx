'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { FaPeopleLine } from 'react-icons/fa6';
import { BsPersonCheckFill } from 'react-icons/bs';
import { showToast } from '@/components/ui/toaster';

interface Student {
  id: string;
  apiStudentId?: number;
  name: string;
  regNo: string;
  hasPrediction: boolean;
  selected?: boolean;
}

interface PredictionClass {
  id: string;
  name: string;
}

interface ClassesApiResponse {
  success?: boolean;
  message?: string;
  data?: {
    classes?: Array<{
      id: number | string;
      name: string;
    }>;
  };
}

interface ClassStudentsApiResponse {
  success?: boolean;
  message?: string;
  data?: {
    students?: Array<{
      id: number | string;
      studentId?: number | string;
      userId?: number | string;
      name: string;
      regNo: string;
      hasPredictionHistory: boolean;
    }>;
  };
}

interface PredictionEntryPayload {
  studentId?: number;
  name: string;
  regNo: string;
  predictedScore: number;
  performance: 'LOW' | 'AVG' | 'HIGH';
  passProbability: number;
  modelConfidence: number;
  riskLevel: 'LOW' | 'MID' | 'HIGH';
  suggestions: string[] | string;
}

interface PredictionSaveResponse {
  success?: boolean;
  message?: string;
  data?: {
    count?: number;
    prediction?: {
      id?: number;
      name?: string;
      title?: string;
      date?: string;
      createdAt?: string;
      status?: string;
      studentsAnalyzed?: number;
      avgScore?: number;
      class?: {
        id?: number | string;
        name?: string;
      };
    };
  };
}

export interface SavedPredictionSummary {
  id: number;
  scope: 'CLASS' | 'SELECTED';
  classId: string;
  className: string;
  date: string;
  status: string;
  studentsAnalyzed: number;
  avgScore: string;
}

const DUMMY_PREDICTION_TEMPLATES = [
  {
    predictedScore: 72.4,
    performance: 'AVG' as const,
    passProbability: 0.86,
    modelConfidence: 0.88,
    riskLevel: 'LOW' as const,
    suggestions: ['Improve quiz practice', 'Maintain attendance above 80%']
  },
  {
    predictedScore: 61.2,
    performance: 'LOW' as const,
    passProbability: 0.54,
    modelConfidence: 0.82,
    riskLevel: 'HIGH' as const,
    suggestions: ['Increase assignment completion', 'Attend extra tutorial sessions']
  },
  {
    predictedScore: 84.1,
    performance: 'HIGH' as const,
    passProbability: 0.94,
    modelConfidence: 0.91,
    riskLevel: 'LOW' as const,
    suggestions: ['Keep up the strong performance', 'Take on advanced practice questions']
  },
  {
    predictedScore: 68.9,
    performance: 'AVG' as const,
    passProbability: 0.73,
    modelConfidence: 0.85,
    riskLevel: 'MID' as const,
    suggestions: ['Review weekly quizzes', 'Focus on weak topics']
  }
];

interface CreatePredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPredictionSaved?: (prediction: SavedPredictionSummary) => void;
}

export function CreatePredictionModal({ isOpen, onClose, onPredictionSaved }: CreatePredictionModalProps) {
  const [predictionType, setPredictionType] = useState<'fullClass' | 'selectedStudents'>('fullClass');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const classDropdownRef = useRef<HTMLDivElement | null>(null);
  const [classes, setClasses] = useState<PredictionClass[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGeneratingOverlay, setShowGeneratingOverlay] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (!isOpen)
      return;

    const fetchClasses = async () => {
      setIsLoadingClasses(true);
      try {
        const response = await fetch('/api/teacher/classes/names', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const payload: ClassesApiResponse = await response.json();

        if (!response.ok || !payload.success) 
          throw new Error(payload.message || 'Failed to fetch class names');
        

        const fetchedClasses = (payload.data?.classes || []).map((cls) => ({
          id: String(cls.id),
          name: cls.name
        }));

        setClasses(fetchedClasses);
      } catch (error) {
        console.error('Error loading classes:', error);
        showToast.error(error instanceof Error ? error.message : 'Failed to fetch class names');
        setClasses([]);
      } finally {
        setIsLoadingClasses(false);
      }
    };

    void fetchClasses();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !selectedClass) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const response = await fetch(`/api/teacher/classes/${selectedClass}/students/prediction-status`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const payload: ClassStudentsApiResponse = await response.json();

        if (!response.ok || !payload.success) 
          throw new Error(payload.message || 'Failed to fetch class students');
        

        const fetchedStudents: Student[] = (payload.data?.students || []).map((student, index) => {
          const rawId = student.id ?? student.studentId ?? student.userId;
          const numericStudentId = Number(rawId);

          return {
            // Keep row selection key unique even if backend IDs are missing/duplicated.
            id: rawId !== undefined && rawId !== null ? `${String(rawId)}-${index}` : `student-${index}`,
            apiStudentId: Number.isFinite(numericStudentId) ? numericStudentId : undefined,
            name: student.name,
            regNo: student.regNo,
            hasPrediction: Boolean(student.hasPredictionHistory),
            selected: false
          };
        });

        setStudents(fetchedStudents);
      } catch (error) {
        console.error('Error loading class students:', error);
        showToast.error(error instanceof Error ? error.message : 'Failed to fetch class students');
        setStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    void fetchStudents();
  }, [isOpen, selectedClass]);

  useEffect(() => {
    if (!showClassDropdown)
      return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      if (target && classDropdownRef.current && !classDropdownRef.current.contains(target))
        setShowClassDropdown(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [showClassDropdown]);

  const handleSelectStudent = (studentId: string) => {
    setStudents(students.map(s =>
      s.id === studentId ? { ...s, selected: !s.selected } : s
    ));
  };

  const allSelected = students.length > 0 && students.every((student) => student.selected);
  const someSelected = students.some((student) => student.selected);
  const selectedStudentsCount = students.filter((student) => student.selected).length;
  const canGeneratePrediction = Boolean(
    selectedClass &&
    !isSubmitting &&
    !isLoadingClasses &&
    !isLoadingStudents &&
    (predictionType === 'fullClass' ? students.length > 0 : selectedStudentsCount > 0)
  );

  const handleSelectAllStudents = (checked: boolean | 'indeterminate') => {
    const shouldSelectAll = checked === true;
    setStudents((prev) => prev.map((student) => ({ ...student, selected: shouldSelectAll })));
  };

  const handleGeneratePrediction = async () => {
    if (!selectedClass) {
      showToast.error('Please select a class first');
      return;
    }

    const className = classes.find((cls) => cls.id === selectedClass)?.name || 'Selected Class';
    const targetStudents = predictionType === 'fullClass'
      ? students
      : students.filter((student) => student.selected);

    if (targetStudents.length === 0) {
      showToast.error(predictionType === 'selectedStudents' ? 'Please select at least one student' : 'No students found for this class');
      return;
    }

    const scope = predictionType === 'fullClass' ? 'CLASS' : 'SELECTED';
    const payload: {
      scope: 'CLASS' | 'SELECTED';
      predictionName?: string;
      predictions: PredictionEntryPayload[];
    } = {
      scope,
      predictions: targetStudents.map((student, index) => {
        const template = DUMMY_PREDICTION_TEMPLATES[index % DUMMY_PREDICTION_TEMPLATES.length];

        return {
          ...(typeof student.apiStudentId === 'number' ? { studentId: student.apiStudentId } : {}),
          name: student.name,
          regNo: student.regNo,
          predictedScore: template.predictedScore,
          performance: template.performance,
          passProbability: template.passProbability,
          modelConfidence: template.modelConfidence,
          riskLevel: template.riskLevel,
          suggestions: template.suggestions
        };
      })
    };

    if (scope === 'SELECTED') 
      payload.predictionName = `${className} - Selected Students Prediction`;
    

    setIsSubmitting(true);
    setShowGeneratingOverlay(true);
    const startedAt = Date.now();

    try {
      const response = await fetch(`/api/teacher/classes/${selectedClass}/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData: PredictionSaveResponse = await response.json();

      if (!response.ok || !responseData.success) 
        throw new Error(responseData.message || 'Failed to save prediction');
      

      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, 2000 - elapsed);
      if (remaining > 0)
        await new Promise((resolve) => setTimeout(resolve, remaining));

      const savedPrediction = responseData.data?.prediction;
      const fallbackId = Date.now();
      const savedDate = savedPrediction?.date || savedPrediction?.createdAt || new Date().toISOString();
      const savedClassName = savedPrediction?.title || savedPrediction?.name || className;
      const savedStudentsAnalyzed = Number(savedPrediction?.studentsAnalyzed ?? targetStudents.length);
      const savedAvgScore = Number(savedPrediction?.avgScore ?? 0);

      showToast.success(responseData.message || 'Prediction saved successfully');
      onPredictionSaved?.({
        id: Number(savedPrediction?.id ?? fallbackId),
        scope,
        classId: String(savedPrediction?.class?.id ?? selectedClass),
        className: savedClassName,
        date: new Date(savedDate).toLocaleDateString('en-GB'),
        status: savedPrediction?.status || 'completed',
        studentsAnalyzed: Number.isFinite(savedStudentsAnalyzed) ? savedStudentsAnalyzed : targetStudents.length,
        avgScore: `${Number.isFinite(savedAvgScore) ? savedAvgScore.toFixed(1) : '0.0'}%`
      });
      onClose();
    } catch (error) {
      console.error('Error saving prediction:', error);
      showToast.error(error instanceof Error ? error.message : 'Failed to save prediction');
    } finally {
      setIsSubmitting(false);
      setShowGeneratingOverlay(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
      <div
        className='relative bg-white rounded-[15px] w-full max-w-[684px] overflow-hidden flex flex-col'
        style={{ maxHeight: 'calc(100vh - 40px)' }}
      >
        {showGeneratingOverlay && (
          <div className='absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/45'>
            <div className='h-9 w-9 animate-spin rounded-full border-4 border-white/40 border-t-white' />
            <p className='text-[16px] font-semibold text-white'>Generating prediction...</p>
          </div>
        )}

        {/* Header with Close Button */}
        <div className='px-8 pt-8 pb-6 border-b border-[rgba(0,0,0,0.3)] flex justify-between items-start'>
          <div>
            <h2 className='text-[26px] font-semibold' style={{ color: '#000000' }}>Create New Prediction</h2>
            <p className='text-[15px] mt-2' style={{ color: 'rgba(0, 0, 0, 0.47)' }}>
              Select the type of prediction you want to make and choose your class or student
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 p-1'
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className='px-8 py-8 overflow-y-auto flex-1'>
          {/* Prediction Type Selection */}
          <div className='mb-8'>
            <h3 className='text-[18px] font-semibold mb-6' style={{ color: '#000000' }}>Prediction Type</h3>
            <div className='grid grid-cols-2 gap-4'>
              {/* Full Class Option */}
              <button
                onClick={() => {
                  setPredictionType('fullClass');
                }}
                className='p-6 rounded-[10px] text-left transition-all'
                style={{
                  backgroundColor: predictionType === 'fullClass' ? 'rgba(79, 166, 248, 0.15)' : '#FFFFFF',
                  border: predictionType === 'fullClass' ? '2.5px solid #4FA6F8' : '2.5px solid rgba(0, 0, 0, 0.2)'
                }}
              >
                <div className='flex items-center gap-4 mb-3'>
                  <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                    {predictionType === 'fullClass' && (
                      <div className='w-3 h-3 rounded-full bg-black'></div>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    <FaPeopleLine size={25} style={{ color: '#4FA6F8' }} />
                    <span className='text-[18px] font-semibold' style={{ color: '#000000' }}>Full Class</span>
                  </div>
                </div>
                <p className='text-[15px]' style={{ color: 'rgba(0, 0, 0, 0.46)', marginLeft: '28px' }}>
                  Predict performance for all student in a class
                </p>
              </button>

              {/* Selected Students Option */}
              <button
                onClick={() => {
                  setPredictionType('selectedStudents');
                  setSelectedClass('');
                  setStudents([]);
                }}
                className='p-6 rounded-[10px] text-left transition-all'
                style={{
                  backgroundColor: predictionType === 'selectedStudents' ? 'rgba(79, 166, 248, 0.15)' : '#FFFFFF',
                  border: predictionType === 'selectedStudents' ? '2.5px solid #4FA6F8' : '2.5px solid rgba(0, 0, 0, 0.2)'
                }}
              >
                <div className='flex items-center gap-4 mb-3'>
                  <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                    {predictionType === 'selectedStudents' && (
                      <div className='w-3 h-3 rounded-full bg-black'></div>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    <BsPersonCheckFill size={20} style={{ color: '#8F008D' }} />
                    <span className='text-[18px] font-semibold' style={{ color: '#000000' }}>Selected Students</span>
                  </div>
                </div>
                <p className='text-[15px]' style={{ color: 'rgba(0, 0, 0, 0.46)', marginLeft: '28px' }}>
                  Choose specific students from a class
                </p>
              </button>
            </div>
          </div>

          {/* Class Selection */}
          <div className='mb-8'>
            <h3 className='text-[18px] font-semibold mb-4' style={{ color: '#000000' }}>Select Class</h3>
            <div ref={classDropdownRef} className='relative w-48'>
              <button
                onClick={() => setShowClassDropdown(!showClassDropdown)}
                className='w-full px-4 py-2.5 rounded-[10px] border border-[rgba(0,0,0,0.27)] flex items-center justify-between hover:bg-gray-50'
                style={{
                  backgroundColor: selectedClass ? '#FFFFFF' : '#FFFFFF'
                }}
              >
                <span style={{ color: selectedClass ? '#000000' : 'rgba(0, 0, 0, 0.44)', fontSize: '15px' }}>
                  {selectedClass ? classes.find((c) => c.id === selectedClass)?.name : (isLoadingClasses ? 'Loading classes...' : 'Choose a class')}
                </span>
                <ChevronDown size={18} style={{ color: 'rgba(0, 0, 0, 0.44)' }} />
              </button>

              {/* Dropdown Menu */}
              {showClassDropdown && (
                <div className='absolute top-full left-0 right-0 mt-2 bg-white border border-[rgba(0,0,0,0.2)] rounded-[10px] z-10 shadow-lg'>
                  {classes.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => {
                        setSelectedClass(cls.id);
                        setShowClassDropdown(false);
                      }}
                      className='w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-[rgba(0,0,0,0.1)] last:border-b-0'
                      style={{ color: '#000000', fontSize: '14px' }}
                    >
                      {cls.name}
                    </button>
                  ))}

                  {!isLoadingClasses && classes.length === 0 && (
                    <div className='px-4 py-3 text-[14px] text-[rgba(0,0,0,0.5)]'>
                      No classes found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Students Selection Table (for Selected Students type) */}
          {predictionType === 'selectedStudents' && selectedClass && (
            <div className=''>
              <h3 className='text-[18px] font-semibold mb-4' style={{ color: '#000000' }}>Select Students</h3>
              {isLoadingStudents ? (
                <div className='rounded-[10px] border border-[rgba(0,0,0,0.18)] px-4 py-6'>
                  <div className='animate-pulse space-y-3'>
                    {[0, 1, 2, 3].map((index) => (
                      <div key={index} className='h-9 rounded-md bg-gray-100' />
                    ))}
                  </div>
                </div>
              ) : students.length === 0 ? (
                <div className='rounded-[10px] border border-[rgba(0,0,0,0.18)] px-4 py-6 text-center text-[14px] text-[rgba(0,0,0,0.5)]'>
                  No students found for this class
                </div>
              ) : (
                <div className='overflow-x-auto border border-[rgba(0,0,0,0.18)] rounded-[10px]'>
                  <table className='w-full text-sm' style={{ borderCollapse: 'collapse' }}>
                    <thead style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.5)' }}>
                      <tr>
                        <th className='px-4 py-3 text-left font-normal text-[14px]' style={{ color: '#000000', width: '50px' }}>
                          <Checkbox
                            checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                            onCheckedChange={handleSelectAllStudents}
                          />
                        </th>
                        <th className='px-4 py-3 text-left font-normal text-[14px]' style={{ color: '#000000' }}>Name</th>
                        <th className='px-4 py-3 text-left font-normal text-[14px]' style={{ color: '#000000' }}>Reg-No</th>
                        <th className='px-3 py-3 text-center font-normal text-[14px]' style={{ color: '#000000', width: '36px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.17)' }}>
                          <td className='px-4 py-3'>
                            <Checkbox
                              checked={student.selected || false}
                              onCheckedChange={() => handleSelectStudent(student.id)}
                            />
                          </td>
                          <td className='px-4 py-3 text-[14px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>
                            {student.name}
                          </td>
                          <td className='px-4 py-3 text-[14px]' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>
                            {student.regNo}
                          </td>
                          <td className='px-3 py-3 text-center align-middle'>
                            <span
                              className='inline-block h-2.5 w-2.5 rounded-full'
                              style={{
                                backgroundColor: student.hasPrediction ? '#10B981' : '#EF4444'
                              }}
                              title={student.hasPrediction ? 'Prediction exists' : 'No prediction yet'}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Action Buttons */}
        <div className='px-8 py-6 border-t border-[rgba(0,0,0,0.3)] flex justify-between gap-4'>
          <Button
            onClick={onClose}
            size='medium'
            color='primary'
            variant='outline'
            className=' !rounded-[7px] '
            style={{
              backgroundColor: '#FFFFFF',
              color: '#000000',
              border: '1px solid rgba(0, 0, 0, 0.24)'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGeneratePrediction}
            disabled={!canGeneratePrediction}
            loading={isSubmitting}
            size='medium'
            color='primary'
            variant='solid'
            className='!rounded-[7px] text-[16px]  disabled:opacity-50 disabled:cursor-not-allowed'
            style={{
              backgroundColor: selectedClass ? '' : 'rgba(0, 0, 0, 0.15)'
            }}
          >
            Generate Prediction
            <span>→</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
