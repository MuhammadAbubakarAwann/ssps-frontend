import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface Activity {
  id: number;
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities?: Activity[];
}

export function RecentActivity({ activities = [] }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className='h-5 w-5 text-[#3DD68C]' />;
      case 'warning':
        return <AlertCircle className='h-5 w-5 text-[#FFD166]' />;
      case 'info':
        return <TrendingUp className='h-5 w-5 text-[#7FD0FF]' />;
      default:
        return null;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-[#12B76A]/[0.06] border border-[#12B76A]/20 hover:border-[#12B76A]/40';
      case 'warning':
        return 'bg-[#FFD166]/[0.06] border border-[#FFD166]/20 hover:border-[#FFD166]/40';
      case 'info':
        return 'bg-[#4FA6F8]/[0.06] border border-[#4FA6F8]/20 hover:border-[#4FA6F8]/40';
      default:
        return '';
    }
  };

  return (
    <div className='group glass-card glass-card-hover relative overflow-hidden p-6 transition-all duration-300'>
      <div className='absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-glow-purple/10 blur-3xl'></div>

      <div className='relative z-10 flex h-full flex-col'>
        <div className='mb-8 '>
          <h2 className='text-2xl font-bold text-fg-default flex items-center gap-3'>
            <div className='h-2 w-2 rounded-full bg-gradient-to-r from-glow-blue to-glow-cyan'></div>
            Recent Activity
          </h2>
          <p className='mt-1 text-xs text-fg-text'>
            Watch Recent Activities
          </p>
        </div>
        <div className='space-y-3'>
          {activities.length === 0 ? (
            <div className='rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center text-sm text-fg-text'>
              No recent activity available.
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className={`group relative cursor-pointer overflow-hidden rounded-xl p-5 transition-all duration-300 ${getBgColor(activity.type)}`}
              >
                <div
                  className={`absolute bottom-0 left-0 top-0 w-1 transition-all duration-300 group-hover:w-1.5 ${
                    activity.type === 'success'
                      ? 'bg-gradient-to-b from-[#12B76A] to-[#3DD68C]'
                      : activity.type === 'warning'
                        ? 'bg-gradient-to-b from-[#FFA30C] to-[#FFD166]'
                        : 'bg-gradient-to-b from-[#4FA6F8] to-[#7FD0FF]'
                  }`}
                ></div>

                <div className='flex gap-4 pl-2'>
                  <div className='mt-0.5 flex-shrink-0'>
                    {getIcon(activity.type)}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-bold text-fg-default'>
                      {activity.title}
                    </p>
                    <p className='mt-1.5 line-clamp-2 text-xs text-fg-text'>
                      {activity.description}
                    </p>
                    <p className='mt-2 text-xs font-medium text-fg-text'>
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
