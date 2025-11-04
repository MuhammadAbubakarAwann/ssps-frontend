'use client';

import React from 'react';
import { Toaster, toast } from 'sonner';

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast(message),
  custom: (message: string, options?: any) => toast(message, options)
};

export const ToasterProvider: React.FC = () => {
  return <Toaster position='bottom-right'  />;
};
