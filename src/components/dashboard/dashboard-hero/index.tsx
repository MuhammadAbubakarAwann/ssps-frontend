import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardHero() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-r from-slate-50 to-slate-100 p-8 md:p-12">
      {/* Background accent */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-100 opacity-50 blur-3xl"></div>
      
      <div className="relative">
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
          Welcome Back to SPPS
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-gray-600">
          Monitor student performance, track predictions, and get actionable insights to support academic success across your classes.
        </p>
        
        <div className="mt-8 flex flex-wrap gap-4">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6">
            New Prediction
            <ArrowRight size={18} />
          </Button>
          <Button variant="outline" className="rounded-lg px-6 border-gray-300 hover:bg-gray-100">
            View Reports
          </Button>
        </div>
      </div>
    </div>
  );
}
