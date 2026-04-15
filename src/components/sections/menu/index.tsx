'use client';
import Link from 'next/link';
import { IoEllipsisHorizontal } from 'react-icons/io5';
import { MdOutlineLogout } from 'react-icons/md';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getMenuList, getSettingsMenu } from '@/lib/menu-list';
import { Button } from '@/components/ui/admin-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CollapseMenuButton } from '@/components/sections/collapse-menu-button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip';
// import { signOut } from 'next-auth/react';
import { Role } from '@prisma/client';

interface MenuProps {
  isOpen: boolean | undefined;
  activeRole: Role;
}

export function Menu({ isOpen, activeRole }: MenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const menuList = getMenuList(pathname);
  const settingsMenu = getSettingsMenu(pathname);


  const handleSignout = async () => {
    try {
      // Optionally get refreshToken from cookies/localStorage if needed
      const refreshToken = undefined; // Replace with actual retrieval if used
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refreshToken ? { refreshToken } : {})
      });
      // Optionally clear local/session storage here
      router.push('/login');
    } catch (err) {
      // fallback: still redirect
      router.push('/login');
    }
  };
  return (
    <ScrollArea className='[&>div>div[style]]:!block bg-bg-bg-subtle'>
      <nav className='mt-4 h-full w-full'>
        <ul className='flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2'>
          {/* Main Menu Groups */}
          {menuList.map(({ groupLabel, menus, role }, index) => (
            <li className={cn('w-full', groupLabel ? 'pt-5' : '')} key={index}>
              {(role.includes(activeRole)) ? (isOpen && groupLabel) || isOpen === undefined ? (
                <p className='text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate'>
                  {groupLabel}
                </p>
              ) : !isOpen && isOpen !== undefined && groupLabel ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className='w-full'>
                      <div className='w-full flex justify-center items-center'>
                        <IoEllipsisHorizontal className='h-5 w-5' />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side='right'>
                      <p>{groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className='pb-2'></p>
              ) : null}
              {menus.map(
                ({ href, label, icon: Icon, active, submenus, role }, index) =>
                  submenus.length === 0 ? (
                    <div key={href}>
                      {
                        (role.includes(activeRole)) && (<div className='w-full' key={index}>
                          <TooltipProvider disableHoverableContent>
                            <Tooltip delayDuration={100}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={active ? 'selected' : 'ghost'}
                                  className={cn(
                                    'w-full justify-start h-10 mb-1 text-white hover:text-white',
                                    active 
                                      ? 'bg-[#B9AFAF33] text-white rounded-[7px] w-[230px] h-[44px] px-[17px] py-[12px] gap-1 hover:bg-[#B9AFAF33]'
                                      : ''
                                  )}
                                  asChild
                                >

                                  <Link href={href}>
                                    <span
                                      className={cn(
                                        isOpen === false ? '' : 'mr-4',
                                        'text-white'
                                      )}
                                    >
                                      <Icon size={18} />
                                    </span>
                                    <p
                                      className={cn(
                                        'max-w-[200px] truncate text-white',
                                        isOpen === false
                                          ? '-translate-x-96 opacity-0'
                                          : 'translate-x-0 opacity-100',
                                        active 
                                          ? 'font-semibold text-sm leading-[15px] tracking-[-0.03em] capitalize'
                                          : ''
                                      )}
                                    >
                                      {label}
                                    </p>
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              {isOpen === false && (
                                <TooltipContent side='right'>
                                  {label}
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>)
                      }

                    </div>

                  ) : (
                    <div className='w-full' key={index}>
                      <CollapseMenuButton
                        icon={Icon}
                        label={label}
                        active={active}
                        submenus={submenus}
                        isOpen={isOpen}
                      />
                    </div>
                  )
              )}
            </li>
          ))}
          
          {/* Spacer to push settings to bottom */}
          <li className='flex-1'></li>
          
          {/* Settings Menu - Positioned at bottom */}
          {settingsMenu.role.includes(activeRole) && (
            <li className={cn('w-full', settingsMenu.groupLabel ? 'pt-5' : '')}>
              {(isOpen && settingsMenu.groupLabel) || isOpen === undefined ? (
                <p className='text-sm font-medium text-white px-4 pb-2 max-w-[248px] truncate'>
                  {settingsMenu.groupLabel}
                </p>
              ) : !isOpen && isOpen !== undefined && settingsMenu.groupLabel ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className='w-full'>
                      <div className='w-full flex justify-center items-center'>
                        <IoEllipsisHorizontal className='h-5 w-5' />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side='right'>
                      <p>{settingsMenu.groupLabel}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className='pb-2'></p>
              )}
              {settingsMenu.menus.map(
                ({ href, label, icon: Icon, active, submenus, role }, index) =>
                  submenus.length === 0 ? (
                    <div key={href}>
                      {
                        (role.includes(activeRole)) && (<div className='w-full' key={index}>
                          <TooltipProvider disableHoverableContent>
                            <Tooltip delayDuration={100}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={active ? 'selected' : 'ghost'}
                                  className={cn(
                                    'w-full justify-start h-10 mb-1 text-white hover:text-white',
                                    active 
                                      ? 'bg-[#B9AFAF33] text-white rounded-[7px] w-[230px] h-[44px] px-[17px] py-[12px] gap-1 hover:bg-[#B9AFAF33]'
                                      : ''
                                  )}
                                  asChild
                                >

                                  <Link href={href}>
                                    <span
                                      className={cn(
                                        isOpen === false ? '' : 'mr-4',
                                        'text-white'
                                      )}
                                    >
                                      <Icon size={18} />
                                    </span>
                                    <p
                                      className={cn(
                                        'max-w-[200px] truncate text-white',
                                        isOpen === false
                                          ? '-translate-x-96 opacity-0'
                                          : 'translate-x-0 opacity-100',
                                        active 
                                          ? 'font-semibold text-sm leading-[15px] tracking-[-0.03em] capitalize'
                                          : ''
                                      )}
                                    >
                                      {label}
                                    </p>
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              {isOpen === false && (
                                <TooltipContent side='right'>
                                  {label}
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>)
                      }

                    </div>

                  ) : (
                    <div className='w-full' key={index}>
                      <CollapseMenuButton
                        icon={Icon}
                        label={label}
                        active={active}
                        submenus={submenus}
                        isOpen={isOpen}
                      />
                    </div>
                  )
              )}
            </li>
          )}
          
          {/* Sign Out Button */}
          <li className='w-full flex items-end'>
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSignout}
                    variant='outline'
                    className='w-full justify-center h-10 mt-5 text-white border-white hover:text-white hover:border-white focus:text-white focus:border-white'
                  >
                    <span className={cn(isOpen === false ? '' : 'mr-4')}>
                      <MdOutlineLogout size={18} />
                    </span>
                    <p
                      className={cn(
                        'whitespace-nowrap',
                        isOpen === false ? 'opacity-0 hidden' : 'opacity-100'
                      )}
                    >
                      Sign out
                    </p>
                  </Button>
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side='right'>Sign out</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </li>
        </ul>
      </nav>
    </ScrollArea>
  );
}
