import { CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type RoleName = 'ADMIN' | 'TEACHER' | 'STUDENT';

type RecommendationsResponse = {
  success?: boolean;
  message?: string;
  data?: {
    recommendations?: {
      strengths?: string[];
      areasForImprovement?: string[];
      nextSteps?: string[];
      source?: string;
      generatedAt?: string;
    };
  };
};

type RecommendationsData = NonNullable<NonNullable<RecommendationsResponse['data']>['recommendations']>;

interface RecommendationsTabProps {
  studentId?: string;
  role?: RoleName;
  semester?: string;
}

export function RecommendationsTab({ studentId, role = 'TEACHER', semester }: RecommendationsTabProps) {
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (semester)
          params.append('semester', semester);

        const baseUrl = role === 'STUDENT'
          ? '/api/student/recommendations'
          : `/api/teacher/students/${studentId}/recommendations`;

        const url = `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        const payload: RecommendationsResponse = await response.json();

        if (!response.ok || !payload.success)
          throw new Error(payload.message || 'Failed to fetch recommendations');

        setRecommendations(payload.data?.recommendations || null);
      } catch (err) {
        setRecommendations(null);
        setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      } finally {
        setIsLoading(false);
      }
    };

    if (role === 'STUDENT' || studentId)
      void fetchRecommendations();
  }, [role, studentId, semester]);

  const generatedAt = useMemo(() => {
    if (!recommendations?.generatedAt)
      return '-';

    return new Date(recommendations.generatedAt).toLocaleString();
  }, [recommendations?.generatedAt]);

  const renderItems = (items: string[]) => {
    if (items.length === 0)
      return <p className='text-fg-text text-sm pl-9'>No items found.</p>;

    return (
      <div className='space-y-3 pl-9'>
        {items.map((item, index) => (
          <p key={`${item}-${index}`} className='text-fg-default text-sm'>
            {item}
          </p>
        ))}
      </div>
    );
  };

  if (isLoading)
    return (
      <div className='space-y-6'>
        <div className='glass-card rounded-2xl p-6 space-y-6 animate-pulse'>
          {[0, 1, 2].map((index) => (
            <div key={index} className='rounded-3xl border border-white/10 p-6 space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='w-6 h-6 rounded-full bg-white/[0.06]' />
                <div className='h-5 w-40 rounded-full bg-white/[0.06]' />
              </div>

              <div className='space-y-3 pl-9'>
                <div className='h-4 w-11/12 rounded-full bg-white/[0.06]' />
                <div className='h-4 w-10/12 rounded-full bg-white/[0.06]' />
                <div className='h-4 w-9/12 rounded-full bg-white/[0.06]' />
              </div>
            </div>
          ))}

          <div className='h-4 w-72 rounded-full bg-white/[0.06]' />
        </div>
      </div>
    );

  if (error)
    return <div className='rounded-2xl glass-card p-6 text-[#FF8A8F]'>{error}</div>;

  const strengths = recommendations?.strengths || [];
  const improvements = recommendations?.areasForImprovement || [];
  const nextSteps = recommendations?.nextSteps || [];

  return (
    <div className='space-y-6'>
      <div className='glass-card rounded-2xl p-6 space-y-6'>
        {/* Strengths */}
        <div className='border-2 border-[#12B76A]/30 rounded-3xl p-6 bg-[#12B76A]/[0.06]'>
          <div className='flex items-center gap-3 mb-4'>
            <CheckCircle className='w-6 h-6 text-[#3DD68C]' />
            <h3 className='text-xl font-semibold text-[#3DD68C]'>Strengths</h3>
          </div>
          {renderItems(strengths)}
        </div>

        {/* Areas for Improvement */}
        <div className='border-2 border-[#FFD166]/30 rounded-3xl p-6 bg-[#FFD166]/[0.06]'>
          <div className='flex items-center gap-3 mb-4'>
            <AlertCircle className='w-6 h-6 text-[#FFA30C]' />
            <h3 className='text-xl font-semibold text-[#FFA30C]'>
              Areas for Improvement
            </h3>
          </div>
          {renderItems(improvements)}
        </div>

        {/* Next Steps */}
        <div className='border-2 border-[#4FA6F8]/30 rounded-3xl p-6 bg-[#4FA6F8]/[0.06]'>
          <div className='flex items-center gap-3 mb-4'>
            <Lightbulb className='w-6 h-6 text-[#7FD0FF]' />
            <h3 className='text-xl font-semibold text-[#7FD0FF]'>Next Steps</h3>
          </div>
          {renderItems(nextSteps)}
        </div>

        <div className='text-xs text-fg-text'>
          Source: {recommendations?.source || '-'} • Generated at: {generatedAt}
        </div>
      </div>
    </div>
  );
}
