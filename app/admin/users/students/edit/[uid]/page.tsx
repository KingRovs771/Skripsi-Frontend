'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Search, CheckCircle2, Hash, GraduationCap, Lock, Mail } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

// ── Tipe Data ──────────────────────────────────────────────────────────────────
interface SchoolData {
  npsn: string;
  nama_sekolah: string;
}

export default function EditSiswa() {
  const router = useRouter();
  const params = useParams();
  const studentUid = params?.uid as string;

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [formData, setFormData] = useState({
    role_uid: '',
    nisn: '',
    nama_lengkap: '',
    no_hp: '',
    alamat: '',
    email: '',
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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Fetch Data Siswa untuk Pre-fill ───────────────────────────────────────
  useEffect(() => {
    if (!studentUid) return;
    const fetchStudent = async () => {
      try {
        const res = await fetchApi(`/api/users/getStudentsById/${studentUid}`);
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          const d = json.Data || json.data || json;
          setFormData({
            role_uid: d.role_uid ?? '',
            nisn: d.nisn ?? '',
            nama_lengkap: d.nama_lengkap ?? '',
            no_hp: d.no_hp ?? '',
            alamat: d.alamat ?? '',
            email: d.email ?? '',
            jenjang_pendidikan: d.jenjang_pendidikan ?? '',
            kelas: d.kelas ?? '',
            npsn: String(d.npsn ?? ''),
          });
          // Set sekolah yang sudah dipilih sebelumnya
          if (d.nama_sekolah || d.npsn) {
            setSelectedSchool({
              npsn: String(d.npsn ?? ''),
              nama_sekolah: d.nama_sekolah ?? d.npsn,
            });
            setSearchQuery(d.nama_sekolah ?? String(d.npsn ?? ''));
          }
        } else {
          toast.error(json.Message || 'Gagal memuat data siswa');
          router.push('/admin/users/students');
        }
      } catch {
        toast.error('Koneksi ke server gagal');
        router.push('/admin/users/students');
      } finally {
        setLoadingPage(false);
      }
    };
    fetchStudent();
  }, [studentUid, router]);

  // ── School Search Debounce ─────────────────────────────────────────────────
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

  // ── Submit Update ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.npsn) { toast.warning('Pilih sekolah terlebih dahulu'); return; }
    if (!formData.role_uid) { toast.error('Fatal: Role UID siswa tidak ditemukan dari database!'); return; }

    setLoadingSubmit(true);
    try {
      const payload = { ...formData };

      const res = await fetchApi(`/api/users/updateStudents/${studentUid}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Data individu siswa berhasil diselaraskan!');
        router.push('/admin/users/students');
      } else {
        toast.error(json.error || json.Message || 'Gagal memperbarui data siswa');
      }
    } catch {
      toast.error('Server Unreachable. Koneksi terputus.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loadingPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400 mb-3" />
          <p className="text-sm font-medium text-slate-500">Membongkar arsip siswa...</p>
        </div>
      </div>
    );
  }

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Back */}
      <Link href="/admin/users/students" className="flex items-center text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Siswa
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Perbarui Biodata Siswa</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Lakukan sinkronisasi silang bila terdapat pemutakhiran jenjang sekolah maupun identitas KTP.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-8 space-y-10">

          {/* ── IDENTITAS ── */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Hash className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Identitas Diri</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nomor Induk Siswa Nasional (NISN)</label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                  placeholder="Ketik 10 Digit NISN Resmi..."
                  maxLength={15}
                  required
                  value={formData.nisn}
                  onChange={set('nisn')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nama Terang Lengkap</label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                  placeholder="Cth: Budi Santoso..."
                  required
                  value={formData.nama_lengkap}
                  onChange={set('nama_lengkap')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nomor WhatsApp Aktif</label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                  placeholder="08xxxxxxxxxx"
                  type="tel"
                  required
                  value={formData.no_hp}
                  onChange={set('no_hp')}
                />
              </div>
              <div className="space-y-2 h-full">
                <label className="text-sm font-bold text-slate-700">Domisili Tempat Tinggal</label>
                <textarea
                  rows={1}
                  className="w-full h-[46px] px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium resize-none overflow-hidden block"
                  placeholder="Nama jalan RT/RW..."
                  required
                  value={formData.alamat}
                  onChange={set('alamat')}
                />
              </div>
            </div>
          </section>

          {/* ── AKADEMIK ── */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-violet-600" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Institusi & Akademik</h2>
            </div>

            {/* School Search */}
            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="text-sm font-bold text-slate-700 flex justify-between">
                <span>Sekolah Tempat Belajar</span>
                {selectedSchool && (
                  <span className="text-xs text-green-600">✓ Valid Terpilih NPSN: {selectedSchool.npsn}</span>
                )}
              </label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                <input
                  className="w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium placeholder:text-slate-400 shadow-sm"
                  placeholder="Ketik lalu pilih nama atau NPSN sekolah..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedSchool) handleClearSchool();
                  }}
                  autoComplete="off"
                />
                {searchingSchool && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />}
                {selectedSchool && !searchingSchool && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />}
              </div>
              {showDropdown && (
                <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {schoolResults.map((s) => (
                    <button
                      key={s.npsn}
                      type="button"
                      onClick={() => handleSelectSchool(s)}
                      className="w-full text-left px-5 py-3.5 text-sm hover:bg-slate-50 flex justify-between items-center border-b border-slate-100 last:border-0 transition-colors"
                    >
                      <span className="font-bold text-slate-800">{s.nama_sekolah}</span>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded bg-slate-200/50 text-slate-600 shrink-0 font-medium ml-4 tracking-wider">NPSN: {s.npsn}</span>
                    </button>
                  ))}
                  {schoolResults.length === 0 && !searchingSchool && searchQuery.length >= 3 && (
                    <div className="p-4 text-center text-sm text-slate-500 font-medium">Berdasarkan hasil pencarian, tidak ada sekolah yang ditemukan.</div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Tingkat Pendidikan</label>
                <select
                  required
                  className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium appearance-none"
                  value={formData.jenjang_pendidikan}
                  onChange={set('jenjang_pendidikan')}
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                >
                  <option value="" disabled>-- Tentukan Jenjang --</option>
                  <option value="SMP">Tingkat Pertama (SMP / MTs)</option>
                  <option value="SMA">Tingkat Atas (SMA / MA)</option>
                  <option value="SMK">Tingkat Atas Kejuruan (SMK)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Rombongan Belajar (Kelas)</label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                  placeholder="Contoh: XII IPA 2"
                  required
                  value={formData.kelas}
                  onChange={set('kelas')}
                />
              </div>
            </div>
          </section>

          {/* ── AKSES LOGIN ── */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <Mail className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Kredensial Login</h2>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Alamat Surel (Email) Siswa</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                placeholder="nama.siswa@mail.com"
                required
                value={formData.email}
                onChange={set('email')}
              />
              <p className="text-xs font-medium text-amber-600 flex items-center mt-1">
                Perhatian: Ubah email berarti akun login bagi siswa ini akan berubah.
                Sandi tidak dapat diubah dari dasbor admin untuk menjaga privasi enkripsi JWT.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Aksi */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3 rounded-b-3xl">
          <Link
            href="/admin/users/students"
            className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-xl transition-all text-center"
          >
            Batalkan Edit
          </Link>
          <button
            type="submit"
            disabled={loadingSubmit}
            className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/10 active:scale-95"
          >
            {loadingSubmit ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Terapkan Skema Baru
          </button>
        </div>
      </form>
    </div>
  );
}
