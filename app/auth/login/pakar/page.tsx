'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  // Di aplikasi nyata, Anda akan menggunakan state dan menangani submit form
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');

  return (
    <Card className="w-full max-w-md mx-4">
      {' '}
      {/* <-- Perubahan di sini */}
      <CardHeader>
        <CardTitle className="text-2xl">Login Pakar</CardTitle>
        <CardDescription>Masukkan email Anda di bawah ini untuk login ke akun Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                Lupa password?
              </Link>
            </div>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Belum punya akun?{' '}
          <Link href="/auth/register" className="underline">
            Register
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
