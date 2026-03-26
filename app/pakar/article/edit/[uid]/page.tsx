'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleUid = params?.uid as string;

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [categories, setCategories] = useState<{ category_uid: string; name_category: string }[]>([]);

  // State Form
  const [formData, setFormData] = useState({
    judul_article: '',
    isi_article: '',
    author: '',
    category_uid: '',
  });

  // State Gambar (Read Only)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!articleUid) return;

    // Load Kategori dan Artikel secara pararel
    const loadData = async () => {
      try {
        const [catRes, artRes] = await Promise.all([
          fetchApi('/api/category/getAllCategories'),
          fetchApi(`/api/article/getArticleByUID/${articleUid}`)
        ]);

        const catJson = await catRes.json().catch(() => ({}));
        if (catRes.ok) setCategories(catJson.Data || catJson.data || []);

        const artJson = await artRes.json().catch(() => ({}));
        if (artRes.ok) {
          const d = artJson.Data || artJson.data || artJson;
          setFormData({
            judul_article: d.judul_article ?? '',
            isi_article: d.isi_article ?? '',
            author: d.author ?? '',
            category_uid: d.category?.category_uid ?? '', // Asumsi response mereturn object Category
          });
          // Set manual Thumbnail Link via backend get resource
          setThumbnailUrl(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/article/thumbnail/${d.article_uid}`);
        } else {
          toast.error(artJson.Message || artJson.error || 'Gagal memuat artikel');
          router.push('/pakar/article');
        }
      } catch (err) {
        toast.error('Koneksi ke server gagal.');
        router.push('/pakar/article');
      } finally {
        setLoadingPage(false);
      }
    };

    loadData();
  }, [articleUid, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      // Endpoint UpdateArticle Golang hanya menerima raw JSON (String), tidak bisa File formData
      const payload = {
        article_uid: articleUid, // Harus dikirim sesuai struct backend
        judul_article: formData.judul_article,
        isi_article: formData.isi_article,
        author: formData.author,
        category_uid: formData.category_uid,
      };

      const res = await fetchApi(`/api/article/updateArticle/${articleUid}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok || json.Status === 'Success') {
        toast.success('Artikel berhasil diperbarui!');
        router.push('/pakar/article');
      } else {
        toast.error(json.Message || json.error || 'Gagal menyimpan perubahan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan jaringan.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none transition-colors text-sm hover:border-slate-300";

  if (loadingPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-3" />
        <p className="text-sm font-medium text-slate-500">Mempersiapkan editor artikel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-20 fade-in slide-in-from-bottom-4">
      <Link href="/pakar/article" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Manajemen Artikel
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900">Ubah Artikel</h1>
        <p className="text-sm font-medium text-slate-500">Koreksi teks konten atau meta data kategori untuk artikel ini.</p>
      </div>

      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mt-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800 leading-relaxed font-medium">Berdasarkan rancangan sistem backend saat ini, gambar thumbnail artikel <b>tidak dapat diubah ulang</b>. Anda hanya dapat memperbarui konten artikel, penulis, judul, dan kategorinya.</p>
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
              <label className="text-sm font-bold text-slate-700 block">Cover / Thumbnail Saat Ini</label>
              {thumbnailUrl && (
                <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-slate-200 shadow-sm opacity-80 cursor-not-allowed">
                  <img src={thumbnailUrl} alt="Thumbnail Saat Ini" className="w-full h-48 object-cover grayscale-[30%]" />
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide">Read Only</div>
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
            <Button variant="ghost" className="text-slate-600 font-medium hover:bg-slate-200 h-11 px-6 rounded-xl transition-colors">Batal</Button>
          </Link>
          <Button type="submit" disabled={loadingSubmit} className="bg-slate-900 hover:bg-slate-800 text-white font-medium h-11 px-8 rounded-xl shadow-sm transition-all active:scale-95">
            {loadingSubmit ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} 
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
