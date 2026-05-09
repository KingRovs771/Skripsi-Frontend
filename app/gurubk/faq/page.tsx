'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Loader2, Scale, Search } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface FaqResponse {
  faqs_uid: string;
  nisn: string;
  nama_lengkap: string;
  faq_pertanyaan: string;
  status: string;
  created_at: string;
}

export default function GuruBkFaqPage() {
  const [faqs, setFaqs] = useState<FaqResponse[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAlert, setOpenAlert] = useState(false);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  const fetchFaqs = async () => {
    setLoadingInitial(true);
    try {
      const res = await fetchApi('/api/gurubk/faq/getAllFaqs');
      const json = await res.json();
      if (res.ok) {
        setFaqs(json.Data || []);
      } else {
        toast.error(json.Message || 'Gagal mengambil data FAQ');
      }
    } catch (err) {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const filteredFaqs = faqs.filter(
    (f) =>
      f.nisn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const triggerDelete = (uid: string) => {
    setSelectedUid(uid);
    setOpenAlert(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUid) return;
    setLoadingDelete(true);
    try {
      const res = await fetchApi(`/api/gurubk/faq/deleteFaq/${selectedUid}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Pertanyaan berhasil dihapus');
        setFaqs((prev) => prev.filter((item) => item.faqs_uid !== selectedUid));
      } else {
        toast.error('Gagal menghapus pertanyaan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan jaringan');
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
          <h1 className="text-3xl font-bold text-slate-900">Konsultasi Siswa (FAQ)</h1>
          <p className="text-sm font-medium text-slate-500">Daftar pertanyaan dari siswa di sekolah Anda.</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          placeholder="Cari NISN atau Nama..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 outline-none text-sm shadow-sm" 
        />
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="py-5 font-bold text-slate-700 pl-6 w-[80px]">No.</TableHead>
                <TableHead className="font-bold text-slate-700">NISN</TableHead>
                <TableHead className="font-bold text-slate-700">Nama Siswa</TableHead>
                <TableHead className="font-bold text-slate-700">Pertanyaan</TableHead>
                <TableHead className="font-bold text-slate-700">Status</TableHead>
                <TableHead className="text-right px-6 font-bold text-slate-700">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingInitial ? (
                 <TableRow>
                   <TableCell colSpan={6} className="h-40 text-center text-slate-400">
                     <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                     Memuat data...
                   </TableCell>
                 </TableRow>
              ) : filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => (
                  <TableRow key={faq.faqs_uid} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-500 py-4 pl-6 text-center">{idx + 1}</TableCell>
                    <TableCell className="font-bold text-slate-900">{faq.nisn}</TableCell>
                    <TableCell className="text-slate-700 font-semibold">{faq.nama_lengkap}</TableCell>
                    <TableCell className="text-slate-500 truncate max-w-[200px]">{faq.faq_pertanyaan}</TableCell>
                    <TableCell>
                      {faq.status === 'Terjawab' ? (
                        <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-lg text-xs font-bold tracking-wide">Terjawab</span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-xs font-bold tracking-wide">Menunggu</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-1">
                        <Link href={`/gurubk/faq/reply/${faq.faqs_uid}`}>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg" title="Balas">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg" onClick={() => triggerDelete(faq.faqs_uid)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-slate-400 font-medium italic">
                    Belum ada pertanyaan dari siswa Anda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent className="bg-white rounded-2xl border-none shadow-2xl max-w-sm">
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-2">
              <Scale className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Hapus Pertanyaan?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 leading-relaxed text-sm">
              Tindakan ini tidak dapat dibatalkan.
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
