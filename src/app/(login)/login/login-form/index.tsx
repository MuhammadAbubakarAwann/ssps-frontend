'use client';
import { type FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { ArrowRight, Mail, Eye, EyeOff, Lock } from 'lucide-react';
import authbg from '../../../../../public/images/auth-bg.png';
import sppsLogoBlack from '../../../../../public/images/logo/SPPS-logo-black.png';
import { login } from '@/lib/auth-client';
import Image from 'next/image';

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirectUrl');

  const safeRedirectUrl = redirectUrl && redirectUrl.startsWith('/') ? redirectUrl : '/';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      const response = await login({
        email,
        password
      });

      if (!response.success) {
        throw new Error(response.message || 'Invalid credentials');
      }

      setLoading(false);
      toast.success('Sign In successful!');
      router.push(safeRedirectUrl);
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className='flex w-full min-h-screen'>
      <div className='w-full lg:w-2/5 flex flex-col items-center justify-center px-6 md:px-12 lg:px-20'>
        <div className='w-full max-w-[419px] flex flex-col gap-12'>
          <div className='flex justify-center'>
            <Image src={sppsLogoBlack} alt='SPPS Logo' width={160} height={124} style={{ width: '160', height: '124' }} />
          </div>

          <div className='flex flex-col gap-2.5 text-center'>
            <h1 className='text-[28px] font-medium leading-[130%] tracking-[-0.02em]'>Log in to your account</h1>
            <p className='text-lg text-black/50'>Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleSubmit} className='flex flex-col gap-8 w-full'>
            <div className='flex flex-col gap-2.5'>
              <label className='text-lg font-medium'>Email*</label>
              <div className='relative'>
                <div className='absolute left-4 top-1/2 transform -translate-y-1/2 text-black/50'>
                  <Mail size={20} />
                </div>
                <Input
                  type='email'
                  name='email'
                  required
                  placeholder='Enter your email'
                  className='h-12 pl-12 border border-black/10 bg-black/[0.01] text-lg rounded-none focus:outline-none focus:ring-0 focus:border-black/20'
                />
              </div>
            </div>

            <div className='flex flex-col gap-2.5'>
              <label className='text-lg font-medium'>Password*</label>
              <div className='relative'>
                <div className='absolute left-4 top-1/2 transform -translate-y-1/2 text-black/50'>
                  <Lock size={20} />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  required
                  placeholder='••••••••'
                  className='h-12 pl-12 pr-12 border border-black/10 bg-black/[0.01] text-lg rounded-none focus:outline-none focus:ring-0 focus:border-black/20'
                />
                <button
                  type='button'
                  onClick={togglePasswordVisibility}
                  className='absolute right-4 top-1/2 transform -translate-y-1/2 text-black/50 hover:text-black'
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <input
                  type='checkbox'
                  id='remember'
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className='w-5 h-5 border border-black/10 bg-black/[0.01] cursor-pointer'
                />
                <label htmlFor='remember' className='text-base text-black/50 cursor-pointer'>
                  Remember for 30 days
                </label>
              </div>
              <Link href='/forgot-password' className='text-base font-semibold text-black hover:text-black/70'>
                Forgot password?
              </Link>
            </div>

            <button
              type='submit'
              className='h-12 bg-[#2A313B] text-white flex items-center justify-center gap-2 hover:bg-[#1f2430] transition-colors disabled:opacity-70'
              disabled={loading}
            >
              <span className='text-lg font-medium'>{loading ? 'Logging in...' : 'Log in'}</span>
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className='text-center text-lg'>
            Need an account?{' '}
            <span className='font-semibold text-black/70'>Contact your administrator</span>
          </div>
        </div>
      </div>

      <div className='hidden lg:block lg:w-3/5 relative bg-gray-900'>
         <Image
          src={authbg || '/placeholder.svg'}
          alt='Background'
          fill
          priority
          className='object-cover'
          style={{ filter: 'brightness(0.7)' }}
        />
        <div className='absolute bottom-20 left-10 text-white max-w-[474px] flex flex-col gap-5 z-10'>
          <h2 className='text-[28px] font-semibold tracking-[0.05em]'>Student Performance Prediction System</h2>
          <p className='text-xl font-normal leading-[180%] tracking-[-0.02em]'>
            Predict the future grading to improve student Performance
          </p>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;
