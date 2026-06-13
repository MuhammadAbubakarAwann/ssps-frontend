import { UserNav } from '@/components/sections/user-nav';
import { SheetMenu } from '@/components/sections/sheet-menu';
import { UserInfo } from '@/@types';

interface NavbarProps {
  title: string;
  userInfo: UserInfo | null
}

export function Navbar({ title, userInfo }: NavbarProps) {
  return (
    <header className='sticky top-0 z-10 w-full border-b border-white/[0.06] bg-bg-default/80 shadow-[0_1px_24px_rgba(79,166,248,0.06)] backdrop-blur-xl'>
      <div className='mx-4 sm:mx-8 flex h-14 items-center'>
        <div className='flex items-center space-x-4 lg:space-x-0'>
          <SheetMenu userInfo={userInfo} />
          <h1 className='font-bold text-fg-default'>{title}</h1>
        </div>
        <div className='flex flex-1 items-center] space-x-2 justify-end'>
          <UserNav userInfo={userInfo} />
        </div>
      </div>
    </header>
  );
}
