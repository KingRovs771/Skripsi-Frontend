'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Loader2, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Category {
  category_uid: string;
  name_category: string;
  description: string;
}

export default function KategoriTesPage() {
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete State
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  // ── FETCH CATEGORIES ──
  const fetchCategories = async () => {
    setLoadingInitial(true);
    try {
      const res = await fetchApi('/api/category/getAllCategories');
      const json = await res.json().catch(() => ({}));
      if (res.ok || json.data) {
        setCategories(json.Data || json.data || []);
      } else {
        toast.error(json.error || json.Message || 'Gagal mengambil data kategori dari server', { id: 'fetch-category' });
      }
    } catch (err) {
      toast.error('Gagal terhubung ke server', { id: 'fetch-category' });
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((c) =>
    (c.name_category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── TRIGGER DELETE ──
  const confirmDelete = (uid: string) => {
    setSelectedUid(uid);
    setOpenConfirm(true);
  };

  const handleDelete = async () => {
    if (!selectedUid) return;
    try {
      const res = await fetchApi(`/api/category/deleteCategory/${selectedUid}`, {
        method: 'DELETE',
      });
      const json = await res.json().catch(() => ({}));
      
      if (res.ok || json.Status === 'Success') {
        toast.success('Kategori telah dihapus');
        setCategories((prev) => prev.filter((c) => c.category_uid !== selectedUid));
      } else {
        toast.error(json.Message || json.error || 'Gagal menghapus kategori');
      }
    } catch {
      toast.error('Server terputus saat menghapus kategori');
    } finally {
      setOpenConfirm(false);
      setSelectedUid(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">Kategori Tes Diagnosis</h1>
          <p className="text-slate-500 text-sm">Kelola pengelompokan jenis instrumen tes kesehatan mental.</p>
        </div>
        <Link href="/pakar/typeTes/create">
          <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-sm active:scale-95">
            <Plus className="w-4 h-4" /> Tambah Kategori
          </button>
        </Link>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          placeholder="Cari berdasarkan nama kategori..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none text-sm shadow-sm" 
        />
      </div>

      {/* GRID LIST */}
      {loadingInitial ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm font-medium">Memuat kategori dar server...</p>
          </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => (
            <div key={cat.category_uid} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm group hover:border-slate-400 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 transition-all">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/pakar/typeTes/edit/${cat.category_uid}`}>
                    <button className="p-2 text-slate-400 hover:text-blue-600 background-none rounded-lg hover:bg-slate-50">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </Link>
                  <button onClick={() => confirmDelete(cat.category_uid)} className="p-2 text-slate-400 hover:text-red-600 background-none rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900">{cat.name_category}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-3">
                  {cat.description || <span className="italic text-slate-300">Tidak ada deskripsi</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400 font-medium italic border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          Belum ada data kategori tes yang ditemukan.
        </div>
      )}

      {/* ALERT DIALOG DELETE */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent className="bg-white rounded-2xl max-w-sm border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-slate-900">Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Kategori yang dihapus akan menghilang sepenuhnya dari basis data. Apakah Anda yakin?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl border-slate-200 hover:bg-slate-50 transition-colors">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDelete(); }} className="bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors">
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
