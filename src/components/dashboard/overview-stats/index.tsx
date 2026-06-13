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
      color: 'bg-[#4FA6F8]/15',
      textColor: 'text-[#7FD0FF]'
    },
    {
      label: 'Students at Risk',
      value: formatNumber(classMetrics.totalAtRisk),
      change: 'from current class data',
      icon: FiAlertCircle,
      color: 'bg-[#FF6369]/15',
      textColor: 'text-[#FF8A8F]'
    },
    {
      label: 'Avg Performance',
      value: formatPercentage(classMetrics.averagePerformance),
      change: 'current average',
      icon: FiBarChart2,
      color: 'bg-[#12B76A]/15',
      textColor: 'text-[#3DD68C]'
    },
    {
      label: 'Improvement Rate',
      value: formatPercentage(classMetrics.improvementRate),
      change: classMetrics.class?.name ? classMetrics.class.name : 'this semester',
      icon: FiTrendingUp,
      color: 'bg-[#8F008D]/20',
      textColor: 'text-[#E69BFF]'
    }
  ];

  return (
    <div className='space-y-4'>
      {classMetrics.class?.name && (
        <div className='glass-card inline-flex items-center px-4 py-2 text-sm font-semibold text-fg-default'>
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
