'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Search, CheckCircle2, Hash, GraduationCap, Lock } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

// ── Tipe Data ──────────────────────────────────────────────────────────────────
interface SchoolData {
  npsn: string;
  nama_sekolah: string;
}

export default function CreateSiswa() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ── Role UID Student (hidden, fetch saat mount) ───────────────────────────
  const [studentRoleUid, setStudentRoleUid] = useState('');

  useEffect(() => {
    const fetchStudentRole = async () => {
      try {
        const res = await fetchApi('/api/role/getRole');
        if (!res.ok) return;
        const json = await res.json();
        const roles: any[] = Array.isArray(json.Data) ? json.Data : [];
        // Cari role dengan nama student / siswa / students (case-insensitive)
        const role = roles.find((r) =>
          ['student', 'students', 'siswa'].includes(r.role_name?.toLowerCase())
        );
        if (role) setStudentRoleUid(role.role_uid);
        else console.warn('[CreateSiswa] Role "student/siswa" tidak ditemukan di database');
      } catch {
        console.error('[CreateSiswa] Gagal fetch role');
      }
    };
    fetchStudentRole();
  }, []);

  const [formData, setFormData] = useState({
    nisn: '',
    nama_lengkap: '',
    no_hp: '',
    alamat: '',
    email: '',
    password: '',
    jenjang_pendidikan: '',
    kelas: '',
    npsn: '',
  });

  // ── School Search ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);
  const [schoolResults, setSchoolResults] = useState<SchoolData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchingSchool, setSearchingSchool] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedSchool) return;
    const timer = setTimeout(async () => {
      const q = searchQuery.trim();
      if (q.length < 3) { setSchoolResults([]); setShowDropdown(false); return; }
      setSearchingSchool(true);
      try {
        const res = await fetchApi(`/school/searchSchool/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        const list: any[] = Array.isArray(json.Data) ? json.Data : [];
        const data: SchoolData[] = list.map((item: any) => ({
          npsn: String(item.npsn ?? ''),
          nama_sekolah: item.nama_sekolah ?? '',
        }));
        setSchoolResults(data);
        setShowDropdown(data.length > 0);
      } catch {
        toast.error('Gagal mencari data sekolah');
      } finally {
        setSearchingSchool(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedSchool]);

  const handleSelectSchool = (school: SchoolData) => {
    setSelectedSchool(school);
    setSearchQuery(school.nama_sekolah);
    setFormData((f) => ({ ...f, npsn: school.npsn }));
    setShowDropdown(false);
  };

  const handleClearSchool = () => {
    setSelectedSchool(null);
    setSearchQuery('');
    setFormData((f) => ({ ...f, npsn: '' }));
  };

  const set = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFormData((f) => ({ ...f, [field]: e.target.value }));

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.npsn) { toast.warning('Pilih sekolah terlebih dahulu'); return; }
    if (!studentRoleUid) { toast.error('Data role belum siap, coba refresh halaman'); return; }

    setLoading(true);
    try {
      const res = await fetchApi('/api/users/createStudents', {
        method: 'POST',
        body: JSON.stringify({ ...formData, role_uid: studentRoleUid }),
      });

      // Baca body sebagai text dulu, lalu coba parse JSON
      const text = await res.text().catch(() => '');
      let json: Record<string, any> = {};
      try { json = text ? JSON.parse(text) : {}; } catch { /* body bukan JSON */ }

      if (res.ok) {
        toast.success('Data siswa berhasil ditambahkan!');
        router.push('/admin/users/students');
      } else {
        const errMsg =
          json.Message ||
          json.message ||
          json.Error ||
          json.error ||
          text ||
          `Gagal menyimpan data siswa (HTTP ${res.status})`;
        toast.error(errMsg);
      }
    } catch {
      toast.error('Koneksi ke server gagal');
    } finally {
      setLoading(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Back */}
      <Link href="/admin/users/students" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Siswa
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tambah Siswa Baru</h1>
        <p className="text-slate-500 text-sm mt-1">Pastikan NISN dan data sekolah sudah sesuai.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 space-y-8">

          {/* ── IDENTITAS ── */}
          <section className="space-y-5">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Hash className="w-4 h-4 text-blue-600" /> Identitas Siswa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">NISN (10 Digit)</label>
                <input
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="0092xxxxxx"
                  maxLength={10}
                  required
                  value={formData.nisn}
                  onChange={set('nisn')}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
                <input
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="Rizky Ramadhan"
                  required
                  value={formData.nama_lengkap}
                  onChange={set('nama_lengkap')}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Nomor WhatsApp</label>
                <input
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="0821xxxxxxxx"
                  type="tel"
                  required
                  value={formData.no_hp}
                  onChange={set('no_hp')}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Alamat</label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm resize-none"
                  placeholder="Jl. Merdeka No. 1, Sragen"
                  required
                  value={formData.alamat}
                  onChange={set('alamat')}
                />
              </div>
            </div>
          </section>

          {/* ── AKADEMIK ── */}
          <section className="space-y-5">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <GraduationCap className="w-4 h-4 text-blue-600" /> Informasi Akademik
            </h2>

            {/* School Search */}
            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <label className="text-sm font-medium text-slate-700">
                Cari Sekolah
                {selectedSchool && (
                  <span className="ml-2 text-xs text-green-600 font-normal">✓ NPSN: {selectedSchool.npsn}</span>
                )}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="Ketik nama atau NPSN sekolah..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedSchool) handleClearSchool();
                  }}
                  autoComplete="off"
                />
                {searchingSchool && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />}
                {selectedSchool && !searchingSchool && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
              </div>
              {showDropdown && (
                <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                  {schoolResults.map((s) => (
                    <button
                      key={s.npsn}
                      type="button"
                      onClick={() => handleSelectSchool(s)}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex justify-between items-center border-b border-slate-100 last:border-0 transition-colors"
                    >
                      <span className="font-medium text-slate-900">{s.nama_sekolah}</span>
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 ml-2 shrink-0">{s.npsn}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Jenjang</label>
                <select
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm bg-white"
                  value={formData.jenjang_pendidikan}
                  onChange={set('jenjang_pendidikan')}
                >
                  <option value="">Pilih Jenjang</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="SMK">SMK</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Kelas</label>
                <input
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="Contoh: XII RPL 1"
                  required
                  value={formData.kelas}
                  onChange={set('kelas')}
                />
              </div>
            </div>
          </section>

          {/* ── AKSES LOGIN ── */}
          <section className="space-y-5">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Lock className="w-4 h-4 text-blue-600" /> Akses Login
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email Siswa</label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="siswa@mail.com"
                  required
                  value={formData.email}
                  onChange={set('email')}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Password Default</label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={set('password')}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer Aksi */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-xs">
            {studentRoleUid
              ? <span className="text-green-600 font-medium">✓ Role Student siap</span>
              : <span className="text-amber-500 font-medium flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin inline" /> Memuat role...</span>
            }
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/users/students"
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading || !studentRoleUid}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Data Siswa
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
