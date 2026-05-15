
/**
 * Base URL API — ubah hanya di .env.local: NEXT_PUBLIC_API_URL=https://your-api.com
 * Seluruh halaman menggunakan nilai ini secara otomatis.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Bangun URL lengkap untuk endpoint API.
 * Contoh: buildApiUrl('/api/home/articles') → 'http://localhost:8080/api/home/articles'
 */
export function buildApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

/**
 * Bangun URL media/gambar dari path relatif yang dikirim backend.
 * Jika `path` sudah absolut (http/https), kembalikan apa adanya.
 * Contoh: getMediaUrl('/uploads/photo.jpg') → 'http://localhost:8080/uploads/photo.jpg'
 */
export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${API_BASE_URL}${path}`;
}

/**
 * Fetch ke backend dengan token JWT dari localStorage secara otomatis.
 * Gunakan fungsi ini di semua halaman agar URL API terpusat di satu tempat.
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token') || '';
  }

  const isFormData = options.body instanceof FormData;

  const headers = new Headers({
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...options.headers,
  });

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = buildApiUrl(endpoint);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}
