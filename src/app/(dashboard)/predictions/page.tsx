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
  id: number;
  classId: string;
  status: string;
  date: string;
  className: string;
  studentsAnalyzed: number;
  avgScore: string;
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
      id: number;
      name?: string;
      title?: string;
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

const DEFAULT_METRICS: PredictionMetricsViewModel = {
  totalPredictions: '0',
  predictionsChange: '+0%',
  activeClasses: '0',
  classesChange: '+0',
  averageImprovement: '0.0%',
  improvementChange: '+0%'
};

export default function PredictionsPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [classes, setClasses] = useState<PredictionClass[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [scope, setScope] = useState<'CLASS' | 'SELECTED'>('CLASS');
  const [students, setStudents] = useState<FilterStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistoryCardItem[]>([]);
  const [totalPredictionCount, setTotalPredictionCount] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [metricsData, setMetricsData] = useState<PredictionMetricsViewModel>(DEFAULT_METRICS);

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading)
      return;

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
        showToast.error(error instanceof Error ? error.message : 'Failed to fetch classes');
      }
    };

    fetchClasses();
  }, [isLoading]);

  useEffect(() => {
    if (isLoading)
      return;

    const fetchPredictionMetrics = async () => {
      try {
        const response = await fetch('/api/teacher/predictions/metrics', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const payload: PredictionMetricsApiResponse = await response.json();

        if (!response.ok || !payload.success)
          throw new Error(payload.message || 'Failed to fetch prediction metrics');

        const totalPredictionsValue = Number(payload.data?.totalPredictions?.value ?? 0);
        const totalPredictionsIncrease = Number(payload.data?.totalPredictions?.increasePercentage ?? 0);
        const activeClassesValue = Number(payload.data?.activeClasses?.value ?? 0);
        const activeClassesIncrease = Number(payload.data?.activeClasses?.increaseNumber ?? 0);
        const averageImprovementValue = Number(payload.data?.averageImprovement?.value ?? 0);
        const averageImprovementIncrease = Number(payload.data?.averageImprovement?.increasePercentage ?? 0);

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
        showToast.error(error instanceof Error ? error.message : 'Failed to fetch prediction metrics');
        setMetricsData(DEFAULT_METRICS);
      }
    };

    fetchPredictionMetrics();
  }, [isLoading]);

  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setSelectedStudentId('');
      return;
    }

    const fetchStudents = async () => {
      try {
        const response = await fetch(`/api/teacher/classes/${selectedClass}/students/prediction-status`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const payload: ClassStudentsApiResponse = await response.json();

        if (!response.ok || !payload.success)
          throw new Error(payload.message || 'Failed to fetch students');

        const studentList = (payload.data?.students || []).reduce<FilterStudent[]>((acc, student) => {
          const rawId = student.id ?? student.studentId ?? student.userId;
          if (rawId === undefined || rawId === null)
            return acc;

          const normalizedId = String(rawId).trim();
          if (!normalizedId || normalizedId === 'undefined' || normalizedId === 'null')
            return acc;

          acc.push({
            id: normalizedId,
            name: student.name,
            regNo: student.regNo
          });

          return acc;
        }, []);

        setStudents(studentList);

        if (scope === 'SELECTED') {
          setSelectedStudentId((prev) => (
            prev && studentList.some((student) => student.id === prev)
              ? prev
              : (studentList[0]?.id || '')
          ));
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        showToast.error(error instanceof Error ? error.message : 'Failed to fetch students');
        setStudents([]);
        setSelectedStudentId('');
      }
    };

    fetchStudents();
  }, [selectedClass, scope]);

  useEffect(() => {
    const fetchPredictionHistory = async () => {
      setIsLoadingHistory(true);

      try {
        const query = new URLSearchParams({ scope });

        const response = await fetch(`/api/teacher/predictions/history?${query.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const payload: PredictionHistoryApiResponse = await response.json();

        if (!response.ok || !payload.success)
          throw new Error(payload.message || 'Failed to fetch prediction history');

        const mappedHistory = (payload.data?.predictions || []).map((item) => ({
          id: item.id,
          classId: String(item.class?.id ?? selectedClass),
          status: item.status || 'completed',
          date: new Date(item.date).toLocaleDateString('en-GB'),
          className: item.title || item.name || item.class?.name || 'Prediction',
          studentsAnalyzed: item.studentsAnalyzed,
          avgScore: `${Number(item.avgScore).toFixed(1)}%`
        }));

        setPredictionHistory(mappedHistory);
        setTotalPredictionCount(payload.data?.totalCount || 0);
      } catch (error) {
        console.error('Error fetching prediction history:', error);
        showToast.error(error instanceof Error ? error.message : 'Failed to fetch prediction history');
        setPredictionHistory([]);
        setTotalPredictionCount(0);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchPredictionHistory();
  }, [scope]);

  const handlePredictionSaved = (newPrediction: SavedPredictionSummary) => {
    if (newPrediction.scope === 'SELECTED') {
      setScope('SELECTED');
      setPredictionHistory([newPrediction]);
      setTotalPredictionCount(1);
      return;
    }

    if (scope !== 'CLASS')
      return;

    const alreadyExists = predictionHistory.some((item) => item.id === newPrediction.id);
    setPredictionHistory((prev) => {
      const withoutDuplicate = prev.filter((item) => item.id !== newPrediction.id);
      return [newPrediction, ...withoutDuplicate].slice(0, 6);
    });

    if (!alreadyExists)
      setTotalPredictionCount((prev) => prev + 1);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const remainingCount = Math.max(0, totalPredictionCount - predictionHistory.length);

  return (
    <ContentLayout userInfo={user} title='Predictions'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/dashboard' style={{ color: '#000000' }}>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ color: '#000000' }}>Predictions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8">
        {/* Page Title */}
        <h1 className="text-2xl font-semibold mb-6" style={{ color: '#000000', fontSize: '24px', fontWeight: '600' }}>
          Make a new predictions, or see recent predictions
        </h1>

        {/* Metric Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Total Predictions"
            value={metricsData.totalPredictions}
            change={metricsData.predictionsChange}
            changeText="from last month"
            icon={<FiBarChart2 size={32} style={{ color: '#4A90E2' }} />}
            changeColor="#447C00"
          />
          <MetricCard
            title="Active Classes"
            value={metricsData.activeClasses}
            change={metricsData.classesChange}
            changeText="from last month"
            icon={<FiUsers size={32} style={{ color: '#8B5CF6' }} />}
            changeColor="#447C00"
          />
          <MetricCard
            title="Average Improvement"
            value={metricsData.averageImprovement}
            change={metricsData.improvementChange}
            changeText="from last month"
            icon={<FiTrendingUp size={32} style={{ color: '#A78BFA' }} />}
            changeColor="#447C00"
          />
        </div>

        {/* View and Manage Section */}
        <div className="flex justify-between items-center mb-6">
          <p style={{ color: 'rgba(0, 0, 0, 0.58)', fontSize: '14px' }}>
            View and manage your prediction history
          </p>
          <div className="flex items-center gap-3">
            <select
              className="h-10  rounded-[5px] border border-black/20 bg-white px-3 text-[14px]"
              value={scope}
              onChange={(event) => setScope(event.target.value as 'CLASS' | 'SELECTED')}
            >
              <option value="CLASS">Class Prediction</option>
              <option value="SELECTED">Selected Prediction</option>
            </select>

            <Button
            size='medium'
            color='primary'
            variant='solid'
              onClick={() => setShowPredictionModal(true)}
              className="gap-2 text-white !rounded-[5px] text-sm font-semibold"
              style={{ backgroundColor: '#000000' }}
            >
              <Plus size={20} />
              New Prediction
            </Button>
          </div>
        </div>

        {/* Prediction History Cards Grid */}
        {isLoadingHistory && predictionHistory.length === 0 ? (
          <div className="py-12 text-center text-[14px] text-black/60">Loading prediction history...</div>
        ) : predictionHistory.length === 0 ? (
          <div className="py-12 text-center text-[14px] text-black/60">No prediction history found</div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {predictionHistory.map((prediction) => (
              <PredictionHistoryCard key={prediction.id} prediction={prediction} />
            ))}
          </div>
        )}

        {remainingCount > 0 && (
          <div className="mt-6 flex justify-center">
            <Button
              color="gray"
              size="medium"
              variant="outline"
              className="rounded-[7px]"
              onClick={() => showToast.info(`Showing latest 6 results. ${remainingCount} more available.`)}
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
    </ContentLayout>
  );
}
