import { ContentLayout } from '@/components/sections/content-layout';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { OverviewStats } from '@/components/dashboard/overview-stats';
import { ClassOverview } from '@/components/dashboard/class-overview';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { PerformanceTrendChart } from '@/components/dashboard/performance-trend-chart';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Get user info from cookies since middleware already validated authentication
  const cookieStore = cookies();
  const userData = cookieStore.get('user_data')?.value;
  const user = userData ? JSON.parse(userData) : null;

  return (
    <ContentLayout userInfo={user} title='Dashboard'>
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href='/'>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className='font-semibold text-black'>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Section */}
        {/* <DashboardHero /> */}

        {/* Stats Grid */}
        <OverviewStats />

        {/* Trend Graph */}
        <PerformanceTrendChart />

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
          <ClassOverview />
          <RecentActivity />
        </div>
    </ContentLayout>
  );
}
