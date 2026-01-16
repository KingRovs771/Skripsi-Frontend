'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockArticles } from '@/lib/data';
import { PlusCircle, Pencil, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// Import komponen AlertDialog dari Shadcn UI
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function PakarArticlePage() {
  // Jadikan data artikel sebagai state agar bisa diperbarui saat dihapus
  const [articles, setArticles] = useState(mockArticles);
  const [loading, setLoading] = useState(false);

  // State untuk kontrol modal konfirmasi
  const [openAlert, setOpenAlert] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Fungsi saat ikon hapus diklik
  const triggerDelete = (id: number) => {
    setSelectedId(id);
    setOpenAlert(true);
  };

  // Proses hapus setelah konfirmasi "Ya"
  const handleConfirmDelete = async () => {
    if (selectedId === null) return;

    setLoading(true);
    try {
      // Simulasi delay API
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Filter data lokal (Ganti dengan API call DELETE nantinya)
      setArticles(articles.filter((article) => article.id !== selectedId));

      toast.success('Artikel berhasil dihapus');
    } catch (error) {
      toast.error('Gagal menghapus artikel');
    } finally {
      setLoading(false);
      setOpenAlert(false);
      setSelectedId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">Manajemen Artikel</h1>
          <p className="text-sm text-slate-500 font-medium text-slate-500">Daftar artikel kesehatan mental yang telah Anda buat.</p>
        </div>
        <Link href="/pakar/article/create">
          <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl px-5">
            <PlusCircle className="w-4 h-4 mr-2" /> Tambah Artikel
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="py-4 font-bold text-slate-700">Judul</TableHead>
                <TableHead className="font-bold text-slate-700">Kategori</TableHead>
                <TableHead className="font-bold text-slate-700">Status</TableHead>
                <th className="text-right px-6 font-bold text-slate-700">Aksi</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.length > 0 ? (
                articles.map((article) => (
                  <TableRow key={article.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-900 py-4">{article.title}</TableCell>
                    <TableCell>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-bold">{article.category}</span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-green-100 text-green-700 border border-green-200">Published</span>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg" onClick={() => triggerDelete(article.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-slate-400 font-medium">
                    Belum ada artikel yang dibuat.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- ALERT DIALOG KONFIRMASI HAPUS --- */}
      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent className="bg-white rounded-2xl border-none shadow-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Hapus Artikel?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 leading-relaxed">Apakah Anda yakin ingin menghapus artikel ini? Data yang dihapus tidak dapat dikembalikan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-slate-600">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium px-6 transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
