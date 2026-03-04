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
import { SearchBar } from '@/components/orders/search-bar';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { fetchCustomers } from '@/lib/server-actions/customer-actions';
import type { Customer } from '@/types/customer';

// Table configuration
const TABLE_COLUMNS = [
  { key: 'name', label: 'Customer Name' },
  { key: 'phone', label: 'Phone Number', className: '' },
  { key: 'email', label: 'Email Address', className: '' },
  { key: 'registrationDate', label: 'Registration Date', className: '' },
  { key: 'totalOrders', label: 'Total Orders', className: '' },
  { key: 'totalSpendings', label: 'Total Spending', className: '' },
  { key: 'subscriptionPlan', label: 'Subscription Plan', className: '' }
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

const SubscriptionPlanBadge = ({ plan }: { plan: 'basic' | 'standard' | 'premium' | null }) => {
  if (!plan) {
    return (
      <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500'>
        No Plan
      </span>
    );
  }

  const config = {
    basic: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Basic' },
    standard: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Standard' },
    premium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Premium' }
  };

  const { bg, text, label } = config[plan];

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
};

export default function CustomerManagementClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Fetch data when component mounts or when filters change
  useEffect(() => {
    let isCancelled = false;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await fetchCustomers({
          search: searchQuery,
          page: currentPage,
          limit: 10
        });
        
        if (!isCancelled) {
          setCustomers(result.customers);
          setTotalPages(result.totalPages);
          setTotalCustomers(result.totalCustomers);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching customers:', error);
          setCustomers([]);
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
  }, [searchQuery, currentPage]);

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // API handles pagination, use totalPages from server
  const currentCustomers = customers; // API already returns the correct page

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
      <div className='mx-auto flex flex-col '>
        {/* Search Container */}
        <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between border-b border-gray-300'>
          
            <div className='flex items-center justify-center gap-2 text-sm text-[#6B7280] pb-2'>
              <span>Total Customers: </span>
              <span className='font-medium text-[#FABB17]'>
                {totalCustomers.toLocaleString()}
              </span>
            </div>
          <div className=''>
            <SearchBar 
              searchQuery={searchQuery} 
              onSearch={setSearchQuery}
              placeholder='Search customers...'
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
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : currentCustomers.length > 0 ? (
                currentCustomers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className={`${TABLE_STYLES.row}`}
                  >
                    <TableDataCell className='font-medium'>
                      {customer.name}
                    </TableDataCell>
                    
                    <TableDataCell>
                      {customer.phone}
                    </TableDataCell>
                    
                    <TableDataCell>
                      {customer.email}
                    </TableDataCell>
                    
                    <TableDataCell>
                      {customer.registrationDate.toLocaleDateString()}
                    </TableDataCell>
                    
                    <TableDataCell>
                      <span className='font-medium'>
                        {customer.totalOrders.toLocaleString()}
                      </span>
                    </TableDataCell>
                    
                    <TableDataCell>
                      <span className='font-medium text-green-600'>
                        ${customer.totalSpendings.toFixed(2)}
                      </span>
                    </TableDataCell>
                    
                    <TableDataCell>
                      <SubscriptionPlanBadge plan={customer.subscriptionPlan} />
                    </TableDataCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className='text-center py-8 text-[#6B7280]'
                  >
                    No customers found
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