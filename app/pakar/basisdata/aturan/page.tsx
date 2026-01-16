'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockBasisPengetahuanAturan } from '@/lib/data';
import { PlusCircle, Pencil, Trash2, Loader2, Scale } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// Import komponen AlertDialog dari Shadcn UI
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function PakarFaqPage() {
  const [aturanList, setAturanList] = useState(mockBasisPengetahuanAturan);
  const [loading, setLoading] = useState(false);

  // State untuk modal konfirmasi
  const [openAlert, setOpenAlert] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Fungsi memicu munculnya alert
  const triggerDelete = (id: number) => {
    setSelectedId(id);
    setOpenAlert(true);
  };

  // Fungsi eksekusi hapus
  const handleConfirmDelete = async () => {
    if (selectedId === null) return;

    setLoading(true);
    try {
      // Simulasi proses backend
      await new Promise((resolve) => setTimeout(resolve, 800));

      setAturanList(aturanList.filter((item) => item.id !== selectedId));
      toast.success('Aturan basis pengetahuan berhasil dihapus.');
    } catch (error) {
      toast.error('Gagal menghapus aturan.');
    } finally {
      setLoading(false);
      setOpenAlert(false);
      setSelectedId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">Data Aturan</h1>
          <p className="text-sm text-slate-500 font-medium">Kelola logika basis pengetahuan untuk sistem pakar diagnosis.</p>
        </div>
        <Link href="/pakar/basisdata/aturan/create">
          <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl">
            <PlusCircle className="w-4 h-4 mr-2" /> Tambah Aturan
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[80px] py-4 font-bold text-slate-700">No.</TableHead>
                <TableHead className="font-bold text-slate-700">Kode Aturan</TableHead>
                <TableHead className="font-bold text-slate-700">Kode Pertanyaan</TableHead>
                <TableHead className="font-bold text-slate-700 text-center">Minimal Jawaban</TableHead>
                <TableHead className="font-bold text-slate-700">Wajib</TableHead>
                <TableHead className="text-center font-bold text-slate-700 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aturanList.length > 0 ? (
                aturanList.map((aturan, index) => (
                  <TableRow key={aturan.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-4 text-slate-500 font-medium">{index + 1}</TableCell>
                    <TableCell className="font-bold text-blue-600">{aturan.kodeaturan}</TableCell>
                    <TableCell className="font-medium text-slate-700">{aturan.kodepertanyaan}</TableCell>
                    <TableCell className="text-center">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{aturan.min_value}</span>
                    </TableCell>
                    <TableCell>
                      {aturan.is_mandatory === 'Ya' ? (
                        <span className="px-2 py-1 text-[10px] font-black uppercase rounded-md bg-amber-100 text-amber-700 border border-amber-200">Wajib</span>
                      ) : (
                        <span className="px-2 py-1 text-[10px] font-black uppercase rounded-md bg-slate-100 text-slate-400">Opsional</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" onClick={() => triggerDelete(aturan.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-slate-400 font-medium italic">
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
            <AlertDialogDescription className="text-slate-500 text-sm leading-relaxed">Menghapus aturan ini dapat mempengaruhi hasil diagnosis sistem pakar. Apakah Anda yakin?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-slate-600">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium px-6 shadow-sm transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ya, Hapus Data'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
