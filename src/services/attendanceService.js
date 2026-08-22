// Attendance Service - Daily & Weekly Tracking, Check-In/Out, Status Management

export const ATTENDANCE_STATUS_TYPES = {
  PRESENT: { label: 'Present', color: 'var(--success-400)', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  HALF_DAY: { label: 'Half-day', color: 'var(--warning-400)', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  ABSENT: { label: 'Absent', color: 'var(--danger-400)', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' },
  LEAVE: { label: 'Leave', color: 'var(--primary-400)', bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)' },
};

export const MOCK_WEEKLY_ATTENDANCE = [
  { id: 'mon', day: 'Monday', date: 'Aug 17', checkIn: '09:00 AM', checkOut: '05:30 PM', hours: '8.5 hrs', status: 'PRESENT', note: 'Regular shift' },
  { id: 'tue', day: 'Tuesday', date: 'Aug 18', checkIn: '09:05 AM', checkOut: '05:35 PM', hours: '8.5 hrs', status: 'PRESENT', note: 'Regular shift' },
  { id: 'wed', day: 'Wednesday', date: 'Aug 19', checkIn: '09:00 AM', checkOut: '01:00 PM', hours: '4.0 hrs', status: 'HALF_DAY', note: 'Medical appointment in afternoon' },
  { id: 'thu', day: 'Thursday', date: 'Aug 20', checkIn: '08:55 AM', checkOut: '05:30 PM', hours: '8.5 hrs', status: 'PRESENT', note: 'Regular shift' },
  { id: 'fri', day: 'Friday', date: 'Aug 21', checkIn: '—', checkOut: '—', hours: '0.0 hrs', status: 'LEAVE', note: 'Approved Casual Leave' },
  { id: 'sat', day: 'Saturday', date: 'Aug 22', checkIn: '09:02 AM', checkOut: '—', hours: '4.2 hrs', status: 'PRESENT', isToday: true, note: 'Shift in progress' },
  { id: 'sun', day: 'Sunday', date: 'Aug 23', checkIn: '—', checkOut: '—', hours: '0.0 hrs', status: 'ABSENT', note: 'Weekend Off' },
];

export const MOCK_DAILY_TIMELINE = [
  { time: '09:02 AM', title: 'Checked In', desc: 'Workplace entry via Employee Dashboard', type: 'checkin' },
  { time: '01:15 PM', title: 'Lunch Break Started', desc: '45 mins break', type: 'break' },
  { time: '02:00 PM', title: 'Lunch Break Ended', desc: 'Resumed sprint tasks', type: 'work' },
];

export function calculateWorkDuration(checkInTimeStr) {
  if (!checkInTimeStr) return { hours: 0, minutes: 0, seconds: 0, text: '00h 00m' };
  // Mock duration calculation
  return { hours: 4, minutes: 22, seconds: 15, text: '04h 22m' };
}
