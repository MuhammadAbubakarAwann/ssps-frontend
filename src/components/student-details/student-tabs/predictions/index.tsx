import { BookOpen } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type RoleName = 'ADMIN' | 'TEACHER' | 'STUDENT';

type PredictionItem = {
  semester?: string;
  subject?: string;
  predictedScore?: number;
  confidence?: number;
  riskLevel?: string;
  recommendations?: string[] | { priority?: string; actions?: string[] };
  predictedAt?: string;
};

interface LatestPredictionsResponse {
  success?: boolean;
  message?: string;
  data?: {
    predictions?: PredictionItem[];
  };
}

interface PredictionsTabProps {
  studentId?: string;
  role?: RoleName;
  semester?: string;
}

export function PredictionsTab({ studentId, role = 'TEACHER', semester }: PredictionsTabProps) {
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestPredictions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (semester)
          params.append('semester', semester);

        const baseUrl = role === 'STUDENT'
          ? '/api/student/latest-predictions'
          : `/api/teacher/students/${studentId}/latest-predictions`;
        const url = `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        const payload: LatestPredictionsResponse = await response.json();

        if (!response.ok || !payload.success)
          throw new Error(payload.message || 'Failed to fetch latest predictions');

        setPredictions(payload.data?.predictions || []);
      } catch (err) {
        setPredictions([]);
        setError(err instanceof Error ? err.message : 'Failed to fetch latest predictions');
      } finally {
        setIsLoading(false);
      }
    };

    if (role === 'STUDENT' || studentId)
      void fetchLatestPredictions();
  }, [role, studentId, semester]);

  const normalizedPredictions = useMemo(() => {
    return predictions.map((pred) => {
      const confidence = Number(pred.confidence ?? 0);
      const predictedScore = Number(pred.predictedScore ?? 0);
      const riskLevel = String(pred.riskLevel || 'MID').toUpperCase();

      let recommendationText = '-';
      if (Array.isArray(pred.recommendations))
        recommendationText = pred.recommendations.join(', ');
      else if (pred.recommendations && typeof pred.recommendations === 'object') {
        const priority = pred.recommendations.priority ? `Priority: ${pred.recommendations.priority}` : '';
        const actions = Array.isArray(pred.recommendations.actions) ? pred.recommendations.actions.join(', ') : '';
        recommendationText = [priority, actions].filter(Boolean).join(' | ') || '-';
      }

      const riskColor = riskLevel === 'LOW'
        ? 'bg-green-100 border-green-400 text-green-700'
        : riskLevel === 'HIGH'
          ? 'bg-red-100 border-red-400 text-red-700'
          : 'bg-amber-100 border-amber-400 text-amber-700';

      return {
        semester: pred.semester || '-',
        subject: pred.subject || '-',
        predictedScore,
        confidence,
        confidenceText: `${confidence.toFixed(1)}%`,
        riskLevel,
        recommendationText,
        riskColor,
        predictedAt: pred.predictedAt ? new Date(pred.predictedAt).toLocaleString() : '-'
      };
    });
  }, [predictions]);

  if (isLoading)
    return (
      <div className='space-y-6'>
        <div className='border border-gray-300 bg-white rounded-2xl p-6 animate-pulse'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-5 h-5 rounded-full bg-gray-200' />
            <div className='h-5 w-64 rounded-full bg-gray-200' />
          </div>

          <div className='space-y-4'>
            {[0, 1, 2].map((index) => (
              <div key={index} className='border border-gray-200 rounded-xl p-4'>
                <div className='grid grid-cols-5 gap-4 items-center'>
                  {[0, 1, 2, 3, 4].map((column) => (
                    <div key={column} className='space-y-3'>
                      <div className='h-3 w-16 rounded-full bg-gray-200' />
                      <div className='h-4 w-full rounded-full bg-gray-200' />
                      <div className='h-3 w-24 rounded-full bg-gray-200' />
                    </div>
                  ))}
                </div>
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
      <div className='border border-gray-300 bg-white rounded-2xl p-6'>
        <div className='flex items-center gap-3 mb-6'>
          <BookOpen className='w-5 h-5 text-blue-500' />
          <h3 className='text-lg font-semibold text-black'>ML-Based Performance Predictions</h3>
        </div>

        {normalizedPredictions.length === 0 && (
          <div className='rounded-xl border border-gray-300 p-4 text-sm text-gray-600'>No predictions found.</div>
        )}

        <div className='space-y-4'>
          {normalizedPredictions.map((pred, idx) => (
            <div key={idx} className='border border-gray-300 rounded-xl p-4'>
              <div className='grid grid-cols-5 gap-4 items-center'>
                {/* Semester */}
                <div>
                  <p className='text-xs text-gray-500 uppercase'>Semester</p>
                  <p className='text-sm font-semibold text-black'>{pred.semester}</p>
                  <p className='text-xs text-gray-500 mt-1'>{pred.subject}</p>
                </div>

                {/* Predicted Score */}
                <div>
                  <p className='text-xs text-gray-500 uppercase'>Predicted Score</p>
                  <p className='text-xl font-bold text-blue-500'>{pred.predictedScore.toFixed(1)}</p>
                </div>

                {/* Confidence */}
                <div>
                  <p className='text-xs text-gray-500 uppercase'>Confidence</p>
                  <div className='flex items-center gap-2 mt-1'>
                    <p className='text-sm font-semibold text-cyan-500'>{pred.confidenceText}</p>
                    <div className='w-16 h-2 bg-gray-200 rounded-full'>
                      <div 
                        className='h-2 bg-cyan-500 rounded-full' 
                        style={{ width: `${Math.max(0, Math.min(100, pred.confidence))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Risk Level */}
                <div>
                  <p className='text-xs text-gray-500 uppercase'>Risk Level</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${pred.riskColor} mt-1`}>
                    {pred.riskLevel}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <p className='text-xs text-gray-500 uppercase'>Recommendations</p>
                  <p className='text-xs text-gray-700 mt-1'>{pred.recommendationText}</p>
                  <p className='text-[11px] text-gray-500 mt-1'>{pred.predictedAt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
