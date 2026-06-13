'use client';
import { type FormEvent, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Mail, Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import sppsLogoWhite from '../../../../../public/images/logo/SPPS-logo-white.png';

export default function RegisterForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirectUrl');
  const ref = useRef<HTMLFormElement>(null);

  const loginLink = redirectUrl ? `/login?redirectUrl=${redirectUrl}` : '/login';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);

    // const formData = new FormData(event.currentTarget);
    
    try {
      // Add your registration logic here
      // const email = formData.get('email') as string;
      // const password = formData.get('password') as string;
      // const name = formData.get('name') as string;

      // Example: Call your registration endpoint
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   body: JSON.stringify({ email, password, name })
      // });

      setLoading(false);
      toast.success('Registration successful!');
      ref.current?.reset();
      
      if (redirectUrl) {
        router.push(`/login?redirectUrl=${encodeURIComponent(redirectUrl)}`);
      } else {
        router.push('/login');
      }
    } catch (error) {
      setLoading(false);
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
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
            <Image src={sppsLogoWhite} alt='SPPS Logo' width={160} height={124} style={{ width: '160', height: '124' }} />
          </div>

          <div className='flex flex-col gap-2.5 text-center'>
            <h1 className='text-[28px] font-medium leading-[130%] tracking-[-0.02em] text-fg-default'>Create your account</h1>
            <p className='text-lg text-fg-text'>Welcome! Please enter your details to get started.</p>
          </div>

          <form ref={ref} onSubmit={handleSubmit} className='flex flex-col gap-8 w-full'>
            <div className='flex flex-col gap-2.5'>
              <label className='text-lg font-medium text-fg-default'>Full Name*</label>
              <div className='relative'>
                <div className='absolute left-4 top-1/2 transform -translate-y-1/2 text-fg-text'>
                  <User size={20} />
                </div>
                <Input
                  type='text'
                  name='name'
                  required
                  placeholder='Enter your full name'
                  className='h-12 pl-12 rounded-lg border border-white/10 bg-white/[0.03] text-lg text-fg-default placeholder:text-fg-text focus:outline-none focus:ring-2 focus:ring-[#4FA6F8]/30 focus:border-[#4FA6F8]/50 transition-colors'
                />
              </div>
            </div>

            <div className='flex flex-col gap-2.5'>
              <label className='text-lg font-medium text-fg-default'>Email*</label>
              <div className='relative'>
                <div className='absolute left-4 top-1/2 transform -translate-y-1/2 text-fg-text'>
                  <Mail size={20} />
                </div>
                <Input
                  type='email'
                  name='email'
                  required
                  placeholder='Enter your email'
                  className='h-12 pl-12 rounded-lg border border-white/10 bg-white/[0.03] text-lg text-fg-default placeholder:text-fg-text focus:outline-none focus:ring-2 focus:ring-[#4FA6F8]/30 focus:border-[#4FA6F8]/50 transition-colors'
                />
              </div>
            </div>

            <div className='flex flex-col gap-2.5'>
              <label className='text-lg font-medium text-fg-default'>Password*</label>
              <div className='relative'>
                <div className='absolute left-4 top-1/2 transform -translate-y-1/2 text-fg-text'>
                  <Lock size={20} />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  required
                  placeholder='Create a password'
                  className='h-12 pl-12 pr-12 rounded-lg border border-white/10 bg-white/[0.03] text-lg text-fg-default placeholder:text-fg-text focus:outline-none focus:ring-2 focus:ring-[#4FA6F8]/30 focus:border-[#4FA6F8]/50 transition-colors'
                />
                <button
                  type='button'
                  onClick={togglePasswordVisibility}
                  className='absolute right-4 top-1/2 transform -translate-y-1/2 text-fg-text hover:text-fg-default transition-colors'
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='h-12 rounded-lg bg-gradient-to-r from-[#4FA6F8] to-[#7FD0FF] text-[#04050A] font-medium flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(79,166,248,0.25)] hover:shadow-[0_0_45px_rgba(79,166,248,0.45)] transition-all disabled:opacity-70'
            >
              <span className='text-lg font-medium'>{loading ? 'Creating Account...' : 'Create Account'}</span>
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className='text-center text-lg text-fg-text'>
            Already have an account?{' '}
            <Link href={loginLink} className='font-semibold text-[#7FD0FF] hover:text-[#9FE0FF] transition-colors'>
              Log in
            </Link>
          </div>
        </div>
      </div>

      <div className='hidden lg:block lg:w-3/5 relative bg-bg-base overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-[#04050A] via-[#0A0C16] to-[#04050A]' />
        <div className='absolute -right-20 -top-20 h-96 w-96 rounded-full bg-glow-purple opacity-20 blur-[120px]' />
        <div className='absolute -bottom-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-glow-blue opacity-20 blur-[130px]' />
        <div className='absolute bottom-20 left-10 max-w-[474px] flex flex-col gap-5 z-10 glass-card p-8'>
          <h2 className='text-[28px] font-semibold tracking-[0.05em] text-fg-default'>Student Performance Prediction System</h2>
          <p className='text-xl font-normal leading-[180%] tracking-[-0.02em] text-fg-text'>
            Predict the future grading to improve student Performance
          </p>
        </div>
      </div>
    </section>
  );
}
