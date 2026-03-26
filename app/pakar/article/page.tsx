'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Pencil, Trash2, Loader2, Scale } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';

// Import komponen AlertDialog dari Shadcn UI
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface ArticleListResponse {
  article_uid: string;
  judul_article: string;
  author: string;
  category_name: string;
  created_at: string;
}

export default function PakarArticlePage() {
  const [articles, setArticles] = useState<ArticleListResponse[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // State untuk kontrol modal konfirmasi
  const [openAlert, setOpenAlert] = useState(false);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  // ── FETCH ARTIKEL ──
  const fetchArticles = async () => {
    setLoadingInitial(true);
    try {
      const res = await fetchApi('/api/article/getAllArticles');
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setArticles(json.data || json.Data || []);
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
    fetchArticles();
  }, []);

  // Fungsi saat ikon hapus diklik
  const triggerDelete = (uid: string) => {
    setSelectedUid(uid);
    setOpenAlert(true);
  };

  // Proses hapus setelah konfirmasi "Ya"
  const handleConfirmDelete = async () => {
    if (!selectedUid) return;

    setLoadingDelete(true);
    try {
      const res = await fetchApi(`/api/article/deleteArticle/${selectedUid}`, {
        method: 'DELETE',
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok || json.Status === 'Success') {
        toast.success('Artikel berhasil dihapus');
        setArticles((prev) => prev.filter((article) => article.article_uid !== selectedUid));
      } else {
        toast.error(json.Message || json.error || 'Gagal menghapus artikel');
      }
    } catch (error) {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoadingDelete(false);
      setOpenAlert(false);
      setSelectedUid(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">Manajemen Artikel</h1>
          <p className="text-sm font-medium text-slate-500">Daftar artikel kesehatan mental yang telah Anda buat.</p>
        </div>
        <Link href="/pakar/article/create">
          <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl px-6 h-11 shadow-sm transition-all active:scale-95">
            <PlusCircle className="w-4 h-4 mr-2" /> Tambah Artikel
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="py-5 font-bold text-slate-700 pl-6">Judul Artikel</TableHead>
                <TableHead className="font-bold text-slate-700">Penulis</TableHead>
                <TableHead className="font-bold text-slate-700">Kategori</TableHead>
                <TableHead className="text-right px-6 font-bold text-slate-700">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingInitial ? (
                 <TableRow>
                   <TableCell colSpan={4} className="h-40 text-center text-slate-400">
                     <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                     Memuat data artikel...
                   </TableCell>
                 </TableRow>
              ) : articles.length > 0 ? (
                articles.map((article, idx) => (
                  <TableRow key={article.article_uid || idx} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-bold text-slate-900 py-4 pl-6 line-clamp-2 max-w-sm">
                      {article.judul_article}
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">
                      {article.author}
                    </TableCell>
                    <TableCell>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-bold uppercase tracking-wide">
                        {article.category_name}
                      </span>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-1">
                        <Link href={`/pakar/article/edit/${article.article_uid}`}>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg" onClick={() => triggerDelete(article.article_uid)}>
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
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-2">
              <Scale className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Hapus Artikel?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 leading-relaxed text-sm">
              Apakah Anda yakin ingin menghapus artikel ini? Data yang dihapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-slate-600">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleConfirmDelete(); }} 
              disabled={loadingDelete} 
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium px-6 transition-all shadow-sm"
            >
              {loadingDelete ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
