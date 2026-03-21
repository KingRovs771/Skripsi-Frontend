'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Pencil, Trash2, Loader2, School, GraduationCap, Mail, Users } from 'lucide-react';

// ── Tipe Data ──────────────────────────────────────────────────────────────────
interface Teacher {
  teacher_uid?: string;
  user_uid?: string;
  uid?: string;
  id?: number;
  nip?: string;
  nama_lengkap: string;
  email: string;
  no_hp?: string;
  phone?: string;
  npsn?: string | number;
  nama_sekolah?: string;
}

const getUid = (t: Teacher): string =>
  t.teacher_uid ?? t.user_uid ?? t.uid ?? String(t.id ?? '');

export default function ManajemenGuru() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete state
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/api/users/getAllTeachers');
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setTeachers(json.Data || json.data || []);
      } else {
        toast.error(json.Message || json.message || 'Gagal memuat data guru', { id: 'fetch-error' });
      }
    } catch {
      toast.error('Koneksi ke server gagal', { id: 'fetch-error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeachers(); }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        t.nama_lengkap.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        (t.nip ?? '').toLowerCase().includes(q) ||
        (t.nama_sekolah ?? '').toLowerCase().includes(q)
    );
  }, [teachers, searchQuery]);

  const onClickDelete = (uid: string) => {
    setSelectedUid(uid);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUid) return;
    setIsDeleting(true);
    try {
      const res = await fetchApi(`/api/users/deleteTeacher/${selectedUid}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Data guru berhasil dihapus');
        setTeachers((prev) => prev.filter((t) => getUid(t) !== selectedUid));
      } else {
        toast.error(json.Message || json.message || 'Gagal menghapus data guru');
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
          <h1 className="text-3xl font-bold text-slate-900">Data Guru BK</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola akun Bimbingan Konseling tingkat sekolah.</p>
        </div>
        <Link href="/admin/users/teachers/create">
          <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Tambah Guru
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-sm"
          placeholder="Cari nama, NIP, email, atau sekolah..."
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
                <TableHead className="font-bold py-4 pl-6">Nama / NIP</TableHead>
                <TableHead className="font-bold">Unit Sekolah</TableHead>
                <TableHead className="font-bold">Email</TableHead>
                <TableHead className="font-bold">No. HP</TableHead>
                <TableHead className="text-right font-bold pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-slate-400">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Memuat data guru...</p>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm text-slate-500 font-medium">
                      {searchQuery ? 'Tidak ada guru yang cocok dengan pencarian.' : 'Belum ada data guru BK.'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((teacher, idx) => {
                  const uid = getUid(teacher);
                  return (
                    <TableRow key={uid || idx} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="py-4 pl-6">
                        <p className="font-bold text-slate-900 text-sm">{teacher.nama_lengkap}</p>
                        {teacher.nip && (
                          <p className="text-xs font-mono text-slate-400 mt-0.5">NIP. {teacher.nip}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {teacher.nama_sekolah ? (
                          <div className="flex items-center gap-2">
                            <School className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="text-sm font-semibold text-slate-700">{teacher.nama_sekolah}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          {teacher.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {teacher.phone ?? teacher.no_hp ?? '-'}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Link href={`/admin/users/teachers/edit/${uid}`}>
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

      {/* Counter */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          Menampilkan {filtered.length} dari {teachers.length} guru
        </p>
      )}

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent className="bg-white rounded-3xl border-none shadow-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Hapus Data Guru?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Data guru akan dihapus secara permanen dari database.
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
