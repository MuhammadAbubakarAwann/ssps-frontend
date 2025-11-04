'use client';

import * as React from 'react';
import { Root, Fallback, Image } from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof Root> {
  className?: string;
};

const Avatar = React.forwardRef<
  React.ElementRef<typeof Root>,
  AvatarProps
>(({ className, ...props }, ref) => {
  const rootClassName = cn(
    'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
    className
  );
  return (
    <Root
      ref={ref}
      className={rootClassName}
      {...props}
    />
  );
});

Avatar.displayName = 'Avatar';

interface AvatarImageProps extends React.ComponentPropsWithoutRef<typeof Image> {
  className?: string;
}

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof Image>,
  AvatarImageProps
>(({ className, ...props }, ref) => (
  <Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
    alt='Avatar'
  />
));

AvatarImage.displayName = 'AvatarImage';

interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<typeof Fallback> {
  className?: string;
}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof Fallback>,
  AvatarFallbackProps
>(({ className, ...props }, ref) => (
  <Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className
    )}
    {...props}
  />
));

AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
