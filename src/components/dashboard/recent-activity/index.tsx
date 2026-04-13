import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface Activity {
  id: number;
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
}

export function RecentActivity() {
  const activities: Activity[] = [
    {
      id: 1,
      type: 'success',
      title: 'Prediction Completed',
      description: '8th Semester (Section A) - 42 students analyzed',
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      type: 'warning',
      title: '4 Students At Risk',
      description: 'Alert: Declining performance detected in Class 8B',
      timestamp: '5 hours ago',
    },
    {
      id: 3,
      type: 'info',
      title: 'Performance Improved',
      description: 'Class 7A showing +8.5% improvement this semester',
      timestamp: '1 day ago',
    },
    {
      id: 4,
      type: 'success',
      title: 'Report Generated',
      description: 'Semester comparison report ready for download',
      timestamp: '2 days ago',
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-l-4 border-green-600';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-600';
      case 'info':
        return 'bg-blue-50 border-l-4 border-blue-600';
      default:
        return '';
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-bold text-gray-900">Recent Activity</h2>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`flex gap-4 rounded p-4 ${getBgColor(activity.type)}`}
          >
            <div className="flex-shrink-0">{getIcon(activity.type)}</div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <p className="mt-1 text-xs text-gray-500">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
