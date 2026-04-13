import { FiUsers, FiAlertCircle, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';
import { StatCard } from '../stat-card';
 
interface StatItem {
  label: string;
  value: string;
  change: string;
  icon: typeof FiUsers;
  color: string;
  textColor: string;
}

export function OverviewStats() {
  const stats: StatItem[] = [
    {
      label: 'Total Students',
      value: '245',
      change: '+12%',
      icon: FiUsers,
      color: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      label: 'Students at Risk',
      value: '28',
      change: '+4%',
      icon: FiAlertCircle,
      color: 'bg-red-100',
      textColor: 'text-red-600'
    },
    {
      label: 'Avg Performance',
      value: '76.5%',
      change: '+5.2%',
      icon: FiBarChart2,
      color: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      label: 'Improvement Rate',
      value: '+8.3%',
      change: 'this semester',
      icon: FiTrendingUp,
      color: 'bg-purple-100',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
