'use client';

import React, { useState, useEffect } from 'react';
import { SubscriptionPlan, CreateSubscriptionPlanInput } from '@/types';
import { getAllSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from '@/lib/server-actions/subscription-actions';
import SubscriptionPlanCard from '../subscription-plan-card';
import { Plus } from 'lucide-react';
import { MdSubscriptions } from 'react-icons/md';
import { toast } from 'sonner';

interface SubscriptionManagementClientProps {
  initialPlans?: SubscriptionPlan[];
}

export default function SubscriptionManagementClient({ 
  initialPlans = [] 
}: SubscriptionManagementClientProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans);
  const [loading, setLoading] = useState(false);

  // Fetch plans on component mount
  useEffect(() => {
    void fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const fetchedPlans = await getAllSubscriptionPlans();
      setPlans(fetchedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to fetch subscription plans');
      // Don't throw error, just set empty array so user can still create new plans
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (data: CreateSubscriptionPlanInput) => {
    try {
      const newPlan = await createSubscriptionPlan(data);
      setPlans((prev: SubscriptionPlan[]): SubscriptionPlan[] => [...prev, newPlan]);
      toast.success('Subscription plan created successfully');
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Failed to create subscription plan');
      throw error;
    }
  };

  const handleUpdatePlan = async (id: string, data: Partial<CreateSubscriptionPlanInput>) => {
    try {
      const updatedPlan = await updateSubscriptionPlan({ id, ...data });
      setPlans((prev: SubscriptionPlan[]): SubscriptionPlan[] => prev.map((plan: SubscriptionPlan): SubscriptionPlan => plan.id === id ? updatedPlan : plan));
      toast.success('Subscription plan updated successfully');
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update subscription plan');
      throw error;
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await deleteSubscriptionPlan(id);
      setPlans((prev: SubscriptionPlan[]): SubscriptionPlan[] => prev.filter((plan: SubscriptionPlan) => plan.id !== id));
      toast.success('Subscription plan deleted successfully');
    } catch (error) {
      console.error('Error deleting plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete subscription plan';
      toast.error(errorMessage);
    }
  };

  const addNewPlan = () => {
    const newPlan: SubscriptionPlan = {
      id: `new-${Date.now()}`,
      restaurantId: null,
      isSystemPlan: true,
      name: '',
      description: '',
      planType: 'STANDARD',
      durationWeeks: 1,
      price: 0,
      mealsPerWeek: 1,
      paymentFrequency: 'WEEKLY',
      weeklyPrice: 0,
      biweeklyPrice: 0,
      monthlyPrice: 0,
      startDayOfWeek: 1,
      deliveryDays: [1, 2, 3, 4, 5, 6, 7],
      features: [],
      isActive: false,
      isMostPopular: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      restaurant: null,
      activatedByRestaurants: [],
      customerPlans: [],
      _count: {
        customerPlans: 0,
        activatedByRestaurants: 0
      }
    };
    setPlans((prev: SubscriptionPlan[]): SubscriptionPlan[] => [...prev, newPlan]);
  };

  const handleCancelNew = (id: string) => {
    if (id.startsWith('new-'))
      setPlans((prev: SubscriptionPlan[]): SubscriptionPlan[] => prev.filter((plan: SubscriptionPlan) => plan.id !== id));
    
  };

  if (loading && plans.length === 0) 
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading subscription plans...</p>
        </div>
      </div>
    );
  

  return (
    <div className='flex flex-col gap-[25px]'>

      {/* Plans Container */}
      <div className='flex flex-col gap-[18px]'>
        {loading && plans.length === 0 ? (
          <div className='text-center py-12'>
            <div className='w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
              <MdSubscriptions className='w-12 h-12 text-gray-400' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>Loading subscription plans...</h3>
          </div>
        ) : (
          <div className='flex flex-col gap-[18px] pt-6'>
            {plans.map((plan) => (
              <SubscriptionPlanCard
                key={plan.id}
                plan={plan}
                isNew={plan.id.startsWith('new-')}
                onSave={plan.id.startsWith('new-') ? handleCreatePlan : (data) => handleUpdatePlan(plan.id, data)}
                onDelete={() => handleDeletePlan(plan.id)}
                onCancel={() => handleCancelNew(plan.id)}
              />
            ))}

            {/* Add New Plan Button */}
            <div className='flex justify-center pt-[10px]'>
              <button
                onClick={addNewPlan}
                className='flex items-center gap-[10px] px-[22px] py-[10px] border border-[#D0D5DD] rounded-[10px] text-[14px] font-[500] text-[#344054] hover:bg-gray-50'
              >
                <Plus className='h-[18px] w-[18px]' />
                Add New Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
