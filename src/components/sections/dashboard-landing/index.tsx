import { ShipWheelIcon as Wheelchair } from 'lucide-react';

export function DashboardLanding() {
  return (
    <div className='dashboard flex flex-col items-center justify-center min-h-[60vh] text-center'>
      <Wheelchair className='h-24 w-24 mb-4 text-primary' />
      <h1 className='text-4xl font-extrabold'>Welcome to Your Graphik</h1>
      <p className='text-xl text-muted-foreground mt-2'>Manage your content and settings here</p>
    </div>
  );
}
