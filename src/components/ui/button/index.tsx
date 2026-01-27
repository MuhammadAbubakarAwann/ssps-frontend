'use client';

import React, { forwardRef, type JSX, useRef } from 'react';
import styles from './index.module.css';
import { mergeRefs } from 'react-merge-refs';
import { Loading } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  as?: keyof JSX.IntrinsicElements | React.ElementType
  className?: string
  color: 'primary' | 'gray'
  size: 'small' | 'medium' | 'large' | 'icon'
  variant: 'solid' | 'soft' | 'surface' | 'outline' | 'ghost'
  type?: 'submit' | 'reset' | 'button'
  form?: string
  leading?: boolean
  trailing?: boolean
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  loading?: boolean
  disabled?: boolean
}

// Create buttonVariants function to match your Button component's styling system
// and provide compatibility with Radix UI components like AlertDialog
export const buttonVariants = (props?: {
  variant?: ButtonProps['variant'] | 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: ButtonProps['size'];
  color?: ButtonProps['color'];
}) => {
  const { variant = 'solid', size = 'small', color = 'primary' } = props || {};
  
  // For Radix UI compatibility - map their variant names to our system
  if (variant === 'default')
    return cn(styles.root, styles.primary, styles.small, styles.solid);
  if (variant === 'outline')
    return cn(styles.root, styles.primary, styles.small, styles.outline);
  
  // For our standard button system
  return cn(styles.root, color && styles[color], size && styles[size], variant && styles[variant]);
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      as: Component = 'button',
      className,
      children,
      color = 'primary',
      size = 'small',
      variant = 'solid',
      type = 'button',
      leadingIcon,
      trailingIcon,
      leading = false,
      trailing = false,
      loading = false,
      disabled = false,
      ...rest
    },
    buttonRef,
  ) => {
    const ref = useRef(null);
    const rootClassName = cn(
      styles.root,
      color && styles[color],
      size && styles[size],
      variant && styles[variant],
      {
        [styles.loading]: loading,
        [styles.disabled]: disabled
      },
      className,
    );

    return React.createElement(
      Component,
      {
        ref: mergeRefs([ref, buttonRef]),
        className: rootClassName,
        'data-size': size,
        'data-color': color,
        'data-variant': variant,
        'data-type': type,
        type: type,
        disabled: Component === 'button' || Component === 'input' ? disabled : undefined,
        'aria-disabled': disabled ? true : undefined,
        ...rest
      },
      <>
        {leading && leadingIcon}
        {children}
        {trailing && trailingIcon}
        {loading && <Loading />}
      </>,
    );
  },
);

Button.displayName = 'Button';
