import React, { useEffect, useState } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { PredictedResultsModal } from '../predicted-results-modal/index';
import { showToast } from '@/components/ui/toaster';
import type { SuggestionsObject } from '@/components/predictions/create-prediction-modal';

interface StudentResult {
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
}

interface PredictionDetailsResponse {
  success?: boolean;
  message?: string;
  data?: {
    class?: {
      id?: string | number;
      name?: string;
    };
    prediction?: {
      date?: string;
      generatedAt?: string;
    };
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
    students?: Array<{
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
  };
}

const normalizeRiskLevel = (risk: 'LOW' | 'MID' | 'HIGH'): 'Low' | 'Mid' | 'High' => {
  if (risk === 'HIGH')
    return 'High';

  if (risk === 'MID')
    return 'Mid';

  return 'Low';
};

interface PredictionHistoryCardProps {
  prediction: {
    id: string;
    classId: string;
    status: string;
    date: string;
    className: string;
    studentsAnalyzed: number;
    avgScore: string;
    preloadedResults?: StudentResult[];
  };
  shouldAutoOpen?: boolean;
  onAutoOpenHandled?: () => void;
}

function normalizeSuggestions(raw: SuggestionsObject | string[] | string | undefined): SuggestionsObject | string[] {
  if (raw === null || raw === undefined) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === 'object') return raw;
  return String(raw).split('\n').map((s) => s.trim()).filter(Boolean);
}

const mapPredictionResults = (payload: PredictionDetailsResponse): StudentResult[] => {
  if (Array.isArray(payload.data?.entries) && payload.data?.entries.length > 0) {
    return payload.data.entries.map((entry, index) => ({
      id: String(entry.studentId ?? entry.id ?? index),
      name: String(entry.name || ''),
      regNo: String(entry.regNo || ''),
      predictedScore: Number(entry.predictedScore || 0),
      passProbability: Number(entry.passProbability || 0),
      performanceCategory: String(entry.performanceCategory || entry.performance || 'N/A'),
      modelConfidence: Number(entry.modelConfidence || 0),
      riskLevel: normalizeRiskLevel(String(entry.riskLevel || 'LOW') as 'LOW' | 'MID' | 'HIGH'),
      expectedCgpa: entry.expectedCgpa ?? null,
      classRank: entry.classRank ?? null,
      overallRiskLevel: String(entry.overallRiskLevel || entry.riskLevel || 'LOW'),
      semesterAvgScore: entry.semesterAvgScore ?? null,
      suggestions: normalizeSuggestions(entry.suggestions)
    }));
  }

  return (payload.data?.students || []).map((student, index) => ({
    id: String(student.studentId ?? student.id ?? index),
    name: String(student.name || ''),
    regNo: String(student.regNo || ''),
    predictedScore: Number(student.predictedScore || 0),
    passProbability: Number(student.passProbability || 0),
    performanceCategory: String(student.performanceCategory || student.performance || 'N/A'),
    modelConfidence: Number(student.modelConfidence || 0),
    riskLevel: normalizeRiskLevel(String(student.riskLevel || 'LOW') as 'LOW' | 'MID' | 'HIGH'),
    expectedCgpa: student.expectedCgpa ?? null,
    classRank: student.classRank ?? null,
    overallRiskLevel: String(student.overallRiskLevel || student.riskLevel || 'LOW'),
    semesterAvgScore: student.semesterAvgScore ?? null,
    suggestions: normalizeSuggestions(student.suggestions)
  }));
};

export function PredictionHistoryCard({ prediction, shouldAutoOpen = false, onAutoOpenHandled }: PredictionHistoryCardProps) {
  const [showResults, setShowResults] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [resultsDate, setResultsDate] = useState(prediction.date);
  const [resultsClassTitle, setResultsClassTitle] = useState(prediction.className);

  const handleOpenResults = async () => {
    setShowResults(true);

    if (prediction.preloadedResults && prediction.preloadedResults.length > 0) {
      setResults(prediction.preloadedResults);
      setResultsDate(prediction.date);
      setResultsClassTitle(prediction.className);
      setIsLoadingResults(false);
      return;
    }

    setIsLoadingResults(true);

    try {
      const response = await fetch(`/api/teacher/classes/${prediction.classId}/predictions/${prediction.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const payload: PredictionDetailsResponse = await response.json();

      if (!response.ok || !payload.success)
        throw new Error(payload.message || 'Failed to fetch prediction results');

      const mappedResults: StudentResult[] = mapPredictionResults(payload);

      setResults(mappedResults);
      setResultsClassTitle(String(payload.data?.class?.name || prediction.className));

      if (payload.data?.prediction?.generatedAt || payload.data?.prediction?.date)
        setResultsDate(
          new Date(payload.data.prediction.generatedAt || payload.data.prediction.date || prediction.date).toLocaleDateString('en-GB')
        );

    } catch (error) {
      console.error('Error fetching prediction details:', error);
      showToast.error(error instanceof Error ? error.message : 'Failed to fetch prediction results');
    } finally {
      setIsLoadingResults(false);
    }
  };

  useEffect(() => {
    if (!shouldAutoOpen || showResults)
      return;

    void handleOpenResults();
    onAutoOpenHandled?.();
  }, [shouldAutoOpen, showResults]);

  return (
    <>
      <div
        onClick={handleOpenResults}
        className='glass-card glass-card-hover flex flex-col p-6 cursor-pointer transition-all duration-300'
      >
        {/* Header with Status and Date */}
        <div className='mb-4 flex items-center justify-between'>
          <span className='rounded-[5px] bg-[#4FA6F8]/15 px-3 py-1 text-xs font-semibold text-[#7FD0FF]'>
            {prediction.status}
          </span>
          <span className='text-xs text-fg-text'>
            {prediction.date}
          </span>
        </div>

        {/* Class Name */}
        <h3 className='mb-2 text-xl font-semibold text-fg-default'>
          {prediction.className}
        </h3>

        {/* Students Analyzed */}
        <p className='mb-6 text-[13px] text-fg-text'>
          {prediction.studentsAnalyzed} Students analyzed
        </p>

        {/* Avg Score and Icon */}
        <div className='flex items-end justify-between'>
          <div>
            <p className='mb-1 text-xs text-fg-text'>
              Avg Score
            </p>
            <p className='text-[28px] font-bold text-fg-default'>
              {prediction.avgScore}
            </p>
          </div>
          <div className='flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center rounded-full border-2 border-[#10B981]'>
            <FiTrendingUp size={24} style={{ color: '#10B981' }} />
          </div>
        </div>
      </div>

      <PredictedResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        className=''
        classTitle={resultsClassTitle}
        date={resultsDate}
        results={results}
        isLoading={isLoadingResults}
      />
    </>
  );
}
