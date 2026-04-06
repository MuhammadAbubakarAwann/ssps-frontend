'use client';
import { type FormEvent, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Mail, Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react';

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

    const formData = new FormData(event.currentTarget);
    
    try {
      // Add your registration logic here
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const name = formData.get('name') as string;

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
            <div className='text-2xl font-bold text-gray-900'>Your Logo</div>
          </div>

          <div className='flex flex-col gap-2.5 text-center'>
            <h1 className='text-[28px] font-medium leading-[130%] tracking-[-0.02em]'>Create your account</h1>
            <p className='text-lg text-black/50'>Welcome! Please enter your details to get started.</p>
          </div>

          <form ref={ref} onSubmit={handleSubmit} className='flex flex-col gap-8 w-full'>
            <div className='flex flex-col gap-2.5'>
              <label className='text-lg font-medium'>Full Name*</label>
              <div className='relative'>
                <div className='absolute left-4 top-1/2 transform -translate-y-1/2 text-black/50'>
                  <User size={20} />
                </div>
                <Input
                  type='text'
                  name='name'
                  required
                  placeholder='Enter your full name'
                  className='h-12 pl-12 border border-black/10 bg-black/[0.01] text-lg rounded-none focus:outline-none focus:ring-0 focus:border-black/20'
                />
              </div>
            </div>

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
                  placeholder='Create a password'
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

            <button
              type='submit'
              disabled={loading}
              className='h-12 bg-[#2A313B] text-white flex items-center justify-center gap-2 hover:bg-[#1f2430] transition-colors disabled:opacity-70'
            >
              <span className='text-lg font-medium'>{loading ? 'Creating Account...' : 'Create Account'}</span>
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className='text-center text-lg'>
            Already have an account?{' '}
            <Link href={loginLink} className='font-semibold text-black hover:text-black/70'>
              Log in
            </Link>
          </div>
        </div>
      </div>

      <div className='hidden lg:block lg:w-3/5 relative bg-gray-900'>
        <div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black' />
        <div className='absolute bottom-20 left-10 text-white max-w-[474px] flex flex-col gap-5 z-10'>
          <h2 className='text-[28px] font-semibold tracking-[0.05em]'>Your Company</h2>
          <p className='text-xl font-normal leading-[180%] tracking-[-0.02em]'>
            From vision to reality — we empower your digital journey with purpose and precision.
          </p>
        </div>
      </div>
    </section>
  );
}
