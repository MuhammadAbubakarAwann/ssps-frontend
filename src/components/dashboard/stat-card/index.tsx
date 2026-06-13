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
    <div className='group glass-card glass-card-hover relative overflow-hidden p-6 transition-all duration-300'>
      {/* Decorative blur accent */}
      <div className='absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#4FA6F8]/10 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-300'></div>

      <div className='relative z-10'>
        {/* Label and Icon */}
        <div className='flex items-start justify-between'>
          <p className='text-xs font-bold uppercase tracking-widest text-fg-text'>
            {label}
          </p>
          <div
            className={`${color} rounded-xl p-3 group-hover:scale-110 transition-all duration-300`}
          >
            <Icon className={`h-6 w-6 ${textColor}`} />
          </div>
        </div>

        <h3 className='text-4xl font-bold text-fg-default mb-2'>{value}</h3>
      </div>
    </div>
  );
}
