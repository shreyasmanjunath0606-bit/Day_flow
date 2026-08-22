// Auth Service — Centralized authentication utility for DayFlow frontend

const API_BASE_URL = 'http://localhost:5000/api';
const TOKEN_KEY = 'dayflow_auth_token';
const USER_KEY = 'dayflow_auth_user';

/**
 * Login with email + password. Stores JWT token and user info on success.
 * @returns {{ success: boolean, message?: string, user?: object }}
 */
export async function login(email, password, role) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Login failed' };
    }

    // Store token and user data
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return { success: true, user: data.user };
  } catch (err) {
    return { success: false, message: 'Server unavailable. Please try again.' };
  }
}

/**
 * Register a new user account
 * @returns {{ success: boolean, message?: string }}
 */
export async function register(employeeId, email, password, role) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, email, password, role }),
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      return { success: false, message: data.message || 'Registration failed' };
    }

    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, message: 'Server unavailable. Please try again.' };
  }
}

/**
 * Logout — clear stored credentials and redirect to sign-in
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/signin';
}

/**
 * Get the stored JWT token
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get Authorization headers for authenticated API calls
 */
export function getAuthHeaders() {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * Get the currently logged-in user object
 */
export function getCurrentUser() {
  const data = localStorage.getItem(USER_KEY);
  if (data) {
    try { return JSON.parse(data); } catch { /* ignore */ }
  }
  return null;
}

/**
 * Check if user is authenticated (has a stored token)
 */
export function isAuthenticated() {
  return !!getToken();
}
