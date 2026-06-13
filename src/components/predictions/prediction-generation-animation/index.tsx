'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils/shadcn-helpers';
import { GridBackground } from './grid-background';
import { FloatingDataCards } from './data-cards';
import { NeuralCore } from './neural-core';
import { NeuralNetwork } from './neural-network';
import { ConfidenceSphere } from './confidence-sphere';
import { CompletionReveal } from './completion-reveal';
import { CONFIDENCE_STEPS, type AnimationPhase } from './constants';

export interface PredictionGenerationAnimationProps {
  /** Set to true once the real prediction data has arrived from the API */
  isComplete?: boolean;
  /** Called once the completion reveal has finished playing */
  onComplete?: () => void;
  className?: string;
}

const PHASE_LABELS: Record<AnimationPhase, string> = {
  1: 'Collecting student records...',
  2: 'Activating AI model...',
  3: 'Processing through neural network...',
  4: 'Calculating confidence score...',
  5: 'Prediction ready'
};

export function PredictionGenerationAnimation({
  isComplete = false,
  onComplete,
  className
}: PredictionGenerationAnimationProps) {
  const [phase, setPhase] = useState<AnimationPhase>(1);
  const [confidence, setConfidence] = useState<number>(CONFIDENCE_STEPS[0]);
  const [rampDone, setRampDone] = useState(false);

  // Base timeline: phase 1 -> 2 -> 3 -> 4
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 4000),
      setTimeout(() => setPhase(4), 6000)
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  // Confidence ramp once phase 4 starts
  useEffect(() => {
    if (phase !== 4) return;

    let stepIndex = 0;
    setConfidence(CONFIDENCE_STEPS[0]);
    setRampDone(false);

    const interval = setInterval(() => {
      stepIndex += 1;
      if (stepIndex < CONFIDENCE_STEPS.length)
        setConfidence(CONFIDENCE_STEPS[stepIndex]);
      else {
        clearInterval(interval);
        setRampDone(true);
      }
    }, 420);

    return () => clearInterval(interval);
  }, [phase]);

  // If the real result isn't ready yet once the ramp finishes, gently breathe between 96-99%
  useEffect(() => {
    if (phase !== 4 || !rampDone || isComplete) return;

    const interval = setInterval(() => {
      setConfidence((prev) => (prev >= 98 ? 96 : 98));
    }, 1100);

    return () => clearInterval(interval);
  }, [phase, rampDone, isComplete]);

  // The moment real data arrives, snap straight to 100% and move on - no extra delay
  useEffect(() => {
    if (phase !== 4 || !rampDone || !isComplete) return;

    setConfidence(100);
    const timer = setTimeout(() => setPhase(5), 300);
    return () => clearTimeout(timer);
  }, [phase, rampDone, isComplete]);

  // Notify the parent once the reveal has played out
  useEffect(() => {
    if (phase !== 5) return;

    const timer = setTimeout(() => onComplete?.(), 1700);
    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  return (
    <div className={cn('fixed inset-0 z-[200] overflow-hidden', className)}>
      <GridBackground />

      <AnimatePresence>
        {phase === 1 && (
          <motion.div
            key='phase-data-cards'
            className='absolute inset-0'
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FloatingDataCards active={phase === 1} />
          </motion.div>
        )}

        {(phase === 2 || phase === 3) && (
          <motion.div
            key='phase-neural'
            className='absolute inset-0'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <NeuralCore active={phase >= 2} />
            {phase === 3 && <NeuralNetwork active />}
          </motion.div>
        )}

        {phase === 4 && (
          <motion.div
            key='phase-confidence'
            className='absolute inset-0'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ConfidenceSphere confidence={confidence} />
          </motion.div>
        )}

        {phase === 5 && (
          <motion.div
            key='phase-complete'
            className='absolute inset-0'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <CompletionReveal />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status label */}
      <div className='absolute bottom-12 left-1/2 -translate-x-1/2'>
        <AnimatePresence mode='wait'>
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className='whitespace-nowrap text-[13px] font-medium uppercase tracking-[0.25em] text-white/40'
          >
            {PHASE_LABELS[phase]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
