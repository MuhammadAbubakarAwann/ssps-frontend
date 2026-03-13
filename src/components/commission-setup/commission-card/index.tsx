import React from 'react';

// Reusable field components matching subscription plan card
interface FieldRowProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

const FieldRow: React.FC<FieldRowProps> = ({ label, children, className = '' }) => (
  <div className={`flex gap-[20px] py-[15px] border-b border-[#EDEFF2] ${className}`}>
    <label className='w-[276px] text-[14px] font-[500] text-[#475156] pt-[20px] first:pt-0'>
      {label}
    </label>
    <div className='flex-1'>{children}</div>
  </div>
);

const FieldContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <div className={`bg-[#F7F7F7] border border-[#F1F1F1] rounded-[10px] px-2 ${className}`}>
    {children}
  </div>
);

interface CommissionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onSave?: () => void;
  saveButtonText?: string;
}

export function CommissionCard({
  title,
  subtitle,
  children,
  onSave,
  saveButtonText = 'Save Changes'
}: CommissionCardProps) {
  return (
    <div className='bg-white w-full border border-[#EDEFF2] rounded-[20px] p-[25px] shadow-[0px_1px_2px_rgba(16,24,40,0.05)]'>
      {/* Header Section */}
      <div className='border-b border-[#E4E7E9]  mb'>
        <div className='flex justify-between items-start pb-[25px]'>
          <div>
            <h3 className='text-[19px] font-[600] text-[#2E2B24] leading-[24px]'>
              {title}
            </h3>
            {subtitle && (
              <p className='text-[14px] font-[400] text-[#475156] leading-[17px] mt-[9px]'>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className='space-y-0'>
        {children}
      </div>

      {/* Footer - Save Button */}
      {onSave && (
        <div className='mt-[20px] flex justify-end gap-[10px]'>
          <button
            onClick={onSave}
            className='px-[22px] py-[10px] bg-[#080707] text-white text-[14px] font-[500] rounded-[10px] hover:bg-gray-800'
            type='button'
          >
            {saveButtonText}
          </button>
        </div>
      )}
    </div>
  );
}

// Export the reusable components for use in the parent component
export { FieldRow, FieldContainer };
