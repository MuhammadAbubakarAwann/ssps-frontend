'use client';

import { motion } from 'framer-motion';

interface ConfidenceSphereProps {
  confidence: number;
}

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ConfidenceSphere({ confidence }: ConfidenceSphereProps) {
  const offset = CIRCUMFERENCE - (confidence / 100) * CIRCUMFERENCE;

  return (
    <div className='absolute inset-0 flex flex-col items-center justify-center gap-6'>
      <div className='relative flex h-48 w-48 items-center justify-center'>
        {/* Glow */}
        <motion.span
          className='absolute h-full w-full rounded-full bg-[#4FA6F8]/30 blur-3xl'
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Progress ring */}
        <svg className='absolute h-full w-full -rotate-90' viewBox='0 0 100 100'>
          <circle cx='50' cy='50' r={RADIUS} fill='none' stroke='rgba(255,255,255,0.08)' strokeWidth='3' />
          <motion.circle
            cx='50'
            cy='50'
            r={RADIUS}
            fill='none'
            stroke='#4FA6F8'
            strokeWidth='3'
            strokeLinecap='round'
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ filter: 'drop-shadow(0 0 6px rgba(79,166,248,0.8))' }}
          />
        </svg>

        {/* Core sphere */}
        <div className='relative flex h-32 w-32 items-center justify-center rounded-full border border-[#4FA6F8]/40 bg-gradient-to-br from-[#0B1220] to-[#1B2A41] shadow-[0_0_50px_rgba(79,166,248,0.4)]'>
          <motion.span
            key={confidence}
            className='text-[34px] font-bold text-white'
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            {confidence}%
          </motion.span>
        </div>
      </div>

      <p className='text-[13px] font-medium uppercase tracking-[0.25em] text-white/50'>AI Confidence</p>
    </div>
  );
}
