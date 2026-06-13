'use client';

import { motion } from 'framer-motion';
import { DATA_CARDS } from './constants';

interface FloatingDataCardsProps {
  active: boolean;
}

export function FloatingDataCards({ active }: FloatingDataCardsProps) {
  return (
    <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
      {DATA_CARDS.map((card, index) => (
        <motion.div
          key={card.label}
          className='absolute flex w-[150px] flex-col gap-1 rounded-xl border border-[#4FA6F8]/30 bg-white/[0.04] px-4 py-3 shadow-[0_0_30px_rgba(79,166,248,0.15)] backdrop-blur-md'
          initial={{
            x: card.origin.x,
            y: card.origin.y,
            opacity: 0,
            scale: 0.6,
            rotate: card.rotate
          }}
          animate={
            active
              ? {
                  x: [card.origin.x, card.origin.x * 0.35, 0],
                  y: [card.origin.y, card.origin.y * 0.35, 0],
                  opacity: [0, 1, 0],
                  scale: [0.6, 1, 0.3],
                  rotate: [card.rotate, card.rotate / 2, 0]
                }
              : { opacity: 0 }
          }
          transition={{
            duration: 1.9,
            ease: 'easeInOut',
            delay: index * 0.12,
            times: [0, 0.55, 1]
          }}
        >
          <span className='text-[10px] font-medium uppercase tracking-wider text-[#4FA6F8]/80'>
            {card.label}
          </span>
          <span className='text-[18px] font-semibold text-white'>{card.value}</span>
        </motion.div>
      ))}
    </div>
  );
}
