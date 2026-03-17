/**
 * Utility untuk membaca payload JWT token dari localStorage
 * dan mendapatkan informasi role user.
 */

export type UserRole = 'administrator' | 'pakar' | 'gurubk' | 'siswa' | null;

/**
 * Decode payload dari JWT token (tanpa verifikasi signature - hanya client side)
 */
export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Ambil token dari localStorage
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Ambil role dari JWT token.
 * Sesuaikan field 'role' dengan yang dikirim backend Golang Anda.
 */
export function getUserRole(): UserRole {
  const token = getToken();
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const role: string = (
    payload.role ||
    payload.Role ||
    payload.user_role ||
    payload.type ||
    ''
  ).toString().toLowerCase();

  if (role === 'administrator') return 'administrator';
  if (role === 'pakar') return 'pakar';
  if (role === 'gurubk' || role === 'guru_bk' || role === 'guru bk') return 'gurubk';
  if (role === 'siswa' || role === 'user') return 'siswa';

  return null;
}

/**
 * Dapatkan dashboard URL berdasarkan role
 */
export function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case 'administrator': return '/admin/dashboard';
    case 'pakar': return '/pakar/dashboard';
    case 'gurubk': return '/gurubk/dashboard';
    case 'siswa': return '/siswa/dashboard';
    default: return '/public';
  }
}

/**
 * Cek apakah user sudah login (ada token valid di localStorage)
 */
export function isLoggedIn(): boolean {
  const token = getToken();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  if (payload.exp) {
    const expiredAt = payload.exp * 1000;
    if (Date.now() > expiredAt) {
      localStorage.removeItem('token');
      return false;
    }
  }

  return true;
}
