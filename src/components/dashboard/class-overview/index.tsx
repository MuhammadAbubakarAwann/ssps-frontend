import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

type ClassOverviewItem = {
  id: string;
  name: string;
  students: number;
  avgScore: number;
  atRisk: number;
};

interface ClassOverviewProps {
  classes?: ClassOverviewItem[];
}

export function ClassOverview({ classes = [] }: ClassOverviewProps) {

  return (
    <div className='group glass-card glass-card-hover relative overflow-hidden p-6 transition-all duration-300'>
      <div className='absolute -right-32 -top-32 h-64 w-64 rounded-full bg-glow-blue/10 blur-3xl'></div>

      <div className='relative z-10'>
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-fg-default'>Class Overview</h2>
            <p className='mt-1 text-xs text-fg-text'>Monitor performance across your classes</p>
          </div>
          <Link href='/predictions' className='flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-[#7FD0FF] transition-colors hover:bg-[#4FA6F8]/10 hover:text-[#9FE0FF]'>
            View All
            <ChevronRight size={18} />
          </Link>
        </div>

        <div className='space-y-4'>
          {classes.length === 0 ? (
            <div className='rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center text-sm text-fg-text'>
              No class overview data available.
            </div>
          ) : (
            classes.map((cls) => (
              <Link key={cls.id} href='/predictions' className='block'>
                <div className='group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:border-[#4FA6F8]/30 hover:bg-white/[0.05]'>
                  <div className='relative z-10 flex items-center justify-between'>
                    <div className='flex-1'>
                      <p className='text-lg font-bold text-fg-default'>{cls.name}</p>
                      <p className='mt-1 text-sm text-fg-text'>{cls.students} students enrolled</p>
                    </div>

                    <div className='ml-6 flex gap-8'>
                      <div className='text-right'>
                        <p className='text-xs font-bold uppercase tracking-wide text-fg-text'>Avg Score</p>
                        <p className='mt-1 text-3xl font-bold text-[#7FD0FF]'>{cls.avgScore}%</p>
                      </div>
                      <div className='text-right'>
                        <p className='text-xs font-bold uppercase tracking-wide text-fg-text'>At Risk</p>
                        <p className='mt-1 text-3xl font-bold text-[#FF8A8F]'>{cls.atRisk}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
