import { refreshAccessToken } from "@/lib/auth-service";
import { cookies } from "next/headers";
import type { UserInfo } from "@/@types";
import { ContentLayout } from "@/components/sections/content-layout";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { OverviewStats } from "@/components/dashboard/overview-stats";
import { ClassOverview } from "@/components/dashboard/class-overview/index";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PerformanceTrendChart } from "@/components/dashboard/performance-trend-chart";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

type DashboardMetricsResponse = {
  success?: boolean;
  message?: string;
  data?: {
    predictionMetrics?: {
      totalStudentsPredictedAtLeastOnce?: number;
      predictionAccuracy?: number;
      classesPredictionsDoneFor?: number;
    };
    classMetrics?: {
      class?: {
        id?: string;
        name?: string;
        programCode?: string;
        semester?: string;
        semesterNumber?: number;
        section?: string;
      };
      totalStudents?: number;
      totalAtRisk?: number;
      averagePerformance?: number;
      improvementRate?: number;
      totalClassesCreatedByTeacher?: number;
    };
    teacherMetrics?: {
      class?: {
        id?: string;
        name?: string;
        programCode?: string;
        semester?: string;
        semesterNumber?: number;
        section?: string;
      };
      totalStudents?: number;
      totalAtRisk?: number;
      averagePerformance?: number;
      improvementRate?: number;
      totalClassesCreatedByTeacher?: number;
    };
  };
};

type TeacherClassesOverviewResponse = {
  success?: boolean;
  message?: string;
  data?: {
    classes?: Array<{
      class?: {
        id?: string;
        name?: string;
        semester?: string;
        semesterNumber?: number;
        section?: string;
      };
      studentsEnrolled?: number;
      avgScore?: number;
      studentsAtRisk?: number;
      latestPrediction?: {
        id?: string;
        generatedAt?: string;
      };
      improvementRate?: number;
    }>;
    recentActivity?: Array<{
      type?: string;
      title?: string;
      description?: string;
      timestamp?: string;
      timeAgo?: string;
    }>;
  };
};

type DashboardClassItem = {
  id: string;
  name: string;
  students: number;
  avgScore: number;
  atRisk: number;
};

type DashboardRecentActivityItem = {
  id: number;
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
};

type DashboardRole = 'TEACHER' | 'STUDENT' | 'ADMIN';

const API_BASE_URL = process.env.BACKEND_API_URL || '';

function normalizeRole(role: unknown): DashboardRole {
  const value = String(role || '').trim().toUpperCase();
  if (value === 'STUDENT')
    return 'STUDENT';
  if (value === 'TEACHER')
    return 'TEACHER';

  return 'ADMIN';
}

function getEndpointCandidates(baseUrl: string, role: DashboardRole): string[] {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const endpoint = role === 'STUDENT'
    ? '/student/dashboard/metrics'
    : '/teacher/dashboard/metrics';

  const roleSegment = role === 'STUDENT' ? 'student' : 'teacher';
  const rolePath = endpoint.replace(new RegExp(`^/${roleSegment}`), '');
  const baseCandidates = [
    normalizedBase.replace(new RegExp(`/api/v1/${roleSegment}$`, 'i'), `/api/${roleSegment}`),
    normalizedBase.replace(/\/api\/v1$/i, '/api'),
    normalizedBase
  ];

  const candidates: string[] = [];
  for (const base of baseCandidates) {
    if (new RegExp(`/api/${roleSegment}$`, 'i').test(base))
      candidates.push(`${base}${rolePath}`);
    else
      candidates.push(`${base}${endpoint}`);
  }

  return [...new Set(candidates.filter(Boolean))];
}

function getTeacherEndpointCandidates(baseUrl: string, endpoint: string): string[] {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const teacherPath = endpoint.replace(/^\/teacher/, '');
  const baseCandidates = [
    normalizedBase.replace(/\/api\/v1\/teacher$/i, '/api/teacher'),
    normalizedBase.replace(/\/api\/v1$/i, '/api'),
    normalizedBase
  ];

  const candidates: string[] = [];
  for (const base of baseCandidates) {
    if (/\/api\/teacher$/i.test(base))
      candidates.push(`${base}${teacherPath}`);
    else
      candidates.push(`${base}${endpoint}`);
  }

  return [...new Set(candidates.filter(Boolean))];
}

function safeJsonParse(raw: string): DashboardMetricsResponse | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object')
      return parsed as DashboardMetricsResponse;

    return null;
  } catch {
    return null;
  }
}

function safeJsonParseOverview(raw: string): TeacherClassesOverviewResponse | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object')
      return parsed as TeacherClassesOverviewResponse;

    return null;
  } catch {
    return null;
  }
}

function normalizeNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function loadDashboardMetrics(role: unknown, accessToken: string) {
  try {
    if (!API_BASE_URL)
      return null;

    const normalizedRole = normalizeRole(role);
    const endpoints = getEndpointCandidates(API_BASE_URL, normalizedRole);
    let activeToken = accessToken;
    let didRefreshToken = false;
    let payload: DashboardMetricsResponse | null = null;

    for (let i = 0; i < endpoints.length; i += 1) {
      const response = await fetch(endpoints[i], {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        }
      });

      const raw = await response.text();
      const data = safeJsonParse(raw);

      if (response.ok && data?.success) {
        payload = data;
        break;
      }

      if ((response.status === 401 || response.status === 403) && !didRefreshToken) {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
          activeToken = refreshedToken;
          didRefreshToken = true;
          i -= 1;
          continue;
        }
      }
    }

    if (!payload?.success)
      return null;

    const data = payload.data;
    const scopedClassMetrics = data?.classMetrics || data?.teacherMetrics;

    return {
      predictionMetrics: {
        totalStudentsPredictedAtLeastOnce: normalizeNumber(data?.predictionMetrics?.totalStudentsPredictedAtLeastOnce),
        predictionAccuracy: normalizeNumber(data?.predictionMetrics?.predictionAccuracy),
        classesPredictionsDoneFor: normalizeNumber(data?.predictionMetrics?.classesPredictionsDoneFor)
      },
      classMetrics: {
        class: scopedClassMetrics?.class,
        totalStudents: normalizeNumber(scopedClassMetrics?.totalStudents),
        totalAtRisk: normalizeNumber(scopedClassMetrics?.totalAtRisk),
        averagePerformance: normalizeNumber(scopedClassMetrics?.averagePerformance),
        improvementRate: normalizeNumber(scopedClassMetrics?.improvementRate),
        totalClassesCreatedByTeacher: normalizeNumber(scopedClassMetrics?.totalClassesCreatedByTeacher)
      }
    };
  } catch {
    return null;
  }
}

function mapActivityType(type: string): 'success' | 'warning' | 'info' {
  if (type === 'PREDICTION_COMPLETED')
    return 'success';

  if (type === 'RISK_ALERT')
    return 'warning';

  return 'info';
}

async function loadTeacherClassesOverview(accessToken: string): Promise<{
  classes: DashboardClassItem[];
  recentActivity: DashboardRecentActivityItem[];
}> {
  try {
    if (!API_BASE_URL)
      return { classes: [], recentActivity: [] };

    const endpoints = getTeacherEndpointCandidates(API_BASE_URL, '/teacher/classes/overview');
    let activeToken = accessToken;
    let didRefreshToken = false;
    let payload: TeacherClassesOverviewResponse | null = null;

    for (let i = 0; i < endpoints.length; i += 1) {
      const response = await fetch(endpoints[i], {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        }
      });

      const raw = await response.text();
      const data = safeJsonParseOverview(raw);

      if (response.ok && data?.success) {
        payload = data;
        break;
      }

      if ((response.status === 401 || response.status === 403) && !didRefreshToken) {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
          activeToken = refreshedToken;
          didRefreshToken = true;
          i -= 1;
          continue;
        }
      }
    }

    if (!payload?.success)
      return { classes: [], recentActivity: [] };

    const classes = (payload.data?.classes || []).map((item, index) => ({
      id: String(item.class?.id || index),
      name: String(item.class?.name || 'Unknown Class'),
      students: normalizeNumber(item.studentsEnrolled),
      avgScore: normalizeNumber(item.avgScore),
      atRisk: normalizeNumber(item.studentsAtRisk)
    }));

    const recentActivity = (payload.data?.recentActivity || []).map((item, index) => ({
      id: index + 1,
      type: mapActivityType(String(item.type || '')),
      title: String(item.title || 'Activity'),
      description: String(item.description || ''),
      timestamp: String(item.timeAgo || item.timestamp || '')
    }));

    return { classes, recentActivity };
  } catch {
    return { classes: [], recentActivity: [] };
  }
}

export default async function DashboardPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('access_token')?.value || '';
  const userData = cookieStore.get('user_data')?.value;

  let user: UserInfo | null = null;
  if (userData) {
    try {
      user = JSON.parse(userData) as UserInfo;
    } catch {
      user = null;
    }
  }

  const metrics = user && accessToken
    ? await loadDashboardMetrics(user.role, accessToken)
    : null;

  const classesOverview = user && accessToken && normalizeRole(user.role) !== 'STUDENT'
    ? await loadTeacherClassesOverview(accessToken)
    : { classes: [], recentActivity: [] };

  return (
    <ContentLayout userInfo={user} title="Dashboard">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold">Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="space-y-6 py-4">
        {/* Hero Section */}
        <DashboardHero metrics={metrics?.predictionMetrics} />

        {/* Stats Grid */}
        <OverviewStats metrics={metrics?.classMetrics} />

        {/* Performance Trend Chart */}
        <div className="w-full">
          <PerformanceTrendChart />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-stretch">
          <div className="h-full">
            <ClassOverview classes={classesOverview.classes} />
          </div>
          <div className="h-full">
            <RecentActivity activities={classesOverview.recentActivity} />
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
