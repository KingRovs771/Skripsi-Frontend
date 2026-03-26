'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, ImagePlus, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';

export default function CreateArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ category_uid: string; name_category: string }[]>([]);

  // State Form
  const [formData, setFormData] = useState({
    judul_article: '',
    isi_article: '',
    author: '',
    category_uid: '',
  });

  // State Gambar
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  useEffect(() => {
    // Memuat daftar kategori
    const loadCategories = async () => {
      try {
        const res = await fetchApi('/api/category/getAllCategories');
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          setCategories(json.Data || json.data || []);
        }
      } catch (err) {
        console.error('Failed fetching categories:', err);
      }
    };
    loadCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal 2MB');
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!thumbnailFile) {
      toast.error('Thumbnail artikel wajib diunggah!');
      setLoading(false);
      return;
    }

    try {
      // Artikel baru membutuhkan FormData karena tipe backend Golang membaca File
      const payload = new FormData();
      payload.append('judul_article', formData.judul_article);
      payload.append('isi_article', formData.isi_article);
      payload.append('author', formData.author);
      payload.append('category_uid', formData.category_uid);
      payload.append('thumbnails', thumbnailFile);

      // Kita tidak memakai wrapper fetchApi langsung untuk 'Content-Type' 
      // Supaya browser yg mengatur otomatis boundary multipart/form-data
      const res = await fetchApi('/api/article/createArticle', {
        method: 'POST',
        body: payload,
      }, true); // Opsi true di fetchApi util biasanya mencegah injeksi headers JSON jika di-support

      const json = await res.json().catch(() => ({}));

      if (res.ok || json.Status === 'Success') {
        toast.success('Artikel berhasil dipublikasikan!');
        router.push('/pakar/article');
      } else {
        toast.error(json.Message || json.error || 'Gagal menyimpan artikel');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none transition-colors text-sm hover:border-slate-300";

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20 fade-in slide-in-from-bottom-4">
      <Link href="/pakar/article" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Manajemen Artikel
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900">Publikasi Artikel</h1>
        <p className="text-sm font-medium text-slate-500">Tulis dan edarkan artikel terbaru ke beranda utama siswa.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden mt-6">
        <div className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">Judul Artikel</label>
              <input 
                type="text" 
                className={`${inputClass} text-base font-semibold`} 
                placeholder="Masukkan judul artikel yang menarik..." 
                required 
                value={formData.judul_article}
                onChange={(e) => setFormData({ ...formData, judul_article: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Kategori Diagnosis Terkait</label>
              <select 
                className={inputClass} 
                required 
                value={formData.category_uid}
                onChange={(e) => setFormData({ ...formData, category_uid: e.target.value })}
              >
                <option value="" disabled>Pilih Kategori Kesehatan</option>
                {categories.map((c) => (
                  <option key={c.category_uid} value={c.category_uid}>{c.name_category}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Penulis (Author)</label>
              <input 
                type="text" 
                className={inputClass} 
                placeholder="Nama Anda atau Instansi..." 
                required 
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>

            <div className="space-y-4 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 block">Thumbnail Cover</label>
              
              {!thumbnailPreview ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-slate-400 cursor-pointer transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                      <ImagePlus className="w-6 h-6 text-slate-500" />
                    </div>
                    <p className="mb-1 text-sm text-slate-600 font-medium"><span className="font-bold text-blue-600">Klik untuk unggah</span> atau seret file</p>
                    <p className="text-xs text-slate-400">PNG, JPG atau WEBP (Maks. 2MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                  <img src={thumbnailPreview} alt="Preview" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={removeImage} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 hover:scale-110 transition-all shadow-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 block">Konten Isi Artikel</label>
              <textarea 
                className={`${inputClass} min-h-[300px] resize-y leading-relaxed`} 
                placeholder="Mulai menulis konten edukasi psikologi di sini..." 
                required 
                value={formData.isi_article}
                onChange={(e) => setFormData({ ...formData, isi_article: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link href="/pakar/article">
            <Button variant="ghost" className="text-slate-600 font-medium hover:bg-slate-200 h-11 px-6 rounded-xl">Batal</Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-slate-900 hover:bg-slate-800 text-white font-medium h-11 px-8 rounded-xl shadow-sm transition-all active:scale-95">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} 
            Publikasi
          </Button>
        </div>
      </form>
    </div>
  );
}
