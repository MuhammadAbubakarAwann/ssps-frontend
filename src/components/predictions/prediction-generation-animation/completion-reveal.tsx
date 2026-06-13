'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const BURST_PARTICLES = Array.from({ length: 28 }, (_, i) => {
  const angle = (i / 28) * Math.PI * 2;
  const distance = 140 + (i % 4) * 40;
  return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, delay: (i % 5) * 0.02 };
});

export function CompletionReveal() {
  return (
    <div className='absolute inset-0 flex items-center justify-center'>
      {/* Burst particles from the collapsed sphere */}
      {BURST_PARTICLES.map((particle, i) => (
        <motion.span
          key={i}
          className='absolute h-1.5 w-1.5 rounded-full bg-[#7FD0FF]'
          style={{ boxShadow: '0 0 10px rgba(127,208,255,0.9)' }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: particle.x, y: particle.y, opacity: 0, scale: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: particle.delay }}
        />
      ))}

      {/* Glassmorphism completion card */}
      <motion.div
        className='relative z-10 flex flex-col items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.06] px-12 py-10 text-center shadow-[0_0_60px_rgba(79,166,248,0.25)] backdrop-blur-2xl'
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.35 }}
      >
        <motion.div
          className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#4FA6F8] to-[#22D3EE] shadow-[0_0_30px_rgba(79,166,248,0.6)]'
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.5 }}
        >
          <CheckCircle2 className='h-9 w-9 text-white' strokeWidth={2} />
        </motion.div>

        <div className='flex flex-col gap-1'>
          <h3 className='text-[22px] font-semibold text-white'>Prediction Complete</h3>
          <p className='text-[13px] text-white/60'>Your AI-powered analysis is ready</p>
        </div>
      </motion.div>
    </div>
  );
}
