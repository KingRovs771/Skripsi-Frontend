'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Pencil, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { fetchApi, buildApiUrl } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ArticleData {
  article_uid: string;
  judul_article: string;
  author: string;
  category_name?: string;
  created_at?: string;
  isi_article?: string;
  status?: number;
  thumbnails?: string;
}

export default function GurubkArticlePage() {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await fetchApi('/api/article/gurubk/getArticles', { method: 'GET' });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setArticles(data.data || data.Data || []);
      } else {
        toast.error(data.Message || 'Gagal memuat artikel');
      }
    } catch {
      toast.error('Kehilangan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  const onClickDelete = (id: string) => {
    setSelectedArticleId(id);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedArticleId) return;

    setIsDeleting(true);
    try {
      const response = await fetchApi(`/api/article/gurubk/deleteArticle/${selectedArticleId}`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        toast.success('Artikel berhasil dihapus.');
        setArticles(articles.filter((a) => a.article_uid !== selectedArticleId));
      } else {
        toast.error(data.Message || 'Gagal menghapus artikel.');
      }
    } catch {
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
          <h1 className="text-3xl font-bold text-slate-900">Kelola Artikel</h1>
          <p className="text-sm text-slate-500">Buat dan kelola konten edukasi kesehatan mental untuk siswa.</p>
        </div>
        <Link href="/gurubk/article/create">
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
                <TableHead className="font-bold py-4">Thumbnail &amp; Judul</TableHead>
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
                    Belum ada artikel yang Anda buat. Klik &quot;Tambah Artikel&quot; untuk memulai.
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article) => (
                  <TableRow key={article.article_uid} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded bg-slate-100 overflow-hidden shrink-0 border border-slate-200 relative">
                          <img
                            src={buildApiUrl(`/api/home/articles/${article.article_uid}/thumbnail`)}
                            alt={article.judul_article}
                            className="w-full h-full object-cover relative z-10"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-50">
                            <Loader2 className="w-4 h-4 animate-pulse" />
                          </div>
                        </div>
                        <div>
                          <p className="line-clamp-2 text-sm max-w-[250px] font-bold text-slate-900">{article.judul_article}</p>
                          <p className="text-xs text-slate-400 font-normal py-0.5">Author: {article.author}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold truncate max-w-[150px] inline-block">
                        {article.category_name || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md ${
                          article.status === 1 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {article.status === 1 ? 'Published' : 'Draft'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Link href={`/gurubk/article/edit/${article.article_uid}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg"
                          onClick={() => onClickDelete(article.article_uid)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent className="bg-white rounded-3xl border-none shadow-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Hapus Artikel?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Artikel yang dihapus akan hilang secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-medium text-slate-600">
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
