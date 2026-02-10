interface StatusBadgeProps {
  status: string
}

interface PaymentStatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'AWAITING_PICKUP':
        return {
          label: 'Awaiting Pickup',
          className: 'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]',
          dotColor: 'bg-[#DC2626]'
        };
      case 'PREPARING':
        return {
          label: 'Preparing',
          className: 'bg-[#F3E8FF] text-[#A855F7] border border-[#E9D5FF]',
          dotColor: 'bg-[#A855F7]'
        };
      case 'READY':
        return {
          label: 'Ready for Pickup',
          className: 'bg-[#F3E8FF] text-[#9333EA] border border-[#E9D5FF]',
          dotColor: 'bg-[#9333EA]'
        };
      case 'RIDER_AT_VENDOR':
        return {
          label: 'Rider At Vendor',
          className: 'bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D]',
          dotColor: 'bg-[#D97706]'
        };
      case 'OUT_FOR_DELIVERY':
        return {
          label: 'Out For Delivery',
          className: 'bg-[#E0E7FF] text-[#4F46E5] border border-[#C7D2FE]',
          dotColor: 'bg-[#4F46E5]'
        };
      case 'DELIVERED':
        return {
          label: 'Delivered',
          className: 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]',
          dotColor: 'bg-[#16A34A]'
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          className: 'bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]',
          dotColor: 'bg-[#6B7280]'
        };
      default:
        return {
          label: status,
          className: 'bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]',
          dotColor: 'bg-[#6B7280]'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${config.className} whitespace-nowrap`}>
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const getPaymentStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return {
          label: 'Pending',
          className: 'bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D]',
          dotColor: 'bg-[#D97706]'
        };
      case 'PAID':
        return {
          label: 'Paid',
          className: 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]',
          dotColor: 'bg-[#16A34A]'
        };
      case 'FAILED':
        return {
          label: 'Failed',
          className: 'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]',
          dotColor: 'bg-[#DC2626]'
        };
      case 'REFUNDED':
        return {
          label: 'Refunded',
          className: 'bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]',
          dotColor: 'bg-[#6B7280]'
        };
      default:
        return {
          label: 'Unknown',
          className: 'bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]',
          dotColor: 'bg-[#6B7280]'
        };
    }
  };

  const config = getPaymentStatusConfig(status);

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${config.className} whitespace-nowrap`}>
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}
