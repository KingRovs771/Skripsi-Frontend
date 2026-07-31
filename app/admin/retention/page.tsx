'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, Users, Clock, AlertTriangle, Search, CheckCircle, GraduationCap, Loader2, ArrowRight, Info } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Student {
  students_uid?: string;
  student_uid?: string;
  user_uid?: string;
  siswa_uid?: string;
  uid?: string;
  id?: number;
  nisn: string;
  nama_lengkap: string;
  email: string;
  kelas: string;
  nama_sekolah?: string;
  status_akun?: string;
  tanggal_nonaktif?: string;
}

interface NearingDeletionStudent {
  students_uid: string;
  nisn: string;
  nama_lengkap: string;
  kelas: string;
  nama_sekolah: string;
  status_akun: string;
  tanggal_nonaktif: string;
  days_remaining: number;
}

const getUid = (s: Student): string =>
  s.students_uid ?? s.student_uid ?? s.user_uid ?? s.siswa_uid ?? s.uid ?? String(s.id ?? '');

export default function RetentionManagementPage() {
  const [activeTab, setActiveTab] = useState<'status' | 'nearing'>('status');

  // Tab 1: Status Akun
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  // Tab 2: Nearing Deletion
  const [nearingDeletion, setNearingDeletion] = useState<NearingDeletionStudent[]>([]);
  const [isLoadingNearing, setIsLoadingNearing] = useState(true);

  // Fetch all students for Tab 1
  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const res = await fetchApi('/api/users/getAllStudents');
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setStudents(json.Data || json.data || []);
      } else {
        toast.error(json.Message || 'Gagal memuat data siswa');
      }
    } catch {
      toast.error('Koneksi ke server gagal');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Fetch nearing deletion for Tab 2
  const fetchNearingDeletion = async () => {
    setIsLoadingNearing(true);
    try {
      const res = await fetchApi('/api/admin/retention/nearing-deletion');
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setNearingDeletion(json.Data || json.data || []);
      } else {
        toast.error(json.Message || 'Gagal memuat data peringatan retensi');
      }
    } catch {
      toast.error('Koneksi ke server gagal');
    } finally {
      setIsLoadingNearing(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'status') {
      fetchStudents();
    } else {
      fetchNearingDeletion();
    }
  }, [activeTab]);

  // Handle status update
  const handleUpdateStatus = async (uid: string, newStatus: string) => {
    setUpdatingUid(uid);
    try {
      const res = await fetchApi(`/api/admin/retention/students/${uid}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_akun: newStatus }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Status akun siswa berhasil diperbarui');
        // Update local state
        setStudents((prev) =>
          prev.map((s) => (getUid(s) === uid ? { ...s, status_akun: newStatus } : s))
        );
      } else {
        toast.error(json.Message || 'Gagal memperbarui status');
      }
    } catch {
      toast.error('Koneksi ke server gagal');
    } finally {
      setUpdatingUid(null);
    }
  };

  // Client-side search filter for Tab 1
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.nama_lengkap.toLowerCase().includes(q) ||
        s.nisn.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.nama_sekolah ?? '').toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <ShieldAlert className="w-7 h-7 text-slate-800" />
          Kebijakan Retensi &amp; Perlindungan Data Pribadi
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-0.5">
          Kelola status keaktifan akademik siswa untuk mematuhi masa retensi data pribadi sensitif (UU PDP No. 27/2022).
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('status')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'status'
              ? 'border-slate-900 text-slate-900 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="w-4 h-4" />
          Kelola Status Akun Siswa
        </button>
        <button
          onClick={() => setActiveTab('nearing')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 relative ${
            activeTab === 'nearing'
              ? 'border-slate-900 text-slate-900 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Clock className="w-4 h-4" />
          Peringatan Penghapusan Data
          {nearingDeletion.length > 0 && (
            <span className="absolute top-2.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'status' ? (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 transition-all shadow-sm"
              placeholder="Cari nama, NISN, email, atau sekolah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold py-4 pl-6">Siswa</TableHead>
                    <TableHead className="font-bold">NISN</TableHead>
                    <TableHead className="font-bold">Sekolah / Kelas</TableHead>
                    <TableHead className="font-bold text-center">Status Akun</TableHead>
                    <TableHead className="text-right font-bold pr-6">Atur Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingStudents ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center text-slate-400">
                        <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Memuat data siswa...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">Tidak ada siswa yang ditemukan.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => {
                      const uid = getUid(student);
                      const currentStatus = student.status_akun || 'AKTIF';
                      return (
                        <TableRow key={uid} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="py-4 pl-6">
                            <p className="font-bold text-slate-900 text-sm">{student.nama_lengkap}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{student.email}</p>
                          </TableCell>
                          <TableCell className="font-mono text-sm font-semibold text-slate-700">
                            {student.nisn || '-'}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-semibold text-slate-700">{student.nama_sekolah || '-'}</p>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              {student.kelas || '-'}
                            </p>
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wider ${
                                currentStatus === 'AKTIF'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : currentStatus === 'LULUS'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {currentStatus}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="inline-flex items-center gap-2">
                              {updatingUid === uid && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
                              <select
                                value={currentStatus}
                                disabled={updatingUid === uid}
                                onChange={(e) => handleUpdateStatus(uid, e.target.value)}
                                className="text-xs font-bold border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-950"
                              >
                                <option value="AKTIF">Aktif</option>
                                <option value="LULUS">Lulus</option>
                                <option value="PINDAH">Pindah Sekolah</option>
                              </select>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Info Card */}
          <div className="flex items-start gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
            <Info className="w-6 h-6 text-slate-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-sm">Kebijakan Anonimisasi Data</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sesuai persetujuan privasi (consent), data personal siswa (nama, NISN, email, alamat, no hp) serta narasi cerita diagnosis
                yang berstatus <strong className="text-slate-800">LULUS</strong> atau <strong className="text-slate-800">PINDAH</strong> akan dihapus dan dianonimkan secara otomatis setelah <strong className="text-slate-800">2 tahun (730 hari)</strong>.
                Halaman ini memberikan peringatan dini daftar siswa yang mendekati batas waktu penghapusan tersebut.
              </p>
            </div>
          </div>

          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-white">
              <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Daftar Siswa Mendekati Batas Retensi (2 Tahun)
              </CardTitle>
              <CardDescription>
                Tabel di bawah menampilkan siswa non-aktif beserta estimasi jumlah hari tersisa sebelum proses anonimisasi berjalan.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold py-4 pl-6">Siswa</TableHead>
                    <TableHead className="font-bold">Sekolah / Kelas</TableHead>
                    <TableHead className="font-bold">Tanggal Nonaktif</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                    <TableHead className="text-right font-bold pr-6">Hari Tersisa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingNearing ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center text-slate-400">
                        <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Memuat data peringatan retensi...</p>
                      </TableCell>
                    </TableRow>
                  ) : nearingDeletion.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center text-slate-400">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                        <p className="text-sm font-semibold text-slate-700">Semua aman!</p>
                        <p className="text-xs text-slate-400 mt-1">Tidak ada siswa yang mendekati batas waktu penghapusan data.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    nearingDeletion.map((student) => {
                      const daysLeft = student.days_remaining;
                      const isCritical = daysLeft <= 30;
                      return (
                        <TableRow key={student.students_uid} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="py-4 pl-6">
                            <p className="font-bold text-slate-900 text-sm">{student.nama_lengkap}</p>
                            <p className="text-xs text-slate-400 mt-0.5">NISN {student.nisn}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-semibold text-slate-700">{student.nama_sekolah}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{student.kelas}</p>
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-slate-700">
                            {student.tanggal_nonaktif
                              ? new Date(student.tanggal_nonaktif).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-black border bg-red-50 text-red-700 border-red-200 uppercase">
                              {student.status_akun}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6 font-mono font-bold text-sm">
                            {daysLeft > 0 ? (
                              <span className={isCritical ? 'text-red-600 animate-pulse' : 'text-slate-700'}>
                                {daysLeft} hari lagi
                              </span>
                            ) : (
                              <span className="text-red-500 font-black">Segera Dianonimkan</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
