'use client';

import { KPICardsSection } from './kpi-cards-section';
import { RevenueOverviewSection } from './revenue-overview-section';
import { EarningsByCategorySection } from './earnings-by-category-section';
import { EarningsByUserTypeSection } from './earnings-by-category-type-section';
import { TopPerformersSection } from './top performers-section';
import { TransactionHistorySection } from './transaction-history-section';

export function Finance() {
  return (
    <div className='flex flex-col gap-4 w-full pb-6 pt-4'>


      {/* KPI Cards */}
      <KPICardsSection />

      {/* Revenue Overview */}
      <RevenueOverviewSection />

      {/* Charts Row */}
      <div className='grid grid-cols-2 gap-4'>
        <EarningsByCategorySection />
        <EarningsByUserTypeSection />
      </div>

      {/* Top Performers */}
      <TopPerformersSection  />

      {/* Transaction History */}
      <TransactionHistorySection />
    </div>
  );
}
