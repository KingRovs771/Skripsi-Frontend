'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { fetchApi, buildApiUrl, getMediaUrl } from '@/lib/api';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Tipe data kategori
type Category = {
  category_id: number;
  category_uid: string;
  name_category: string;
};

// Dynamic import ReactQuill agar tidak error SSR di Next.js
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

// Konfigurasi Toolbar
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'], // Tombol hapus format
  ],
};

export default function PakarEditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const uid = params.uid as string;

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [dataFetching, setDataFetching] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    status: 0, // 0 = Draft, 1 = Publish
  });

  // Fetch data awal
  useEffect(() => {
    const fetchData = async () => {
      setDataFetching(true);
      try {
        // Fetch Categories
        const catRes = await fetchApi('/categories/getAllCategories', { method: 'GET' });
        if (catRes.ok) {
          const catJson = await catRes.json();
          setCategories(catJson.data || catJson.Data || []);
        } else {
          setCategoryError('Gagal memuat kategori');
        }
        setLoadingCategories(false);

        // Ambil detail artikel 
        const artRes = await fetchApi(`/api/artikelpakar/getArtikelByUID/${uid}`);
        if (artRes.ok) {
          const artJson = await artRes.json().catch(() => ({}));
          const currentArticle = artJson.data || artJson.Data;

          if (currentArticle) {
            setFormData({
              title: currentArticle.judul_article || '',
              content: currentArticle.isi_article || '',
              category: currentArticle.category?.category_uid || currentArticle.category_uid || '',
              // Pastikan status dipetakan dengan benar, 1 itu Published, 0 itu Draft
              status: currentArticle.status === 1 ? 1 : 0,
            });

            // Set Thumbnail dari endpoint gambar statis backend
            setImagePreview(
              getMediaUrl(currentArticle.thumbnail_url) ?? buildApiUrl(`/api/home/articles/${uid}/thumbnail`)
            );
          } else {
            toast.error('Artikel tidak ditemukan.');
            router.push('/pakar/article');
          }
        } else {
          toast.error('Gagal memuat detail artikel.');
          router.push('/pakar/article');
        }
      } catch (err) {
        toast.error('Gagal mengambil data dari server.');
      } finally {
        setDataFetching(false);
      }
    };

    if (uid) fetchData();
  }, [uid, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.category) {
      toast.warning('Mohon lengkapi judul, konten, dan kategori artikel');
      return;
    }

    setLoadingSubmit(true);

    // Endpoint Update Article biasanya memakai JSON, bukan Form Data
    const payload = {
      article_uid: uid,
      judul_article: formData.title,
      isi_article: formData.content,
      category_uid: formData.category,
      // AUTHOR KITA HAPUS (Tanpa Author, Backend menggunakan data asli/lama)
      status: Number(formData.status),
    };

    try {
      const response = await fetchApi(`/api/artikelpakar/updateArticle/${uid}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const json = await response.json().catch(() => ({}));

      if (response.ok || json.Status === 'Success') {
        toast.success('Artikel berhasil diperbarui!');
        router.push('/pakar/article');
      } else {
        toast.error(json.error || json.Message || 'Gagal memperbarui artikel.');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (dataFetching) {
    return (
      <div className="flex justify-center flex-col gap-4 items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        <p className="text-sm font-medium text-slate-500">Mempersiapkan editor artikel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/pakar/article" className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ubah Artikel</h1>
          <p className="text-slate-500 font-medium text-sm">Koreksi narasi tulisan atau sesuaikan status penayangan konten Anda.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            {/* Input Judul */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Judul Artikel</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-semibold text-slate-900"
                placeholder="Sebutkan judul artikel utama..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Upload Area (Read Only for Edit) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
                <span>Cover Thumbnail (Read Only)</span>
                <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md mb-1">
                  <Info className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Gambar Terkunci</span>
                </div>
              </label>
              {imagePreview ? (
                <div className="relative w-full text-center border-2 border-slate-200 rounded-xl overflow-hidden bg-slate-50 opacity-85 select-none touch-none">
                  <img src={imagePreview} alt="Preview" className="h-56 mx-auto w-full object-cover grayscale-[20%]" />
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm font-medium">
                  Gambar Thumbnail tidak tersedia.
                </div>
              )}
            </div>

            {/* Konten dengan Rich Text Editor */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Materi Konten Edukasi</label>
              <div className="bg-white rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all">
                <ReactQuill
                  theme="snow"
                  modules={quillModules}
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Susun kerangka tulisan Anda melalui editor ini..."
                  className="min-h-[500px] [&>.ql-container]:min-h-[450px] [&>.ql-container]:text-base [&>.ql-editor]:min-h-[450px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Pengaturan */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5 sticky top-6">
            <h3 className="font-bold text-slate-900 border-b border-slate-50 pb-3 text-lg">Konfigurasi Label</h3>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Kategori Diagnosis</label>
              <select
                className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                disabled={loadingCategories}
              >
                <option value="" disabled>
                  {loadingCategories ? 'Sedang Sinkronisasi Kategori...' : categoryError ? 'Gagal memuat kategori' : 'Pilih Kategori'}
                </option>
                {categories.map((cat) => (
                  <option key={cat.category_uid} value={cat.category_uid}>
                    {cat.name_category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Status Atribut</label>
              <select
                className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
              >
                <option value="0">Draft (Simpan Sementara)</option>
                <option value="1">Publish (Tayangkan Publik)</option>
              </select>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-100">
              <button type="submit" disabled={loadingSubmit} className="w-full flex justify-center items-center bg-slate-900 text-white p-3.5 rounded-xl font-bold hover:bg-slate-800 disabled:bg-slate-300 transition-all active:scale-95 shadow-sm">
                {loadingSubmit ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" /> Simpan Perubahan
                  </>
                )}
              </button>
              <Link href="/pakar/article" className="block text-center w-full p-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-600 transition-colors">
                Batalkan Aksi
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
