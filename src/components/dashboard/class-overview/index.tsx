import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function ClassOverview() {
  const classes = [
    {
      name: '8th Semester (Section A)',
      students: 42,
      avgScore: 78.5,
      atRisk: 4,
    },
    {
      name: '8th Semester (Section B)',
      students: 38,
      avgScore: 75.2,
      atRisk: 6,
    },
    {
      name: '7th Semester (Section A)',
      students: 45,
      avgScore: 81.3,
      atRisk: 3,
    },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Class Overview</h2>
        <Link href="/class-management" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
          View All
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="space-y-3">
        {classes.map((cls, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900">{cls.name}</p>
              <p className="text-sm text-gray-500">{cls.students} students</p>
            </div>

            <div className="flex gap-8">
              <div className="text-right">
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-lg font-semibold text-gray-900">{cls.avgScore}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">At Risk</p>
                <p className="text-lg font-semibold text-red-600">{cls.atRisk}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
