'use client';

import { useState } from 'react';
import { MoreHorizontal, Check, X, Ban, CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { RejectRestaurantDialog } from '@/components/restaurants/reject-restaurant-dialog';
import { Restaurant } from '@/types/restaurant';

interface RestaurantActionsMenuProps {
  restaurant: Restaurant;
  onApprove: (restaurantId: string) => void;
  onReject: (restaurantId: string, reason: string) => void;
  onDisable: (restaurantId: string) => void;
  onEnable: (restaurantId: string) => void;
}

export function RestaurantActionsMenu({ restaurant, onApprove, onReject, onDisable, onEnable }: RestaurantActionsMenuProps) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const handleApprove = () => {
    onApprove(restaurant.id);
  };

  const handleRejectClick = () => {
    setIsRejectDialogOpen(true);
  };

  const handleDisable = () => {
    onDisable(restaurant.id);
  };

  const handleEnable = () => {
    onEnable(restaurant.id);
  };

  const handleRejectSubmit = (restaurantId: string, reason: string) => {
    onReject(restaurantId, reason);
    setIsRejectDialogOpen(false);
  };

  const handleRejectCancel = () => {
    setIsRejectDialogOpen(false);
  };

  const getMenuItems = () => {
    const items = [];

    // For pending restaurants (including documents pending and profile incomplete): show approve/reject
    if (restaurant.status === 'PENDING' || restaurant.status === 'DOCUMENTS_PENDING' || restaurant.status === 'PROFILE_INCOMPLETE') {
      items.push(
        <DropdownMenuItem
          key='approve'
          onClick={handleApprove}
          className='flex items-center cursor-pointer bg-white text-green-600 hover:text-green-700 hover:bg-green-50'
        >
          <Check className='mr-2 h-4 w-4' />
          <span>Approve</span>
        </DropdownMenuItem>
      );

      items.push(
        <DropdownMenuItem
          key='reject'
          onClick={handleRejectClick}
          className='flex items-center bg-white cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50'
        >
          <X className='mr-2 h-4 w-4' />
          <span>Reject</span>
        </DropdownMenuItem>
      );
    }

    // For approved restaurants: show disable option
    if (restaurant.status === 'APPROVED') 
      items.push(
        <DropdownMenuItem
          key='disable'
          onClick={handleDisable}
          className='flex items-center bg-white cursor-pointer text-orange-600 hover:text-orange-700 hover:bg-orange-300'
        >
          <Ban className='mr-2 h-4 w-4' />
          <span>Disable</span>
        </DropdownMenuItem>
      );
    

    // For disabled restaurants: show enable option
    if (restaurant.status === 'DISABLED') 
      items.push(
        <DropdownMenuItem
          key='enable'
          onClick={handleEnable}
          className='flex items-center cursor-pointer text-green-600 hover:text-green-700 hover:bg-green-50'
        >
          <CheckCircle className='mr-2 h-4 w-4' />
          <span>Enable</span>
        </DropdownMenuItem>
      );
    

    return items;
  };

  const menuItems = getMenuItems();

  // Don't show menu if no items are available
  if (menuItems.length === 0) 
    return <div className='w-8 h-8'></div>; // Empty space to maintain table alignment
  

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            color='primary'
            className='h-8 w-8 p-0 text-[#6B7280] hover:text-[#374151] hover:bg-[#F3F4F6]'
          >
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-40'>
          {menuItems}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rejection Dialog */}
      {isRejectDialogOpen && (
        <RejectRestaurantDialog
          restaurant={restaurant}
          onReject={handleRejectSubmit}
          onCancel={handleRejectCancel}
        />
      )}
    </>
  );
}