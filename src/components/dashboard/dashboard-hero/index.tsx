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
    <div className='glass-card relative overflow-hidden p-8 md:p-12 shadow-[0_0_60px_rgba(79,166,248,0.1)]'>
      {/* Glow accents */}
      <div className='absolute -right-32 -top-32 h-64 w-64 rounded-full bg-glow-blue opacity-20 blur-[110px]'></div>
      <div className='absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-glow-purple opacity-20 blur-[120px]'></div>

      <div className='relative z-10 max-w-3xl'>
        {/* Badge */}
        <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-glow-blue/30 bg-glow-blue/10 px-4 py-2 backdrop-blur-sm'>
          <Sparkles size={16} className='text-glow-cyan' />
          <span className='text-sm font-semibold text-glow-cyan'>AI-Powered Predictions</span>
        </div>

        {/* Heading */}
        <h1 className='text-4xl md:text-5xl font-bold text-fg-default leading-tight'>
          Student Performance at a Glance
        </h1>

        {/* Description */}
        <p className='mt-4 text-lg text-fg-text max-w-2xl'>
          Leverage AI-powered insights to identify at-risk students, track performance trends, and make data-driven decisions to enhance academic outcomes.
        </p>

        {/* CTA Buttons */}
        <div className='mt-4 flex flex-wrap gap-4'>
          <Link href='/predictions'>
            <Button
              color='primary'
              size='medium'
              variant='solid'
              className='gap-2 font-semibold px-8 py-6 text-base shadow-[0_0_30px_rgba(79,166,248,0.35)] hover:shadow-[0_0_45px_rgba(79,166,248,0.55)] transition-all'
            >
              Create Prediction
              <ArrowRight size={20} />
            </Button>
          </Link>

          <Link href='/student-details'>
            <Button
              color='primary'
              size='medium'
              variant='surface'
              className='gap-2 font-semibold px-8 py-6 text-base transition-all'
            >
              View Analytics
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className='mt-6 flex gap-8'>
          <div className='flex flex-col'>
            <p className='text-3xl font-bold text-fg-default'>{formatNumber(predictionMetrics.totalStudentsPredictedAtLeastOnce)}</p>
            <p className='text-sm text-fg-text'>Students Analyzed</p>
          </div>
          <div className='flex flex-col'>
            <p className='text-3xl font-bold text-fg-default'>{formatPercentage(predictionMetrics.predictionAccuracy)}</p>
            <p className='text-sm text-fg-text'>Prediction Accuracy</p>
          </div>
          <div className='flex flex-col'>
            <p className='text-3xl font-bold text-fg-default'>{formatNumber(predictionMetrics.classesPredictionsDoneFor)}</p>
            <p className='text-sm text-fg-text'>Classes Monitored</p>
          </div>
        </div>
      </div>
    </div>
  );
}
