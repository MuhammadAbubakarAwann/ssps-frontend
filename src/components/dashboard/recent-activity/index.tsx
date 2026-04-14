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
        return <CheckCircle className='h-5 w-5 text-green-600' />;
      case 'warning':
        return <AlertCircle className='h-5 w-5 text-yellow-600' />;
      case 'info':
        return <TrendingUp className='h-5 w-5 text-blue-600' />;
      default:
        return null;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-50/80 to-emerald-50/40 border border-green-200/50 hover:border-green-300';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-50/80 to-amber-50/40 border border-yellow-200/50 hover:border-yellow-300';
      case 'info':
        return 'bg-gradient-to-r from-blue-50/80 to-cyan-50/40 border border-blue-200/50 hover:border-blue-300';
      default:
        return '';
    }
  };

  return (
    <div className='group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white shadow-sm hover:shadow-2xl p-6 hover:border-blue-200 transition-all duration-300'>
      <div className='absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-gradient-to-tr from-blue-100 to-transparent opacity-20 blur-3xl'></div>

      <div className='relative z-10 flex h-full flex-col'>
        <div className='mb-8 '>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-3'>
            <div className='h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500'></div>
            Recent Activity
          </h2>
          <p className='mt-1 text-xs text-gray-500'>
            Watch Recent Activities
          </p>
        </div>
        <div className='space-y-3'>
          {activities.length === 0 ? (
            <div className='rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500'>
              No recent activity available.
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className={`group relative cursor-pointer overflow-hidden rounded-xl p-5 transition-all duration-300 hover:shadow-lg ${getBgColor(activity.type)}`}
              >
                <div
                  className={`absolute bottom-0 left-0 top-0 w-1 transition-all duration-300 group-hover:w-1.5 ${
                    activity.type === 'success'
                      ? 'bg-gradient-to-b from-green-400 to-emerald-500'
                      : activity.type === 'warning'
                        ? 'bg-gradient-to-b from-yellow-400 to-amber-500'
                        : 'bg-gradient-to-b from-blue-400 to-cyan-500'
                  }`}
                ></div>

                <div className='flex gap-4 pl-2'>
                  <div className='mt-0.5 flex-shrink-0'>
                    {getIcon(activity.type)}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-bold text-gray-900'>
                      {activity.title}
                    </p>
                    <p className='mt-1.5 line-clamp-2 text-xs text-gray-600'>
                      {activity.description}
                    </p>
                    <p className='mt-2 text-xs font-medium text-gray-500'>
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
