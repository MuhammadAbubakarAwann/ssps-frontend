import { IconType } from 'react-icons';

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  icon: IconType;
  color: string;
  textColor: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  textColor
}: StatCardProps) {

  return (
    <div className='group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white p-6 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all duration-300'>
      {/* Animated gradient background on hover */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

      {/* Decorative blur accent */}
      <div className='absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-blue-100 to-transparent opacity-0 group-hover:opacity-30 blur-3xl transition-opacity duration-300'></div>

      <div className='relative z-10'>
        {/* Label and Icon */}
        <div className='flex items-start justify-between'>
          <p className='text-xs font-bold uppercase tracking-widest text-gray-500'>
            {label}
          </p>
          <div
            className={`${color} rounded-xl p-3 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}
          >
            <Icon className={`h-6 w-6 ${textColor}`} />
          </div>
        </div>

          <h3 className='text-4xl font-bold text-gray-900 mb-2'>{value}</h3>

       
      </div>
    </div>
  );
}
