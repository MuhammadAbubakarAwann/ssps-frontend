'use client';

interface RestaurantTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  counts: {
    total: number
    pending: number
    approved: number
    rejected: number
    disabled: number
  }
}

export function RestaurantTabs({ activeTab, onTabChange, counts }: RestaurantTabsProps) {
  const tabs = [
    { key: 'ALL', label: 'All', count: counts.total },
    { key: 'PENDING', label: 'Pending', count: counts.pending },
    { key: 'APPROVED', label: 'Approved', count: counts.approved },
    { key: 'REJECTED', label: 'Rejected', count: counts.rejected },
    { key: 'DISABLED', label: 'Disabled', count: counts.disabled }
  ];

  return (
    <div className='flex justify-between items-center pt-2 pb-0'>
      <nav className='flex gap-4 mx-auto'>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-2 px-1 pb-5 border-b-2 transition-all ${
                isActive
                  ? 'border-[#FABB17] text-[#FABB17] font-semibold'
                  : 'border-transparent text-[#6B7280] font-normal hover:text-[#4B5563]'
              }`}
            >
              <span className='text-sm capitalize'>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isActive
                      ? 'bg-[#FABB17] text-white'
                      : 'bg-[#E5E7EB] text-[#6B7280]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}