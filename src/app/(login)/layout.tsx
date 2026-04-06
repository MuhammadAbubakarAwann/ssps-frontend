import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';
import '../globals.css';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='font-graphik'>
      <NextTopLoader color='#0a778f' />
      {children}
      <Toaster />
    </div>
  );
}
