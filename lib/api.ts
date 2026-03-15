/**
 * API Fetch Wrapper
 * 
 * NEXT_PUBLIC_API_URL ini yang akan mempermudah saat di-deploy (misalnya ke Vercel atau environment lain).
 * Saat proses build/deploy, kita tinggal ubah environment variable "NEXT_PUBLIC_API_URL"
 * menyesuaikan dengan URL Backend Golang yang dipakai, tanpa perlu mengubah source code.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  // Ambil token dari localStorage untuk dikirim di setiap request.
  // Ini cocok kalau Backend Golang menggunakan JWT Authentication.
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

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}
