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

type DashboardClassMetrics = {
  class?: {
    id?: string;
    name?: string;
    programCode?: string;
    semester?: string;
    semesterNumber?: number;
    section?: string;
  } | null;
  totalStudents: number;
  totalAtRisk: number;
  averagePerformance: number;
  improvementRate: number;
  totalClassesCreatedByTeacher?: number;
};

interface OverviewStatsProps {
  metrics?: DashboardClassMetrics | null;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatPercentage(value: number): string {
  return `${Number.isFinite(value) ? value.toFixed(1) : '0.0'}%`;
}

export function OverviewStats({ metrics }: OverviewStatsProps) {
  const classMetrics = metrics ?? {
    class: null,
    totalStudents: 0,
    totalAtRisk: 0,
    averagePerformance: 0,
    improvementRate: 0,
    totalClassesCreatedByTeacher: 0
  };

  const stats: StatItem[] = [
    {
      label: 'Total Students',
      value: formatNumber(classMetrics.totalStudents),
      change: classMetrics.totalClassesCreatedByTeacher ? `+${formatNumber(classMetrics.totalClassesCreatedByTeacher)} classes` : 'class metrics',
      icon: FiUsers,
      color: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      label: 'Students at Risk',
      value: formatNumber(classMetrics.totalAtRisk),
      change: 'from current class data',
      icon: FiAlertCircle,
      color: 'bg-red-100',
      textColor: 'text-red-600'
    },
    {
      label: 'Avg Performance',
      value: formatPercentage(classMetrics.averagePerformance),
      change: 'current average',
      icon: FiBarChart2,
      color: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      label: 'Improvement Rate',
      value: formatPercentage(classMetrics.improvementRate),
      change: classMetrics.class?.name ? classMetrics.class.name : 'this semester',
      icon: FiTrendingUp,
      color: 'bg-purple-100',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className='space-y-4'>
      {classMetrics.class?.name && (
        <div className='inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200'>
          {classMetrics.class.name}
        </div>
      )}

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
}
