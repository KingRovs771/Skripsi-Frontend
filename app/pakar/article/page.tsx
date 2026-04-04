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
  category_uid: string;
  category_name: string;
  author: string;
  status: number;
  status_label: string;
  thumbnail_url: string;
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
      const res = await fetchApi('/api/artikelpakar/getAllArtikel');
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
        toast.success('Artikel berhasil dihapus!');
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
    } // Ensure finally runs exactly here
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
                <TableHead className="font-bold text-slate-700 py-4 pl-6">Thumbnail & Judul</TableHead>
                <TableHead className="font-bold text-slate-700">Kategori</TableHead>
                <TableHead className="font-bold text-slate-700">Status</TableHead>
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
                articles.map((article, idx) => {

                  // Deteksi Real URL
                  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
                  const isAbsolute = article.thumbnail_url?.startsWith('http');
                  const validThumbnail = article.thumbnail_url ?
                    (isAbsolute ? article.thumbnail_url : `${API_URL}${article.thumbnail_url}`)
                    : `${API_URL}/api/home/articles/${article.article_uid}/thumbnail`;

                  return (
                    <TableRow key={article.article_uid || idx} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium py-4 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-sm relative">
                            <img
                              src={validThumbnail}
                              alt={article.judul_article}
                              className="w-full h-full object-cover transition-opacity duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-50"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></div>';
                              }}
                            />
                          </div>
                          <div className="flex flex-col gap-1 max-w-[300px]">
                            <p className="line-clamp-2 text-sm font-bold text-slate-900 leading-snug">{article.judul_article}</p>
                            <p className="text-xs text-slate-500 font-medium">Ditulis oleh: <span className="text-slate-700">{article.author || 'Pakar Sistem'}</span></p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold truncate max-w-[150px] inline-block shadow-sm">
                          {article.category_name || '-'}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md ${article.status === 0 || article.status_label === 'Published'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                          {article.status === 1 ? 'Draft' : 'Published'}
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
                  );
                })
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
