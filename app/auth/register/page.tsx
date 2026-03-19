'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, Search } from 'lucide-react';

// ── Tipe Data ──────────────────────────────────────────────
interface SchoolData {
  npsn: string;
  nama_sekolah: string;
}

interface RoleData {
  role_uid: string;
  role_name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ── State Form ─────────────────────────────────────────────
  const [formData, setFormData] = useState({
    nisn: '',
    nama_lengkap: '',
    no_hp: '',
    alamat: '',
    email: '',
    password: '',
    confirmPassword: '',
    jenjang: '',
    kelas: '',
    npsn_terpilih: '',
    nama_sekolah_terpilih: '',
  });

  // ── State Role (hidden) ───────────────────────────────────
  const [studentRoleUid, setStudentRoleUid] = useState<string>('');

  // Fetch role student dari backend saat mount (tidak ditampilkan ke user)
  useEffect(() => {
    const fetchStudentRole = async () => {
      try {
        // Endpoint sesuai backend: /api/role/getAllRoles
        const res = await fetchApi('/api/role/getRole');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Respons backend: { "Data": [...], "Message": "...", "Status": 200 }
        const roles: RoleData[] = Array.isArray(json.Data) ? json.Data : [];

        const studentRole = roles.find(
          (r) => r.role_name.toLowerCase() === 'student'
        );

        if (studentRole) {
          setStudentRoleUid(studentRole.role_uid);
        } else {
          console.warn('[Register] Role "Student" tidak ditemukan. Daftar role:', roles.map(r => r.role_name));
        }
      } catch (err) {
        console.error('[Register] Gagal fetch data role:', err);
      }
    };
    fetchStudentRole();
  }, []);

  // ── State Pencarian Sekolah ────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolResults, setSchoolResults] = useState<SchoolData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchingSchool, setSearchingSchool] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch sekolah dari backend dengan debounce 400ms
  useEffect(() => {
    if (formData.npsn_terpilih) return; // Jangan search jika sudah dipilih

    const debounce = setTimeout(async () => {
      const q = searchQuery.trim();
      if (q.length < 3) {
        setSchoolResults([]);
        setShowDropdown(false);
        return;
      }

      setSearchingSchool(true);
      try {
        const res = await fetchApi(`/school/searchSchool/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Backend Go mengembalikan { "Data": [...], "Message": "...", "Status": "OK" }
        // npsn dari backend bertipe integer, dikonversi ke string
        const rawList: any[] = Array.isArray(json.Data) ? json.Data : [];
        const data: SchoolData[] = rawList.map((item: any) => ({
          npsn: String(item.npsn ?? ''),
          nama_sekolah: item.nama_sekolah ?? '',
        }));

        setSchoolResults(data);
        setShowDropdown(data.length > 0);
      } catch (err) {
        console.error('[School Search] error:', err);
        toast.error('Gagal mencari data sekolah dari server');
        setSchoolResults([]);
        setShowDropdown(false);
      } finally {
        setSearchingSchool(false);
      }
    }, 400);

    return () => clearTimeout(debounce);
  }, [searchQuery, formData.npsn_terpilih]);

  const handleSelectSchool = (school: SchoolData) => {
    setFormData({
      ...formData,
      npsn_terpilih: school.npsn,
      nama_sekolah_terpilih: school.nama_sekolah,
    });
    setSearchQuery(school.nama_sekolah);
    setShowDropdown(false);
  };

  const handleClearSchool = () => {
    setFormData({ ...formData, npsn_terpilih: '', nama_sekolah_terpilih: '' });
    setSearchQuery('');
    setSchoolResults([]);
    setShowDropdown(false);
  };

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Password dan konfirmasi password tidak cocok!');
      return;
    }
    if (!formData.npsn_terpilih) {
      toast.warning('Mohon pilih sekolah terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nisn: formData.nisn,
        nama_lengkap: formData.nama_lengkap,
        no_hp: formData.no_hp,
        alamat: formData.alamat,
        email: formData.email,
        password: formData.password,
        jenjang: formData.jenjang,
        kelas: formData.kelas,
        npsn: formData.npsn_terpilih,
        role_uid: studentRoleUid,
      };

      const response = await fetchApi('/auth/registerStudents', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const json = await response.json().catch(() => ({}));

      if (response.ok) {
        toast.success('Akun berhasil dibuat! Silakan login.');
        router.push('/auth/login');
      } else {
        toast.error(json.error || json.message || json.Message || 'Gagal membuat akun. Coba lagi.');
      }
    } catch {
      toast.error('Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFormData({ ...formData, [field]: e.target.value });

  // ── UI ─────────────────────────────────────────────────────
  return (
    <Card className="w-full max-w-xl mx-4 my-8">
      <CardHeader>
        <CardTitle className="text-2xl">Daftar Akun Siswa</CardTitle>
        <CardDescription>
          Lengkapi data diri kamu untuk mulai menggunakan layanan diagnosis kesehatan mental.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-6">

          {/* ── INFORMASI PRIBADI ── */}
          <div className="grid gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b pb-2">
              Informasi Pribadi
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nisn">NISN (10 Digit)</Label>
                <Input
                  id="nisn"
                  placeholder="0092xxxxxx"
                  maxLength={10}
                  required
                  value={formData.nisn}
                  onChange={set('nisn')}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
                <Input
                  id="nama_lengkap"
                  placeholder="Budi Santoso"
                  required
                  value={formData.nama_lengkap}
                  onChange={set('nama_lengkap')}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="no_hp">Nomor HP (WhatsApp)</Label>
              <Input
                id="no_hp"
                type="tel"
                placeholder="08xxxxxxxxxx"
                required
                value={formData.no_hp}
                onChange={set('no_hp')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="alamat">Alamat</Label>
              <textarea
                id="alamat"
                rows={2}
                placeholder="Jl. Merdeka No. 1, Sragen"
                required
                value={formData.alamat}
                onChange={set('alamat')}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>

          {/* ── INFORMASI SEKOLAH ── */}
          <div className="grid gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b pb-2">
              Informasi Sekolah
            </p>

            {/* Pencarian Sekolah */}
            <div className="grid gap-2 relative" ref={dropdownRef}>
              <Label htmlFor="cari-sekolah">
                Cari Sekolah
                {formData.npsn_terpilih && (
                  <span className="ml-2 text-xs text-green-600 font-normal">
                    ✓ NPSN: {formData.npsn_terpilih}
                  </span>
                )}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="cari-sekolah"
                  className="pl-9 pr-9"
                  placeholder="Ketik nama atau NPSN sekolah..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (formData.npsn_terpilih) handleClearSchool();
                  }}
                  autoComplete="off"
                />
                {searchingSchool && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
                {formData.npsn_terpilih && !searchingSchool && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>

              {/* Dropdown hasil pencarian */}
              {showDropdown && (
                <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-popover border border-border rounded-md shadow-lg max-h-52 overflow-y-auto">
                  {schoolResults.length > 0 ? (
                    schoolResults.map((s) => (
                      <button
                        key={s.npsn}
                        type="button"
                        className="w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors flex justify-between items-center border-b border-border last:border-0"
                        onClick={() => handleSelectSchool(s)}
                      >
                        <span className="font-medium text-foreground">{s.nama_sekolah}</span>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded ml-2 shrink-0">
                          {s.npsn}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-muted-foreground italic">
                      Sekolah tidak ditemukan.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="jenjang">Jenjang</Label>
                <select
                  id="jenjang"
                  required
                  value={formData.jenjang}
                  onChange={set('jenjang')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Pilih Jenjang</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="SMK">SMK</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="kelas">Kelas</Label>
                <Input
                  id="kelas"
                  placeholder="Contoh: XII MIPA 1"
                  required
                  value={formData.kelas}
                  onChange={set('kelas')}
                />
              </div>
            </div>
          </div>

          {/* ── PENGATURAN AKUN ── */}
          <div className="grid gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b pb-2">
              Pengaturan Akun
            </p>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={formData.email}
                onChange={set('email')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={set('password')}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.confirmPassword}
                  onChange={set('confirmPassword')}
                />
              </div>
            </div>
          </div>

          {/* ── SUBMIT ── */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              'Buat Akun Siswa'
            )}
          </Button>

          <div className="text-center text-sm">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="underline">
              Login di sini
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
