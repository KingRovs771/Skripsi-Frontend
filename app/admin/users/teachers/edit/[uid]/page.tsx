'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, GraduationCap, School, Lock, Search, CheckCircle2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

interface SchoolData {
  npsn: string;
  nama_sekolah: string;
}

export default function EditGuru() {
  const router = useRouter();
  const params = useParams();
  const teacherUid = params?.uid as string;

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Form State ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    nip: '',
    nama_lengkap: '',
    phone: '',
    email: '',
    password: '', // kosong = tidak ganti
    npsn: '',
  });

  // ── School Search ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);
  const [schoolResults, setSchoolResults] = useState<SchoolData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchingSchool, setSearchingSchool] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Pre-fill dari API ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!teacherUid) return;
    const fetchTeacher = async () => {
      try {
        const res = await fetchApi(`/api/users/getTeacherById/${teacherUid}`);
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          const d = json.Data || json.data || json;
          setFormData({
            nip: d.nip ?? '',
            nama_lengkap: d.nama_lengkap ?? '',
            phone: d.phone ?? d.no_hp ?? '',
            email: d.email ?? '',
            password: '',
            npsn: String(d.npsn ?? ''),
          });
          // Set sekolah yang sudah dipilih
          if (d.nama_sekolah || d.npsn) {
            setSelectedSchool({
              npsn: String(d.npsn ?? ''),
              nama_sekolah: d.nama_sekolah ?? '',
            });
            setSearchQuery(d.nama_sekolah ?? String(d.npsn ?? ''));
          }
        } else {
          toast.error(json.Message || 'Gagal memuat data guru');
          router.push('/admin/users/teachers');
        }
      } catch {
        toast.error('Koneksi ke server gagal');
        router.push('/admin/users/teachers');
      } finally {
        setLoadingPage(false);
      }
    };
    fetchTeacher();
  }, [teacherUid, router]);

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
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((f) => ({ ...f, [field]: e.target.value }));

  // ── Submit Update ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.npsn) { toast.warning('Pilih sekolah terlebih dahulu'); return; }

    setLoadingSubmit(true);
    try {
      const payload: any = {
        nip: formData.nip,
        nama_lengkap: formData.nama_lengkap,
        phone: formData.phone,
        email: formData.email,
        npsn: formData.npsn,
      };
      if (formData.password) payload.password = formData.password;

      const res = await fetchApi(`/api/users/updateTeacher/${teacherUid}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Data guru berhasil diperbarui!');
        router.push('/admin/users/teachers');
      } else {
        toast.error(json.error || json.Message || json.message || 'Gagal memperbarui data guru');
      }
    } catch {
      toast.error('Koneksi ke server gagal');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-base';

  if (loadingPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Memuat data guru...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <Link href="/admin/users/teachers" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Guru
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Data Guru BK</h1>
        <p className="text-slate-500 text-base mt-2">Perbarui informasi guru. Kosongkan password jika tidak ingin menggantinya.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-10 space-y-10">

          {/* ── IDENTITAS GURU ── */}
          <section className="space-y-6">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <GraduationCap className="w-5 h-5 text-blue-500" /> Identitas Guru
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">NIP (Nomor Induk Pegawai)</label>
                <input className={inputClass} placeholder="19880212 201503 1 002" required value={formData.nip} onChange={set('nip')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nama Lengkap &amp; Gelar</label>
                <input className={inputClass} placeholder="Budi Santoso, S.Pd" required value={formData.nama_lengkap} onChange={set('nama_lengkap')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">No. Telepon / WhatsApp</label>
                <input className={inputClass} type="tel" placeholder="0821xxxxxxxx" required value={formData.phone} onChange={set('phone')} />
              </div>
            </div>
          </section>

          {/* ── UNIT SEKOLAH ── */}
          <section className="space-y-6">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <School className="w-5 h-5 text-blue-500" /> Unit Penugasan
            </h2>

            <div className="relative" ref={dropdownRef}>
              <label className="text-sm font-semibold text-slate-700 block mb-2">
                Sekolah
                {selectedSchool && (
                  <span className="ml-2 text-xs text-green-600 font-normal">✓ NPSN: {selectedSchool.npsn}</span>
                )}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  className="w-full pl-9 pr-9 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-base"
                  placeholder="Ketik nama atau NPSN sekolah..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); if (selectedSchool) handleClearSchool(); }}
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
                      <span className="font-semibold text-slate-900">{s.nama_sekolah}</span>
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 ml-2 shrink-0">{s.npsn}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── AKSES LOGIN ── */}
          <section className="space-y-6">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Lock className="w-5 h-5 text-blue-500" /> Akses Login
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Alamat Email</label>
                <input className={inputClass} type="email" placeholder="guru@sekolah.sch.id" required value={formData.email} onChange={set('email')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Password Baru
                  <span className="ml-1 text-xs text-slate-400 font-normal">(kosongkan jika tidak diganti)</span>
                </label>
                <input className={inputClass} type="password" placeholder="••••••••" value={formData.password} onChange={set('password')} />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link href="/admin/users/teachers" className="px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
            Batal
          </Link>
          <button
            type="submit"
            disabled={loadingSubmit}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 disabled:bg-slate-300 transition-all shadow-sm"
          >
            {loadingSubmit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
