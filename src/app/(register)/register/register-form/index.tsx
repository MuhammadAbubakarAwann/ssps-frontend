'use client';
import { type FormEvent, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/db/server-actions';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { ArrowRight, Mail, Eye, EyeOff, Lock, User } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import Image from 'next/image';
import authbg from "../../../../../public/images/auth-bg.png";
import domliiLogo from "../../../../../public/images/logo/domlii-logo.png";


export default function RegisterForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirectUrl');
  const ref = useRef<HTMLFormElement>(null);
  const [token, setToken] = useState<string | null>(null);


  const loginLink = redirectUrl ? `/login?redirectUrl=${redirectUrl}` : '/login';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const r = await register({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string
    });

    setLoading(false);

    if (r?.error) toast.error(r.error);
    else {
      toast.success('Registration successful!');
      if (redirectUrl) router.push(`/login?redirectUrl=${encodeURIComponent(redirectUrl)}`);
      else router.push('/login');
    }
    ref.current?.reset();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      const safeRedirectUrl = redirectUrl && redirectUrl.startsWith("/") ? redirectUrl : "/";
      
      // For OAuth providers like Google, we should use redirect: true
      // This will redirect to Google's consent screen with account selection
      await signIn("google", {
        callbackUrl: safeRedirectUrl,
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed. Please try again.");
      setLoading(false);
    }
    // Note: setLoading(false) is not needed here because the page will redirect
  };

  return (
    <section className="flex w-full min-h-screen bg-white">
      <div className="hidden lg:block lg:w-[35%] relative">
        <div className="bg-primary-solid w-full h-full"></div>
        <Image
          src={authbg || "/placeholder.svg"}
          alt="Background"
          fill
          priority
          className="object-cover object-center"
          style={{ filter: "brightness(0.7)" }}
        />
      </div>

      <div className="w-full lg:w-[65%] flex flex-col items-center justify-center px-6 md:px-12 lg:px-12 py-12">
        <div className="w-full max-w-[450px]">
          {/* Form card container */}
          <div className="bg-white p-6 flex flex-col gap-8">
            <div className="flex justify-center">
              <Image
                src={domliiLogo}
                alt="Domlii Logo"
                width={120}
                height={74}
                style={{ width: "120", height: "74" }}
              />
            </div>
            <div className="flex flex-col gap-4 text-left">
              <h1 className="text-[22px] font-semibold leading-[24px] tracking-[-0.04em] text-[#2E2B24]">
                Create your account
              </h1>
            </div>

            <form ref={ref} onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
              {/* Full Name Field */}
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-semibold text-[#1F2937] capitalize">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#626974]">
                    <User size={18} />
                  </div>
                  <Input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter your full name"
                    className="h-10 pl-10 border border-[#E3EBF2] bg-white text-sm rounded-lg focus:outline-none focus:ring-0 shadow-sm"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-semibold text-[#1F2937] capitalize">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#626974]">
                    <Mail size={18} />
                  </div>
                  <Input
                    type="email"
                    name="email"
                    required
                    placeholder="Enter your email"
                    className="h-10 pl-10 border border-[#FABB17] bg-white text-sm rounded-lg focus:outline-none focus:ring-0 shadow-sm"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-semibold text-[#1F2937] capitalize">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#626974]">
                    <Lock size={18} />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Create a password"
                    className="h-10 pl-10 pr-12 border border-[#E3EBF2] bg-white text-sm rounded-lg focus:outline-none focus:ring-0 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6B7280]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-11 bg-gradient-to-b from-[rgba(255,255,255,0.12)] to-[rgba(255,255,255,0)] bg-[#080707] text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 shadow-lg border border-[#191818] hover:bg-[#1a1a1a] transition-colors"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              </button>
            </form>

            <div className="flex items-center gap-4 w-full">
              <div className="flex-1 h-px bg-[#E5E7EB]" />
              <span className="text-xs font-normal text-[#6B7280]">Or Log in with</span>
              <div className="flex-1 h-px bg-[#E5E7EB]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="h-10 w-full bg-white border border-[#DDE5EC] rounded-lg flex items-center justify-center gap-3 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FcGoogle size={20} />
              <span className="text-sm font-medium text-[#1F2937]">
                {loading ? "Signing in..." : "Google"}
              </span>
            </button>

            <div className="text-center text-sm font-normal">
              <span className="text-[#1F2937]">
                Already have an account?{" "}
              </span>
              <Link
                href={loginLink}
                className="font-semibold text-[#1F2937] hover:underline"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
