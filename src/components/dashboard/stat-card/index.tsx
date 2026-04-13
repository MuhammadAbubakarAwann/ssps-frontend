import { IconType } from 'react-icons';

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  icon: IconType;
  color: string;
  textColor: string;
}

export function StatCard({ label, value, change, icon: Icon, color, textColor }: StatCardProps) {
  return (
    <div className='flex flex-col items-center justify-center gap-4 rounded-[10px] border border-black/20 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md'>
      <div className={`rounded-[10px] ${color} flex h-12 w-12 items-center justify-center flex-shrink-0`}>
        <Icon className={`h-6 w-6 ${textColor}`} />
      </div>
      
      <div className='flex flex-col items-center justify-center'>
        <p className='text-sm font-medium text-black/60'>{label}</p>
        <div className='mt-1 flex items-baseline justify-center gap-2'>
          <h3 className='text-2xl font-bold text-black'>{value}</h3>
          <span className='text-sm font-medium text-green-600'>
            {change}
          </span>
        </div>
      </div>
    </div>
  );
}
