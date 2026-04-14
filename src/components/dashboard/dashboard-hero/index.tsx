import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type DashboardPredictionMetrics = {
  totalStudentsPredictedAtLeastOnce: number;
  predictionAccuracy: number;
  classesPredictionsDoneFor: number;
};

interface DashboardHeroProps {
  metrics?: DashboardPredictionMetrics | null;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatPercentage(value: number): string {
  return `${Number.isFinite(value) ? value.toFixed(1) : '0.0'}%`;
}

export function DashboardHero({ metrics }: DashboardHeroProps) {
  const predictionMetrics = metrics ?? {
    totalStudentsPredictedAtLeastOnce: 0,
    predictionAccuracy: 0,
    classesPredictionsDoneFor: 0
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 p-8 md:p-12 shadow-lg">
      {/* Animated background elements */}
      <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
      <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-white opacity-5 blur-3xl"></div>
      
      <div className="relative z-10 max-w-3xl">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
          <Sparkles size={16} className="text-white" />
          <span className="text-sm font-semibold text-white">AI-Powered Predictions</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
          Student Performance at a Glance
        </h1>
        
        {/* Description */}
        <p className="mt-4 text-lg text-blue-100 max-w-2xl">
          Leverage AI-powered insights to identify at-risk students, track performance trends, and make data-driven decisions to enhance academic outcomes.
        </p>
        
        {/* CTA Buttons */}
        <div className="mt-4 flex flex-wrap gap-4">
          <Link href='/predictions'>
            <Button
              color='primary'
              size='medium'
              variant="solid"
              className="gap-2   font-semibold  px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all"
            >
              Create Prediction
              <ArrowRight size={20} />
            </Button>
          </Link>

          <Link href='/student-details'>
            <Button
              color='primary'
              size='medium'
              variant="solid"
              className="gap-2    font-semibold  px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all"
            >
              View Analytics
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="mt-6 flex gap-8">
          <div className="flex flex-col">
            <p className="text-3xl font-bold text-white">{formatNumber(predictionMetrics.totalStudentsPredictedAtLeastOnce)}</p>
            <p className="text-sm text-blue-100">Students Analyzed</p>
          </div>
          <div className="flex flex-col">
            <p className="text-3xl font-bold text-white">{formatPercentage(predictionMetrics.predictionAccuracy)}</p>
            <p className="text-sm text-blue-100">Prediction Accuracy</p>
          </div>
          <div className="flex flex-col">
            <p className="text-3xl font-bold text-white">{formatNumber(predictionMetrics.classesPredictionsDoneFor)}</p>
            <p className="text-sm text-blue-100">Classes Monitored</p>
          </div>
        </div>
      </div>
    </div>
  );
}
