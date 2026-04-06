'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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

interface PredictedResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  date: string;
  results: StudentResult[];
  isLoading?: boolean;
}

const getRiskLevelColorClass = (riskLevel: 'Low' | 'Mid' | 'High') => {
  switch (riskLevel) {
    case 'Low':
      return 'bg-[rgba(178,229,39,0.28)]';
    case 'Mid':
      return 'bg-[rgba(229,201,39,0.28)]';
    case 'High':
      return 'bg-[rgba(229,39,39,0.28)]';
    default:
      return 'bg-[rgba(178,229,39,0.28)]';
  }
};

const getRiskLevelNumberClass = (riskLevel: 'Low' | 'Mid' | 'High') => {
  switch (riskLevel) {
    case 'Low':
      return 'text-[#9DD35B]';
    case 'Mid':
      return 'text-[#D3BB5B]';
    case 'High':
      return 'text-[#D35B5B]';
    default:
      return 'text-[#9DD35B]';
  }
};

const getValueColorClass = (riskLevel: 'Low' | 'Mid' | 'High') => {
  switch (riskLevel) {
    case 'Low':
      return 'text-[#447C00]';
    case 'Mid':
      return 'text-[#7C6900]';
    case 'High':
      return 'text-[#7C0000]';
    default:
      return 'text-[#447C00]';
  }
};

const getValueBgColorClass = (riskLevel: 'Low' | 'Mid' | 'High') => {
  switch (riskLevel) {
    case 'Low':
      return 'bg-[rgba(157,211,91,0.56)]';
    case 'Mid':
      return 'bg-[rgba(211,173,91,0.31)]';
    case 'High':
      return 'bg-[rgba(211,91,91,0.31)]';
    default:
      return 'bg-[rgba(157,211,91,0.56)]';
  }
};

export function PredictedResultsModal({
  isOpen,
  onClose,
  className,
  date,
  results,
  isLoading = false
}: PredictedResultsModalProps) {
  if (!isOpen) return null;

  const displayResults = results;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div className={`flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl ${className}`}>
        <div className='flex items-center justify-between border-b border-black/[0.18] px-6 py-6'>
          <div className='flex items-center gap-4'>
            <h2 className='text-[28px] font-bold text-black'>Predicted Results</h2>
            <span className='text-[14px] font-bold text-[#9D9D9D]'>{date}</span>
          </div>
          <Button
            color='gray'
            size='icon'
            variant='ghost'
            className='h-8 w-8 p-0 text-black'
            onClick={onClose}
          >
            <X className='h-5 w-5' />
          </Button>
        </div>

        <div className='flex-1 overflow-y-auto px-6 py-6'>
          {isLoading ? (
            <div className='flex h-[280px] flex-col items-center justify-center gap-3'>
              <div className='h-9 w-9 animate-spin rounded-full border-4 border-black/20 border-t-black' />
              <div className='text-[14px] font-semibold text-black/70'>Loading results...</div>
            </div>
          ) : displayResults.length === 0 ? (
            <div className='py-10 text-center text-[14px] text-black/60'>No prediction results available</div>
          ) : (
            <div className='space-y-2'>
              {displayResults.map((result, index) => (
              <div
                key={result.id}
                className={`relative rounded px-5 py-4 ${getRiskLevelColorClass(result.riskLevel)}`}
              >
                <div className='flex items-start gap-[30px]'>
                  <div className='flex w-[160px] shrink-0 self-center items-center gap-4'>
                    <div className={`text-[28px] font-bold leading-[42px] ${getRiskLevelNumberClass(result.riskLevel)}`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className='text-[16px] font-bold text-black'>{result.name}</div>
                      <div className='text-[12px] font-bold text-black'>{result.regNo}</div>
                    </div>
                  </div>

                  <div className='flex flex-1 self-center gap-[30px]'>
                    <div className='flex flex-col items-end gap-3'>
                      <div className='flex items-center gap-3'>
                        <span className='min-w-[97px] text-[12px] text-right font-bold text-black'>
                          Predicted Score
                        </span>
                        <div
                          className={`min-w-[79px] rounded-[2px] px-3 py-1 text-center text-[13px] font-bold ${getValueBgColorClass(result.riskLevel)} ${getValueColorClass(result.riskLevel)}`}
                        >
                          {result.predictedScore}
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span className='min-w-[97px] text-[12px] text-right font-bold text-black'>
                          Performance Category
                        </span>
                        <div
                          className={`min-w-[79px] rounded-[2px] px-3 py-1 text-center text-[13px] font-bold ${getValueBgColorClass(result.riskLevel)} ${getValueColorClass(result.riskLevel)}`}
                        >
                          {result.performanceCategory}
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-col items-end gap-3'>
                      <div className='flex items-center gap-3'>
                        <span className='min-w-[100px] text-[12px] text-right font-bold text-black'>
                          Pass Probability
                        </span>
                        <div
                          className={`min-w-[79px] rounded-[2px] px-3 py-1 text-center text-[13px] font-bold ${getValueBgColorClass(result.riskLevel)} ${getValueColorClass(result.riskLevel)}`}
                        >
                          {result.passProbability}
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span className='min-w-[100px] text-[12px] text-right font-bold text-black'>
                          Model Confidence
                        </span>
                        <div
                          className={`min-w-[79px] rounded-[2px] px-3 py-1 text-center text-[13px] font-bold ${getValueBgColorClass(result.riskLevel)} ${getValueColorClass(result.riskLevel)}`}
                        >
                          {result.modelConfidence}
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-row items-center gap-1'>
                      <span className='min-w-[60px] text-center text-[12px] font-bold text-black'>
                        Risk Level
                      </span>
                      <div
                        className={`flex h-[65px] min-w-[79px] items-center justify-center rounded-[2px] px-[22px] py-[14px] text-center text-[20px] font-bold ${getValueBgColorClass(result.riskLevel)} ${getValueColorClass(result.riskLevel)}`}
                      >
                        {result.riskLevel}
                      </div>
                    </div>

                    <div className='flex flex-1 flex-col gap-[2px]'>
                      <span className='text-[12px] font-bold text-black'>Suggestions:</span>
                      <div className='flex flex-col gap-[2px]'>
                        {result.suggestions.map((suggestion, idx) => (
                          <div key={idx} className={`text-[13px] font-bold ${getValueColorClass(result.riskLevel)}`}>
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
