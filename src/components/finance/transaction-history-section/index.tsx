'use client';

import { useState, useEffect } from 'react';

interface TransactionItem {
  name: string;
  quantity: number;
  price: number;
}

interface Transaction {
  orderId: string;
  itemsOrdered: TransactionItem[];
  customerName: string;
  restaurantName: string;
  riderName: string;
  amountPaid: number;
  payoutStatus: string;
  paymentDate: string | null;
}

export function TransactionHistorySection() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/admin/finance/transaction-history');
        const result = await response.json();

        if (!response.ok) 
          setError(`Failed to load transaction history: ${result.message || 'Unknown error'}`);
         else if (result.success) 
          setTransactions(result.data.transactions);
        
      } catch (error) {
        console.error('Error fetching transaction history:', error);
        setError('Network error occurred while loading transaction history');
      } finally {
        setLoading(false);
      }
    };

    void fetchTransactionHistory();
  }, []);

  const getPaymentStatus = (payoutStatus: string) => {
    switch (payoutStatus.toUpperCase()) {
      case 'PROCESSING':
        return 'Paid';
      case 'PENDING':
        return 'Pending';
      default:
        return 'Failed';
    }
  };

  if (loading) 
    return (
      <div className='flex flex-col gap-4 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
        <h2 className='text-[15px] font-bold text-[#3F4956] capitalize'>Transaction History</h2>
        <div className='flex items-center justify-center h-[200px]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#FABB17] mx-auto mb-2'></div>
            <p className='text-[#6B7280]'>Loading transaction history...</p>
          </div>
        </div>
      </div>
    );
  

  if (error) 
    return (
      <div className='flex flex-col gap-4 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
        <div className='flex items-center justify-center h-[200px]'>
          <div className='text-center'>
            <p className='text-red-600 mb-2'>Error loading data</p>
            <p className='text-[#6B7280] text-sm'>{error}</p>
          </div>
        </div>
      </div>
    );
  
  return (
    <div className='flex flex-col gap-4 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
      <h2 className='text-[15px] font-bold text-[#3F4956] capitalize'>Transaction History</h2>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-[#EDEDEB]'>
              <th className='text-left py-3 px-4 text-[12px] font-bold text-[#6B7280] uppercase'>Order ID</th>
              <th className='text-left py-3 px-4 text-[12px] font-bold text-[#6B7280] uppercase'>Order/Created</th>
              <th className='text-left py-3 px-4 text-[12px] font-bol text-[#6B7280] uppercase'>Customer Name</th>
              <th className='text-left py-3 px-4 text-[12px] font-medium text-[#6B7280] uppercase'>restaurant Name</th>
              <th className='text-left py-3 px-4 text-[12px] font-medium text-[#6B7280] uppercase'>rider Name</th>
              <th className='text-left py-3 px-4 text-[12px] font-medium text-[#6B7280] uppercase'>Amount Paid</th>
              <th className='text-left py-3 px-4 text-[12px] font-medium text-[#6B7280] uppercase'>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, idx) => (
              <tr key={idx} className='border-b border-[#EDEDEB] hover:bg-[#F9FAFB] transition-colors'>
                <td className='py-3 px-4 text-[13px] text-[#1F2937] font-medium'>{transaction.orderId}</td>
                <td className='py-3 px-4 text-[13px] text-[#6B7280]'>
                  {transaction.paymentDate ? new Date(transaction.paymentDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className='py-3 px-4 text-[13px] text-[#6B7280]'>{transaction.customerName}</td>
                <td className='py-3 px-4 text-[13px] text-[#6B7280]'>{transaction.restaurantName}</td>
                <td className='py-3 px-4 text-[13px] text-[#6B7280]'>{transaction.riderName}</td>
                <td className='py-3 px-4 text-[13px] text-[#1F2937] font-medium'>${transaction.amountPaid.toFixed(2)}</td>
                <td className='py-3 px-4'>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-[12px] font-medium ${
                      getPaymentStatus(transaction.payoutStatus) === 'Paid'
                        ? 'bg-[rgba(52,184,55,0.1)] text-[#34B837]'
                        : getPaymentStatus(transaction.payoutStatus) === 'Pending'
                          ? 'bg-[rgba(251,191,36,0.1)] text-[#FABB17]'
                          : 'bg-[#FFE0E0] text-[#EC1717]'
                    }`}
                  >
                    {getPaymentStatus(transaction.payoutStatus)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
