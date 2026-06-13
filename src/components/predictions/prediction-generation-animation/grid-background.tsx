'use client';

import { motion } from 'framer-motion';

export function GridBackground() {
  return (
    <div className='absolute inset-0 overflow-hidden bg-[#04050A]'>
      {/* Animated grid */}
      <motion.div
        className='absolute inset-[-2px]'
        style={{
          backgroundImage:
            'linear-gradient(rgba(79,166,248,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(79,166,248,0.12) 1px, transparent 1px)',
          backgroundSize: '46px 46px'
        }}
        animate={{ backgroundPosition: ['0px 0px', '46px 46px'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Ambient glow blobs */}
      <motion.div
        className='absolute left-1/4 top-1/3 h-[420px] w-[420px] rounded-full bg-[#4FA6F8]/20 blur-[120px]'
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.15, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className='absolute bottom-1/4 right-1/4 h-[380px] w-[380px] rounded-full bg-[#8F008D]/15 blur-[130px]'
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Vignette */}
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(4,5,10,0.92)_100%)]' />
    </div>
  );
}
