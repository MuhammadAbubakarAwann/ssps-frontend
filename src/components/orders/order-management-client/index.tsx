'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { OrderTabs } from '@/components/orders/order-tabs';
import { SearchBar } from '@/components/orders/search-bar';
import { OrderDetailsModal } from '@/components/orders/order-details-modal';
import {
  StatusBadge,
  PaymentStatusBadge
} from '@/components/orders/status-badges';
import { Eye } from 'lucide-react';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { fetchOrders, fetchOrderStatsOnly, fetchOrderDetails, type Order } from '@/lib/server-actions/admin-order-actions';
import { orderCache } from '@/lib/utils/cache-manager';

// Table configuration
const TABLE_COLUMNS = [
  { key: 'orderId', label: 'Order ID' },
  { key: 'status', label: 'Order Status', className: '' },
  { key: 'vendorName', label: 'Restaurant', className: '' },
  { key: 'customerName', label: 'Customer', className: '' },
  { key: 'courier', label: 'Rider', className: '' },
  { key: 'totalCost', label: 'Total Price'},
  { key: 'paymentStatus', label: 'Payment Status', className: '' },
  { key: 'actions', label: 'Actions', className: 'text-right' }
];

const COLUMN_COUNT = TABLE_COLUMNS.length;

// Reusable styling constants
const TABLE_STYLES = {
  header: 'text-[#534E43] font-semibold text-xs uppercase py-4 px-6 whitespace-nowrap',
  cell: 'text-sm text-[#65656A] py-4 px-6',
  row: 'border-b border-[#F2F0EA] hover:bg-[#FAFAF8] transition-colors'
};

// Reusable components
const TableHeaderCell = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <TableHead className={`${TABLE_STYLES.header} ${className}`}>
    {children}
  </TableHead>
);

const TableDataCell = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <TableCell className={`${TABLE_STYLES.cell} ${className}`}>
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

export default function OrderManagementPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0
  });
  
  // Modal state
  const [, setSelectedOrderId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Function to handle viewing order details
  const handleViewOrderDetails = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setModalOpen(true);
    setLoadingDetails(true);
    setOrderDetails(null);
    
    try {
      const details = await fetchOrderDetails(orderId);
      setOrderDetails(details);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Function to close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrderId(null);
    setOrderDetails(null);
    setLoadingDetails(false);
  };

  // Fetch data when component mounts or when filters change
  useEffect(() => {
    let isCancelled = false;
    
    const fetchData = async () => {
      // If searching, always fetch fresh data
      const isSearching = searchQuery.trim() !== '';
      
      if (isSearching) {
        setLoading(true);
        try {
          const result = await fetchOrders({
            tab: activeTab,
            search: searchQuery,
            page: currentPage,
            limit: 20,
            includeStats: false
          });
          
          if (!isCancelled) 
            setOrders(result.orders);
          
        } catch (error) {
          if (!isCancelled) {
            console.error('Error fetching orders:', error);
            setOrders([]);
          }
        } finally {
          if (!isCancelled) 
            setLoading(false);
          
        }
        return;
      }
      
      // For non-search requests, check persistent cache first
      const cacheKey = `${activeTab}_${currentPage}`;
      const cachedData = orderCache.getData<{
        orders: Order[];
      }>(cacheKey);
      
      // Use cached data if available
      if (cachedData) {
        setOrders(cachedData.orders);
        setLoading(false);
        return;
      }
      
      // Fetch fresh data
      setLoading(true);
      try {
        const cachedStats = orderCache.getStats();
        const needStats = !cachedStats;
        
        const result = await fetchOrders({
          tab: activeTab,
          page: currentPage,
          limit: 20,
          includeStats: needStats
        });
        
        if (!isCancelled) {
          setOrders(result.orders);
          
          // Update persistent cache
          orderCache.setData(cacheKey, {
            orders: result.orders
          });
          
          // Update stats if we got them
          if (result.counts) {
            setCounts(result.counts);
            orderCache.setStats(result.counts);
          }
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching orders:', error);
          setOrders([]);
        }
      } finally {
        if (!isCancelled) 
          setLoading(false);
        
      }
    };

    // No debounce needed here since SearchBar handles it
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
      const cachedStats = orderCache.getStats();
      
      if (cachedStats && typeof cachedStats === 'object' && 'total' in cachedStats) {
        setCounts(cachedStats as { total: number; pending: number; delivered: number; cancelled: number });
      } else {
        try {
          const stats = await fetchOrderStatsOnly();
          setCounts(stats);
          orderCache.setStats(stats);
        } catch (error) {
          console.error('Error fetching initial stats:', error);
        }
      }
    };

    void loadInitialStats();
  }, []); // Run once on mount


  const ordersPerPage = 20; // Match the API limit

  // For pagination, we use the current orders directly since API handles filtering
  const totalPages = Math.ceil((searchQuery ? orders.length : counts.total) / ordersPerPage);
  const currentOrders = orders; // API already returns the correct page

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

  return (
    <main className='min-h-screen bg-[#FFFDF8] pt-4'>
      <div className=' mx-auto flex flex-col gap-5'>
        {/* Tabs and Search Container */}
        <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between  border-b border-gray-300'>
          <div className=''>
            <OrderTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={counts}
            />
          </div>
          <div className=''>
            <SearchBar searchQuery={searchQuery} onSearch={setSearchQuery} />
          </div>
        </div>

        {/* Table */}
        <div className='bg-white border border-[#F2F0EA] rounded-[10px] overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow className='border-b border-[#ECE9E1] bg-white hover:bg-white'>
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
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className={TABLE_STYLES.row}
                  >
                    <TableDataCell className='font-medium'>
                      {order.orderId}
                    </TableDataCell>
                    <TableDataCell>
                      <StatusBadge status={order.status} />
                    </TableDataCell>
                    <TableDataCell>
                      {order.vendorName}
                    </TableDataCell>
                    <TableDataCell>
                      {order.customerName}
                    </TableDataCell>
                    <TableDataCell>
                      {order.courier}
                    </TableDataCell>
                    <TableDataCell className='font-medium'>
                      {order.totalCost}
                    </TableDataCell>
                    <TableDataCell>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </TableDataCell>
                    <TableDataCell className='text-right'>
                      <Button
                        variant='ghost'
                        size='icon'
                        color='primary'
                        onClick={() => handleViewOrderDetails(order.id)}
                        className='h-8 w-8 p-0 text-[#6B7280] hover:text-[#374151] hover:bg-[#F3F4F6]'
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                    </TableDataCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className='text-center py-8 text-[#6B7280]'
                  >
                    No orders found
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

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        orderDetails={orderDetails}
        loading={loadingDetails}
      />
    </main>
  );
}
