const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchLeaves() {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves`);
    if (!response.ok) throw new Error('Failed to fetch leaves');
    return await response.json();
  } catch (err) {
    console.error('Error fetching leaves:', err);
    return [];
  }
}

export async function applyLeave(leaveData) {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leaveData),
    });
    if (!response.ok) throw new Error('Failed to apply for leave');
    return await response.json();
  } catch (err) {
    console.error('Error applying for leave:', err);
    return { success: false };
  }
}

export async function updateLeaveStatusAPI(leaveId, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/leaves/${leaveId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update leave status');
    return await response.json();
  } catch (err) {
    console.error('Error updating leave status:', err);
    return { success: false };
  }
}
