'use client';

import { useState, useEffect } from 'react';
import { Plus, X, CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { CommissionCard, FieldRow, FieldContainer } from './commission-card';

interface RestaurantTypeCommission {
  id: string;
  commissionSettingId: string;
  restaurantType: string;
  platformPercent: number;
  createdAt: string;
  updatedAt: string;
}

interface CommissionSettings {
  id: string;
  name: string;
  defaultPlatformPercent: number;
  effectiveDate: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  restaurantTypeCommissions: RestaurantTypeCommission[];
}

interface CategoryCommission {
  id: string;
  category: string;
  percentage: string;
}

type PayoutFrequency = 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';

interface RiderCommissionSettings {
  id: string;
  payPerDelivery: number;
  maxEarningPerDay: number;
  weekendBonusEnabled: boolean;
  weekendBonusAmount: number;
  payoutFrequency: PayoutFrequency;
  effectiveDate: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_RESTAURANT_TYPES = [
  'Bakery',
  'Fast Food',
  'Fine Dining',
  'Italian',
  'Asian',
  'Mexican'
];

function normalizeRestaurantType(value: string | undefined) {
  return value?.trim() ?? '';
}

function formatDate(date: Date | undefined) {
  if (!date)
    return '';

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export function CommissionSetup() {
  const [defaultCommission, setDefaultCommission] = useState('20');
  const [categoryCommissions, setCategoryCommissions] = useState<CategoryCommission[]>([
    { id: '1', category: 'Fast Food', percentage: '17' }
  ]);
  const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [weekendBonusEnabled, setWeekendBonusEnabled] = useState(false);
  const [payPerDelivery, setPayPerDelivery] = useState('13');
  const [maxEarnings, setMaxEarnings] = useState('500');
  const [weekendBonusAmount, setWeekendBonusAmount] = useState('50');
  const [payoutFrequency, setPayoutFrequency] = useState<PayoutFrequency>('WEEKLY');
  const [riderEffectiveDate, setRiderEffectiveDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings | null>(null);
  const [, setRiderCommissionSettings] = useState<RiderCommissionSettings | null>(null);

  const restaurantTypeOptions = Array.from(
    new Set([
      ...DEFAULT_RESTAURANT_TYPES,
      ...categoryCommissions.map((item) => normalizeRestaurantType(item.category)).filter(Boolean)
    ])
  );

  useEffect(() => {
    void fetchCommissionSettings();
    void fetchRiderCommissionSettings();
  }, []);

  const fetchCommissionSettings = async () => {
    try {
      const response = await fetch('/api/admin/commission/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Commission settings API response:', data);
      if (data.success) {
        setCommissionSettings(data.data);
        setDefaultCommission(data.data.defaultPlatformPercent.toString());
        setEffectiveDate(new Date(data.data.effectiveDate));
        setCategoryCommissions(data.data.restaurantTypeCommissions.map((item: RestaurantTypeCommission) => {
          return {
            id: item.id,
            category: normalizeRestaurantType(item.restaurantType),
            percentage: item.platformPercent.toString()
          };
        }));
      }
    } catch (error) {
      console.error('Error fetching commission settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiderCommissionSettings = async () => {
    try {
      const response = await fetch('/api/admin/rider-commission/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success && data.data) {
        setRiderCommissionSettings(data.data);
        setPayPerDelivery(String(data.data.payPerDelivery ?? ''));
        setMaxEarnings(String(data.data.maxEarningPerDay ?? ''));
        setWeekendBonusEnabled(Boolean(data.data.weekendBonusEnabled));
        setWeekendBonusAmount(String(data.data.weekendBonusAmount ?? ''));
        setPayoutFrequency((data.data.payoutFrequency ?? 'WEEKLY') as PayoutFrequency);
        if (data.data.effectiveDate)
          setRiderEffectiveDate(new Date(data.data.effectiveDate));
      }
    } catch (error) {
      console.error('Error fetching rider commission settings:', error);
    }
  };

  const saveCommissionSettings = async () => {
    try {
      const payload = {
        name: commissionSettings?.name || 'Commission Setup',
        defaultPlatformPercent: parseFloat(defaultCommission),
        effectiveDate: effectiveDate.toISOString(),
        restaurantTypeCommissions: categoryCommissions.map(item => ({
          restaurantType: item.category,
          platformPercent: parseFloat(item.percentage)
        }))
      };

      const response = await fetch('/api/admin/commission/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Commission settings saved successfully!');
        void fetchCommissionSettings();
      } else
        toast.error('Error saving commission settings');
    } catch (error) {
      console.error('Error saving commission settings:', error);
      toast.error('Error saving commission settings');
    }
  };

  const saveRiderCommissionSettings = async () => {
    try {
      const payload = {
        payPerDelivery: parseFloat(payPerDelivery) || 0,
        maxEarningPerDay: parseFloat(maxEarnings) || 0,
        weekendBonusEnabled,
        weekendBonusAmount: weekendBonusEnabled ? (parseFloat(weekendBonusAmount) || 0) : 0,
        payoutFrequency,
        effectiveDate: riderEffectiveDate.toISOString()
      };

      const response = await fetch('/api/admin/rider-commission/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Rider payout settings saved successfully!');
        void fetchRiderCommissionSettings();
      } else
        toast.error(data.message || 'Error saving rider payout settings');
    } catch (error) {
      console.error('Error saving rider payout settings:', error);
      toast.error('Error saving rider payout settings');
    }
  };

  const addCategoryCommission = () => {
    setCategoryCommissions([
      ...categoryCommissions,
      { id: Date.now().toString(), category: '', percentage: '' }
    ]);
  };

  const removeCategoryCommission = (id: string) => {
    setCategoryCommissions(categoryCommissions.filter(c => c.id !== id));
  };

  const updateCategoryCommission = (id: string, field: 'category' | 'percentage', value: string) => {
    setCategoryCommissions(
      categoryCommissions.map(c =>
        c.id === id ? { ...c, [field]: field === 'category' ? normalizeRestaurantType(value) : value } : c
      )
    );
  };

  if (loading)
    return <div>Loading commission settings...</div>;

  return (
    <div className='flex flex-col gap-8 w-full max-w-5xl mx-auto items-center pt-4'>
      {/* Default Restaurant Commission Section */}
      <CommissionCard
        title='Default Restaurant Commission'
        subtitle='Define how much Domli earns from each order.'
        onSave={saveCommissionSettings}
        saveButtonText='Save Commission Settings'
      >
        <FieldRow label='Default Platform Commission'>
          <FieldContainer>
            <div className='flex items-center'>
              <Input
                type='text'
                value={defaultCommission}
                onChange={(e) => setDefaultCommission(e.target.value)}
                placeholder='20'
                className='w-full border-0 bg-transparent text-[14px] font-[500] text-[#191C1F] placeholder:text-[#9CA3AF] focus:ring-0 p-0'
              />
              <span className='text-[14px] font-[500] text-[#191C1F] ml-1'>%</span>
              
            </div>
          </FieldContainer>
          <div className = 'text-[#475156] text-[13px] pt-1'>This is the percentage taken from each order unless overridden</div>
        </FieldRow>

        <FieldRow label='Commission By Restaurant Category' className='items-start'>
          <div className=' '>
            <div className='flex flex-col gap-3'>
              {categoryCommissions.map((item) => {
                return (
                  <div key={item.id} className='flex items-center w-full gap-3'>
                    <FieldContainer className='w-full flex h-10 items-center justify-center'>
                      <Select value={normalizeRestaurantType(item.category)} onValueChange={(value) => updateCategoryCommission(item.id, 'category', value)}>
                        <SelectTrigger className='w-full h-full border-0 bg-[#F7F7F7] focus:ring-0'>
                          <SelectValue placeholder='Select category' />
                        </SelectTrigger>
                        <SelectContent className='bg-white'>
                          {restaurantTypeOptions.map((restaurantType) => (
                            <SelectItem key={restaurantType} value={restaurantType}>
                              {restaurantType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldContainer>
                    <FieldContainer className='flex items-center w-full'>
                      <Input
                        type='text'
                        placeholder='17'
                        value={item.percentage}
                        onChange={(e) => updateCategoryCommission(item.id, 'percentage', e.target.value)}
                        className='w-full border-0 bg-transparent text-[14px] font-[500] text-[#191C1F] placeholder:text-[#9CA3AF] focus:ring-0 p-0'
                      />
                      <span className='text-[14px] font-[500] text-[#191C1F] ml-1'>%</span>
                    </FieldContainer>
                    <button
                      onClick={() => removeCategoryCommission(item.id)}
                      className='text-[#666] hover:text-red-500 transition-colors p-1'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              onClick={addCategoryCommission}
              className='mt-3 flex items-center gap-2 text-[14px] font-[500] text-[#FABB17] hover:text-[#f0a000]'
            >
              <Plus className='w-4 h-4' />
              Add another category
            </button>
          </div>
        </FieldRow>

        <FieldRow label='Effective Date' className='border-b-0'>
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <button
                type='button'
                className='bg-[#F7F7F7] border border-[#F1F1F1] rounded-[10px] px-2 py-2 w-full text-left cursor-pointer hover:bg-[#f0f0f0] transition-colors'
              >
                <div className='flex items-center justify-between'>
                  <span className='text-[14px] font-[500] text-[#191C1F]'>
                    {formatDate(effectiveDate) || 'Select a date'}
                  </span>
                  <CalendarIcon className='w-4 h-4 text-[#666]' />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent
              className='w-auto p-0 rounded-md border bg-white shadow-lg'
              align='start'
            >
              <Calendar
                mode='single'
                selected={effectiveDate}
                onSelect={(date) => {
                  if (date) {
                    setEffectiveDate(date);
                    setDatePickerOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </FieldRow>
      </CommissionCard>

      {/* Rider Payout Rules Section */}
      <CommissionCard
        title='Rider Payout Rules'
        subtitle='Set what riders earn for each delivery and configure bonuses or limits.'
        onSave={saveRiderCommissionSettings}
        saveButtonText='Update Rider Pay Rules'
      >
        <FieldRow label='Pay Per Delivery'>
          <FieldContainer>
            <div className='flex items-center'>
              <span className='text-[14px] font-[500] text-[#191C1F]'>$</span>
              <Input
                type='text'
                value={payPerDelivery}
                onChange={(e) => setPayPerDelivery(e.target.value)}
                placeholder='13'
                className='w-full border-0 bg-transparent text-[14px] font-[500] text-[#191C1F] placeholder:text-[#9CA3AF] focus:ring-0 p-0 ml-1'
              />
            </div>
          </FieldContainer>
        </FieldRow>

        <FieldRow label='Max Earnings Per Day'>
          <FieldContainer>
            <div className='flex items-center'>
              <span className='text-[14px] font-[500] text-[#191C1F]'>$</span>
              <Input
                type='text'
                value={maxEarnings}
                onChange={(e) => setMaxEarnings(e.target.value)}
                placeholder='500'
                className='w-full border-0 bg-transparent text-[14px] font-[500] text-[#191C1F] placeholder:text-[#9CA3AF] focus:ring-0 p-0 ml-1'
              />
            </div>
          </FieldContainer>
        </FieldRow>

        <FieldRow label='Weekend Bonus'>
          <div className='flex-1'>
            <button
              onClick={() => setWeekendBonusEnabled(!weekendBonusEnabled)}
              className={`relative inline-flex h-[25px] w-[40px] items-center rounded-[17px] transition-colors ${
                weekendBonusEnabled ? 'bg-[#FABB17]' : 'bg-gray-300'
              } cursor-pointer`}
              type='button'
            >
              <span
                className={`inline-block h-[21px] w-[21px] transform rounded-full bg-white transition-transform ${
                  weekendBonusEnabled ? 'translate-x-[17px]' : 'translate-x-[3px]'
                }`}
              />
            </button>
            <span className='ml-[10px] text-[14px] font-[500] text-[#191C1F]'>
              {weekendBonusEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </FieldRow>

        {weekendBonusEnabled && (
          <FieldRow label='Weekend Bonus Amount'>
            <FieldContainer>
              <div className='flex items-center'>
                <span className='text-[14px] font-[500] text-[#191C1F]'>$</span>
                <Input
                  type='text'
                  value={weekendBonusAmount}
                  onChange={(e) => setWeekendBonusAmount(e.target.value)}
                  placeholder='50'
                  className='w-full border-0 bg-transparent text-[14px] font-[500] text-[#191C1F] placeholder:text-[#9CA3AF] focus:ring-0 p-0 ml-1'
                />
              </div>
            </FieldContainer>
          </FieldRow>
        )}

        <FieldRow label='Payout Frequency' className='border-b-0'>
           <FieldContainer className='w-full flex h-10 items-center justify-center'>
          <Select value={payoutFrequency} onValueChange={(value) => setPayoutFrequency(value as PayoutFrequency)}>
            <SelectTrigger className='w-full h-16 border-0  focus:ring-0'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className = 'bg-white'>
              <SelectItem value='DAILY'>Daily</SelectItem>
              <SelectItem value='WEEKLY'>Weekly</SelectItem>
              <SelectItem value='BI_WEEKLY'>Bi-Weekly</SelectItem>
              <SelectItem value='MONTHLY'>Monthly</SelectItem>
            </SelectContent>
          </Select>
          </FieldContainer>
        </FieldRow>
      </CommissionCard>
    </div>
  );
}
