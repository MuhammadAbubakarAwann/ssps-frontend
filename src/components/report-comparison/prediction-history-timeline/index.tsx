'use client';

import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PredictionHistory {
  predictionId?: string;
  reportCode: string;
  type: string;
  label: string;
  date: string;
  averageScore: number;
}
interface PredictionHistoryTimelineProps {
  studentId: string;
  onSelectHistories: (first: PredictionHistory, second?: PredictionHistory) => void;
}

interface StudentPredictionsApiResponse {
  success?: boolean;
  message?: string;
  data?: {
    predictions?: Array<{
      id?: string;
      predictionId?: string;
      prediction_id?: string;
      reportCode?: string;
      report_code?: string;
      type?: string;
      label?: string;
      date?: string;
      createdAt?: string;
      averageScore?: number | string;
      average_score?: number | string;
    }>;
  };
}

const ITEMS_PER_PAGE = 5;

export function PredictionHistoryTimeline({
  studentId,
  onSelectHistories
}: PredictionHistoryTimelineProps) {
  const [allHistories, setAllHistories] = useState<PredictionHistory[]>([]);
  const [displayedHistories, setDisplayedHistories] = useState<PredictionHistory[]>([]);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFirst, setSelectedFirst] = useState<string | null>(null);
  const [selectedSecond, setSelectedSecond] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId)
      return;

    const fetchHistories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/teacher/students/${studentId}/predictions`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const raw = await response.text();
        let payload: StudentPredictionsApiResponse | null = null;

        try {
          payload = raw ? JSON.parse(raw) : null;
        } catch {
          throw new Error('Invalid response format from prediction history API');
        }

        if (!payload)
          throw new Error('Empty response from prediction history API');

        if (!response.ok || !payload.success)
          throw new Error(payload.message || 'Failed to fetch prediction history');

        const normalized = (payload.data?.predictions || []).map((prediction, index) => {
          const predictionId = String(
            prediction.predictionId || prediction.prediction_id || prediction.id || ''
          ).trim();
          const reportCode = String(
            prediction.reportCode || prediction.report_code || predictionId || `RPT-${index + 1}`
          );
          const averageScore = Number(prediction.averageScore ?? prediction.average_score ?? 0);

          return {
            predictionId: predictionId || undefined,
            reportCode,
            type: String(prediction.type || 'CLASS'),
            label: String(prediction.label || 'Prediction'),
            date: String(prediction.date || prediction.createdAt || new Date().toISOString()),
            averageScore: Number.isFinite(averageScore) ? averageScore : 0
          } satisfies PredictionHistory;
        });

        setAllHistories(normalized);
        setDisplayedHistories(normalized.slice(0, ITEMS_PER_PAGE));
        setDisplayCount(ITEMS_PER_PAGE);
        setSelectedFirst(null);
        setSelectedSecond(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching prediction history');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchHistories();
  }, [studentId]);

  const selectFirst = (reportCode: string) => {
    setSelectedFirst(reportCode);
    setSelectedSecond(null);

    const first = allHistories.find((history) => history.reportCode === reportCode);
    if (first)
      onSelectHistories(first);
  };

  const selectSecond = (reportCode: string) => {
    if (!selectedFirst || selectedFirst === reportCode)
      return;

    setSelectedSecond(reportCode);
    const first = allHistories.find((history) => history.reportCode === selectedFirst);
    const second = allHistories.find((history) => history.reportCode === reportCode);

    if (first && second)
      onSelectHistories(first, second);
  };

  const handleCardClick = (reportCode: string) => {
    if (!selectedFirst)
      return selectFirst(reportCode);

    if (selectedFirst === reportCode)
      return;

    return selectSecond(reportCode);
  };

  const handleViewMore = () => {
    const nextCount = displayCount + ITEMS_PER_PAGE;
    setDisplayCount(nextCount);
    setDisplayedHistories(allHistories.slice(0, nextCount));
  };

  const hasMore = displayCount < allHistories.length;

  if (isLoading)
    return (
      <div className='mb-4 animate-pulse'>
        <div className='mb-2 h-7 w-52 rounded-full bg-gray-200' />
        <div className='mb-4 h-4 w-56 rounded-full bg-gray-200' />
        <div className='flex gap-5 overflow-x-auto px-2 pb-4 pt-4'>
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className='min-w-[215px] rounded-[10px] border border-gray-200 bg-white p-5 space-y-3'>
              <div className='h-4 w-32 rounded-full bg-gray-200' />
              <div className='h-9 w-20 rounded-full bg-gray-200' />
              <div className='h-3 w-24 rounded-full bg-gray-200' />
            </div>
          ))}
        </div>
      </div>
    );

  if (error)
    return <div className='text-[#d32f2f]'>{error}</div>;

  if (allHistories.length === 0)
    return <div>No prediction history found for this student.</div>;

  return (
    <div className='mb-4'>
      <h2 className='mb-2 text-xl font-semibold text-black'>
        Prediction History
      </h2>
      <p className='mb-3 text-base text-black/50'>
        Select base and compare predictions
      </p>

      <div className='mb-5 flex gap-5 overflow-x-auto bg-transparent px-2 pb-4 pt-4 '>
        {displayedHistories.map((item) => {
          const isFirst = selectedFirst === item.reportCode;
          const isSecond = selectedSecond === item.reportCode;

          return (
            <div
              key={item.reportCode}
              onClick={() => handleCardClick(item.reportCode)}
              className='relative min-w-[215px] overflow-hidden rounded-[10px] border-2 border-transparent bg-white p-5 text-left shadow-[1px_1px_3px_rgba(0,0,0,0.25),-1px_-1px_3px_rgba(0,0,0,0.1)] transition-all duration-300'
            >
              {(isFirst || isSecond) && (
                <div
                  className={`pointer-events-none absolute inset-0 z-10 backdrop-blur-[1px] ${isFirst ? 'bg-[#40BA3E]/50' : 'bg-yellow-500/50'}`}
                />
              )}

              {isFirst && (
                <p className='pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-3xl font-black text-white'>
                  1st
                </p>
              )}
              {isSecond && (
                <p className='pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-3xl font-extrabold text-white'>
                  2nd
                </p>
              )}

              <div className='mb-3 flex items-center gap-2.5'>
                <Calendar size={24} className='shrink-0 text-black' />
                <p className='m-0 text-base font-semibold text-black/70'>
                  {item.label}
                </p>
              </div>

              <p className='mb-2 text-[36px] font-bold leading-none text-black'>
                {Number(item.averageScore).toFixed(1)}
              </p>

              <p className='text-sm text-black/50'>
                {new Date(item.date).toLocaleDateString()}
              </p>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className='text-center'>
          <Button
            color='primary'
            size='medium'
            variant='outline'
            onClick={handleViewMore}
          >
            View More
          </Button>
        </div>
      )}
    </div>
  );
}
