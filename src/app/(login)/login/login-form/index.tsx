'use client';
import { type FormEvent, useState } from 'react';
import { login } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Mail, Eye, EyeOff, Lock } from 'lucide-react';
import Image from 'next/image';
import authbg from '../../../../../public/images/auth-bg.png';
import domliiLogo from '../../../../../public/images/logo/domlii-logo.png';

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirectUrl');

  const safeRedirectUrl =
    redirectUrl && redirectUrl.startsWith('/') ? redirectUrl : '/';
  const registerLink = redirectUrl
    ? `/register?redirectUrl=${redirectUrl}`
    : '/register';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await login({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        role: 'ADMIN'
      });

      setLoading(false);

      if (response.success) {
        toast.success('Sign In successful!');
        // Force a small delay to ensure the session is properly set
        setTimeout(() => {
          router.push(safeRedirectUrl);
        }, 500);
      } else 
        // Handle different error scenarios
        switch (response.code) {
          case 'EMAIL_NOT_VERIFIED':
            toast.error('Please verify your email before logging in.');
            break;
          case 'PASSWORD_SETUP_REQUIRED':
            toast.error('This account requires password setup. Please use Google Sign-In or set up a password.');
            break;
          default:
            toast.error(response.message || 'Login failed');
        }
      
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className='flex w-full min-h-screen bg-white'>
      <div className='hidden lg:block lg:w-[35%] relative'>
        <div className='bg-primary-solid w-full h-full'></div>
        <Image
          src={authbg || '/placeholder.svg'}
          alt='Background'
          fill
          priority
          className='object-cover object-center'
          style={{ filter: 'brightness(0.7)' }}
        />
      </div>

      <div className='w-full lg:w-[65%] flex flex-col items-center justify-center px-6 md:px-12 lg:px-12 py-12'>
        <div className='w-full max-w-[450px]'>
          {/* Form card container */}
          <div className='bg-white  p-6 flex flex-col gap-8 '>
            <div className='flex justify-center'>
              <Image
                src={domliiLogo}
                alt='Domlii Logo'
                width={120}
                height={74}
                style={{ width: '120', height: '74' }}
              />
            </div>
            <div className='flex flex-col gap-4 text-left'>
              <h1 className='text-[22px] font-semibold leading-[24px] tracking-[-0.04em] text-[#2E2B24]'>
                Log in to your account
              </h1>
            </div>

            <form
              onSubmit={handleSubmit}
              className='flex flex-col gap-6 w-full'
            >
              {/* Email Field */}
              <div className='flex flex-col gap-2.5'>
                <label className='text-sm font-semibold text-[#1F2937] capitalize'>
                  Email
                </label>
                <div className='relative'>
                  <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#626974]'>
                    <Mail size={18} />
                  </div>
                  <Input
                    type='email'
                    name='email'
                    required
                    placeholder='Enter your email'
                    className='h-10 pl-10 border border-[#FABB17] bg-white text-sm !rounded-lg focus:outline-none focus:ring-0 shadow-sm'
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className='flex flex-col gap-2.5'>
                <label className='text-sm font-semibold text-[#1F2937] capitalize'>
                  Password
                </label>
                <div className='relative'>
                  <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#626974]'>
                    <Lock size={18} />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    required
                    placeholder='••••••••'
                    className='h-10 pl-10 pr-12 border border-[#E3EBF2] bg-white text-sm rounded-lg focus:outline-none focus:ring-0 shadow-sm'
                  />
                  <button
                    type='button'
                    onClick={togglePasswordVisibility}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6B7280]'
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember for 30 days */}
              <div className='flex items-center gap-2.5'>
                <input
                  type='checkbox'
                  id='remember'
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className='w-4 h-4 border border-[#E3EBF2] rounded accent-[#FABB17]'
                />
                <label
                  htmlFor='remember'
                  className='text-xs font-normal text-[#6B7280]'
                >
                  Remember for 30 days
                </label>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='h-11 bg-gradient-to-b from-[rgba(255,255,255,0.12)] to-[rgba(255,255,255,0)] bg-[#080707] text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 shadow-lg border border-[#191818] hover:bg-[#1a1a1a] transition-colors'
              >
                <span>log in</span>
              </button>
            </form>

            <div className='text-center text-sm font-normal'>
              <span className='text-[#1F2937]'>
                Don&apos;t have an account?{' '}
              </span>
              <Link
                href={registerLink}
                className='font-semibold text-[#1F2937] hover:underline'
              >
                Register here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;
