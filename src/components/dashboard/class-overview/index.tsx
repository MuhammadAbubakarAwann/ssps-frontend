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
    <div className='group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-2xl'>
      <div className='absolute -right-32 -top-32 h-64 w-64 rounded-full bg-gradient-to-br from-blue-100 to-transparent opacity-20 blur-3xl'></div>

      <div className='relative z-10'>
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>Class Overview</h2>
            <p className='mt-1 text-xs text-gray-500'>Monitor performance across your classes</p>
          </div>
          <Link href='/predictions' className='flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700'>
            View All
            <ChevronRight size={18} />
          </Link>
        </div>

        <div className='space-y-4'>
          {classes.length === 0 ? (
            <div className='rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500'>
              No class overview data available.
            </div>
          ) : (
            classes.map((cls) => (
              <Link key={cls.id} href='/predictions' className='block'>
                <div className='group relative overflow-hidden rounded-xl border border-gray-200/50 bg-gradient-to-br from-white to-gray-50/30 p-6 transition-all duration-300 hover:border-blue-300 hover:shadow-md'>
                  <div className='absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>

                  <div className='relative z-10 flex items-center justify-between'>
                    <div className='flex-1'>
                      <p className='text-lg font-bold text-gray-900'>{cls.name}</p>
                      <p className='mt-1 text-sm text-gray-500'>{cls.students} students enrolled</p>
                    </div>

                    <div className='ml-6 flex gap-8'>
                      <div className='text-right'>
                        <p className='text-xs font-bold uppercase tracking-wide text-gray-500'>Avg Score</p>
                        <p className='mt-1 text-3xl font-bold text-blue-600'>{cls.avgScore}%</p>
                      </div>
                      <div className='text-right'>
                        <p className='text-xs font-bold uppercase tracking-wide text-gray-500'>At Risk</p>
                        <p className='mt-1 text-3xl font-bold text-red-500'>{cls.atRisk}</p>
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
