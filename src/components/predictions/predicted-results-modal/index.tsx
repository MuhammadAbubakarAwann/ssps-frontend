'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
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

interface PredictedResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  classTitle?: string;
  date: string;
  results: StudentResult[];
  isLoading?: boolean;
}

const getRiskLevelColorClass = (riskLevel: 'Low' | 'Mid' | 'High') => {
  switch (riskLevel) {
    case 'Low':
      return 'bg-[#12B76A]/15';
    case 'Mid':
      return 'bg-[#FFD166]/15';
    case 'High':
      return 'bg-[#FF6369]/15';
    default:
      return 'bg-[#12B76A]/15';
  }
};

const getRiskLevelNumberClass = (riskLevel: 'Low' | 'Mid' | 'High') => {
  switch (riskLevel) {
    case 'Low':
      return 'text-[#3DD68C]';
    case 'Mid':
      return 'text-[#FFA30C]';
    case 'High':
      return 'text-[#FF8A8F]';
    default:
      return 'text-[#3DD68C]';
  }
};

const getValueColorClass = (riskLevel: 'Low' | 'Mid' | 'High') => {
  switch (riskLevel) {
    case 'Low':
      return 'text-[#3DD68C]';
    case 'Mid':
      return 'text-[#FFA30C]';
    case 'High':
      return 'text-[#FF8A8F]';
    default:
      return 'text-[#3DD68C]';
  }
};

const getValueBgColorClass = (riskLevel: 'Low' | 'Mid' | 'High') => {
  switch (riskLevel) {
    case 'Low':
      return 'bg-[#12B76A]/15';
    case 'Mid':
      return 'bg-[#FFD166]/15';
    case 'High':
      return 'bg-[#FF6369]/15';
    default:
      return 'bg-[#12B76A]/15';
  }
};

// Extracts a flat string list from either the old string[] or the new SuggestionsObject
function getSuggestionStrings(suggestions: SuggestionsObject | string[]): string[] {
  if (Array.isArray(suggestions)) return suggestions;
  return (
    suggestions.suggestions ||
    suggestions.nextSteps ||
    []
  );
}

export function PredictedResultsModal({
  isOpen,
  onClose,
  className,
  classTitle,
  date,
  results,
  isLoading = false
}: PredictedResultsModalProps) {
  if (!isOpen) return null;

  const displayResults = results;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-[#04050A]/80 backdrop-blur-sm p-4'
      onClick={onClose}
    >
      <div
        className={`flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-[#0A0C16] border border-white/10 shadow-2xl ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className='flex items-center justify-between border-b border-white/10 px-6 py-6'>
          <div className='flex items-center gap-4'>
            <div>
              <h2 className='text-[28px] font-bold text-fg-default'>Predicted Results</h2>
              {classTitle && (
                <p className='text-[16px] font-semibold text-fg-text'>{classTitle}</p>
              )}
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <span className='text-[14px] font-bold text-fg-text'>{date}</span>
            <Button
              color='gray'
              size='icon'
              variant='ghost'
              className='h-8 w-8 p-0 text-fg-default'
              onClick={onClose}
            >
              <X className='h-5 w-5' />
            </Button>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto px-6 py-6'>
          {isLoading ? (
            <div className='animate-pulse space-y-3'>
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className='glass-card p-4'>
                  <div className='flex items-center justify-between gap-4'>
                    <div className='space-y-2'>
                      <div className='h-4 w-32 rounded-full bg-white/[0.06]' />
                      <div className='h-3 w-24 rounded-full bg-white/[0.06]' />
                    </div>
                    <div className='h-7 w-16 rounded-full bg-white/[0.06]' />
                  </div>
                </div>
              ))}
            </div>
          ) : displayResults.length === 0 ? (
            <div className='py-10 text-center text-[14px] text-fg-text'>No prediction results available</div>
          ) : (
            <div className='space-y-2'>
              {displayResults.map((result, index) => (
              <div
                key={result.id}
                className={`relative rounded px-5 py-4 ${getRiskLevelColorClass(result.riskLevel)}`}
              >
                <div className='flex items-center gap-[30px]'>
                  <div className='flex w-[160px] shrink-0 self-center items-center gap-4'>
                    <div className={`text-[28px] font-bold leading-[42px] ${getRiskLevelNumberClass(result.riskLevel)}`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className='text-[16px] font-bold text-fg-default'>{result.name}</div>
                      <div className='text-[12px] font-bold text-fg-text'>{result.regNo}</div>
                    </div>
                  </div>

                  <div className='flex flex-1 self-center gap-[30px]'>
                    <div className='flex flex-col  self-center items-end gap-3'>
                      <div className='flex items-center gap-3'>
                        <span className='min-w-[97px] text-[12px] text-right font-bold text-fg-text'>
                          Predicted Score
                        </span>
                        <div
                          className={`min-w-[79px] rounded-[2px] px-3 py-1 text-center text-[13px] font-bold ${getValueBgColorClass(result.riskLevel)} ${getValueColorClass(result.riskLevel)}`}
                        >
                          {result.predictedScore}
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span className='min-w-[97px] text-[12px] text-right font-bold text-fg-text'>
                          Performance Category
                        </span>
                        <div
                          className={`min-w-[79px] rounded-[2px] px-3 py-1 text-center text-[13px] font-bold ${getValueBgColorClass(result.riskLevel)} ${getValueColorClass(result.riskLevel)}`}
                        >
                          {result.performanceCategory}
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-col  self-center items-end gap-3'>
                      <div className='flex items-center gap-3'>
                        <span className='min-w-[100px] text-[12px] text-right font-bold text-fg-text'>
                          Pass Probability
                        </span>
                        <div
                          className={`min-w-[79px] rounded-[2px] px-3 py-1 text-center text-[13px] font-bold ${getValueBgColorClass(result.riskLevel)} ${getValueColorClass(result.riskLevel)}`}
                        >
                          {result.passProbability}
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span className='min-w-[100px] text-[12px] text-right font-bold text-fg-text'>
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
                      <span className='min-w-[60px] text-center text-[12px] font-bold text-fg-text'>
                        Risk Level
                      </span>
                      <div
                        className={`flex h-[65px] min-w-[79px] items-center justify-center rounded-[2px] px-[22px] py-[14px] text-center text-[20px] font-bold ${getValueBgColorClass(result.riskLevel)} ${getValueColorClass(result.riskLevel)}`}
                      >
                        {result.riskLevel}
                      </div>
                    </div>

                    <div className='flex flex-1 flex-col gap-[2px]'>
                      <span className='text-[12px] font-bold text-fg-text'>Suggestions:</span>
                      <div className='flex flex-col gap-[0px]'>
                        {getSuggestionStrings(result.suggestions).map((suggestion, idx) => (
                          <div key={idx} className={`text-[11px] font-bold ${getValueColorClass(result.riskLevel)}`}>
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
