'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { isLoggedIn, getUserRole, getDashboardUrl } from '@/lib/auth';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Redirect jika sudah login
  useEffect(() => {
    if (isLoggedIn()) {
      const role = getUserRole();
      router.replace(getDashboardUrl(role));
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Endpoint login untuk Pakar
      // Sesuaikan jika berbeda di backend Golang Anda
      const response = await fetchApi('/auth/loginPakar', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || data.Message || 'Gagal login, periksa kembali email & password Anda.');
      }

      // Backend bisa mengembalikan token dengan key yang bervariasi
      const token = data.token ||
        data.access_token ||
        data.Token ||
        (data.data && data.data.token) ||
        (data.data && data.data.access_token);

      if (token) {
        localStorage.setItem('token', token);
      } else {
        console.warn('Token JWT masih belum berhasil ditangkap dari JSON Backend!', data);
      }

      // Simpan pakar_uid jika ada (beberapa modul/fitur membutuhkan ini)
      const pakarUid = data.User?.pakar_uid || data.user?.pakar_uid || data.Data?.pakar_uid || data.data?.pakar_uid;
      if (pakarUid) {
        localStorage.setItem('pakar_uid', pakarUid);
      }

      toast.success('Login berhasil!');
      router.push(getDashboardUrl('pakar'));

    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-4">
      <CardHeader>
        <CardTitle className="text-2xl">Login Pakar</CardTitle>
        <CardDescription>Masukkan email Anda di bawah ini untuk masuk ke panel sistem pakar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline text-muted-foreground hover:text-slate-900">
                Lupa password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validasi Kredensial...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Belum punya akun?{' '}
          <Link href="/auth/register" className="underline text-slate-900 border-b-2 border-transparent hover:border-slate-900 transition-colors">
            Register
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
