'use client';

import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/predictions/metric-card';
import { PredictionHistoryCard } from '@/components/predictions/prediction-history-card';
import { CreatePredictionModal } from '@/components/predictions/create-prediction-modal';
import type { SavedPredictionSummary } from '@/components/predictions/create-prediction-modal';
import { Plus } from 'lucide-react';
import { FiBarChart2, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { showToast } from '@/components/ui/toaster';

interface PredictionClass {
  id: string;
  name: string;
}

interface FilterStudent {
  id: string;
  name: string;
  regNo: string;
}

interface PredictionHistoryCardItem {
  id: string;
  classId: string;
  status: string;
  date: string;
  className: string;
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
    suggestions: string[];
  }>;
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
      id?: number | string;
      studentId?: number | string;
      userId?: number | string;
      name: string;
      regNo: string;
      hasPredictionHistory: boolean;
    }>;
  };
}

interface PredictionHistoryApiResponse {
  success?: boolean;
  message?: string;
  data?: {
    totalCount?: number;
    predictions?: Array<{
      id: number | string;
      reportId?: string;
      name?: string;
      title?: string;
      className?: string;
      generatedAt?: string;
      classMetadata?: {
        programCode?: string;
        semesterNumber?: number;
        section?: string;
        courseCode?: string;
        courseName?: string;
      };
      class?: {
        id: number | string;
        name: string;
      };
      date: string;
      status: string;
      studentsAnalyzed: number;
      avgScore: number;
      trend?: string;
      scope: 'CLASS' | 'SELECTED';
    }>;
  };
}

interface PredictionMetricsApiResponse {
  success?: boolean;
  message?: string;
  data?: {
    totalPredictions?: {
      value?: number;
      increasePercentage?: number;
    };
    activeClasses?: {
      value?: number;
      increaseNumber?: number;
    };
    averageImprovement?: {
      value?: number;
      increasePercentage?: number;
    };
  };
}

interface PredictionMetricsViewModel {
  totalPredictions: string;
  predictionsChange: string;
  activeClasses: string;
  classesChange: string;
  averageImprovement: string;
  improvementChange: string;
}

interface SavedPredictionMetricsSnapshot {
  totalPredictions?: {
    value?: number;
    increasePercentage?: number;
  };
  activeClasses?: {
    value?: number;
    increaseNumber?: number;
  };
  averageImprovement?: {
    value?: number;
    increasePercentage?: number;
  };
}

const DEFAULT_METRICS: PredictionMetricsViewModel = {
  totalPredictions: '0',
  predictionsChange: '+0%',
  activeClasses: '0',
  classesChange: '+0',
  averageImprovement: '0.0%',
  improvementChange: '+0%'
};

function mapMetricsSnapshotToViewModel(snapshot?: SavedPredictionMetricsSnapshot): PredictionMetricsViewModel | null {
  if (!snapshot)
    return null;

  const totalPredictionsValue = Number(snapshot.totalPredictions?.value ?? 0);
  const totalPredictionsIncrease = Number(snapshot.totalPredictions?.increasePercentage ?? 0);
  const activeClassesValue = Number(snapshot.activeClasses?.value ?? 0);
  const activeClassesIncrease = Number(snapshot.activeClasses?.increaseNumber ?? 0);
  const averageImprovementValue = Number(snapshot.averageImprovement?.value ?? 0);
  const averageImprovementIncrease = Number(snapshot.averageImprovement?.increasePercentage ?? 0);

  return {
    totalPredictions: `${Number.isFinite(totalPredictionsValue) ? totalPredictionsValue : 0}`,
    predictionsChange: `${totalPredictionsIncrease >= 0 ? '+' : ''}${Number.isFinite(totalPredictionsIncrease) ? totalPredictionsIncrease.toFixed(2) : '0.00'}%`,
    activeClasses: `${Number.isFinite(activeClassesValue) ? activeClassesValue : 0}`,
    classesChange: `${activeClassesIncrease >= 0 ? '+' : ''}${Number.isFinite(activeClassesIncrease) ? activeClassesIncrease : 0}`,
    averageImprovement: `${Number.isFinite(averageImprovementValue) ? averageImprovementValue.toFixed(2) : '0.00'}%`,
    improvementChange: `${averageImprovementIncrease >= 0 ? '+' : ''}${Number.isFinite(averageImprovementIncrease) ? averageImprovementIncrease.toFixed(2) : '0.00'}%`
  };
}

export function PredictionsMainData() {
  const [isLoading] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [classes, setClasses] = useState<PredictionClass[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [scope, setScope] = useState<'CLASS' | 'SELECTED'>('CLASS');
  const [_students, setStudents] = useState<FilterStudent[]>([]);
  const [_selectedStudentId, setSelectedStudentId] = useState('');
  const [predictionHistory, setPredictionHistory] = useState<
    PredictionHistoryCardItem[]
  >([]);
  const [totalPredictionCount, setTotalPredictionCount] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [metricsData, setMetricsData] =
    useState<PredictionMetricsViewModel>(DEFAULT_METRICS);
  const [metricsRefreshKey, setMetricsRefreshKey] = useState(0);
  const [autoOpenPredictionId, setAutoOpenPredictionId] = useState('');
  const [cardsTransitioning, setCardsTransitioning] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/teacher/classes/names', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const payload: ClassesApiResponse = await response.json();

        if (!response.ok || !payload.success)
          throw new Error(payload.message || 'Failed to fetch classes');

        const classList = (payload.data?.classes || []).map((item) => ({
          id: String(item.id),
          name: item.name
        }));

        setClasses(classList);

        if (classList.length > 0)
          setSelectedClass((prev) => prev || classList[0].id);
      } catch (error) {
        console.error('Error fetching classes:', error);
        showToast.error(
          error instanceof Error ? error.message : 'Failed to fetch classes',
        );
      }
    };

    void fetchClasses();
  }, [isLoading, metricsRefreshKey]);

  useEffect(() => {
    if (isLoading) return;

    const fetchPredictionMetrics = async () => {
      try {
        const response = await fetch('/api/teacher/predictions/metrics', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const payload: PredictionMetricsApiResponse = await response.json();

        if (!response.ok || !payload.success)
          throw new Error(
            payload.message || 'Failed to fetch prediction metrics',
          );

        const totalPredictionsValue = Number(
          payload.data?.totalPredictions?.value ?? 0,
        );
        const totalPredictionsIncrease = Number(
          payload.data?.totalPredictions?.increasePercentage ?? 0,
        );
        const activeClassesValue = Number(
          payload.data?.activeClasses?.value ?? 0,
        );
        const activeClassesIncrease = Number(
          payload.data?.activeClasses?.increaseNumber ?? 0,
        );
        const averageImprovementValue = Number(
          payload.data?.averageImprovement?.value ?? 0,
        );
        const averageImprovementIncrease = Number(
          payload.data?.averageImprovement?.increasePercentage ?? 0,
        );

        setMetricsData({
          totalPredictions: `${Number.isFinite(totalPredictionsValue) ? totalPredictionsValue : 0}`,
          predictionsChange: `${totalPredictionsIncrease >= 0 ? '+' : ''}${Number.isFinite(totalPredictionsIncrease) ? totalPredictionsIncrease.toFixed(2) : '0.00'}%`,
          activeClasses: `${Number.isFinite(activeClassesValue) ? activeClassesValue : 0}`,
          classesChange: `${activeClassesIncrease >= 0 ? '+' : ''}${Number.isFinite(activeClassesIncrease) ? activeClassesIncrease : 0}`,
          averageImprovement: `${Number.isFinite(averageImprovementValue) ? averageImprovementValue.toFixed(2) : '0.00'}%`,
          improvementChange: `${averageImprovementIncrease >= 0 ? '+' : ''}${Number.isFinite(averageImprovementIncrease) ? averageImprovementIncrease.toFixed(2) : '0.00'}%`
        });
      } catch (error) {
        console.error('Error fetching prediction metrics:', error);
        showToast.error(
          error instanceof Error
            ? error.message
            : 'Failed to fetch prediction metrics',
        );
        setMetricsData(DEFAULT_METRICS);
      }
    };

    void fetchPredictionMetrics();
  }, [isLoading]);

  useEffect(() => {
    if (isLoadingHistory)
      return;

    setCardsTransitioning(true);

    const frameId = window.requestAnimationFrame(() => {
      setCardsTransitioning(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [predictionHistory, isLoadingHistory]);

  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setSelectedStudentId('');
      return;
    }

    const fetchStudents = async () => {
      try {
        const response = await fetch(
          `/api/teacher/classes/${selectedClass}/students/prediction-status`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          },
        );

        const payload: ClassStudentsApiResponse = await response.json();

        if (!response.ok || !payload.success)
          throw new Error(payload.message || 'Failed to fetch students');

        const studentList = (payload.data?.students || []).reduce<
          FilterStudent[]
        >((acc, student) => {
          const rawId = student.id ?? student.studentId ?? student.userId;
          if (rawId === undefined || rawId === null) return acc;

          const normalizedId = String(rawId).trim();
          if (
            !normalizedId ||
            normalizedId === 'undefined' ||
            normalizedId === 'null'
          )
            return acc;

          acc.push({
            id: normalizedId,
            name: student.name,
            regNo: student.regNo
          });

          return acc;
        }, []);

        setStudents(studentList);

        if (scope === 'SELECTED')
          setSelectedStudentId((prev) =>
            prev && studentList.some((student) => student.id === prev)
              ? prev
              : studentList[0]?.id || '',
          );
      } catch (error) {
        console.error('Error fetching students:', error);
        showToast.error(
          error instanceof Error ? error.message : 'Failed to fetch students',
        );
        setStudents([]);
        setSelectedStudentId('');
      }
    };

    void fetchStudents();
  }, [selectedClass, scope]);

  useEffect(() => {
    const fetchPredictionHistory = async () => {
      setIsLoadingHistory(true);

      try {
        const query = new URLSearchParams({ scope });

        const response = await fetch(
          `/api/teacher/predictions/history?${query.toString()}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          },
        );

        const payload: PredictionHistoryApiResponse = await response.json();

        if (!response.ok || !payload.success)
          throw new Error(
            payload.message || 'Failed to fetch prediction history',
          );

        const mappedHistory = (payload.data?.predictions || []).map((item) => ({
          id: String(item.id),
          classId: String(item.class?.id ?? selectedClass),
          status: item.status || 'completed',
          date: new Date(item.generatedAt || item.date).toLocaleDateString('en-GB'),
          className:
            item.name || item.title || item.className || item.class?.name || 'Prediction',
          studentsAnalyzed: item.studentsAnalyzed,
          avgScore: `${Number(item.avgScore).toFixed(1)}%`,
          reportId: item.reportId,
          classMetadata: item.classMetadata
            ? {
              programCode: String(item.classMetadata.programCode || ''),
              semesterNumber: Number(item.classMetadata.semesterNumber || 0),
              section: String(item.classMetadata.section || ''),
              courseCode: String(item.classMetadata.courseCode || ''),
              courseName: String(item.classMetadata.courseName || '')
            }
            : undefined
        }));

        const filteredHistory = selectedClass
          ? mappedHistory.filter((item) => item.classId === selectedClass)
          : mappedHistory;

        setPredictionHistory(filteredHistory);
        setTotalPredictionCount(selectedClass ? filteredHistory.length : (payload.data?.totalCount || 0));
      } catch (error) {
        console.error('Error fetching prediction history:', error);
        showToast.error(
          error instanceof Error
            ? error.message
            : 'Failed to fetch prediction history',
        );
        setPredictionHistory([]);
        setTotalPredictionCount(0);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    void fetchPredictionHistory();
  }, [scope, selectedClass]);

  const handlePredictionSaved = (newPrediction: SavedPredictionSummary) => {
    // Update metric cards from save response when available; fallback to API refresh.
    const liveMetrics = mapMetricsSnapshotToViewModel(newPrediction.metricsSnapshot);
    if (liveMetrics)
      setMetricsData(liveMetrics);
    else
      setMetricsRefreshKey((prev) => prev + 1);

    setAutoOpenPredictionId(newPrediction.id);

    if (newPrediction.scope === 'SELECTED') {
      setScope('SELECTED');
      setPredictionHistory([newPrediction]);
      setTotalPredictionCount(1);
      return;
    }

    if (scope !== 'CLASS') return;

    const alreadyExists = predictionHistory.some(
      (item) => item.id === newPrediction.id,
    );
    setPredictionHistory((prev) => {
      const withoutDuplicate = prev.filter(
        (item) => item.id !== newPrediction.id,
      );
      return [newPrediction, ...withoutDuplicate].slice(0, 6);
    });

    if (!alreadyExists) setTotalPredictionCount((prev) => prev + 1);
  };

  if (isLoading)
    return (
      <div className='mt-4 space-y-6 animate-pulse'>
        <div className='h-8 w-2/3 rounded-full bg-gray-200' />

        <div className='grid grid-cols-3 gap-6'>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className='rounded-xl border border-gray-200 bg-white p-5 space-y-3'
            >
              <div className='h-4 w-28 rounded-full bg-gray-200' />
              <div className='h-8 w-20 rounded-full bg-gray-200' />
              <div className='h-3 w-24 rounded-full bg-gray-200' />
            </div>
          ))}
        </div>

        <div className='flex items-center justify-between'>
          <div className='h-4 w-64 rounded-full bg-gray-200' />
          <div className='h-10 w-36 rounded-md bg-gray-200' />
        </div>

        <div className='grid grid-cols-3 gap-6'>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className='rounded-xl border border-gray-200 bg-white p-5 space-y-3'
            >
              <div className='h-4 w-36 rounded-full bg-gray-200' />
              <div className='h-8 w-20 rounded-full bg-gray-200' />
              <div className='h-3 w-28 rounded-full bg-gray-200' />
            </div>
          ))}
        </div>
      </div>
    );

  const remainingCount = Math.max(
    0,
    totalPredictionCount - predictionHistory.length,
  );

  return (
    <>
      <div className='mt-4'>
        {/* Page Title */}
        <h1
          className='text-2xl font-semibold mb-6'
          style={{ color: '#000000', fontSize: '24px', fontWeight: '600' }}
        >
          Make a new predictions, or see recent predictions
        </h1>

        {/* Metric Cards */}
        <div className='grid grid-cols-3 gap-6 mb-8'>
          <MetricCard
            title='Total Predictions'
            value={metricsData.totalPredictions}
            change={metricsData.predictionsChange}
            changeText='from last month'
            icon={<FiBarChart2 size={32} style={{ color: '#4A90E2' }} />}
            changeColor='#447C00'
          />
          <MetricCard
            title='Active Classes'
            value={metricsData.activeClasses}
            change={metricsData.classesChange}
            changeText='from last month'
            icon={<FiUsers size={32} style={{ color: '#8B5CF6' }} />}
            changeColor='#447C00'
          />
          <MetricCard
            title='Average Improvement'
            value={metricsData.averageImprovement}
            change={metricsData.improvementChange}
            changeText='from last month'
            icon={<FiTrendingUp size={32} style={{ color: '#A78BFA' }} />}
            changeColor='#447C00'
          />
        </div>

        {/* View and Manage Section */}
        <div className='flex justify-between items-center mb-6'>
          <p style={{ color: 'rgba(0, 0, 0, 0.58)', fontSize: '14px' }}>
            View and manage your prediction history
          </p>
          <div className='flex items-center gap-3'>
            <select
              className='h-10  rounded-[5px] border border-black/20 bg-white px-3 text-[14px]'
              value={scope}
              onChange={(event) =>
                setScope(event.target.value as 'CLASS' | 'SELECTED')
              }
            >
              <option value='CLASS'>Class Prediction</option>
              <option value='SELECTED'>Selected Prediction</option>
            </select>

            <select
              className='h-10 rounded-[5px] border border-black/20 bg-white px-3 text-[14px]'
              value={selectedClass}
              onChange={(event) => setSelectedClass(event.target.value)}
            >
              <option value=''>All Classes</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>

            <Button
              size='medium'
              color='primary'
              variant='solid'
              onClick={() => setShowPredictionModal(true)}
              className='gap-2 text-white !rounded-[5px] text-sm font-semibold'
              style={{ backgroundColor: '#000000' }}
            >
              <Plus size={20} />
              New Prediction
            </Button>
          </div>
        </div>

        {/* Prediction History Cards Grid */}
        {isLoadingHistory && predictionHistory.length === 0 ? (
          <div className='grid grid-cols-3 gap-6 animate-pulse'>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className='rounded-[10px] border border-gray-200 bg-white p-5 space-y-3'
              >
                <div className='h-4 w-36 rounded-full bg-gray-200' />
                <div className='h-9 w-20 rounded-full bg-gray-200' />
                <div className='h-3 w-24 rounded-full bg-gray-200' />
              </div>
            ))}
          </div>
        ) : predictionHistory.length === 0 ? (
          <div className={`py-12 text-center text-[14px] text-black/60 transition-opacity duration-300 ease-out ${cardsTransitioning ? 'opacity-50' : 'opacity-100'}`}>
            No prediction history found
          </div>
        ) : (
          <div className={`grid grid-cols-3 gap-6 transition-opacity duration-300 ease-out ${cardsTransitioning ? 'opacity-50' : 'opacity-100'}`}>
            {predictionHistory.map((prediction) => (
              <PredictionHistoryCard
                key={prediction.id}
                prediction={prediction}
                shouldAutoOpen={prediction.id === autoOpenPredictionId}
                onAutoOpenHandled={() => {
                  setAutoOpenPredictionId((prev) => prev === prediction.id ? '' : prev);
                }}
              />
            ))}
          </div>
        )}

        {remainingCount > 0 && (
          <div className='mt-6 flex justify-center'>
            <Button
              color='gray'
              size='medium'
              variant='outline'
              className='rounded-[7px]'
              onClick={() =>
                showToast.info(
                  `Showing latest 6 results. ${remainingCount} more available.`,
                )
              }
            >
              View {remainingCount} more
            </Button>
          </div>
        )}
      </div>

      {/* Create Prediction Modal */}
      <CreatePredictionModal
        isOpen={showPredictionModal}
        onClose={() => setShowPredictionModal(false)}
        onPredictionSaved={handlePredictionSaved}
      />
    </>
  );
}
