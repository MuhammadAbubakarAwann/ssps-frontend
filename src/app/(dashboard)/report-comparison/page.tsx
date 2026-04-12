'use client';

import Link from 'next/link';
import { ContentLayout } from '@/components/sections/content-layout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import {
  PredictionHistoryTimeline,
  type PredictionHistory
} from '@/components/report-comparison/prediction-history-timeline';
import { ComparisonPanels, ComparisonPanelData } from '@/components/report-comparison/comparison-panels';
import { PerformanceChange } from '@/components/report-comparison/performance-change';
import { StudentSelectionModal } from '@/components/report-comparison/student-selection-modal';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface Student {
  id: string;
  apiStudentId?: string;
  name: string;
  regNo: string;
}

interface PredictionComparisonApiResponse {
  success?: boolean;
  message?: string;
  data?: {
    prediction?: {
      id?: string;
      reportCode?: string;
      title?: string;
      scope?: string;
      date?: string;
    };
    class?: {
      id?: string;
      name?: string;
      subject?: string;
    };
    student?: {
      id?: string;
      name?: string;
      regNo?: string;
    };
    details?: {
      predictedScore?: number | string;
      passProbability?: number | string;
      confidence?: number | string;
      riskLevel?: string;
      subject?: string;
      subjectPerformance?: string;
      subjects?: Array<{
        name?: string;
        score?: number | string;
        predictedScore?: number | string;
      }>;
      subjectScores?: Array<{
        name?: string;
        score?: number | string;
      }>;
      subjectPerformanceDetails?: Array<{
        name?: string;
        score?: number | string;
      }>;
    };
  };
}

export default function ReportComparisonPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedFirstHistory, setSelectedFirstHistory] = useState<PredictionHistory | null>(null);
  const [selectedSecondHistory, setSelectedSecondHistory] = useState<PredictionHistory | null>(null);
  const [comparisonLeft, setComparisonLeft] = useState<ComparisonPanelData | null>(null);
  const [comparisonRight, setComparisonRight] = useState<ComparisonPanelData | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [classesLoading, setClassesLoading] = useState(false);

  const mapComparisonData = (payload: PredictionComparisonApiResponse): ComparisonPanelData => {
    const predictedScore = Number(payload.data?.details?.predictedScore ?? 0);
    const passProbability = Number(payload.data?.details?.passProbability ?? 0);
    const confidence = Number(payload.data?.details?.confidence ?? 0);
    const rawSubjectScores =
      payload.data?.details?.subjects ||
      payload.data?.details?.subjectScores ||
      payload.data?.details?.subjectPerformanceDetails ||
      [];

    const subjectScores = rawSubjectScores.reduce<Array<{ name: string; score: number }>>((acc, item: any) => {
      const name = String(item.name || '').trim();
      const score = Number(item.score ?? item.predictedScore ?? NaN);

      if (!name || !Number.isFinite(score))
        return acc;

      acc.push({ name, score });
      return acc;
    }, []);

    return {
      title: String(payload.data?.prediction?.title || payload.data?.prediction?.reportCode || 'Prediction'),
      date: String(payload.data?.prediction?.date || new Date().toISOString()),
      predictedScore: Number.isFinite(predictedScore) ? predictedScore : 0,
      passProbability: Number.isFinite(passProbability) ? passProbability : 0,
      confidence: Number.isFinite(confidence) ? confidence : 0,
      riskLevel: String(payload.data?.details?.riskLevel || 'LOW'),
      subject: payload.data?.class?.subject ?? null,
      subjectPerformance: String(
        payload.data?.details?.subject ||
        payload.data?.details?.subjectPerformance ||
        payload.data?.class?.subject ||
        'N/A'
      ),
      subjectScores
    };
  };

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) 
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      setClassesLoading(true);
      try {
        const response = await fetch('/api/teacher/classes/names', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const payload = await response.json();
        
        if (!response.ok || !payload.success) 
          throw new Error(payload.message || 'Failed to fetch classes');
        

        const classList = (payload.data?.classes || []).map((cls: any) => ({
          id: String(cls.id),
          name: cls.name
        }));
        setClasses(classList);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      } finally {
        setClassesLoading(false);
      }
    };

    if (!isLoading) 
      void fetchClasses();
    
  }, [isLoading]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    setSelectedStudent(null);
    setSelectedFirstHistory(null);
    setSelectedSecondHistory(null);
  };

  const handleStudentSelected = (student: Student) => {
    setSelectedStudent(student);
    // Reset prediction histories when student is changed to go back to step 3
    setSelectedFirstHistory(null);
    setSelectedSecondHistory(null);
  };

  const handleHistoriesSelected = (first: PredictionHistory, second?: PredictionHistory) => {
    setSelectedFirstHistory(first);
    setSelectedSecondHistory(second || null);
  };

  useEffect(() => {
    const studentId = selectedStudent?.apiStudentId;

    if (!studentId || !selectedFirstHistory || !selectedSecondHistory) {
      setComparisonLeft(null);
      setComparisonRight(null);
      setComparisonLoading(false);
      setComparisonError(null);
      return;
    }

    const firstPredictionId = selectedFirstHistory.predictionId;
    const secondPredictionId = selectedSecondHistory.predictionId;

    if (!firstPredictionId || !secondPredictionId) {
      setComparisonLeft(null);
      setComparisonRight(null);
      setComparisonError('Missing prediction id for one or both selected predictions.');
      return;
    }

    const firstTime = new Date(selectedFirstHistory.date).getTime();
    const secondTime = new Date(selectedSecondHistory.date).getTime();
    const latestHistory = secondTime >= firstTime ? selectedSecondHistory : selectedFirstHistory;
    const olderHistory = latestHistory === selectedSecondHistory ? selectedFirstHistory : selectedSecondHistory;

    const fetchComparisonData = async (predictionId: string) => {
      const response = await fetch(`/api/teacher/predictions/${predictionId}/students/${studentId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const raw = await response.text();
      let payload: PredictionComparisonApiResponse | null = null;

      try {
        payload = raw ? JSON.parse(raw) : null;
      } catch {
        throw new Error('Invalid response format from prediction comparison API');
      }

      if (!payload)
        throw new Error('Empty response from prediction comparison API');

      if (!response.ok || !payload.success)
        throw new Error(payload.message || 'Failed to fetch comparison data');

      return mapComparisonData(payload);
    };

    let cancelled = false;
    setComparisonLoading(true);
    setComparisonError(null);

    Promise.all([
      fetchComparisonData(latestHistory.predictionId || ''),
      fetchComparisonData(olderHistory.predictionId || '')
    ])
      .then(([left, right]) => {
        if (cancelled)
          return;

        setComparisonLeft(left);
        setComparisonRight(right);
      })
      .catch((error) => {
        if (cancelled)
          return;

        setComparisonLeft(null);
        setComparisonRight(null);
        setComparisonError(error instanceof Error ? error.message : 'Failed to fetch comparison data');
      })
      .finally(() => {
        if (!cancelled)
          setComparisonLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedStudent?.apiStudentId, selectedFirstHistory, selectedSecondHistory]);

  if (isLoading) 
    return (
      <ContentLayout userInfo={user} title='Report Comparison'>
        <div className='mt-8 space-y-6 animate-pulse'>
          <div className='h-8 w-2/3 rounded-full bg-gray-200' />
          <div className='h-10 w-72 rounded-md bg-gray-200' />
          <div className='rounded-xl border border-gray-200 bg-white p-5 space-y-4'>
            {[0, 1, 2].map((index) => (
              <div key={index} className='h-16 rounded-md bg-gray-100' />
            ))}
          </div>
        </div>
      </ContentLayout>
    );
  

  return (
    <ContentLayout userInfo={user} title='Report Comparison'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/' className='text-black'>
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className='text-black'>Prediction Comparison</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className=''>
        {/* Page Title */}
        <h1 className='mb-4 text-2xl font-semibold text-black'>
          Compare student predictions over time
        </h1>

        {/* Step 1: Class Selection */}
        <div className='mb-4'>
          <label className='mb-2 block font-medium text-black'>
            Step 1: Select Class
          </label>
          {classesLoading ? (
            <div className='h-11 w-[300px] animate-pulse rounded-[7px] border border-gray-200 bg-gray-100' />
          ) : (
            <select
              value={selectedClassId}
              onChange={handleClassChange}
              className={`min-w-[300px] cursor-pointer rounded-[7px] border border-black/40 bg-white p-2.5 text-base ${selectedClassId ? 'text-black' : 'text-black/50'}`}
            >
              <option value=''>Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Step 2: Student Selection Button */}
        {selectedClassId && (
          <div className='mb-4'>
            <label className='mb-2 block font-medium text-black'>
              Step 2: Select Student
            </label>
            <Button
              color='primary'
              size='medium'
              variant='solid'
              onClick={() => setIsStudentModalOpen(true)}
              className='w-[300px]'
            >
              {selectedStudent ? `${selectedStudent.name} (${selectedStudent.regNo})` : 'Choose Student'}
            </Button>
          </div>
        )}

        {/* Step 3: Prediction History Timeline */}
        {selectedStudent?.apiStudentId && (
          <div className='mb-4'>
            <label className='mb-2 block font-medium text-black'>
              Step 3: Select Predictions to Compare
            </label>
            <PredictionHistoryTimeline
              studentId={selectedStudent.apiStudentId}
              onSelectHistories={handleHistoriesSelected}
            />
          </div>
        )}

        {/* Step 4: Comparison Panels (when first prediction is selected) */}
        {selectedFirstHistory && selectedSecondHistory && (
          <div className='mb-4 mt-4'>
            {comparisonLoading && (
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 animate-pulse'>
                {[0, 1].map((index) => (
                  <div key={index} className='rounded-xl border border-gray-200 bg-white p-5 space-y-3'>
                    <div className='h-5 w-40 rounded-full bg-gray-200' />
                    <div className='h-4 w-28 rounded-full bg-gray-200' />
                    <div className='h-24 rounded-md bg-gray-100' />
                  </div>
                ))}
              </div>
            )}
            {comparisonError && <div className='text-[#d32f2f]'>{comparisonError}</div>}
            {!comparisonLoading && !comparisonError && comparisonLeft && comparisonRight && (
              <ComparisonPanels leftPanel={comparisonLeft} rightPanel={comparisonRight} />
            )}
          </div>
        )}

        {/* Step 5: Performance Change (when second prediction is selected) */}
        {selectedFirstHistory && selectedSecondHistory && (
          <div className='mt-4'>
            {!comparisonLoading && !comparisonError && comparisonLeft && comparisonRight && (
              <PerformanceChange latestPanel={comparisonLeft} olderPanel={comparisonRight} />
            )}
          </div>
        )}
      </div>

      {/* Student Selection Modal */}
      <StudentSelectionModal
        isOpen={isStudentModalOpen}
        classId={selectedClassId}
        onStudentSelected={handleStudentSelected}
        onClose={() => setIsStudentModalOpen(false)}
      />
    </ContentLayout>
  );
}
