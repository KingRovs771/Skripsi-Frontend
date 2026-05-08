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

interface Penyakit {
  penyakit_uid: string;
  kode_penyakit: string;
  nama_penyakit: string;
  kode_turunan: string;
  description: string;
  saran_penanganan: string;
}

export default function PakarPenyakitPage() {
  const [penyakitList, setPenyakitList] = useState<Penyakit[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State untuk modal konfirmasi
  const [openAlert, setOpenAlert] = useState(false);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  // ── FETCH PENYAKIT ──
  const fetchPenyakit = async () => {
    setLoadingInitial(true);
    try {
      // Endpoint ini menyesuaikan dengan backend Anda (GetAllPenyakits atau getAllPenyakit)
      const res = await fetchApi('/api/penyakit/getAllPenyakits');
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setPenyakitList(json.Data || json.data || []);
      } else {
        toast.error(json.Message || json.error || 'Gagal mengambil data penyakit dari server', { id: 'fetch-error' });
      }
    } catch (err) {
      toast.error('Gagal terhubung ke server', { id: 'fetch-error' });
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchPenyakit();
  }, []);

  // Filter Search
  const filtered = penyakitList.filter(
    (p) =>
      p.kode_penyakit?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nama_penyakit?.toLowerCase().includes(searchQuery.toLowerCase())
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
      const res = await fetchApi(`/api/penyakit/deletePenyakit/${selectedUid}`, {
        method: 'DELETE',
      });
      const json = await res.json().catch(() => ({}));
      
      if (res.ok || json.Status === "Not Found" || res.status === 404 /* Backend returns 404 for success deleting */) {
        toast.success('Penyakit berhasil dihapus.');
        setPenyakitList((prev) => prev.filter((item) => item.penyakit_uid !== selectedUid));
      } else {
        toast.error(json.Message || json.message || 'Gagal menghapus penyakit.');
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
          <h1 className="text-3xl font-bold text-slate-900">Data Penyakit & Gangguan</h1>
          <p className="text-sm text-slate-500 font-medium">Kelola daftar penyakit atau gangguan psikososial beserta sarannya.</p>
        </div>
        <Link href="/pakar/basisdata/penyakit/create">
          <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl px-6">
            <PlusCircle className="w-4 h-4 mr-2" /> Tambah Penyakit
          </Button>
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm shadow-sm"
          placeholder="Cari berdasarkan Kode Penyakit atau Nama Penyakit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[60px] py-4 font-bold text-slate-700">No.</TableHead>
                <TableHead className="w-[90px] font-bold text-slate-700">Kode</TableHead>
                <TableHead className="font-bold text-slate-700">Nama Penyakit</TableHead>
                <TableHead className="w-[110px] font-bold text-slate-700">Kode Turunan</TableHead>
                <TableHead className="font-bold text-slate-700">Deskripsi Singkat</TableHead>
                <TableHead className="text-right font-bold text-slate-700 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingInitial ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                    Memuat data penyakit...
                  </TableCell>
                </TableRow>
              ) : filtered.length > 0 ? (
                filtered.map((penyakit, index) => (
                  <TableRow key={penyakit.penyakit_uid || index} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-4 text-slate-500 font-medium">{index + 1}</TableCell>
                    <TableCell className="font-bold text-emerald-600 font-mono">{penyakit.kode_penyakit}</TableCell>
                    <TableCell className="font-bold text-slate-900">{penyakit.nama_penyakit}</TableCell>
                    <TableCell>
                      {penyakit.kode_turunan ? (
                        <span className="inline-block px-2.5 py-1 text-xs font-bold font-mono rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                          {penyakit.kode_turunan}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 max-w-xs truncate" title={penyakit.description}>
                      {penyakit.description || '-'}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Link href={`/pakar/basisdata/penyakit/edit/${penyakit.penyakit_uid}`}>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" onClick={() => triggerDelete(penyakit.penyakit_uid)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-slate-400 font-medium italic">
                    Belum ada data penyakit yang tersedia.
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
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Hapus Penyakit?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-sm leading-relaxed">
              Menghapus data penyakit ini akan menyebabkan history diagnosis yang berkaitan menjadi tidak utuh. Apakah Anda yakin?
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
