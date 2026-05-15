'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Pencil, Trash2, Loader2, GraduationCap, Users } from 'lucide-react';

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

  // Delete state
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // ── Client-side search filter ──────────────────────────────────────────────
  const filtered = useMemo(() => {
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

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-sm"
          placeholder="Cari nama, NISN, email, atau sekolah..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
                      {searchQuery ? 'Tidak ada siswa yang cocok dengan pencarian.' : 'Belum ada data siswa.'}
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
                      <TableCell className="text-right pr-6">
                        <Link href={`/admin/users/students/edit/${uid}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="mr-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg"
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
    </div>
  );
}
