// Central Reactive Store Service - Real-time Sync across Employee & HR Admin Dashboards

const INITIAL_EMPLOYEES_STORE = [
  { id: 'EMP-001', name: 'Alex Morgan', role: 'Senior Frontend Engineer', dept: 'Engineering & Product', status: 'present', avatar: 'AM', checkIn: '09:02 AM', checkOut: '05:30 PM', hours: '8.5 hrs', email: 'alex.morgan@dayflow.io', phone: '+1 (555) 234-5678', address: '742 Evergreen Terrace, Springfield, OR', salary: '$145,000', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' },
  { id: 'EMP-002', name: 'Sarah Chen', role: 'Lead Product Designer', dept: 'Design', status: 'present', avatar: 'SC', checkIn: '08:55 AM', checkOut: '05:25 PM', hours: '8.5 hrs', email: 'sarah.chen@dayflow.io', phone: '+1 (555) 345-6789', address: '120 Market St, San Francisco, CA', salary: '$150,000' },
  { id: 'EMP-003', name: 'James Wilson', role: 'Backend Software Engineer', dept: 'Engineering', status: 'absent', avatar: 'JW', checkIn: '—', checkOut: '—', hours: '0.0 hrs', email: 'james.wilson@dayflow.io', phone: '+1 (555) 456-7890', address: '456 Oak Lane, Seattle, WA', salary: '$135,000' },
  { id: 'EMP-004', name: 'Maya Patel', role: 'HR Operations Manager', dept: 'Human Resources', status: 'present', avatar: 'MP', checkIn: '08:48 AM', checkOut: '05:15 PM', hours: '8.5 hrs', email: 'maya.patel@dayflow.io', phone: '+1 (555) 567-8901', address: '789 Pine Ave, Austin, TX', salary: '$130,000' },
  { id: 'EMP-005', name: 'David Kim', role: 'Senior Data Analyst', dept: 'Analytics', status: 'on-leave', avatar: 'DK', checkIn: '—', checkOut: '—', hours: '0.0 hrs', email: 'david.kim@dayflow.io', phone: '+1 (555) 678-9012', address: '321 Elm St, Chicago, IL', salary: '$125,000' },
  { id: 'EMP-006', name: 'Emma Thompson', role: 'QA Lead Engineer', dept: 'Engineering', status: 'half-day', avatar: 'ET', checkIn: '09:10 AM', checkOut: '01:10 PM', hours: '4.0 hrs', email: 'emma.t@dayflow.io', phone: '+1 (555) 789-0123', address: '654 Birch Rd, Denver, CO', salary: '$120,000' },
];

const INITIAL_LEAVES_STORE = [
  { id: 'LV-101', employee: 'Alex Morgan', avatar: 'AM', type: 'Casual Leave', from: 'Aug 25', to: 'Aug 26', days: 2, reason: 'Personal errands and home maintenance', status: 'approved', appliedDate: 'Aug 20, 2026' },
  { id: 'LV-102', employee: 'David Kim', avatar: 'DK', type: 'Sick Leave', from: 'Aug 22', to: 'Aug 24', days: 3, reason: 'Medical appointment', status: 'pending', appliedDate: 'Aug 21, 2026' },
  { id: 'LV-103', employee: 'Emma Thompson', avatar: 'ET', type: 'Annual Vacation', from: 'Sep 01', to: 'Sep 05', days: 5, reason: 'Family trip to national park', status: 'pending', appliedDate: 'Aug 22, 2026' },
];

// Load Store from LocalStorage or Defaults
export function getStoredEmployees() {
  const data = localStorage.getItem('dayflow_employees');
  if (data) {
    try { return JSON.parse(data); } catch {}
  }
  return INITIAL_EMPLOYEES_STORE;
}

export function getStoredLeaves() {
  const data = localStorage.getItem('dayflow_leaves');
  if (data) {
    try { return JSON.parse(data); } catch {}
  }
  return INITIAL_LEAVES_STORE;
}

export function updateStoredEmployeeProfile(employeeId, updatedFields) {
  const employees = getStoredEmployees();
  const index = employees.findIndex(e => e.id === employeeId || e.name === 'Alex Morgan');
  if (index !== -1) {
    employees[index] = {
      ...employees[index],
      phone: updatedFields.phone || employees[index].phone,
      address: updatedFields.address || employees[index].address,
      avatarUrl: updatedFields.avatarUrl || employees[index].avatarUrl,
      name: updatedFields.fullName || employees[index].name,
    };
    localStorage.setItem('dayflow_employees', JSON.stringify(employees));
    notifyStoreChange();
  }
  return employees;
}

export function addLeaveRequest(leaveObj) {
  const leaves = getStoredLeaves();
  leaves.unshift(leaveObj);
  localStorage.setItem('dayflow_leaves', JSON.stringify(leaves));
  notifyStoreChange();
  return leaves;
}

export function updateLeaveStatus(leaveId, newStatus) {
  const leaves = getStoredLeaves();
  const index = leaves.findIndex(l => l.id === leaveId || String(l.id) === String(leaveId));
  if (index !== -1) {
    leaves[index].status = newStatus;
    localStorage.setItem('dayflow_leaves', JSON.stringify(leaves));
    notifyStoreChange();
  }
  return leaves;
}

function notifyStoreChange() {
  window.dispatchEvent(new CustomEvent('dayflow_store_update'));
}
