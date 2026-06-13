export type AnimationPhase = 1 | 2 | 3 | 4 | 5;

export interface DataCardInfo {
  label: string;
  value: string;
  origin: { x: number; y: number };
  rotate: number;
}

export const DATA_CARDS: DataCardInfo[] = [
  { label: 'Attendance', value: '92%', origin: { x: -380, y: -220 }, rotate: -8 },
  { label: 'Quiz Scores', value: '85 / 100', origin: { x: 380, y: -200 }, rotate: 6 },
  { label: 'Assignments', value: '4 / 5 Done', origin: { x: -420, y: 180 }, rotate: 5 },
  { label: 'Previous GPA', value: '3.42', origin: { x: 420, y: 200 }, rotate: -6 },
  { label: 'Midterm', value: '78%', origin: { x: 0, y: -320 }, rotate: 3 },
  { label: 'Participation', value: 'High', origin: { x: 0, y: 320 }, rotate: -3 }
];

export const FEATURE_LABELS = [
  'Attendance',
  'Quiz Scores',
  'Assignments',
  'Midterm',
  'Previous GPA',
  'Participation'
];

export const CONFIDENCE_STEPS = [25, 48, 72, 91, 98];
