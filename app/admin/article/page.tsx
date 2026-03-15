'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Pencil, Trash2, Loader2, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';

// Import komponen AlertDialog
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface ArticleData {
  ArticleUID: string;
  JudulArticle: string;
  Author: string;
  CategoryName: string;
  CreatedAt: string;
}

export default function PakarArticlePage() {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // State untuk mengontrol Dialog Konfirmasi
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      // Endpoint yang digunakan menyesuaikan backend Golang
      const response = await fetchApi('/api/article/admin/getArticles', { method: 'GET' });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setArticles(data.data || []);
      } else {
        toast.error(data.Message || 'Gagal memuat artikel');
      }
    } catch (error) {
      toast.error('Kehilangan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Fungsi saat tombol sampah diklik (Membuka Popup)
  const onClickDelete = (id: string) => {
    setSelectedArticleId(id);
    setOpenConfirm(true);
  };

  // 2. Fungsi saat User klik "Hapus" di dalam Popup
  const handleConfirmDelete = async () => {
    if (!selectedArticleId) return;

    setIsDeleting(true);
    try {
      // Sesuaikan URL jika format Golangnya berbeda `/pakar/article/${selectedArticleId}`
      const response = await fetchApi(`/pakar/article/${selectedArticleId}`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        toast.success('Artikel berhasil dihapus selamanya.');
        setArticles(articles.filter((a) => a.ArticleUID !== selectedArticleId));
      } else {
        toast.error(data.Message || 'Gagal menghapus artikel dari server.');
      }
    } catch (error) {
      toast.error('Gagal menghapus artikel (Koneksi Error).');
    } finally {
      setIsDeleting(false);
      setOpenConfirm(false);
      setSelectedArticleId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manajemen Artikel</h1>
          <p className="text-sm text-slate-500">Kelola konten edukasi kesehatan mental siswa.</p>
        </div>
        <Link href="/admin/article/create">
          <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl">
            <PlusCircle className="w-4 h-4 mr-2" /> Tambah Artikel
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold py-4">Judul Artikel</TableHead>
                <TableHead className="font-bold">Kategori</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Memuat data artikel...
                  </TableCell>
                </TableRow>
              ) : articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-slate-500 font-medium">
                    Belum ada artikel yang ditambahkan.
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article) => (
                  <TableRow key={article.ArticleUID} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium py-4">
                      {article.JudulArticle}
                      <p className="text-xs text-slate-400 font-normal mt-1">Author: {article.Author}</p>
                    </TableCell>
                    <TableCell>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{article.CategoryName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-green-100 text-green-700">Published</span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="mr-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg"
                        onClick={() => onClickDelete(article.ArticleUID)} // Panggil fungsi buka popup
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- MODAL KONFIRMASI (CLEAN WHITE) --- */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent className="bg-white rounded-3xl border-none shadow-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Hapus Artikel?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 leading-relaxed">Tindakan ini tidak dapat dibatalkan. Artikel yang dihapus akan hilang secara permanen dari database.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-medium text-slate-600">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium px-6 transition-all">
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
