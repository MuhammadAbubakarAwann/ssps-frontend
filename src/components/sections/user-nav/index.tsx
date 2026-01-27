'use client';
import Link from 'next/link';
import { LuLayoutGrid } from 'react-icons/lu';
import { MdOutlineLogout } from 'react-icons/md';
import { FiUsers } from 'react-icons/fi';
import { Button } from '@/components/ui/admin-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { logout } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { UserInfo } from '@/@types';

export function UserNav({ userInfo }: { userInfo: UserInfo }) {
  const router = useRouter();
  
  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return (
    <DropdownMenu  >
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='relative h-8 w-8 rounded-full'
              >
                <Avatar className='h-8 w-8'>
                  <AvatarImage src={userInfo.image || ''} alt={'Avatar'} />
                  <AvatarFallback className='bg-transparent'>
                    {userInfo.name?.toString()[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side='bottom'>Profile</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className='w-56 bg-primary-on-primary dark:bg-bg-default' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{userInfo.name}</p>
            <p className='text-xs leading-none text-muted-foreground'>
              {userInfo.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className='hover:cursor-pointer' asChild>
            <Link href='/dashboard' className='flex items-center'>
              <LuLayoutGrid className='w-4 h-4 mr-3 text-muted-foreground' />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className='hover:cursor-pointer' asChild>
            <Link href='/dashboard/account' className='flex items-center'>
              <FiUsers className='w-4 h-4 mr-3 text-muted-foreground' />
              Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='hover:cursor-pointer' onClick={handleSignOut}>
          <MdOutlineLogout className='w-4 h-4 mr-3 text-muted-foreground' />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
