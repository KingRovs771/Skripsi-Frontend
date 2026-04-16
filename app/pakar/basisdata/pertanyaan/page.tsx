'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Pencil, Trash2, Loader2, Scale, Search } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';

// Import komponen AlertDialog dari Shadcn UI
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Pertanyaan {
  pertanyaan_uid: string;
  kode_pertanyaan: string;
  kategori_pertanyaan: string;
  pertanyaan: string;
  bobot: number;
}

export default function PakarPertanyaanPage() {
  const [pertanyaanList, setPertanyaanList] = useState<Pertanyaan[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State untuk modal konfirmasi
  const [openAlert, setOpenAlert] = useState(false);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  // ── FETCH PERTANYAAN ──
  const fetchPertanyaan = async () => {
    setLoadingInitial(true);
    try {
      // Endpoint ini menyesuaikan dengan backend Anda (GetAllPertanyaans)
      const res = await fetchApi('/api/pertanyaan/getAllPertanyaans');
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setPertanyaanList(json.Data || json.data || []);
      } else {
        toast.error(json.Message || json.error || 'Gagal mengambil data dari server', { id: 'fetch-error' });
      }
    } catch (err) {
      toast.error('Gagal terhubung ke server', { id: 'fetch-error' });
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchPertanyaan();
  }, []);

  // Filter Search
  const filtered = pertanyaanList.filter(
    (p) =>
      p.kode_pertanyaan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.kategori_pertanyaan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pertanyaan?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── DELETE OPERATION ──
  const triggerDelete = (uid: string) => {
    setSelectedUid(uid);
    setOpenAlert(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUid) return;
    setLoadingDelete(true);
    try {
      const res = await fetchApi(`/api/pertanyaan/deletePertanyaan/${selectedUid}`, {
        method: 'DELETE',
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success('Pertanyaan berhasil dihapus.');
        setPertanyaanList((prev) => prev.filter((item) => item.pertanyaan_uid !== selectedUid));
      } else {
        toast.error(json.Message || json.message || 'Gagal menghapus pertanyaan.');
      }
    } catch (error) {
      toast.error('Koneksi ke server terputus.');
    } finally {
      setLoadingDelete(false);
      setOpenAlert(false);
      setSelectedUid(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">Data Pertanyaan</h1>
          <p className="text-sm text-slate-500 font-medium">Kelola pertanyaan kuesioner diagnosis untuk sistem pakar.</p>
        </div>
        <Link href="/pakar/basisdata/pertanyaan/create">
          <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl px-6">
            <PlusCircle className="w-4 h-4 mr-2" /> Tambah Pertanyaan
          </Button>
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm shadow-sm"
          placeholder="Cari berdasarkan Kode, Kategori, atau isi Pertanyaan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[60px] py-4 font-bold text-slate-700 text-center">No.</TableHead>
                <TableHead className="w-[100px] font-bold text-slate-700">Kode</TableHead>
                <TableHead className="w-[140px] font-bold text-slate-700">Kategori</TableHead>
                <TableHead className="max-w-[300px] font-bold text-slate-700">Isi Pertanyaan</TableHead>
                <TableHead className="w-[80px] font-bold text-slate-700 text-center">Bobot</TableHead>
                <TableHead className="w-[120px] text-right font-bold text-slate-700 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingInitial ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                    Memuat data pertanyaan...
                  </TableCell>
                </TableRow>
              ) : filtered.length > 0 ? (
                filtered.map((item, index) => (
                  <TableRow key={item.pertanyaan_uid || index} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-4 text-slate-500 font-medium text-center">{index + 1}</TableCell>
                    <TableCell className="font-bold text-blue-600">{item.kode_pertanyaan}</TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {item.kategori_pertanyaan}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="text-slate-700 text-sm line-clamp-2 leading-relaxed" title={item.pertanyaan}>
                        {item.pertanyaan}
                      </p>
                    </TableCell>
                    <TableCell className="text-center font-bold text-slate-900">{item.bobot}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Link href={`/pakar/basisdata/pertanyaan/edit/${item.pertanyaan_uid}`}>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" onClick={() => triggerDelete(item.pertanyaan_uid)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-slate-400 font-medium italic">
                    Belum ada data pertanyaan yang tersedia.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- POPUP KONFIRMASI HAPUS --- */}
      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent className="bg-white rounded-2xl border-none shadow-2xl max-w-sm">
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-2">
              <Scale className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Hapus Pertanyaan?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-sm leading-relaxed">
              Menghapus pertanyaan ini akan mempengaruhi semua alur diagnosis form kuesioner. Apakah Anda yakin?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-slate-600">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleConfirmDelete(); }}
              disabled={loadingDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium px-6 shadow-sm transition-all"
            >
              {loadingDelete ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ya, Hapus Data'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
