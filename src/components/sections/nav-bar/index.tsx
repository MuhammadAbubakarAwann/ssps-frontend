import { UserNav } from '@/components/sections/user-nav';
import { SheetMenu } from '@/components/sections/sheet-menu';
import { UserInfo } from '@/@types';

interface NavbarProps {
  title: string;
  userInfo: UserInfo
}

export function Navbar({ title, userInfo }: NavbarProps) {
  return (
    <header className='sticky dark:bg-bg-default top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary'>
      <div className='mx-4 sm:mx-8 flex h-14 items-center'>
        <div className='flex items-center space-x-4 lg:space-x-0'>
          <SheetMenu userInfo={userInfo} />
          <h1 className='font-bold'>{title}</h1>
        </div>
        <div className='flex flex-1 items-center] space-x-2 justify-end'>
          <UserNav userInfo={userInfo} />
        </div>
      </div>
    </header>
  );
}
