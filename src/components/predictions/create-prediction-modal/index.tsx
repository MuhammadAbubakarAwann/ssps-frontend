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
  apiStudentId?: string;
  name: string;
  regNo: string;
  hasPrediction: boolean;
  selected?: boolean;
}

interface PredictionClass {
  id: string;
  name: string;
  programCode?: string;
  semesterNumber?: number;
  section?: string;
  courseCode?: string;
  courseName?: string;
}

interface ClassesApiResponse {
  success?: boolean;
  message?: string;
  data?: {
    classes?: Array<{
      id: number | string;
      name: string;
      subject?: string;
      programCode?: string;
      semester?: string;
      semesterNumber?: number | string;
      section?: string;
      courseCode?: string;
      courseName?: string;
    }>;
  };
  classes?: Array<{
    id: number | string;
    name: string;
    subject?: string;
    programCode?: string;
    semester?: string;
    semesterNumber?: number | string;
    section?: string;
    courseCode?: string;
    courseName?: string;
  }>;
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

export interface SuggestionsObject {
  source?: string;
  aiSummary?: string;
  strengths?: string[];
  areasForImprovement?: string[];
  nextSteps?: string[];
  suggestions?: string[];
  featureBreakdown?: Record<string, number>;
  history?: Record<string, unknown>;
  recommendationSnapshot?: Record<string, unknown>;
}

interface PredictionSaveResponse {
  success?: boolean;
  message?: string;
  data?: {
    count?: number;
    entries?: Array<{
      id?: number | string;
      studentId?: number | string;
      name?: string;
      regNo?: string;
      predictedScore?: number;
      performance?: string;
      performanceCategory?: string;
      passProbability?: number;
      modelConfidence?: number;
      riskLevel?: 'LOW' | 'MID' | 'HIGH';
      expectedCgpa?: number | null;
      classRank?: number | null;
      overallRiskLevel?: string;
      semesterAvgScore?: number | null;
      suggestions?: SuggestionsObject | string[] | string;
    }>;
    prediction?: {
      id?: number | string;
      reportId?: string;
      name?: string;
      title?: string;
      scope?: 'CLASS' | 'SELECTED';
      generatedAt?: string;
      date?: string;
      createdAt?: string;
      updatedAt?: string;
      status?: string;
      studentsAnalyzed?: number;
      avgScore?: number;
      classMetadata?: {
        programCode?: string;
        semesterNumber?: number;
        section?: string;
        courseCode?: string;
        courseName?: string;
      };
      class?: {
        id?: number | string;
        name?: string;
      };
    };
    metrics?: {
      totalPredictions?: { value?: number; increasePercentage?: number };
      activeClasses?: { value?: number; increaseNumber?: number };
      averageImprovement?: { value?: number; increasePercentage?: number };
    };
  };
}

export interface SavedPredictionMetricsSnapshot {
  totalPredictions?: { value?: number; increasePercentage?: number };
  activeClasses?: { value?: number; increaseNumber?: number };
  averageImprovement?: { value?: number; increasePercentage?: number };
}

export interface SavedPredictionSummary {
  id: string;
  scope: 'CLASS' | 'SELECTED';
  classId: string;
  className: string;
  date: string;
  status: string;
  studentsAnalyzed: number;
  avgScore: string;
  reportId?: string;
  classMetadata?: {
    programCode: string;
    semesterNumber: number;
    section: string;
    courseCode: string;
    courseName: string;
  };
  preloadedResults?: Array<{
    id: string;
    name: string;
    regNo: string;
    predictedScore: number;
    passProbability: number;
    performanceCategory: string;
    modelConfidence: number;
    riskLevel: 'Low' | 'Mid' | 'High';
    expectedCgpa?: number | null;
    classRank?: number | null;
    overallRiskLevel?: string;
    semesterAvgScore?: number | null;
    suggestions: SuggestionsObject | string[];
  }>;
  metricsSnapshot?: SavedPredictionMetricsSnapshot;
}

function parseSemesterNumber(input?: string | number): number {
  const value = String(input ?? '').trim();
  if (!value) return 0;
  const matched = value.match(/\d+/);
  const parsed = Number(matched ? matched[0] : value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeRiskLevel(risk?: string): 'Low' | 'Mid' | 'High' {
  const normalized = String(risk || '').trim().toUpperCase();
  if (normalized === 'HIGH') return 'High';
  if (normalized === 'MID') return 'Mid';
  return 'Low';
}

function extractClasses(payload: ClassesApiResponse) {
  return payload.data?.classes || payload.classes || [];
}

interface CreatePredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPredictionSaved?: (prediction: SavedPredictionSummary) => void;
}

export function CreatePredictionModal({
  isOpen,
  onClose,
  onPredictionSaved
}: CreatePredictionModalProps) {
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
    if (!isOpen) return;

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

        const fetchedClasses = extractClasses(payload).map((cls) => ({
          id: String(cls.id),
          name: cls.name,
          programCode: cls.programCode ? String(cls.programCode) : undefined,
          semesterNumber: parseSemesterNumber(cls.semesterNumber ?? cls.semester),
          section: cls.section ? String(cls.section) : undefined,
          courseCode: cls.courseCode ? String(cls.courseCode) : undefined,
          courseName: cls.courseName
            ? String(cls.courseName)
            : cls.subject
              ? String(cls.subject).replace(/^\s*([A-Za-z]{2,}-\d+)\s+/, '').trim()
              : undefined
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

  // Only fetch students when the teacher needs to pick individuals
  useEffect(() => {
    if (!isOpen || !selectedClass || predictionType !== 'selectedStudents') {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const response = await fetch(
          `/api/teacher/classes/${selectedClass}/students/prediction-status`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );

        const payload: ClassStudentsApiResponse = await response.json();

        if (!response.ok || !payload.success)
          throw new Error(payload.message || 'Failed to fetch class students');

        const fetchedStudents: Student[] = (payload.data?.students || []).map((student, index) => {
          const rawId = student.id ?? student.studentId ?? student.userId;
          const normalizedStudentId = rawId !== undefined && rawId !== null ? String(rawId).trim() : '';

          return {
            id: rawId !== undefined && rawId !== null ? `${String(rawId)}-${index}` : `student-${index}`,
            apiStudentId: normalizedStudentId || undefined,
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
  }, [isOpen, selectedClass, predictionType]);

  useEffect(() => {
    if (!showClassDropdown) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && classDropdownRef.current && !classDropdownRef.current.contains(target))
        setShowClassDropdown(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => { document.removeEventListener('pointerdown', handlePointerDown); };
  }, [showClassDropdown]);

  const handleSelectStudent = (studentId: string) => {
    setStudents(students.map((s) => s.id === studentId ? { ...s, selected: !s.selected } : s));
  };

  const allSelected = students.length > 0 && students.every((s) => s.selected);
  const someSelected = students.some((s) => s.selected);
  const selectedStudentsCount = students.filter((s) => s.selected).length;

  const canGeneratePrediction = Boolean(
    selectedClass &&
    !isSubmitting &&
    !isLoadingClasses &&
    (predictionType === 'fullClass'
      ? true  // backend fetches the whole class — just need a class selected
      : selectedStudentsCount > 0 && !isLoadingStudents)
  );

  const handleSelectAllStudents = (checked: boolean | 'indeterminate') => {
    const shouldSelectAll = checked === true;
    setStudents((prev) => prev.map((s) => ({ ...s, selected: shouldSelectAll })));
  };

  const handleGeneratePrediction = async () => {
    if (!selectedClass) {
      showToast.error('Please select a class first');
      return;
    }

    const selectedClassInfo = classes.find((cls) => cls.id === selectedClass);
    const className = selectedClassInfo?.name || 'Selected Class';
    const scope = predictionType === 'fullClass' ? 'CLASS' : 'SELECTED';

    type ClassPayload = { scope: 'CLASS' };
    type SelectedPayload = { scope: 'SELECTED'; predictionName: string; studentIds: string[] };
    let payload: ClassPayload | SelectedPayload;

    if (scope === 'CLASS') {
      payload = { scope: 'CLASS' };
    } else {
      const selectedStudents = students.filter((s) => s.selected);
      if (selectedStudents.length === 0) {
        showToast.error('Please select at least one student');
        return;
      }

      const validStudentIds = selectedStudents
        .map((s) => s.apiStudentId)
        .filter((id): id is string => Boolean(id));

      if (validStudentIds.length === 0) {
        showToast.error('Selected students have no valid IDs. Please refresh and try again.');
        return;
      }

      const classPrefix = [
        selectedClassInfo?.programCode,
        selectedClassInfo?.semesterNumber ? String(selectedClassInfo.semesterNumber) : '',
        selectedClassInfo?.section
      ].filter(Boolean).join('-');

      const predictionName = [classPrefix, selectedClassInfo?.courseCode, selectedClassInfo?.courseName]
        .filter(Boolean).join(' ').trim() || className;

      payload = {
        scope: 'SELECTED',
        predictionName: `${predictionName} - Selected Students`,
        studentIds: validStudentIds
      };
    }

    setIsSubmitting(true);
    setShowGeneratingOverlay(true);
    const startedAt = Date.now();

    try {
      // Read the access token so we can attach it as a Bearer header
      const tokenRes = await fetch('/api/auth/check-token', { method: 'GET' });
      const tokenData: { status?: string; accessToken?: string } = tokenRes.ok
        ? await tokenRes.json()
        : {};
      const accessToken = tokenData.accessToken || '';

      const response = await fetch(`/api/teacher/classes/${selectedClass}/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
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
      const fallbackId = `local-${Date.now()}`;
      const savedDate =
        savedPrediction?.generatedAt ||
        savedPrediction?.date ||
        savedPrediction?.createdAt ||
        new Date().toISOString();
      const savedClassName = savedPrediction?.title || savedPrediction?.name || className;
      const savedStudentsAnalyzed = Number(
        responseData.data?.count ?? savedPrediction?.studentsAnalyzed ?? 0
      );
      const entries = responseData.data?.entries || [];
      const avgFromEntries = entries.reduce((acc, entry) => acc + Number(entry.predictedScore || 0), 0);
      const savedAvgScore = entries.length > 0 ? avgFromEntries / entries.length : Number(savedPrediction?.avgScore ?? 0);

      const effectiveClassMetadata = savedPrediction?.classMetadata
        ? {
            programCode: String(savedPrediction.classMetadata.programCode || ''),
            semesterNumber: Number(savedPrediction.classMetadata.semesterNumber || 0),
            section: String(savedPrediction.classMetadata.section || ''),
            courseCode: String(savedPrediction.classMetadata.courseCode || ''),
            courseName: String(savedPrediction.classMetadata.courseName || '')
          }
        : undefined;

      const preloadedResults = entries.map((entry, index) => ({
        id: String(entry.id ?? entry.studentId ?? index),
        name: String(entry.name || ''),
        regNo: String(entry.regNo || ''),
        predictedScore: Number(entry.predictedScore || 0),
        passProbability: Number(entry.passProbability || 0),
        performanceCategory: String(entry.performanceCategory || entry.performance || 'N/A'),
        modelConfidence: Number(entry.modelConfidence || 0),
        riskLevel: normalizeRiskLevel(entry.riskLevel),
        expectedCgpa: entry.expectedCgpa ?? null,
        classRank: entry.classRank ?? null,
        overallRiskLevel: String(entry.overallRiskLevel || entry.riskLevel || 'LOW'),
        semesterAvgScore: entry.semesterAvgScore ?? null,
        suggestions: (
          entry.suggestions !== null &&
          entry.suggestions !== undefined &&
          typeof entry.suggestions === 'object' &&
          !Array.isArray(entry.suggestions)
        )
          ? entry.suggestions
          : Array.isArray(entry.suggestions)
            ? entry.suggestions.map(String).filter(Boolean)
            : String(entry.suggestions || '').split('\n').map((s) => s.trim()).filter(Boolean)
      }));

      showToast.success(responseData.message || 'Prediction saved successfully');
      onPredictionSaved?.({
        id: String(savedPrediction?.id ?? fallbackId),
        scope: (savedPrediction?.scope || scope) as 'CLASS' | 'SELECTED',
        classId: String(savedPrediction?.class?.id ?? selectedClass),
        className: savedClassName,
        date: new Date(savedDate).toLocaleDateString('en-GB'),
        status: savedPrediction?.status || 'completed',
        studentsAnalyzed: Number.isFinite(savedStudentsAnalyzed) ? savedStudentsAnalyzed : 0,
        avgScore: `${Number.isFinite(savedAvgScore) ? savedAvgScore.toFixed(1) : '0.0'}%`,
        reportId: savedPrediction?.reportId,
        classMetadata: effectiveClassMetadata,
        preloadedResults,
        metricsSnapshot: responseData.data?.metrics
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
            <p className='text-[16px] font-semibold text-white'>
              Generating prediction...
            </p>
          </div>
        )}

        {/* Header */}
        <div className='px-8 pt-8 pb-6 border-b border-[rgba(0,0,0,0.3)] flex justify-between items-start'>
          <div>
            <h2 className='text-[26px] font-semibold' style={{ color: '#000000' }}>
              Create New Prediction
            </h2>
            <p className='text-[15px] mt-2' style={{ color: 'rgba(0, 0, 0, 0.47)' }}>
              Select the type of prediction you want to make and choose your class or student
            </p>
          </div>
          <button onClick={onClose} className='text-gray-500 hover:text-gray-700 p-1'>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className='px-8 py-8 overflow-y-auto flex-1'>
          {/* Prediction Type Selection */}
          <div className='mb-8'>
            <h3 className='text-[18px] font-semibold mb-6' style={{ color: '#000000' }}>
              Prediction Type
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <button
                onClick={() => setPredictionType('fullClass')}
                className='p-6 rounded-[10px] text-left transition-all'
                style={{
                  backgroundColor: predictionType === 'fullClass' ? 'rgba(79, 166, 248, 0.15)' : '#FFFFFF',
                  border: predictionType === 'fullClass' ? '2.5px solid #4FA6F8' : '2.5px solid rgba(0, 0, 0, 0.2)'
                }}
              >
                <div className='flex items-center gap-4 mb-3'>
                  <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                    {predictionType === 'fullClass' && <div className='w-3 h-3 rounded-full bg-black' />}
                  </div>
                  <div className='flex items-center gap-2'>
                    <FaPeopleLine size={25} style={{ color: '#4FA6F8' }} />
                    <span className='text-[18px] font-semibold' style={{ color: '#000000' }}>
                      Full Class
                    </span>
                  </div>
                </div>
                <p className='text-[15px]' style={{ color: 'rgba(0, 0, 0, 0.46)', marginLeft: '28px' }}>
                  Predict performance for all students in a class
                </p>
              </button>

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
                    {predictionType === 'selectedStudents' && <div className='w-3 h-3 rounded-full bg-black' />}
                  </div>
                  <div className='flex items-center gap-2'>
                    <BsPersonCheckFill size={20} style={{ color: '#8F008D' }} />
                    <span className='text-[18px] font-semibold' style={{ color: '#000000' }}>
                      Selected Students
                    </span>
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
            <h3 className='text-[18px] font-semibold mb-4' style={{ color: '#000000' }}>
              Select Class
            </h3>
            <div ref={classDropdownRef} className='relative w-48'>
              <button
                onClick={() => setShowClassDropdown(!showClassDropdown)}
                className='w-full px-4 py-2.5 rounded-[10px] border border-[rgba(0,0,0,0.27)] flex items-center justify-between hover:bg-gray-50 bg-white'
              >
                <span style={{ color: selectedClass ? '#000000' : 'rgba(0, 0, 0, 0.44)', fontSize: '15px' }}>
                  {selectedClass
                    ? classes.find((c) => c.id === selectedClass)?.name
                    : isLoadingClasses
                      ? 'Loading classes...'
                      : 'Choose a class'}
                </span>
                <ChevronDown size={18} style={{ color: 'rgba(0, 0, 0, 0.44)' }} />
              </button>

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
                    <div className='px-4 py-3 text-[14px] text-[rgba(0,0,0,0.5)]'>No classes found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Students Selection Table (only for Selected Students mode) */}
          {predictionType === 'selectedStudents' && selectedClass && (
            <div>
              <h3 className='text-[18px] font-semibold mb-4' style={{ color: '#000000' }}>
                Select Students
              </h3>
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
                        <th className='px-3 py-3 text-center font-normal text-[14px]' style={{ color: '#000000', width: '36px' }} />
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
                              style={{ backgroundColor: student.hasPrediction ? '#10B981' : '#EF4444' }}
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

        {/* Footer */}
        <div className='px-8 py-6 border-t border-[rgba(0,0,0,0.3)] flex justify-between gap-4'>
          <Button
            onClick={onClose}
            size='medium'
            color='primary'
            variant='outline'
            className='!rounded-[7px]'
            style={{ backgroundColor: '#FFFFFF', color: '#000000', border: '1px solid rgba(0, 0, 0, 0.24)' }}
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
            className='!rounded-[7px] text-[16px] disabled:opacity-50 disabled:cursor-not-allowed'
            style={{ backgroundColor: selectedClass ? '' : 'rgba(0, 0, 0, 0.15)' }}
          >
            Generate Prediction
            <span>→</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
