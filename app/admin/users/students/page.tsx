'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Pencil, Trash2, Loader2, GraduationCap, Users, KeyRound, School, X } from 'lucide-react';

// ── Tipe Data ──────────────────────────────────────────────────────────────────
interface Student {
  // Berbagai kemungkinan nama field UID dari backend Go
  students_uid?: string;
  student_uid?: string;
  user_uid?: string;
  siswa_uid?: string;
  uid?: string;
  id?: number;
  // Data fields
  nisn: string;
  nama_lengkap: string;
  email: string;
  no_hp: string;
  jenjang: string;
  kelas: string;
  nama_sekolah?: string;
  npsn?: string | number;
}

/** Ambil UID dari student — toleran terhadap berbagai field name backend */
const getUid = (s: Student): string =>
  s.students_uid ?? s.student_uid ?? s.user_uid ?? s.siswa_uid ?? s.uid ?? String(s.id ?? '');

export default function ManajemenSiswa() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');

  // Delete state
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset Password state
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [resetStudentUid, setResetStudentUid] = useState<string | null>(null);
  const [resetStudentName, setResetStudentName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // ── Fetch Data ─────────────────────────────────────────────────────────────
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/api/users/getAllStudents');
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setStudents(json.Data || json.data || []);
      } else {
        toast.error(json.Message || json.message || 'Gagal memuat data siswa');
      }
    } catch {
      toast.error('Koneksi ke server gagal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ── Dynamic School Options derived from students data ──────────────────────
  const schoolOptions = useMemo(() => {
    const schools = students.map((s) => s.nama_sekolah?.trim()).filter(Boolean) as string[];
    return Array.from(new Set(schools)).sort();
  }, [students]);

  // ── Client-side search and school filter ──────────────────────────────────
  const filtered = useMemo(() => {
    let result = students;

    // Filter by School
    if (selectedSchool) {
      result = result.filter((s) => s.nama_sekolah === selectedSchool);
    }

    // Filter by Search Query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (s) =>
          s.nama_lengkap.toLowerCase().includes(q) ||
          s.nisn.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    return result;
  }, [students, searchQuery, selectedSchool]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const onClickDelete = (uid: string) => {
    setSelectedUid(uid);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUid) return;
    setIsDeleting(true);
    try {
      const res = await fetchApi(`/api/users/deleteStudents/${selectedUid}`, {
        method: 'DELETE',
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Data siswa berhasil dihapus');
        setStudents((prev) => prev.filter((s) => getUid(s) !== selectedUid));
      } else {
        toast.error(json.Message || json.message || 'Gagal menghapus data siswa');
      }
    } catch {
      toast.error('Koneksi ke server gagal');
    } finally {
      setIsDeleting(false);
      setOpenConfirm(false);
      setSelectedUid(null);
    }
  };

  // ── Reset Password ─────────────────────────────────────────────────────────
  const onClickResetPassword = (uid: string, name: string) => {
    setResetStudentUid(uid);
    setResetStudentName(name);
    setNewPassword('');
    setOpenResetDialog(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetStudentUid) return;
    if (newPassword.trim().length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetchApi(`/api/users/resetPasswordStudents/${resetStudentUid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(`Password ${resetStudentName} berhasil diperbarui`);
        setOpenResetDialog(false);
        setResetStudentUid(null);
        setNewPassword('');
      } else {
        toast.error(json.error || 'Gagal mereset password');
      }
    } catch {
      toast.error('Koneksi ke server gagal');
    } finally {
      setIsResetting(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Siswa</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola informasi akademik dan akun seluruh siswa.
          </p>
        </div>
        <Link href="/admin/users/students/create">
          <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Tambah Siswa
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-sm"
            placeholder="Cari nama, NISN, atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter per Sekolah */}
        <div className="relative">
          <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-sm appearance-none cursor-pointer"
          >
            <option value="">Semua Sekolah</option>
            {schoolOptions.map((sch) => (
              <option key={sch} value={sch}>{sch}</option>
            ))}
          </select>
          {selectedSchool && (
            <button
              onClick={() => setSelectedSchool('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold py-4 pl-6">Siswa</TableHead>
                <TableHead className="font-bold">NISN</TableHead>
                <TableHead className="font-bold">Sekolah / Kelas</TableHead>
                <TableHead className="font-bold">No. HP</TableHead>
                <TableHead className="text-right font-bold pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-slate-400">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Memuat data siswa...</p>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm text-slate-500 font-medium">
                      {searchQuery || selectedSchool ? 'Tidak ada siswa yang cocok dengan kriteria.' : 'Belum ada data siswa.'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((student, idx) => {
                  const uid = getUid(student);
                  return (
                    <TableRow key={uid || idx} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="py-4 pl-6">
                        <p className="font-bold text-slate-900 text-sm">{student.nama_lengkap}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{student.email}</p>
                      </TableCell>
                      <TableCell className="font-mono text-sm font-semibold text-slate-700">
                        {student.nisn || '-'}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-semibold text-slate-700">
                          {student.nama_sekolah || '-'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          {student.jenjang} · {student.kelas}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {student.no_hp || '-'}
                      </TableCell>
                      <TableCell className="text-right pr-6 space-x-1">
                        {/* Reset Password */}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Reset Password"
                          className="text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all rounded-lg"
                          onClick={() => onClickResetPassword(uid, student.nama_lengkap)}
                        >
                          <KeyRound className="w-4 h-4" />
                        </Button>
                        <Link href={`/admin/users/students/edit/${uid}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg"
                          onClick={() => onClickDelete(uid)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Jumlah data */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          Menampilkan {filtered.length} dari {students.length} siswa
        </p>
      )}

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent className="bg-white rounded-3xl border-none shadow-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">
              Hapus Data Siswa?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Data siswa akan dihapus secara permanen dari database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-slate-600">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium px-6 transition-all"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Reset Password */}
      <AlertDialog open={openResetDialog} onOpenChange={setOpenResetDialog}>
        <AlertDialogContent className="bg-white rounded-3xl border-none shadow-2xl max-w-md">
          <form onSubmit={handleResetPassword}>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-slate-900">
                Reset Password Siswa
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 mt-2">
                Masukkan password baru untuk siswa <span className="font-bold text-slate-800">{resetStudentName}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="my-4">
              <input
                id="reset-new-password"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru (min 6 karakter)"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 transition-all shadow-sm"
              />
            </div>

            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel
                type="button"
                onClick={() => { setOpenResetDialog(false); setResetStudentUid(null); }}
                className="border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-slate-600"
              >
                Batal
              </AlertDialogCancel>
              <Button
                type="submit"
                disabled={isResetting || newPassword.trim().length < 6}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium px-6 transition-all"
              >
                {isResetting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
                Reset Password
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
