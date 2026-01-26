'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import domliiLogo from '../../../../public/images/logo/domlii-logo.png';

export default function AuthError() {
  const searchParams = useSearchParams();
  // const router = useRouter();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    setError(errorParam || 'Unknown error');
  }, [searchParams]);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'OAuthAccountNotLinked':
        return {
          title: 'Account Already Exists',
          message: 'An account with this email already exists. Please sign in with your email and password, or contact support to link your Google account.',
          suggestion: 'Try signing in with your email and password instead.'
        };
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          message: 'You denied access to the application.',
          suggestion: 'Please try again and allow access to continue.'
        };
      case 'Verification':
        return {
          title: 'Verification Error',
          message: 'The verification token has expired or is invalid.',
          suggestion: 'Please try signing in again.'
        };
      default:
        return {
          title: 'Authentication Error',
          message: 'An error occurred during authentication.',
          suggestion: 'Please try again or contact support if the issue persists.'
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <section className='flex w-full min-h-screen bg-white'>
      <div className='w-full flex flex-col items-center justify-center px-6 md:px-12 py-12'>
        <div className='w-full max-w-[450px]'>
          <div className='bg-white p-6 flex flex-col gap-8 text-center'>
            {/* Logo */}
            <div className='flex justify-center'>
              <Image
                src={domliiLogo}
                alt='Domlii Logo'
                width={120}
                height={74}
                style={{ width: '120', height: '74' }}
              />
            </div>

            {/* Error Icon */}
            <div className='flex justify-center'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center'>
                <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
                </svg>
              </div>
            </div>

            {/* Error Details */}
            <div className='flex flex-col gap-4'>
              <h1 className='text-[22px] font-semibold leading-[24px] tracking-[-0.04em] text-[#2E2B24]'>
                {errorInfo.title}
              </h1>
              <p className='text-sm text-[#6B7280]'>
                {errorInfo.message}
              </p>
              <p className='text-xs text-[#9CA3AF]'>
                {errorInfo.suggestion}
              </p>
            </div>

            {/* Error Code */}
            {error && (
              <div className='bg-gray-50 p-3 rounded-lg'>
                <p className='text-xs text-gray-500'>Error Code: {error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex flex-col gap-3'>
              <Link
                href='/login'
                className='h-11 bg-gradient-to-b from-[rgba(255,255,255,0.12)] to-[rgba(255,255,255,0)] bg-[#080707] text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 shadow-lg border border-[#191818] hover:bg-[#1a1a1a] transition-colors'
              >
                Try Again
              </Link>
              
              <Link
                href='/register'
                className='h-10 w-full bg-white border border-[#DDE5EC] rounded-lg flex items-center justify-center gap-3 shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium text-[#1F2937]'
              >
                Create New Account
              </Link>
            </div>

            {/* Support Link */}
            <div className='text-center text-sm'>
              <span className='text-[#6B7280]'>Need help? </span>
              <a 
                href='mailto:support@domlii.com' 
                className='font-semibold text-[#1F2937] hover:underline'
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}