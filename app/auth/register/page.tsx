'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, School, User, Mail, Lock, Hash, GraduationCap, Loader2, CheckCircle2 } from 'lucide-react';

// Tipe data untuk Sekolah
interface SchoolData {
  npsn: string;
  nama_sekolah: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [npsnSearch, setNpsnSearch] = useState('');
  const [schoolResults, setSchoolResults] = useState<SchoolData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [formData, setFormData] = useState({
    nisn: '',
    nama_lengkap: '',
    email: '',
    password: '',
    confirmPassword: '',
    jenjang: '',
    kelas: '',
    npsn_terpilih: '',
    nama_sekolah_terpilih: '',
  });

  // Simulasi Search Sekolah berdasarkan NPSN (Bisa diganti Fetch API)
  useEffect(() => {
    const searchSchool = async () => {
      if (npsnSearch.length > 3) {
        // Ganti URL dengan endpoint API pencarian sekolah Anda
        // const res = await fetch(`http://localhost:8080/api/sekolah?npsn=${npsnSearch}`);
        // const data = await res.json();

        // Contoh Data Mock
        const mockSchools = [
          { npsn: '20311234', nama_sekolah: 'SMP Negeri 1 Sragen' },
          { npsn: '20311567', nama_sekolah: 'SMA Negeri 1 Sragen' },
          { npsn: '20311890', nama_sekolah: 'SMK Negeri 1 Sragen' },
        ].filter((s) => s.npsn.includes(npsnSearch));

        setSchoolResults(mockSchools);
        setShowDropdown(true);
      } else {
        setSchoolResults([]);
        setShowDropdown(false);
      }
    };

    const debounce = setTimeout(searchSchool, 500);
    return () => clearTimeout(debounce);
  }, [npsnSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Password tidak cocok!');
      return;
    }

    setLoading(true);
    // Logika kirim ke backend Go Anda
    try {
      const response = await fetch('http://localhost:8080/api/register/siswa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/auth/login?success=true');
      }
    } catch (error) {
      alert('Terjadi kesalahan pendaftaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden my-8">
      <div className="bg-slate-900 p-8 text-white text-center">
        <h1 className="text-3xl font-black tracking-tight">Daftar Akun Siswa</h1>
        <p className="text-slate-400 text-sm mt-2">Lengkapi data diri kamu untuk mulai diagnosis kesehatan mental.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DATA PRIBADI */}
        <div className="space-y-4 md:col-span-2 border-b border-slate-100 pb-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <User className="w-4 h-4" /> Informasi Pribadi
          </h3>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">NISN (10 Digit)</label>
          <div className="relative">
            <Hash className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="0092xxxxxx"
              required
              onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
          <input
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Max Robinson"
            required
            onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
          />
        </div>

        {/* DATA SEKOLAH */}
        <div className="space-y-4 md:col-span-2 border-b border-slate-100 pb-4 mt-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <School className="w-4 h-4" /> Informasi Sekolah
          </h3>
        </div>

        {/* Search NPSN & Dropdown */}
        <div className="space-y-2 md:col-span-2 relative">
          <label className="text-xs font-bold text-slate-700">Cari Sekolah (Masukkan NPSN)</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Ketik NPSN sekolah kamu..."
              value={formData.nama_sekolah_terpilih || npsnSearch}
              onChange={(e) => {
                setNpsnSearch(e.target.value);
                setFormData({ ...formData, nama_sekolah_terpilih: '' }); // Reset jika mengetik ulang
              }}
            />
            {formData.npsn_terpilih && <CheckCircle2 className="absolute right-3 top-3 w-4 h-4 text-green-500" />}
          </div>

          {/* Custom Dropdown Search Results */}
          {showDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
              {schoolResults.length > 0 ? (
                schoolResults.map((s) => (
                  <button
                    key={s.npsn}
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex justify-between items-center"
                    onClick={() => {
                      setFormData({ ...formData, npsn_terpilih: s.npsn, nama_sekolah_terpilih: s.nama_sekolah });
                      setNpsnSearch(s.npsn);
                      setShowDropdown(false);
                    }}
                  >
                    <span className="font-bold text-slate-900 text-sm">{s.nama_sekolah}</span>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-500">{s.npsn}</span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-sm text-slate-400 italic">NPSN tidak ditemukan...</div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Jenjang</label>
          <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900" required onChange={(e) => setFormData({ ...formData, jenjang: e.target.value })}>
            <option value="">Pilih Jenjang</option>
            <option value="SMA/SMK">SMA/SMK</option>
            <option value="SMP">SMP</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Kelas</label>
          <input
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Contoh: XII IPA 1 / 9A"
            required
            onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
          />
        </div>

        {/* AKUN */}
        <div className="space-y-4 md:col-span-2 border-b border-slate-100 pb-4 mt-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Pengaturan Akun
          </h3>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-slate-700">Email Sekolah / Pribadi</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="email"
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="m@example.com"
              required
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            required
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Konfirmasi Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            required
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
        </div>

        <div className="md:col-span-2 pt-4">
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buat Akun Siswa'}
          </button>

          <div className="mt-6 text-center text-sm text-slate-500">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="font-bold text-slate-900 underline underline-offset-4">
              Login di sini
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
