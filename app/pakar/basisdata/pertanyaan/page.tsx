'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockBasisPengetahuanGejala } from '@/lib/data';
import { PlusCircle, Pencil, Trash2, Loader2, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// Import komponen AlertDialog dari Shadcn UI
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function PakarGejalaPage() {
  const [gejalaList, setGejalaList] = useState(mockBasisPengetahuanGejala);
  const [loading, setLoading] = useState(false);

  // State untuk kontrol modal konfirmasi
  const [openAlert, setOpenAlert] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Fungsi memicu alert
  const triggerDelete = (id: number) => {
    setSelectedId(id);
    setOpenAlert(true);
  };

  // Fungsi eksekusi hapus
  const handleConfirmDelete = async () => {
    if (selectedId === null) return;

    setLoading(true);
    try {
      // Simulasi delay API
      await new Promise((resolve) => setTimeout(resolve, 800));

      setGejalaList(gejalaList.filter((item) => item.id !== selectedId));
      toast.success('Pertanyaan gejala berhasil dihapus.');
    } catch (error) {
      toast.error('Gagal menghapus data.');
    } finally {
      setLoading(false);
      setOpenAlert(false);
      setSelectedId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Data Gejala</h1>
          <p className="text-sm text-slate-500 font-medium">Kelola butir pertanyaan diagnosis yang akan dijawab oleh siswa.</p>
        </div>
        <Link href="/pakar/basisdata/pertanyaan/create">
          <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl px-5 transition-all">
            <PlusCircle className="w-4 h-4 mr-2" /> Tambah Pertanyaan
          </Button>
        </Link>
      </div>

      {/* TABLE SECTION */}
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[80px] py-4 font-bold text-slate-700">No.</TableHead>
                <TableHead className="w-[150px] font-bold text-slate-700">Kode Gejala</TableHead>
                <TableHead className="w-[150px] font-bold text-slate-700">Kategori</TableHead>
                <TableHead className="font-bold text-slate-700">Pertanyaan / Gejala</TableHead>
                <TableHead className="text-right font-bold text-slate-700 pr-6 w-[120px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gejalaList.length > 0 ? (
                gejalaList.map((gejala, index) => (
                  <TableRow key={gejala.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-4 text-slate-400 font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-black border border-blue-100 uppercase">{gejala.kodegajala}</span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-wider">{gejala.kategori}</span>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{gejala.namagejala}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" onClick={() => triggerDelete(gejala.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-slate-400 font-medium italic">
                    Belum ada data pertanyaan gejala yang tersedia.
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
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-2">
              <HelpCircle className="w-6 h-6 text-amber-500" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Hapus Pertanyaan?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-sm leading-relaxed">
              Pertanyaan ini mungkin terhubung dengan aturan basis pengetahuan. Menghapus data ini secara permanen dapat mengganggu logika sistem pakar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-slate-600 transition-all">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium px-6 shadow-sm transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
