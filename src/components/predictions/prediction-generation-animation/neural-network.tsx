'use client';

import { motion } from 'framer-motion';
import { FEATURE_LABELS } from './constants';

interface NeuralNetworkProps {
  active: boolean;
}

interface Connection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function layoutNodes(count: number): number[] {
  if (count === 1) return [50];

  const margin = 14;
  const span = 100 - margin * 2;
  return Array.from({ length: count }, (_, i) => margin + (span * i) / (count - 1));
}

const LAYER_X = [9, 36, 64, 91];
const LAYER_SIZES = [6, 8, 6, 1];
const LAYER_NAMES = ['Input Layer', 'Hidden Layer 1', 'Hidden Layer 2', 'Output Layer'];

const LAYERS = LAYER_SIZES.map((size, i) => ({
  x: LAYER_X[i],
  name: LAYER_NAMES[i],
  nodes: layoutNodes(size)
}));

const STATIC_CONNECTIONS: Connection[] = (() => {
  const lines: Connection[] = [];

  for (let l = 0; l < LAYERS.length - 1; l += 1) {
    const from = LAYERS[l];
    const to = LAYERS[l + 1];

    from.nodes.forEach((y1) => {
      to.nodes.forEach((y2) => {
        lines.push({ x1: from.x, y1, x2: to.x, y2 });
      });
    });
  }

  return lines;
})();

const PULSE_CONNECTIONS = STATIC_CONNECTIONS.filter((_, i) => i % 7 === 0).slice(0, 18);

export function NeuralNetwork({ active }: NeuralNetworkProps) {
  return (
    <div className='absolute inset-0 flex items-center justify-center px-6'>
      <div className='relative h-[78%] w-full max-w-[820px]'>
        {/* Static connection mesh */}
        <svg className='absolute inset-0 h-full w-full' viewBox='0 0 100 100' preserveAspectRatio='none'>
          {STATIC_CONNECTIONS.map((connection, i) => (
            <line
              key={i}
              x1={connection.x1}
              y1={connection.y1}
              x2={connection.x2}
              y2={connection.y2}
              stroke='#4FA6F8'
              strokeOpacity={0.08}
              strokeWidth={0.15}
              vectorEffect='non-scaling-stroke'
            />
          ))}
        </svg>

        {/* Animated data pulses traveling between layers */}
        {active &&
          PULSE_CONNECTIONS.map((connection, i) => (
            <motion.span
              key={i}
              className='absolute h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7FD0FF]'
              style={{ boxShadow: '0 0 8px rgba(127,208,255,0.9)' }}
              initial={{ left: `${connection.x1}%`, top: `${connection.y1}%`, opacity: 0 }}
              animate={{
                left: [`${connection.x1}%`, `${connection.x2}%`],
                top: [`${connection.y1}%`, `${connection.y2}%`],
                opacity: [0, 1, 1, 0]
              }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: (i % 9) * 0.18 }}
            />
          ))}

        {/* Nodes + layer labels */}
        {LAYERS.map((layer, layerIndex) => (
          <div key={layer.name}>
            {layer.nodes.map((y, nodeIndex) => (
              <div
                key={`${layerIndex}-${nodeIndex}`}
                className='absolute -translate-x-1/2 -translate-y-1/2'
                style={{ left: `${layer.x}%`, top: `${y}%` }}
              >
                <motion.div
                  className='rounded-full border border-[#4FA6F8]/70 bg-[#0B1220]'
                  style={{ width: 10, height: 10, boxShadow: '0 0 10px rgba(79,166,248,0.5)' }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={active ? { scale: [1, 1.35, 1], opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{
                    scale: {
                      duration: 1.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: layerIndex * 0.2 + nodeIndex * 0.08
                    },
                    opacity: { duration: 0.4, delay: layerIndex * 0.25 + nodeIndex * 0.04 }
                  }}
                />
              </div>
            ))}

            <div className='absolute -translate-x-1/2' style={{ left: `${layer.x}%`, top: '-7%' }}>
              <motion.span
                className='whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-white/40'
                initial={{ opacity: 0, y: 6 }}
                animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                transition={{ delay: layerIndex * 0.25 + 0.2, duration: 0.4 }}
              >
                {layer.name}
              </motion.span>
            </div>
          </div>
        ))}

        {/* Feature names beside the input layer */}
        {LAYERS[0].nodes.map((y, i) => (
          <div
            key={i}
            className='absolute'
            style={{ left: `${LAYERS[0].x}%`, top: `${y}%`, transform: 'translate(calc(-100% - 14px), -50%)' }}
          >
            <motion.span
              className='whitespace-nowrap text-[10px] font-medium text-[#4FA6F8]/90'
              initial={{ opacity: 0, x: -8 }}
              animate={active ? { opacity: [0, 1, 1, 0.5], x: 0 } : { opacity: 0 }}
              transition={{ delay: 0.3 + i * 0.18, duration: 0.6 }}
            >
              {FEATURE_LABELS[i]}
            </motion.span>
          </div>
        ))}
      </div>
    </div>
  );
}
