'use client';

import { useState } from 'react';
import {
  AlertDialog as RadixAlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Rider } from '@/types/rider';

interface RejectRiderDialogProps {
  rider: Rider;
  onReject: (riderId: string, reason: string) => void;
  onCancel: () => void;
}

export function RejectRiderDialog({ rider, onReject, onCancel }: RejectRiderDialogProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const handleSubmit = () => {
    if (rejectionReason.trim()) {
      onReject(rider.id, rejectionReason.trim());
      setRejectionReason('');
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setRejectionReason('');
    setIsOpen(false);
    onCancel();
  };

  return (
    <RadixAlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogPortal>
        <AlertDialogOverlay
          className={cn(
            'fixed inset-0 z-50 bg-black/20 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in'
          )}
        />
        <AlertDialogContent
          className={cn(
            'fixed left-[50%] top-[50%] z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg'
          )}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className='text-lg font-semibold'>
              Reject Rider
            </AlertDialogTitle>
            <AlertDialogDescription className='text-muted-foreground mt-2 text-sm'>
              Are you sure you want to reject {rider.riderName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className='mt-4'>
            <label htmlFor='rejectionReason' className='block text-sm font-medium text-gray-700 mb-2'>
              Reason for rejection *
            </label>
            <textarea
              id='rejectionReason'
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder='Please provide a detailed reason for rejecting this rider...'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none'
              rows={4}
              required
            />
          </div>

          <AlertDialogFooter className='mt-4 flex justify-end space-x-2'>
            <AlertDialogCancel asChild>
              <Button
                variant='outline'
                size='medium'
                color='primary'
                onClick={handleCancel}
                className='rounded-md px-4 py-2 text-sm transition-colors'
              >
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={handleSubmit}
                size='medium'
                color='primary'
                variant='outline'
                disabled={!rejectionReason.trim()}
                className='bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md px-4 py-2 text-sm transition-colors'
              >
                Reject
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </RadixAlertDialog>
  );
}