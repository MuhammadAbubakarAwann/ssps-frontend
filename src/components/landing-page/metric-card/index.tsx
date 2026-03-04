import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
}

export function MetricCard({ title, value, change }: MetricCardProps) {
  const isPositive = change >= 0;

  return (
    <div className='flex flex-col gap-3 py-7 px-5 bg-white border border-[#EDEDEB] '>
      <p className='text-[13px] font-normal text-[#4C515C] capitalize'>{title}</p>
      <div className='flex items-end justify-between'>
        <p className='text-[24px] font-bold text-[#2F2F2F]'>{value}</p>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-[16px] ${
            isPositive ? 'bg-[rgba(221,249,222,0.62)]' : 'bg-[#FFE0E0]'
          }`}
        >
          {isPositive ? (
            <TrendingUp className='w-3 h-3 text-[#34B837]' />
          ) : (
            <TrendingDown className='w-3 h-3 text-[#EC1717]' />
          )}
          <span
            className={`text-[13px] font-normal ${
              isPositive ? 'text-[#34B837]' : 'text-[#EC1717]'
            }`}
          >
            {isPositive ? '+' : ''}{change}%
          </span>
        </div>
      </div>
    </div>
  );
}
