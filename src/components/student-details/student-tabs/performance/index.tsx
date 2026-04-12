import { useEffect, useMemo, useState } from 'react';

interface ActivityItem {
  subject: string;
  score: string;
  submittedAt: string;
  name?: string;
  type?: string;
}

interface ActivityGroup {
  title: string;
  items: Array<{
    detail: string;
    time: string;
    dotColor: string;
  }>;
}

interface PerformanceOverviewResponse {
  success?: boolean;
  message?: string;
  data?: {
    performance?: {
      averageScore?: number;
      classRank?: string;
      percentileStanding?: string;
      improvementRate?: string;
      strongSubjects?: string;
    };
    recentActivity?: {
      quizzes?: ActivityItem[];
      assignments?: ActivityItem[];
      exams?: ActivityItem[];
    };
  };
}

interface PerformanceTabProps {
  studentId?: string;
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT';
  semester?: string;
}

export function PerformanceTab({ studentId, role = 'TEACHER', semester }: PerformanceTabProps) {
  const [payload, setPayload] = useState<PerformanceOverviewResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformanceOverview = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (semester)
          params.append('semester', semester);

        const baseUrl = role === 'STUDENT'
          ? '/api/student/performance-overview'
          : `/api/teacher/students/${studentId}/performance-overview`;
        const url = `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        const data: PerformanceOverviewResponse = await response.json();

        if (!response.ok || !data.success)
          throw new Error(data.message || 'Failed to fetch performance overview');

        setPayload(data.data || null);
      } catch (err) {
        setPayload(null);
        setError(err instanceof Error ? err.message : 'Failed to fetch performance overview');
      } finally {
        setIsLoading(false);
      }
    };

    if (role === 'STUDENT' || studentId)
      void fetchPerformanceOverview();
  }, [role, studentId, semester]);

  const averageScoreValue = useMemo(() => {
    const score = Number(payload?.performance?.averageScore ?? 0);
    return Number.isFinite(score) ? score : 0;
  }, [payload?.performance?.averageScore]);

  const averageScoreBarWidth = useMemo(() => {
    return `${Math.max(0, Math.min(100, averageScoreValue))}%`;
  }, [averageScoreValue]);

  const activityGroups = useMemo<ActivityGroup[]>(() => {
    const quizzes = (payload?.recentActivity?.quizzes || []).slice(0, 3);
    const assignments = (payload?.recentActivity?.assignments || []).slice(0, 3);
    const exams = (payload?.recentActivity?.exams || []).slice(0, 3);

    const groups: ActivityGroup[] = [];

    if (quizzes.length > 0)
      groups.push({
        title: 'Quizzes',
        items: quizzes.map((item) => ({
          detail: `${item.subject} - Score ${item.score}`,
          time: item.submittedAt,
          dotColor: 'bg-blue-500'
        }))
      });

    if (assignments.length > 0)
      groups.push({
        title: 'Assignments',
        items: assignments.map((item) => ({
          detail: `${item.subject} - ${item.name || 'Assignment'} - Score ${item.score}`,
          time: item.submittedAt,
          dotColor: 'bg-amber-500'
        }))
      });

    if (exams.length > 0)
      groups.push({
        title: 'Exams',
        items: exams.map((item) => ({
          detail: `${item.subject} - ${item.type || 'Exam'} - ${item.score}`,
          time: item.submittedAt,
          dotColor: 'bg-green-500'
        }))
      });

    return groups;
  }, [payload]);

  if (isLoading)
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-2 gap-6'>
          <div className='border border-gray-300 rounded-2xl p-6 bg-white space-y-4 animate-pulse'>
            <div className='h-5 w-48 rounded-full bg-gray-200' />

            <div className='border border-gray-200 rounded-xl p-4 space-y-3'>
              <div className='h-4 w-32 rounded-full bg-gray-200' />
              <div className='flex items-center gap-4'>
                <div className='h-2 flex-1 rounded-full bg-gray-200' />
                <div className='h-8 w-16 rounded-full bg-gray-200' />
              </div>
            </div>

            {[0, 1, 2].map((index) => (
              <div key={index} className='border border-gray-200 rounded-xl p-4 space-y-3'>
                <div className='h-4 w-28 rounded-full bg-gray-200' />
                <div className='flex items-center justify-between gap-4'>
                  <div className='h-6 w-24 rounded-full bg-gray-200' />
                  <div className='h-4 w-20 rounded-full bg-gray-200' />
                </div>
              </div>
            ))}
          </div>

          <div className='border border-gray-300 rounded-2xl p-6 bg-white space-y-4 animate-pulse'>
            <div className='h-5 w-40 rounded-full bg-gray-200' />
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className='space-y-3 border border-gray-200 rounded-xl p-4'>
                <div className='h-4 w-24 rounded-full bg-gray-200' />
                <div className='flex items-center gap-3'>
                  <div className='h-3 w-3 rounded-full bg-gray-200' />
                  <div className='h-4 flex-1 rounded-full bg-gray-200' />
                </div>
                <div className='h-3 w-32 rounded-full bg-gray-200' />
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  if (error)
    return <div className='rounded-2xl border border-gray-300 bg-white p-6 text-red-600'>{error}</div>;

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 gap-6'>
        {/* Performance Overview */}
        <div className='border border-gray-300 rounded-2xl p-6 bg-white space-y-4'>
          <h3 className='text-lg font-semibold text-black'>Performance Overview</h3>

          {/* Average Score */}
          <div className='border border-gray-300 rounded-xl p-4 space-y-2'>
            <p className='text-sm text-gray-700'>Average Score</p>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div className='bg-blue-500 h-2 rounded-full' style={{ width: averageScoreBarWidth }}></div>
                </div>
              </div>
              <p className='text-2xl font-bold text-blue-500 ml-4'>{averageScoreValue.toFixed(2)}</p>
            </div>
          </div>

          {/* Class Rank */}
          <div className='border border-gray-300 rounded-xl p-4 space-y-2'>
            <p className='text-sm text-gray-700'>Class Rank</p>
            <div className='flex justify-between items-center'>
              <p className='text-xl font-bold text-black'>{payload?.performance?.classRank || '-'}</p>
              <p className='text-sm text-gray-600'>{payload?.performance?.percentileStanding || '-'}</p>
            </div>
          </div>

          {/* Improvement Rate */}
          <div className='border border-gray-300 rounded-xl p-4 space-y-2'>
            <p className='text-sm text-gray-700'>Improvement Rate</p>
            <p className='text-xl font-bold text-green-600'>{payload?.performance?.improvementRate || '-'}</p>
            <p className='text-xs text-gray-600'>This semester vs last semester</p>
          </div>

          {/* Strong Subjects */}
          <div className='border border-gray-300 rounded-xl p-4 space-y-2'>
            <p className='text-sm text-gray-700'>Strong Subjects</p>
            <p className='text-xl font-bold text-green-600'>{payload?.performance?.strongSubjects || '-'}</p>
            <p className='text-xs text-gray-600'>A or A+ grade subjects</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className='border border-gray-300 rounded-2xl p-6 bg-white space-y-4'>
          <h3 className='text-lg font-semibold text-black'>Recent Activity</h3>

          {activityGroups.length === 0 && (
            <p className='text-sm text-gray-600'>No recent activity found.</p>
          )}

          {activityGroups.map((group) => (
            <div key={group.title} className='space-y-3'>
              <p className='text-sm font-semibold text-black'>{group.title}</p>
              <div className='space-y-3'>
                {group.items.map((item, index) => (
                  <div key={`${group.title}-${index}`} className='flex gap-3 items-start pl-1'>
                    <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${item.dotColor}`}></div>
                    <div>
                      <p className='text-sm text-gray-600'>{item.detail}</p>
                      <p className='text-xs text-gray-500'>{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
