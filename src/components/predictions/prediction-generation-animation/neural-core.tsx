'use client';

import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface NeuralCoreProps {
  active: boolean;
}

const PARTICLES = Array.from({ length: 32 }, (_, i) => {
  const angle = (i / 32) * Math.PI * 2;
  const radius = 70 + (i % 4) * 26;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    size: 2 + (i % 3),
    delay: (i % 8) * 0.15,
    duration: 2 + (i % 5) * 0.4
  };
});

const RAYS = Array.from({ length: 12 }, (_, i) => (i / 12) * 360);

const MATRIX_COLUMNS = Array.from({ length: 14 }, (_, i) => ({
  left: `${4 + (i / 14) * 92}%`,
  delay: (i % 7) * 0.5,
  duration: 5 + (i % 4),
  digits: Array.from({ length: 16 }, (_, j) => (i * 5 + j * 11) % 2)
}));

export function NeuralCore({ active }: NeuralCoreProps) {
  return (
    <div className='absolute inset-0 flex items-center justify-center'>
      {/* Matrix-style data rain */}
      <div className='absolute inset-0 overflow-hidden opacity-40'>
        {MATRIX_COLUMNS.map((column, i) => (
          <motion.div
            key={i}
            className='absolute top-0 flex flex-col items-center font-mono text-[11px] leading-[14px] text-[#4FA6F8]/40'
            style={{ left: column.left }}
            initial={{ y: '-100%' }}
            animate={active ? { y: '100vh' } : { y: '-100%' }}
            transition={{ duration: column.duration, repeat: Infinity, ease: 'linear', delay: column.delay }}
          >
            {column.digits.map((digit, j) => (
              <span key={j}>{digit}</span>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Orbiting particles */}
      {active &&
        PARTICLES.map((particle, i) => (
          <motion.span
            key={i}
            className='absolute rounded-full bg-[#4FA6F8]'
            style={{ width: particle.size, height: particle.size, boxShadow: '0 0 8px rgba(79,166,248,0.8)' }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: [0, particle.x, 0],
              y: [0, particle.y, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: particle.duration, repeat: Infinity, ease: 'easeInOut', delay: particle.delay }}
          />
        ))}

      {/* Radiating connection rays */}
      {active &&
        RAYS.map((angle, i) => (
          <motion.span
            key={i}
            className='absolute h-px w-24 origin-left bg-gradient-to-r from-[#4FA6F8] to-transparent'
            style={{ rotate: angle }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 0], opacity: [0, 0.8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: (i % 6) * 0.2 }}
          />
        ))}

      {/* AI core */}
      <motion.div
        className='relative flex h-24 w-24 items-center justify-center rounded-full'
        initial={{ scale: 0.6, opacity: 0 }}
        animate={active ? { scale: [0.9, 1.08, 0.9], opacity: 1 } : { scale: 0.6, opacity: 0 }}
        transition={{ duration: 2.2, repeat: active ? Infinity : 0, ease: 'easeInOut' }}
      >
        <span className='absolute inset-0 rounded-full bg-[#4FA6F8]/30 blur-2xl' />
        <span className='absolute inset-0 rounded-full border border-[#4FA6F8]/50' />
        <span className='absolute -inset-3 rounded-full border border-[#8F008D]/30' />
        <div className='relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#4FA6F8] to-[#8F008D] shadow-[0_0_40px_rgba(79,166,248,0.6)]'>
          <Brain className='h-7 w-7 text-white' strokeWidth={1.75} />
        </div>
      </motion.div>
    </div>
  );
}
