// File: components/ui/AlertDialog.tsx
'use client';

import React from 'react';
import {
  AlertDialog as RadixAlertDialog,
  AlertDialogTrigger,
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

interface AlertDialogProps {
  trigger: React.ReactNode; // The element that triggers the dialog
  title: string; // Title of the dialog
  description: string; // Description text of the dialog
  actionText?: string; // Text for the primary action button
  cancelText?: string; // Text for the cancel button
  onConfirm: () => void; // Action to perform on confirmation
  onCancel?: () => void; // Optional action on cancel
  actionVariant?: string; // Optional class for action button styling
  cancelVariant?: string; // Optional class for cancel button styling
  customContent?: React.ReactNode; // Optional custom content to display in the dialog
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  trigger,
  title,
  description,
  actionText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  actionVariant = 'bg-error text-error-on-error',
  cancelVariant = 'bg-muted text-muted-foreground',
  customContent
}) => {
  return (
    <RadixAlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
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
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className='text-muted-foreground mt-2 text-sm'>
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {customContent && (
            <div className='mt-4'>
              {customContent}
            </div>
          )}
          <AlertDialogFooter className='mt-4 flex justify-end space-x-2'>
            <AlertDialogCancel
              className={cn(
                'rounded-md px-4 py-2 text-sm transition-colors',
                cancelVariant
              )}
              onClick={onCancel}
            >
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                'rounded-md px-4 py-2 text-sm transition-colors',
                actionVariant
              )}
              onClick={onConfirm}
            >
              {actionText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </RadixAlertDialog>
  );
};

export default AlertDialog;
