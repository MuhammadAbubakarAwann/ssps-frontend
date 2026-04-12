import React, { useState } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { PredictedResultsModal } from '../predicted-results-modal/index';
import { showToast } from '@/components/ui/toaster';

interface StudentResult {
  id: string;
  name: string;
  regNo: string;
  predictedScore: number;
  passProbability: number;
  performanceCategory: string;
  modelConfidence: number;
  riskLevel: 'Low' | 'Mid' | 'High';
  suggestions: string[];
}

interface PredictionDetailsResponse {
  success?: boolean;
  message?: string;
  data?: {
    prediction?: {
      date?: string;
    };
    students?: Array<{
      id: number | string;
      studentId?: number | string;
      name: string;
      registrationNum: string;
      predictedScore: number;
      performanceCategory: string;
      passProbability: number;
      modelConfidence: number;
      riskLevel: 'LOW' | 'MID' | 'HIGH';
      suggestions: string[] | string;
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
    id: number;
    classId: string;
    status: string;
    date: string;
    className: string;
    studentsAnalyzed: number;
    avgScore: string;
  };
}

export function PredictionHistoryCard({ prediction }: PredictionHistoryCardProps) {
  const [showResults, setShowResults] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [resultsDate, setResultsDate] = useState(prediction.date);

  const handleOpenResults = async () => {
    setShowResults(true);
    setIsLoadingResults(true);

    try {
      const response = await fetch(`/api/teacher/classes/${prediction.classId}/predictions/${prediction.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const payload: PredictionDetailsResponse = await response.json();

      if (!response.ok || !payload.success)
        throw new Error(payload.message || 'Failed to fetch prediction results');

      const mappedResults: StudentResult[] = (payload.data?.students || []).map((student) => ({
        id: String(student.studentId ?? student.id),
        name: student.name,
        regNo: student.registrationNum,
        predictedScore: student.predictedScore,
        passProbability: student.passProbability,
        performanceCategory: student.performanceCategory,
        modelConfidence: student.modelConfidence,
        riskLevel: normalizeRiskLevel(student.riskLevel),
        suggestions: Array.isArray(student.suggestions)
          ? student.suggestions
          : String(student.suggestions || '').split('\n').filter(Boolean)
      }));

      setResults(mappedResults);

      if (payload.data?.prediction?.date)
        setResultsDate(new Date(payload.data.prediction.date).toLocaleDateString('en-GB'));

    } catch (error) {
      console.error('Error fetching prediction details:', error);
      showToast.error(error instanceof Error ? error.message : 'Failed to fetch prediction results');
    } finally {
      setIsLoadingResults(false);
    }
  };

  return (
    <>
      <div
        onClick={handleOpenResults}
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(0, 0, 0, 0.18)',
          borderRadius: '10px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Header with Status and Date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span
            style={{
              backgroundColor: 'rgba(74, 144, 226, 0.2)',
              color: '#2563EB',
              padding: '4px 12px',
              borderRadius: '5px',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {prediction.status}
          </span>
          <span style={{ color: 'rgba(0, 0, 0, 0.5)', fontSize: '12px' }}>
            {prediction.date}
          </span>
        </div>

        {/* Class Name */}
        <h3 style={{ color: '#000000', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
          {prediction.className}
        </h3>

        {/* Students Analyzed */}
        <p style={{ color: 'rgba(0, 0, 0, 0.58)', fontSize: '13px', marginBottom: '24px' }}>
          {prediction.studentsAnalyzed} Students analyzed
        </p>

        {/* Avg Score and Icon */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ color: 'rgba(0, 0, 0, 0.58)', fontSize: '12px', marginBottom: '4px' }}>
              Avg Score
            </p>
            <p style={{ color: '#000000', fontSize: '28px', fontWeight: '700' }}>
              {prediction.avgScore}
            </p>
          </div>
          <div
            style={{
              border: '2px solid #10B981',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <FiTrendingUp size={24} style={{ color: '#10B981' }} />
          </div>
        </div>
      </div>

      <PredictedResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        className=''
        date={resultsDate}
        results={results}
        isLoading={isLoadingResults}
      />
    </>
  );
}
