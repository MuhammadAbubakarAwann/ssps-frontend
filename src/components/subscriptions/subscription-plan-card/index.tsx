'use client';

import React, { useState } from 'react';
import { SubscriptionPlan, CreateSubscriptionPlanInput } from '@/types';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  isNew: boolean;
  onSave: (data: CreateSubscriptionPlanInput) => Promise<void>;
  onDelete: () => void;
  onCancel: () => void;
}

// Reusable field components
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

interface TextFieldProps {
  value: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
  suffix?: string;
  min?: string;
  step?: string;
}

const TextField: React.FC<TextFieldProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  prefix,
  suffix,
  min,
  step
}) => (
  <FieldContainer>
    <div className='flex items-center'>
      {prefix && <span className='text-[14px] font-[500] '>{prefix}</span>}
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        min={min}
        step={step}
        className='w-full border-0 bg-transparent text-[14px] font-[500] text-[#191C1F] placeholder:text-[#9CA3AF] focus:ring-0 p-0 ml-1'
      />
      {suffix && <span className='text-[14px] font-[400] text-[#475156] ml-1'>{suffix}</span>}
    </div>
  </FieldContainer>
);

interface ToggleFieldProps {
  value: boolean;
  onChange?: (value: boolean) => void;
}

const ToggleField: React.FC<ToggleFieldProps> = ({ value, onChange }) => (
  <div className='flex-1'>
    <button
      onClick={() => onChange?.(!value)}
      className={`relative inline-flex h-[25px] w-[40px] items-center rounded-[17px] transition-colors ${
        value ? 'bg-[#FABB17]' : 'bg-gray-300'
      } cursor-pointer`}
      type='button'
    >
      <span
        className={`inline-block h-[21px] w-[21px] transform rounded-full bg-white transition-transform ${
          value ? 'translate-x-[17px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
    <span className='ml-[10px] text-[14px] font-[500] text-[#191C1F]'>
      {value ? 'Yes' : 'No'}
    </span>
  </div>
);

export default function SubscriptionPlanCard({
  plan,
  isNew,
  onSave,
  onDelete,
  onCancel
}: SubscriptionPlanCardProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSubscriptionPlanInput>({
    name: plan.name,
    price: plan.price || '',
    mealsIncluded: plan.mealsPerWeek,
    features: [...plan.features],
    isActive: plan.isActive,
    isMostPopular: plan.isMostPopular
  });
  const [newFeature, setNewFeature] = useState('');

  const handleInputChange = (field: keyof CreateSubscriptionPlanInput, value: string | number | boolean) => {
    setFormData((prev: CreateSubscriptionPlanInput): CreateSubscriptionPlanInput => {
      const updated: CreateSubscriptionPlanInput = { ...prev };
      (updated as any)[field] = value;
      return updated;
    });
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev: CreateSubscriptionPlanInput): CreateSubscriptionPlanInput => {
        const updated: CreateSubscriptionPlanInput = { ...prev };
        updated.features = [...prev.features, newFeature.trim()];
        return updated;
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev: CreateSubscriptionPlanInput): CreateSubscriptionPlanInput => {
      const updated: CreateSubscriptionPlanInput = { ...prev };
      updated.features = prev.features.filter((_, i) => i !== index);
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const dataToSave = {
        ...formData,
        price: parseFloat(formData.price as string) || 0
      };
      await onSave(dataToSave);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isNew)
      onCancel();
  };

  // Dynamic heading - shows current typed name or fallback
  const displayName = formData.name.trim() || 'New Plan';

  return (
    <div className='bg-white border border-[#EDEFF2] rounded-[20px] p-[21px] shadow-[0px_1px_2px_rgba(16,24,40,0.05)]'>
      {/* Header Section - Dynamic */}
      <div className='border-b border-[#E4E7E9] pb-[10px] mb-[18px]'>
        <div className='flex justify-between items-start'>
          <div>
            <h3 className='text-[22px] font-[600] text-[#2E2B24] leading-[24px]'>
              {displayName}
            </h3>
            <p className='text-[14px] font-[400] text-[#475156] leading-[17px] mt-[9px]'>
              Update the weekly subscription plan details
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className='space-y-0'>
        <FieldRow label='Plan Name'>
          <TextField
            value={formData.name}
            onChange={(value: string) => handleInputChange('name', value)}
            placeholder='Weekly Plan'
          />
        </FieldRow>

        <FieldRow label='Price'>
          <TextField
            value={formData.price}
            onChange={(value: string) => handleInputChange('price', value)}
            placeholder='17'
            type='number'
            min='0'
            step='0.01'
            prefix='$'
          />
        </FieldRow>

        <FieldRow label='Meals Included'>
          <TextField
            value={formData.mealsIncluded}
            onChange={(value: string) => handleInputChange('mealsIncluded', parseInt(value) || 1)}
            placeholder='5'
            type='number'
            min='1'
          />
        </FieldRow>

        <FieldRow label='Features' className='items-start'>
          <div className='bg-[#F7F7F7] border border-[#F1F1F1] rounded-[10px] p-2 '>
            <div className='flex flex-wrap gap-[8px] items-center'>
              {formData.features.map((feature, index) => (
                <div key={index} className='flex items-center gap-[6px] bg-white px-[8px] py-[4px] rounded-[6px] shadow-[0px_1px_1px_rgba(0,0,0,0.09)] border border-[#E4E7E9]'>
                  <span className='text-[13px] font-[500] text-[#191C1F]'>{feature}</span>
                  <button
                    onClick={() => handleRemoveFeature(index)}
                    className='text-[#666] hover:text-red-500 transition-colors'
                    type='button'
                  >
                    <X className='h-[14px] w-[14px]' />
                  </button>
                </div>
              ))}
              <input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder={formData.features.length === 0 ? 'Type features and press Enter' : 'Add another feature...'}
                className='flex-1 min-w-[150px] border-0 bg-transparent text-[14px] font-[400] text-[#191C1F] placeholder:text-[#9CA3AF] focus:outline-none'
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
              />
            </div>
          </div>
        </FieldRow>

        <FieldRow label='Active Status'>
          <ToggleField
            value={formData.isActive}
            onChange={(value) => handleInputChange('isActive', value)}
          />
        </FieldRow>

        <FieldRow label='Most Popular?' className='border-b-0'>
          <ToggleField
            value={formData.isMostPopular}
            onChange={(value) => handleInputChange('isMostPopular', value)}
          />
        </FieldRow>
      </div>

      {/* Footer - Buttons */}
      <div className='mt-[20px] flex justify-end gap-[10px]'>
        {isNew && (
          <button
            onClick={handleCancel}
            className='px-[22px] py-[10px] border border-[#D0D5DD] rounded-[10px] text-[14px] font-[500] text-[#344054] hover:bg-gray-50'
            type='button'
          >
            Cancel
          </button>
        )}
        {!isNew && (
          <button
            onClick={onDelete}
            className='px-[22px] py-[10px] border border-[#D0D5DD] rounded-[10px] text-[14px] font-[500] text-red-600 hover:bg-red-50'
            type='button'
          >
            Delete
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={loading}
          className='px-[22px] py-[10px] bg-[#080707] text-white text-[14px] font-[500] rounded-[10px] hover:bg-gray-800 disabled:opacity-50'
          type='button'
        >
          {isNew ? 'Create Plan' : 'Update Plan'}
        </button>
      </div>
    </div>
  );
}
