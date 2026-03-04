import { AlertTriangle, CheckCircle } from 'lucide-react';

interface Reminder {
  id: number;
  type: 'warning' | 'info' | 'error';
  title: string;
  description: string;
}

interface RemindersSectionProps {
  reminders: Reminder[];
}

const defaultReminders: Reminder[] = [
  {
    id: 1,
    type: 'warning',
    title: 'Document Expiry Alert',
    description: 'One or more documents for your restaurants or riders, including [restaurant name] or [rider name], have expired, please review and update them to avoid any service interruption.'
  },
  {
    id: 2,
    type: 'info',
    title: 'Document Renewal Reminder',
    description: 'Reminder: the document for [rider name] or [restaurant name] is set to expire soon, ensure it is renewed before the expiration date.'
  },
  {
    id: 3,
    type: 'error',
    title: 'Urgent Document Update Needed',
    description: 'Urgent: documents for [restaurant name] of [rider name] have expired, please update their records to maintain compliance and prevent delays.'
  }
];

export function RemindersSection({ reminders = defaultReminders }: Partial<RemindersSectionProps>) {
  return (
    <div className='flex flex-col gap-4 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
      <div className='flex items-center justify-between'>
        <h2 className='text-[15px] font-medium text-[#3F4956] capitalize'>Reminders</h2>
        <a href='#' className='text-[14px] font-semibold text-[#FABB17] capitalize'>
          See All
        </a>
      </div>

      <div className='flex flex-col gap-4'>
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className='flex items-center gap-4 p-4 bg-gray-50 rounded-[8px] border border-[#EDEDEB]'
          >
            <div className='flex-shrink-0'>
              {reminder.type === 'warning' && (
                <AlertTriangle className='w-5 h-5 text-yellow-500' />
              )}
              {reminder.type === 'info' && (
                <CheckCircle className='w-5 h-5 text-blue-500' />
              )}
              {reminder.type === 'error' && (
                <AlertTriangle className='w-5 h-5 text-red-500' />
              )}
            </div>
            <div className='flex-1'>
              <p className='text-[13px] font-medium text-[#1F2937] capitalize'>
                {reminder.title}
              </p>
              <p className='text-[12px] text-[#6B7280] mt-1'>{reminder.description}</p>
            </div>
            <button className='flex-shrink-0 px-4 py-1.5 bg-[#1F2937] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#2d2d2d] transition-colors whitespace-nowrap'>
              Review
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
