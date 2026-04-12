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
      return <p className='text-black text-sm pl-9'>No items found.</p>;

    return (
      <div className='space-y-3 pl-9'>
        {items.map((item, index) => (
          <p key={`${item}-${index}`} className='text-black text-sm'>
            {item}
          </p>
        ))}
      </div>
    );
  };

  if (isLoading)
    return (
      <div className='space-y-6'>
        <div className='border border-gray-300 bg-white rounded-2xl p-6 space-y-6 animate-pulse'>
          {[0, 1, 2].map((index) => (
            <div key={index} className='rounded-3xl border border-gray-200 p-6 space-y-4 bg-gray-50'>
              <div className='flex items-center gap-3'>
                <div className='w-6 h-6 rounded-full bg-gray-200' />
                <div className='h-5 w-40 rounded-full bg-gray-200' />
              </div>

              <div className='space-y-3 pl-9'>
                <div className='h-4 w-11/12 rounded-full bg-gray-200' />
                <div className='h-4 w-10/12 rounded-full bg-gray-200' />
                <div className='h-4 w-9/12 rounded-full bg-gray-200' />
              </div>
            </div>
          ))}

          <div className='h-4 w-72 rounded-full bg-gray-200' />
        </div>
      </div>
    );

  if (error)
    return <div className='rounded-2xl border border-gray-300 bg-white p-6 text-red-600'>{error}</div>;

  const strengths = recommendations?.strengths || [];
  const improvements = recommendations?.areasForImprovement || [];
  const nextSteps = recommendations?.nextSteps || [];

  return (
    <div className='space-y-6'>
      <div className='border border-gray-300 bg-white rounded-2xl p-6 space-y-6'>
        {/* Strengths */}
        <div className='border-2 border-green-500 rounded-3xl p-6 bg-green-50'>
          <div className='flex items-center gap-3 mb-4'>
            <CheckCircle className='w-6 h-6 text-green-600' />
            <h3 className='text-xl font-semibold text-green-700'>Strengths</h3>
          </div>
          {renderItems(strengths)}
        </div>

        {/* Areas for Improvement */}
        <div className='border-2 border-yellow-500 rounded-3xl p-6 bg-yellow-50'>
          <div className='flex items-center gap-3 mb-4'>
            <AlertCircle className='w-6 h-6 text-yellow-600' />
            <h3 className='text-xl font-semibold text-yellow-700'>
              Areas for Improvement
            </h3>
          </div>
          {renderItems(improvements)}
        </div>

        {/* Next Steps */}
        <div className='border-2 border-blue-500 rounded-3xl p-6 bg-blue-50'>
          <div className='flex items-center gap-3 mb-4'>
            <Lightbulb className='w-6 h-6 text-blue-600' />
            <h3 className='text-xl font-semibold text-blue-700'>Next Steps</h3>
          </div>
          {renderItems(nextSteps)}
        </div>

        <div className='text-xs text-gray-500'>
          Source: {recommendations?.source || '-'} • Generated at: {generatedAt}
        </div>
      </div>
    </div>
  );
}
