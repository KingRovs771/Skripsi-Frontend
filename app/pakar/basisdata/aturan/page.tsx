'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Pencil, Trash2, Loader2, Scale, Search, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';

// Import komponen AlertDialog dari Shadcn UI
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Aturan {
  aturan_uid: string;
  kode_penyakit: string;
  kode_pertanyaan: string;
  min_value: number;
  is_mandatory: number;
  tipe_aturan?: string;
  berlaku_untuk_semua_tingkat?: boolean;
}

export default function PakarAturanPage() {
  const [aturanList, setAturanList] = useState<Aturan[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State untuk modal konfirmasi
  const [openAlert, setOpenAlert] = useState(false);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  // ── FETCH ATURAN ──
  const fetchAturan = async () => {
    setLoadingInitial(true);
    try {
      const res = await fetchApi('/api/aturan/getAllAturan');
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setAturanList(json.Data || json.data || []);
      } else {
        toast.error(json.Message || json.error || 'Gagal mengambil data aturan dari server', { id: 'fetch-error' });
      }
    } catch (err) {
      toast.error('Gagal terhubung ke server', { id: 'fetch-error' });
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchAturan();
  }, []);

  // Filter Search
  const filtered = aturanList.filter(
    (a) =>
      a.kode_penyakit?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.kode_pertanyaan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.tipe_aturan ?? '').toLowerCase().includes(searchQuery.toLowerCase())
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
      const res = await fetchApi(`/api/aturan/deleteAturan/${selectedUid}`, {
        method: 'DELETE',
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success('Aturan basis pengetahuan berhasil dihapus.');
        setAturanList((prev) => prev.filter((item) => item.aturan_uid !== selectedUid));
      } else {
        toast.error(json.Message || json.message || 'Gagal menghapus aturan.');
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
          <h1 className="text-3xl font-bold text-slate-900">Data Aturan</h1>
          <p className="text-sm text-slate-500 font-medium">Kelola logika basis pengetahuan untuk sistem pakar diagnosis.</p>
        </div>
        <Link href="/pakar/basisdata/aturan/create">
          <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl px-6">
            <PlusCircle className="w-4 h-4 mr-2" /> Tambah Aturan
          </Button>
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm shadow-sm"
          placeholder="Cari berdasarkan Kode Penyakit, Kode Pertanyaan, atau Tipe Aturan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[80px] py-4 font-bold text-slate-700">No.</TableHead>
                <TableHead className="font-bold text-slate-700">Kode Penyakit</TableHead>
                <TableHead className="font-bold text-slate-700">Tipe Aturan</TableHead>
                <TableHead className="font-bold text-slate-700">Kode Pertanyaan</TableHead>
                <TableHead className="font-bold text-slate-700 text-center">Min. Jawaban</TableHead>
                <TableHead className="font-bold text-slate-700">Sifat</TableHead>
                <TableHead className="font-bold text-slate-700 text-center">Lintas Tingkat</TableHead>
                <TableHead className="text-right font-bold text-slate-700 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingInitial ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                    Memuat data aturan...
                  </TableCell>
                </TableRow>
              ) : filtered.length > 0 ? (
                filtered.map((aturan, index) => (
                  <TableRow key={aturan.aturan_uid || index} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-4 text-slate-500 font-medium">{index + 1}</TableCell>
                    <TableCell className="font-bold text-slate-900">
                      {aturan.kode_penyakit === 'ALL' ? (
                        <span className="text-slate-400 italic">Semua Penyakit</span>
                      ) : (
                        aturan.kode_penyakit
                      )}
                    </TableCell>
                    <TableCell>
                      {aturan.tipe_aturan === 'RED_FLAG' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-50 text-red-700 border border-red-100 gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-500" /> Red Flag
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          Gejala Inti
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">{aturan.kode_pertanyaan}</TableCell>
                    <TableCell className="text-center">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">{aturan.min_value}</span>
                    </TableCell>
                    <TableCell>
                      {aturan.is_mandatory === 1 ? (
                        <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-md bg-amber-100 text-amber-700 border border-amber-200 gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" /> Wajib
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-md bg-slate-100 text-slate-400">
                          Opsional
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {aturan.berlaku_untuk_semua_tingkat ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                          <ShieldCheck className="w-3 h-3" /> Ya
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Link href={`/pakar/basisdata/aturan/edit/${aturan.aturan_uid}`}>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" onClick={() => triggerDelete(aturan.aturan_uid)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20 text-slate-400 font-medium italic">
                    Belum ada data aturan yang tersedia.
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
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Hapus Aturan?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-sm leading-relaxed">
              Menghapus aturan ini dapat mempengaruhi hasil diagnosis sistem pakar. Apakah Anda yakin?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-slate-600">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
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
