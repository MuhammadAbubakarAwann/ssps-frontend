export default function UnauthorizedPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>403 - Unauthorized</h1>
        <p className='text-gray-600 mb-8'>You don&apos;t have permission to access this resource.</p>
        <p className='text-sm text-gray-500'>Admin access required.</p>
      </div>
    </div>
  );
}