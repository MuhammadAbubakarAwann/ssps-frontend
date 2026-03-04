import { FiUser, FiArrowRight } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface ApprovalItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface PendingRider {
  id: string;
  name: string;
  email: string;
  underReviewSince: string;
}

interface PendingRestaurant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface ApprovalListsProps {
  pendingRiders: PendingRider[];
  pendingRestaurants: PendingRestaurant[];
}

function ListCard({
  title,
  items,
  showArrow = false,
  onItemClick,
  onSeeAll
}: {
  title: string;
  items: ApprovalItem[];
  showArrow?: boolean;
  onItemClick?: (item: ApprovalItem) => void;
  onSeeAll?: () => void;
}) {
  const router = useRouter();
  return (
    <div className='flex flex-col gap-4 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
      <div className='flex items-center justify-between'>
        <h2 className='text-[15px] font-medium text-[#3F4956] capitalize'>{title}</h2>
        <button
          onClick={(e) => {
            e.preventDefault();
            onSeeAll?.();
          }}
          className='text-[14px] font-semibold text-[#FABB17] capitalize'
        >
          See All
        </button>
      </div>

      <div className='flex flex-col gap-4 max-h-96 overflow-y-auto'>
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
             className={`flex items-center justify-between border rounded-[10px] p-4 border-b border-[#EDEDEB] hover:bg-[#FABB17]/10 transition-colors ${
                onItemClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onItemClick?.(item)}
            >
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-[#F0F0F0] flex items-center justify-center text-sm'>
                  <FiUser className='w-4 h-4 text-[#6B7280]' />
                </div>
                <div>
                  <p className='text-[13px] font-medium text-[#1F2937] capitalize'>
                    {item.name}
                  </p>
                  <p className='text-[12px] text-[#6B7280] lowercase'>{item.email}</p>
                </div>
              </div>
              {showArrow ? (
                <button className='p-1.5 hover:bg-gray-100 rounded transition-colors'>
                  <FiArrowRight className='w-4 h-4 text-[#6B7280]' />
                </button>
              ) : (
                <button className='px-4 py-1.5 bg-[#1F2937] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#2d2d2d] transition-colors'>
                  Review
                </button>
              )}
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center gap-3 py-8 text-center'>
            <div className='w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center'>
              <FiUser className='w-6 h-6 text-[#9CA3AF]' />
            </div>
            <div>
              <p className='font-medium text-[#374151] text-sm'>No pending requests</p>
              <p className='text-xs text-[#6B7280] mt-1'>
                {title.toLowerCase().includes('rider') ? 'All riders have been processed.' : 'All restaurants have been processed.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApprovalLists({ pendingRiders, pendingRestaurants }: ApprovalListsProps) {
  const router = useRouter();
  
  const restaurants: ApprovalItem[] = pendingRestaurants.map((r) => ({
    id: r.id,
    name: `${r.firstName} ${r.lastName}`,
    email: r.email,
    avatar: '' // Will use FiUser icon
  }));

  const riders: ApprovalItem[] = pendingRiders.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    avatar: '' // Will use FiUser icon
  }));

  const handleRiderClick = (rider: ApprovalItem) => {
    router.push('/riders?tab=PENDING');
  };

  const handleRestaurantClick = (restaurant: ApprovalItem) => {
    router.push('/restaurants?tab=PENDING');
  };

  return (
    <div className='grid grid-cols-2 gap-4'>
      <ListCard 
        title={`restaurants Needing Approval (${restaurants.length.toString().padStart(2, '0')})`} 
        items={restaurants} 
        onItemClick={handleRestaurantClick}
        onSeeAll={() => router.push('/restaurants?tab=PENDING')}
      />
      <ListCard 
        title='riders Awaiting Approval' 
        items={riders} 
        showArrow 
        onItemClick={handleRiderClick}
        onSeeAll={() => router.push('/riders?tab=PENDING')}
      />
    </div>
  );
}
