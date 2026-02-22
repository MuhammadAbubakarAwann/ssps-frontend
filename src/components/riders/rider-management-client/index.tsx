'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { RiderTabs } from '@/components/riders/rider-tabs';
import { SearchBar } from '@/components/orders/search-bar';
import { RiderStatusBadge } from '@/components/riders/status-badges';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { fetchRiders, fetchRiderStatsOnly, approveRider, rejectRider, disableRider, enableRider } from '@/lib/server-actions/rider-actions';
import type { Rider } from '@/types/rider';
import { riderCache } from '@/lib/utils/cache-manager';
import { RiderActionsMenu } from '@/components/riders/rider-actions-menu';
import { toast } from 'sonner';

// Table configuration
const TABLE_COLUMNS = [
  { key: 'riderName', label: 'Rider Name' },
  { key: 'riderId', label: 'Rider ID', className: '' },
  { key: 'phoneNumber', label: 'Phone Number', className: '' },
  { key: 'email', label: 'Email Address', className: '' },
  { key: 'address', label: 'Address', className: '' },
  { key: 'vehicleType', label: 'Vehicle Type', className: '' },
  { key: 'licenseNumber', label: 'License Number', className: '' },
  { key: 'status', label: 'Status', className: '' },
  { key: 'registrationDate', label: 'Registration Date', className: '' },
  { key: 'actions', label: 'Actions', className: 'text-right' }
];

const COLUMN_COUNT = TABLE_COLUMNS.length;

// Reusable styling constants
const TABLE_STYLES = {
  header: 'text-[#534E43] font-semibold text-xs uppercase py-4 px-6 whitespace-nowrap',
  cell: 'text-sm text-[#65656A] py-4 px-6 whitespace-nowrap',
  row: 'border-b border-[#F2F0EA] hover:bg-[#FFF9E8] transition-colors'
};

// Reusable components
const TableHeaderCell = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <TableHead className={`${TABLE_STYLES.header} ${className}`}>
    {children}
  </TableHead>
);

const TableDataCell = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent<HTMLTableCellElement>) => void }) => (
  <TableCell className={`${TABLE_STYLES.cell} ${className}`} onClick={onClick}>
    {children}
  </TableCell>
);

const PaginationButton = ({
  onClick,
  disabled,
  children,
  className = ''
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
  className?: string
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-row justify-center items-center px-3.5 py-2 gap-2 h-9 bg-white border border-[#D0D5DD] shadow-sm rounded-[8px] font-medium text-sm leading-5 ${
      disabled
        ? 'text-[#D0D5DD] cursor-not-allowed opacity-50'
        : 'text-[#344054] cursor-pointer hover:bg-gray-50'
    } ${className}`}
  >
    {children}
  </button>
);

export default function RiderManagementClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    disabled: 0
  });
  const [totalPages, setTotalPages] = useState(1);

  // Fetch data when component mounts or when filters change
  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      // If searching, always fetch fresh data
      const isSearching = searchQuery.trim() !== '';

      if (isSearching) {
        setLoading(true);
        try {
          const result = await fetchRiders({
            tab: activeTab as any,
            search: searchQuery,
            page: currentPage,
            limit: 10,
            includeStats: false
          });

          if (!isCancelled) {
            setRiders(result.riders);
            setTotalPages(result.totalPages);
          }
        } catch (error) {
          if (!isCancelled) {
            console.error('Error fetching riders:', error);
            setRiders([]);
          }
        } finally {
          if (!isCancelled)
            setLoading(false);

        }
        return;
      }

      // For non-search requests, check persistent cache first
      const cacheKey = `${activeTab}_${currentPage}`;
      const cachedData = riderCache.getData<{
        riders: Rider[];
        totalPages: number;
      }>(cacheKey);

      // Use cached data if available
      if (cachedData) {
        setRiders(cachedData.riders);
        setTotalPages(cachedData.totalPages);
        setLoading(false);
        return;
      }

      // Fetch fresh data
      setLoading(true);
      try {
        const cachedStats = riderCache.getStats();
        const needStats = !cachedStats;

        const result = await fetchRiders({
          tab: activeTab as any,
          page: currentPage,
          limit: 10,
          includeStats: needStats
        });

        if (!isCancelled) {
          setRiders(result.riders);
          setTotalPages(result.totalPages);

          // Update persistent cache
          riderCache.setData(cacheKey, {
            riders: result.riders,
            totalPages: result.totalPages
          });

          // Update stats if we got them
          if (result.counts) {
            setCounts(result.counts);
            riderCache.setStats(result.counts);
          }
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching riders:', error);
          setRiders([]);
        }
      } finally {
        if (!isCancelled)
          setLoading(false);

      }
    };

    void fetchData();

    return () => {
      isCancelled = true;
    };
  }, [activeTab, searchQuery, currentPage]);

  // Reset page to 1 when search query or active tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Load initial stats if not cached
  useEffect(() => {
    const loadInitialStats = async () => {
      const cachedStats = riderCache.getStats() as typeof counts | null;

      if (cachedStats)
        setCounts(cachedStats);
      else
        try {
          const stats = await fetchRiderStatsOnly();
          setCounts(stats);
          riderCache.setStats(stats);
        } catch (error) {
          console.error('Error fetching initial stats:', error);
        }
    };

    void loadInitialStats();
  }, []); // Run once on mount

  // API handles pagination, use totalPages from server
  const currentRiders = riders; // API already returns the correct page

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages)
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
     else if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pageNumbers.push(i);
      pageNumbers.push('...');
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pageNumbers.push(1);
      pageNumbers.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      pageNumbers.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++)
        pageNumbers.push(i);
      pageNumbers.push('...');
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const handleApprove = async (id: string) => {
    try {
      await approveRider(id);

      // Update local state optimistically
      setRiders(prevRiders => {
        const updatedRiders = prevRiders.map(rider => {
          if (rider.id === id) {
            const updatedRider: Rider = { ...rider, status: 'APPROVED' as const };
            return updatedRider;
          }
          return rider;
        });

        // Update cache with new data
        const cacheKey = `${activeTab}_${currentPage}`;
        riderCache.setData(cacheKey, {
          riders: updatedRiders,
          totalPages: totalPages
        });

        return updatedRiders;
      });

      // Update counts
      setCounts(prevCounts => {
        const newCounts = {
          ...prevCounts,
          pending: Math.max(0, prevCounts.pending - 1),
          approved: prevCounts.approved + 1
        };

        // Update stats cache
        riderCache.setStats(newCounts);

        return newCounts;
      });

      toast.success('Rider approved successfully!');
    } catch (error) {
      console.error('Error approving rider:', error);
      toast.error('Failed to approve rider. Please try again.');
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await rejectRider(id, reason);

      // Update local state optimistically
      setRiders(prevRiders => {
        const updatedRiders = prevRiders.map(rider =>
          rider.id === id
            ? { ...rider, status: 'REJECTED' as const }
            : rider
        );

        // Update cache with new data
        const cacheKey = `${activeTab}_${currentPage}`;
        riderCache.setData(cacheKey, {
          riders: updatedRiders,
          totalPages: totalPages
        });

        return updatedRiders;
      });

      // Update counts
      setCounts(prevCounts => {
        const newCounts = {
          ...prevCounts,
          pending: Math.max(0, prevCounts.pending - 1),
          rejected: prevCounts.rejected + 1
        };

        // Update stats cache
        riderCache.setStats(newCounts);

        return newCounts;
      });

      toast.success('Rider rejected successfully!');
    } catch (error) {
      console.error('Error rejecting rider:', error);
      toast.error('Failed to reject rider. Please try again.');
    }
  };

  const handleDisable = async (id: string) => {
    try {
      await disableRider(id);

      // Update local state optimistically
      setRiders(prevRiders => {
        const updatedRiders = prevRiders.map(rider =>
          rider.id === id
            ? { ...rider, status: 'DISABLED' as const }
            : rider
        );

        // Update cache with new data
        const cacheKey = `${activeTab}_${currentPage}`;
        riderCache.setData(cacheKey, {
          riders: updatedRiders,
          totalPages: totalPages
        });

        return updatedRiders;
      });

      // Update counts
      setCounts(prevCounts => {
        const newCounts = {
          ...prevCounts,
          approved: Math.max(0, prevCounts.approved - 1),
          disabled: prevCounts.disabled + 1
        };

        // Update stats cache
        riderCache.setStats(newCounts);

        return newCounts;
      });

      toast.success('Rider disabled successfully!');
    } catch (error) {
      console.error('Error disabling rider:', error);
      toast.error('Failed to disable rider. Please try again.');
    }
  };

  const handleEnable = async (id: string) => {
    try {
      await enableRider(id);

      // Update local state optimistically
      setRiders(prevRiders => {
        const updatedRiders = prevRiders.map(rider =>
          rider.id === id
            ? { ...rider, status: 'APPROVED' as const } // Assume enabled riders go back to approved status
            : rider
        );

        // Update cache with new data
        const cacheKey = `${activeTab}_${currentPage}`;
        riderCache.setData(cacheKey, {
          riders: updatedRiders,
          totalPages: totalPages
        });

        return updatedRiders;
      });

      // Update counts
      setCounts(prevCounts => {
        const newCounts = {
          ...prevCounts,
          disabled: Math.max(0, prevCounts.disabled - 1),
          approved: prevCounts.approved + 1
        };

        // Update stats cache
        riderCache.setStats(newCounts);

        return newCounts;
      });

      toast.success('Rider enabled successfully!');
    } catch (error) {
      console.error('Error enabling rider:', error);
      toast.error('Failed to enable rider. Please try again.');
    }
  };

  return (
    <main className='min-h-screen bg-[#FFFDF8] pt-4'>
      <div className='mx-auto flex flex-col gap-5'>
        {/* Tabs and Search Container */}
        <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between border-b border-gray-300'>
          <div className=''>
            <RiderTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={counts}
            />
          </div>
          <div className=''>
            <SearchBar
              searchQuery={searchQuery}
              onSearch={setSearchQuery}
              placeholder='Search riders...'
            />
          </div>
        </div>

        {/* Table */}
        <div className='bg-white border border-[#F2F0EA] rounded-[10px] overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow className='border-b border-[#ECE9E1] bg-white '>
                {TABLE_COLUMNS.map((column) => (
                  <TableHeaderCell key={column.key} className={column.className}>
                    {column.label}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className='text-center py-8 text-[#6B7280]'
                  >
                    Loading riders...
                  </TableCell>
                </TableRow>
              ) : currentRiders.length > 0 ? (
                currentRiders.map((rider) => (
                  <TableRow
                    key={rider.id}
                    className={`${TABLE_STYLES.row} cursor-pointer`}
                    onClick={() => router.push(`/riders/${rider.id}`)}
                  >
                    <TableDataCell className='font-medium'>
                      {rider.riderName}
                    </TableDataCell>
                    <TableDataCell>
                      {rider.riderId}
                    </TableDataCell>
                    <TableDataCell>
                      {rider.phoneNumber}
                    </TableDataCell>
                    <TableDataCell>
                      {rider.email}
                    </TableDataCell>
                    <TableDataCell>
                      {rider.address}
                    </TableDataCell>
                    <TableDataCell>
                      {rider.vehicleType}
                    </TableDataCell>
                    <TableDataCell>
                      {rider.licenseNumber}
                    </TableDataCell>
                    <TableDataCell>
                      <RiderStatusBadge status={rider.status} />
                    </TableDataCell>
                    <TableDataCell>
                      {new Date(rider.registrationDate).toLocaleDateString()}
                    </TableDataCell>
                    <TableDataCell className='text-right' onClick={(e) => e.stopPropagation()}>
                      <RiderActionsMenu
                        rider={rider}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onDisable={handleDisable}
                        onEnable={handleEnable}
                      />
                    </TableDataCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className='text-center py-8 text-[#6B7280]'
                  >
                    No riders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination - Only show if there are multiple pages */}
          {totalPages > 1 && (
            <div className='flex flex-row justify-between items-center py-3 border-t border-[#F2F0EA] h-16 px-4'>
              {/* Previous Button */}
              <PaginationButton
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className='w-[114px]'
              >
                <FiArrowLeft className={`w-4 h-4 ${currentPage === 1 ? 'text-[#D0D5DD] font-light' : 'text-[#344054]'}`} />
                Previous
              </PaginationButton>

              {/* Pagination Numbers */}
              <div className='flex flex-row items-center gap-0.5'>
                {getPageNumbers().map((pageNumber, index) => (
                  <div key={index}>
                    {pageNumber === '...' ? (
                      <span className='py-3 px-2 font-medium text-sm leading-5 text-[#454950]'>
                        ...
                      </span>
                    ) : (
                      <button
                        onClick={() => setCurrentPage(pageNumber as number)}
                        className={`flex flex-row justify-center items-center p-3 w-10 h-10 rounded-[8px] bg-transparent font-medium text-sm leading-5 cursor-pointer ${
                          currentPage === pageNumber
                            ? 'border border-[#FABB17] text-[#2E2B24]'
                            : 'border-none text-[#454950] hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Next Button */}
              <PaginationButton
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className='w-[88px]'
              >
                Next
                <FiArrowRight className={`w-4 h-4 ${currentPage === totalPages ? 'text-[#D0D5DD]' : 'text-[#344054]'}`} />
              </PaginationButton>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}