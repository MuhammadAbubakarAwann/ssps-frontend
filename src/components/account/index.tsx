'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { showToast } from '@/components/ui/toaster';
import { User, Lock, Mail, Shield, IdCard, Phone, MapPin } from 'lucide-react';

type Profile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  regNo?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
};

type ProfileApiResponse = {
  success?: boolean;
  message?: string;
  data?: Profile;
};

type ChangePasswordApiResponse = {
  success?: boolean;
  message?: string;
};

const FIELD_CLASS =
  'h-11 w-full rounded-[8px] border border-white/10 bg-white/[0.03] px-4 text-[14px] text-fg-default placeholder:text-fg-text focus:border-[#4FA6F8]/50 focus:outline-none focus:ring-2 focus:ring-[#4FA6F8]/20';

const READONLY_CLASS =
  'h-11 w-full rounded-[8px] border border-white/5 bg-white/[0.02] px-4 text-[14px] text-fg-text cursor-not-allowed select-none flex items-center';

function Label({ children }: { children: React.ReactNode }) {
  return <p className='mb-1.5 text-[13px] font-medium text-fg-text'>{children}</p>;
}

function SectionCard({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className='glass-card p-6'>
      <div className='mb-6 flex items-center gap-3 border-b border-white/10 pb-4'>
        <div className='flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#4FA6F8]/15'>
          <Icon size={16} className='text-[#7FD0FF]' />
        </div>
        <h2 className='text-[16px] font-semibold text-fg-default'>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function AccountMainData() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Profile edit state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const res = await fetch('/api/auth/profile', { method: 'GET' });
        const data: ProfileApiResponse = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.message || 'Failed to load profile');
        if (data.data) {
          setProfile(data.data);
          setFirstName(data.data.firstName || '');
          setLastName(data.data.lastName || '');
          setPhoneNumber(data.data.phoneNumber || '');
          setAddress(data.data.address || '');
        }
      } catch (err) {
        showToast.error(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    void fetchProfile();
  }, []);

  const isStudent = profile?.role === 'STUDENT';

  const handleSaveProfile = async () => {
    if (!firstName.trim() && !lastName.trim()) {
      showToast.error('First name or last name is required');
      return;
    }

    setIsSavingProfile(true);
    try {
      const body: Record<string, string> = {};
      if (firstName.trim()) body.firstName = firstName.trim();
      if (lastName.trim()) body.lastName = lastName.trim();
      if (isStudent) {
        if (phoneNumber.trim()) body.phoneNumber = phoneNumber.trim();
        if (address.trim()) body.address = address.trim();
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data: ProfileApiResponse = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || 'Failed to update profile');

      if (data.data) {
        setProfile(data.data);
        setFirstName(data.data.firstName || '');
        setLastName(data.data.lastName || '');
        setPhoneNumber(data.data.phoneNumber || '');
        setAddress(data.data.address || '');
      }
      showToast.success('Profile updated successfully');
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      showToast.error('Both current and new password are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showToast.error('New password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data: ChangePasswordApiResponse = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || 'Failed to change password');

      showToast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoadingProfile)
    return (
      <div className='mt-4 space-y-6 animate-pulse'>
        <div className='glass-card p-6 space-y-4'>
          <div className='h-5 w-40 rounded-full bg-white/[0.06]' />
          <div className='grid grid-cols-2 gap-4'>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className='space-y-2'>
                <div className='h-3 w-20 rounded-full bg-white/[0.06]' />
                <div className='h-11 rounded-[8px] bg-white/[0.06]' />
              </div>
            ))}
          </div>
        </div>
        <div className='glass-card p-6 space-y-4'>
          <div className='h-5 w-40 rounded-full bg-white/[0.06]' />
          <div className='space-y-4'>
            {[0, 1, 2].map((i) => (
              <div key={i} className='space-y-2'>
                <div className='h-3 w-28 rounded-full bg-white/[0.06]' />
                <div className='h-11 rounded-[8px] bg-white/[0.06]' />
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div className='mt-4 space-y-6 max-w-3xl'>
      {/* Profile Section */}
      <SectionCard title='Profile Information' icon={User}>
        <div className='space-y-4'>
          {/* Read-only info */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <Label>
                <span className='flex items-center gap-1.5'><Mail size={12} className='inline' /> Email</span>
              </Label>
              <div className={READONLY_CLASS}>{profile?.email || '—'}</div>
            </div>
            <div>
              <Label>
                <span className='flex items-center gap-1.5'><Shield size={12} className='inline' /> Role</span>
              </Label>
              <div className={READONLY_CLASS}>
                <span className='rounded-[4px] bg-[#4FA6F8]/15 px-2 py-0.5 text-[12px] font-semibold text-[#7FD0FF]'>
                  {profile?.role || '—'}
                </span>
              </div>
            </div>
            {isStudent && profile?.regNo && (
              <div>
                <Label>
                  <span className='flex items-center gap-1.5'><IdCard size={12} className='inline' /> Registration No.</span>
                </Label>
                <div className={READONLY_CLASS}>{profile.regNo}</div>
              </div>
            )}
          </div>

          {/* Editable name */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <Label>First Name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder='First name'
                className={FIELD_CLASS}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder='Last name'
                className={FIELD_CLASS}
              />
            </div>
          </div>

          {/* Student-only contact fields */}
          {isStudent && (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div>
                <Label>
                  <span className='flex items-center gap-1.5'><Phone size={12} className='inline' /> Phone Number</span>
                </Label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder='e.g. 03001234567'
                  className={FIELD_CLASS}
                />
              </div>
              <div>
                <Label>
                  <span className='flex items-center gap-1.5'><MapPin size={12} className='inline' /> Address</span>
                </Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder='Your address'
                  className={FIELD_CLASS}
                />
              </div>
            </div>
          )}

          <div className='flex justify-end pt-2'>
            <Button
              size='medium'
              color='primary'
              variant='solid'
              onClick={handleSaveProfile}
              loading={isSavingProfile}
              className='!rounded-[7px] text-[14px] font-semibold text-white'
            >
              Save Changes
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* Change Password Section */}
      <SectionCard title='Change Password' icon={Lock}>
        <div className='space-y-4'>
          <div>
            <Label>Current Password</Label>
            <Input
              type='password'
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder='Enter current password'
              className={FIELD_CLASS}
            />
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <Label>New Password</Label>
              <Input
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder='Enter new password'
                className={FIELD_CLASS}
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Repeat new password'
                className={FIELD_CLASS}
              />
            </div>
          </div>
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className='text-[12px] text-[#FF8A8F]'>Passwords do not match</p>
          )}
          <div className='flex justify-end pt-2'>
            <Button
              size='medium'
              color='primary'
              variant='solid'
              onClick={handleChangePassword}
              loading={isChangingPassword}
              disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className='!rounded-[7px] text-[14px] font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Change Password
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
