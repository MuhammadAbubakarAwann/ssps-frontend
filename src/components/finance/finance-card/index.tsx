import { TrendingUp, TrendingDown } from 'lucide-react';

interface FinanceCardProps {
  title: string;
  value: string;
  change?: number;
  isPositive?: boolean;
}

export function FinanceCard({ title, value, change, isPositive = true }: FinanceCardProps) {
  return (
    <div className='flex flex-col gap-3 p-5 bg-white border border-[#EDEDEB] rounded-[10px]'>
      <p className='text-[13px] font-normal text-[#4C515C] capitalize'>{title}</p>
      <div className='flex items-end justify-between'>
        <p className='text-[18px] font-bold text-[#2F2F2F]'>{value}</p>
        {change !== undefined && (
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
        )}
      </div>
    </div>
  );
}
