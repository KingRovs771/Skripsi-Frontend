'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, GraduationCap, School, Mail, Lock, Fingerprint, Search, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface SchoolData {
  npsn: string;
  nama_sekolah: string;
}

export default function CreateGuru() {
  const [loading, setLoading] = useState(false);
  const [npsnSearch, setNpsnSearch] = useState('');
  const [schoolResults, setSchoolResults] = useState<SchoolData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [formData, setFormData] = useState({
    nip: '',
    nama_lengkap: '',
    email: '',
    password: '',
    npsn_terpilih: '',
    nama_sekolah_terpilih: '',
  });

  useEffect(() => {
    const searchSchool = async () => {
      if (npsnSearch.length > 3 && !formData.nama_sekolah_terpilih) {
        // Simulasi data sekolah
        const mockSchools = [
          { npsn: '20311234', nama_sekolah: 'SMP Negeri 1 Sragen' },
          { npsn: '20311567', nama_sekolah: 'SMA Negeri 1 Sragen' },
          { npsn: '20311890', nama_sekolah: 'SMK Negeri 2 Sragen' },
        ].filter((s) => s.npsn.includes(npsnSearch) || s.nama_sekolah.toLowerCase().includes(npsnSearch.toLowerCase()));

        setSchoolResults(mockSchools);
        setShowDropdown(true);
      } else {
        setSchoolResults([]);
        setShowDropdown(false);
      }
    };

    const debounce = setTimeout(searchSchool, 400);
    return () => clearTimeout(debounce);
  }, [npsnSearch, formData.nama_sekolah_terpilih]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Breadcrumbs / Back Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users/teachers" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Daftar Guru
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Tambah Guru BK Baru</h1>
        <p className="text-slate-500 text-sm">Silakan lengkapi informasi di bawah untuk mendaftarkan akun Guru Bimbingan Konseling.</p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <form className="p-8 space-y-8">
          {/* Section 1: Profil */}
          <section className="space-y-6">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <UserCircle className="w-4 h-4 text-blue-500" /> Informasi Profil
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">NIP (Nomor Induk Pegawai)</label>
                <input
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Contoh: 19880212..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nama Lengkap & Gelar</label>
                <input
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Contoh: Budi Santoso, S.Pd"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Penugasan */}
          <section className="space-y-6">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <School className="w-4 h-4 text-blue-500" /> Unit Penugasan
            </h2>

            <div className="relative space-y-2">
              <label className="text-sm font-medium text-slate-700">Cari Sekolah (NPSN atau Nama)</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="Ketik NPSN atau Nama Sekolah..."
                  value={formData.nama_sekolah_terpilih || npsnSearch}
                  onChange={(e) => {
                    setNpsnSearch(e.target.value);
                    setFormData({ ...formData, nama_sekolah_terpilih: '', npsn_terpilih: '' });
                  }}
                />
                {formData.npsn_terpilih && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
              </div>

              {/* Minimalist Dropdown */}
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {schoolResults.length > 0 ? (
                    schoolResults.map((s) => (
                      <button
                        key={s.npsn}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                        onClick={() => {
                          setFormData({ ...formData, npsn_terpilih: s.npsn, nama_sekolah_terpilih: s.nama_sekolah });
                          setNpsnSearch(s.npsn);
                          setShowDropdown(false);
                        }}
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{s.nama_sekolah}</p>
                          <p className="text-xs text-slate-500">NPSN: {s.npsn}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-slate-400 italic text-center">Sekolah tidak ditemukan</div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Akun */}
          <section className="space-y-6">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Mail className="w-4 h-4 text-blue-500" /> Akses Login
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Alamat Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="guru@sekolah.sch.id"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password Default</label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="********"
                />
              </div>
            </div>
          </section>

          {/* Footer Form / Actions */}
          <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
            <Link href="/admin/users/teachers" className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
              Batal
            </Link>
            <button type="submit" disabled={loading} className="px-8 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2 active:scale-95">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" /> Simpan Data Guru
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Tambahan icon yang belum diimport
const UserCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="10" r="3" />
    <path d="M7 20.662V19c0-1.657 2.239-3 5-3s5 1.343 5 3v1.662" />
  </svg>
);
