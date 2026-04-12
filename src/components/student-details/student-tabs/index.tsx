interface StudentTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function StudentTabs({ activeTab, setActiveTab }: StudentTabsProps) {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'performance', label: 'Performance' },
    { id: 'predictions', label: 'Predictions' },
    { id: 'recommendations', label: 'Recommendations' }
  ];

  return (
    <div className='flex flex-col gap-4'>
      {/* Tab Buttons */}
      <div className='flex gap-5 border-b border-black/30'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`bg-transparent px-[17px] py-[5px] text-lg font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'border-b-2 border-black text-black'
                : 'border-b-2 border-transparent text-black/55'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
