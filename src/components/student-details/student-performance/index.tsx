import { BookOpen, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Subject {
  name: string;
  grade: string;
  score: number;
  trend: string;
  predictedPerformance?: string;
}

interface SubjectPerformanceProps {
  studentId?: string;
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT';
  semester?: string;
}

interface SubjectPerformanceApiResponse {
  success?: boolean;
  message?: string;
  data?: {
    subjects?: Array<{
      subject?: string;
      grade?: string;
      averageScore?: number;
      latestScore?: number;
      trend?: string;
      predictedPerformance?: string;
    }>;
  };
}

export function SubjectPerformance({ studentId, role = 'TEACHER', semester }: SubjectPerformanceProps) {
  const maxScore = 100;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjectPerformance = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (semester)
          params.append('semester', semester);

        const baseUrl = role === 'STUDENT'
          ? '/api/student/subject-performance'
          : `/api/teacher/students/${studentId}/subject-performance`;

        const url = `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        const payload: SubjectPerformanceApiResponse = await response.json();

        if (!response.ok || !payload.success)
          throw new Error(payload.message || 'Failed to fetch subject performance');

        const mappedSubjects = (payload.data?.subjects || []).map((item) => ({
          name: item.subject || 'Unknown Subject',
          grade: item.grade || '-',
          score: Number(item.latestScore ?? item.averageScore ?? 0),
          trend: String(item.trend || 'NO_PREVIOUS').toUpperCase(),
          predictedPerformance: item.predictedPerformance || '-'
        }));

        setSubjects(mappedSubjects);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch subject performance';
        setError(message);
        setSubjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (role === 'STUDENT' || studentId)
      void fetchSubjectPerformance();
  }, [role, studentId, semester]);

  const getTrendMeta = useMemo(() => {
    return (trend: string) => {
      if (trend === 'UP')
        return {
          icon: TrendingUp,
          text: 'UP',
          className: 'text-[#3FBA3DFD]'
        };

      if (trend === 'DOWN')
        return {
          icon: TrendingDown,
          text: 'DOWN',
          className: 'text-[#d32f2f]'
        };

      if (trend === 'STABLE')
        return {
          icon: Minus,
          text: 'STABLE',
          className: 'text-black/60'
        };

      return {
        icon: Minus,
        text: 'NO PREVIOUS',
        className: 'text-black/50'
      };
    };
  }, []);

  if (isLoading)
    return (
      <div className='rounded-[20px] border border-black/30 bg-white p-6 shadow-[1px_1px_3px_rgba(0,0,0,0.25),-1px_-1px_3px_rgba(0,0,0,0.25)] animate-pulse'>
        <div className='mb-6 flex items-center gap-2.5'>
          <div className='h-6 w-6 rounded-full bg-gray-200' />
          <div className='h-5 w-48 rounded-full bg-gray-200' />
        </div>

        <div className='flex flex-col gap-3'>
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className='rounded-xl border border-black/20 bg-white p-4 space-y-4'>
              <div className='flex items-center justify-between gap-4'>
                <div className='h-5 w-40 rounded-full bg-gray-200' />
                <div className='h-4 w-56 rounded-full bg-gray-200' />
              </div>

              <div className='h-2 rounded-full bg-gray-200' />
              <div className='h-3 w-16 rounded-full bg-gray-200' />
            </div>
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className='rounded-[20px] border border-black/30 bg-white p-6 shadow-[1px_1px_3px_rgba(0,0,0,0.25),-1px_-1px_3px_rgba(0,0,0,0.25)]'>
        <div className='py-8 text-center text-red-600'>{error}</div>
      </div>
    );

  return (
    <div className='rounded-[20px] border border-black/30 bg-white p-6 shadow-[1px_1px_3px_rgba(0,0,0,0.25),-1px_-1px_3px_rgba(0,0,0,0.25)]'>
      {/* Header */}
      <div className='mb-6 flex items-center gap-2.5'>
        <BookOpen size={24} className='text-[#0084FF]' />
        <h3 className='text-[20px] font-semibold text-black'>
          Subject Performance
        </h3>
      </div>

      {/* Subject List */}
      <div className='flex flex-col gap-3'>
        {subjects.length === 0 && (
          <div className='rounded-xl border border-black/20 bg-white p-4 text-sm text-black/60'>No subject performance found.</div>
        )}
        {subjects.map((subject, index) => {
          const progressWidth = Math.max(0, Math.min(100, (subject.score / maxScore) * 100));
          const trendMeta = getTrendMeta(subject.trend);
          const TrendIcon = trendMeta.icon;

          return (
            <div
              key={index}
              className='rounded-xl border border-black/30 bg-white p-4'
            >
              {/* Subject Header */}
              <div className='mb-3 flex items-center justify-between'>
                <h4 className='text-base font-semibold text-black'>
                  {subject.name}
                </h4>
                <div className='flex items-center gap-4'>
                  <span className='text-[15px] font-medium text-black/60'>
                    Grade: {subject.grade} | {subject.predictedPerformance}
                  </span>
                  <span className='text-[20px] font-bold text-black/60'>
                    {subject.score.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className='relative mb-2 h-[9px] overflow-hidden rounded-[5px] bg-[#C6C6C6]'>
                <div
                  className='h-full rounded-l-[5px] bg-gradient-to-r from-[#1072EB] to-[#17CBEB] transition-[width] duration-300 ease-in-out'
                  style={{ width: `${progressWidth}%` }}
                ></div>
              </div>

              {/* Trend */}
              <div className={`flex items-center gap-1 text-[10px] font-semibold ${trendMeta.className}`}>
                <TrendIcon size={12} />
                <span>{trendMeta.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
