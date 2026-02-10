interface RestaurantStatusBadgeProps {
  status: string
}

export function RestaurantStatusBadge({ status }: RestaurantStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return {
          label: 'Approved',
          className: 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]',
          dotColor: 'bg-[#16A34A]'
        };
      case 'PENDING':
        return {
          label: 'Pending',
          className: 'bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D]',
          dotColor: 'bg-[#D97706]'
        };
      case 'DOCUMENTS_PENDING':
        return {
          label: 'Documents Pending',
          className: 'bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D]',
          dotColor: 'bg-[#D97706]'
        };
      case 'PROFILE_INCOMPLETE':
        return {
          label: 'Profile Incomplete',
          className: 'bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D]',
          dotColor: 'bg-[#D97706]'
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          className: 'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]',
          dotColor: 'bg-[#DC2626]'
        };
      case 'DISABLED':
        return {
          label: 'Disabled',
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