'use client';
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Tipe data kategori sesuai model backend
type Category = {
  category_id: number;
  category_uid: string;
  name_category: string;
  description: string;
  created_at: string;
  update_at: string;
};

// Dynamic import ReactQuill agar tidak error SSR di Next.js
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

// Konfigurasi Toolbar ala Wordpress untuk Quill
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'], // Tombol hapus format
  ],
};

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const uid = params.uid as string;

  const [loading, setLoading] = useState(false);
  const [dataFetching, setDataFetching] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    status: 0,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch data awal
  useEffect(() => {
    const fetchData = async () => {
      setDataFetching(true);
      try {
        // Fetch Categories
        const catRes = await fetchApi('/categories/getAllCategories', { method: 'GET' });
        if (catRes.ok) {
          const catJson = await catRes.json();
          setCategories(catJson.data || []);
        } else {
          setCategoryError('Gagal memuat kategori');
        }
        setLoadingCategories(false);

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        // Ambil detail artikel menggunakan endpoint detail agar isi_article dan kategori ada
        const artRes = await fetch(`${baseUrl}/api/article/admin/getArtikelByUID/${uid}`);
        if (artRes.ok) {
          const artJson = await artRes.json();
          const currentArticle = artJson.data || artJson.Data;

          if (currentArticle) {
            setFormData({
              title: currentArticle.judul_article || '',
              content: currentArticle.isi_article || '',
              category: currentArticle.category?.category_uid || '',
              // Status fallback (karena home api mungkin tidak ada status)
              status: currentArticle.status === 1 ? 1 : 0,
            });

            // Set Thumbnail dari endpoint gambar statis backend
            setImagePreview(`${baseUrl}/api/home/articles/${uid}/thumbnail`);
          } else {
            toast.error('Artikel tidak ditemukan.');
            router.push('/admin/article');
          }
        } else {
          toast.error('Gagal memuat detail artikel.');
          router.push('/admin/article');
        }
      } catch (err) {
        toast.error('Gagal mengambil data dari server.');
      } finally {
        setDataFetching(false);
      }
    };
    if (uid) fetchData();
  }, [uid, router]);

  // Fungsi untuk menangani perubahan gambar
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran gambar terlalu besar. Maksimal 2MB.');
        return;
      }
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      toast.info('Gambar berhasil dipilih');
    }
  };

  // Fungsi untuk menghapus gambar yang dipilih
  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    toast.success('Gambar telah dihapus dari pilihan');
  };
  // Fungsi untuk konversi File ke Base64
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let encoded = reader.result as string;
        // Hapus metadata "data:image/jpeg;base64," pada awalan
        encoded = encoded.split(',')[1] || encoded;
        resolve(encoded);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.category) {
      toast.warning('Mohon lengkapi semua data artikel');
      return;
    }

    setLoading(true);

    const payload: any = {
      judul_article: formData.title,
      isi_article: formData.content,
      category_uid: formData.category,
      author: 'Administrator',
      status: Number(formData.status),
    };

    if (selectedFile) {
      payload.thumbnails = await getBase64(selectedFile);
    }

    try {
      const endpoint = `/api/article/admin/updateArticle/${uid}`;

      const response = await fetchApi(endpoint, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const json = await response.json().catch(() => ({}));

      if (response.ok) {
        toast.success('Artikel berhasil diperbarui!');
        router.push('/admin/article');
      } else {
        toast.error(json.error || json.Message || 'Gagal memperbarui artikel.');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  if (dataFetching) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500 flex-col gap-4">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p>Memuat Data Artikel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/article" className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Edit Artikel</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            {/* Input Judul */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Judul Artikel</label>
              <input
                type="text"
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                placeholder="Masukkan judul artikel..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Upload Area */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Thumbnail Artikel Baru (Opsional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:border-slate-400 transition-colors bg-slate-50/50 relative">
                {imagePreview ? (
                  <div className="relative w-full text-center">
                    <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-md object-cover" />
                    <button type="button" onClick={removeImage} className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-lg border border-red-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 text-center">
                    <div className="bg-white p-3 rounded-full w-fit mx-auto shadow-sm border border-slate-100">
                      <ImageIcon className="h-6 w-6 text-slate-400" />
                    </div>
                    <div className="flex text-sm text-slate-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer font-bold text-blue-600 hover:text-blue-700">
                        <span>Upload gambar baru</span>
                        <input id="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                      </label>
                      <p className="pl-1 text-slate-500">untuk mengganti yg lama</p>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PNG, JPG up to 2MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Isi Konten</label>
              <div className="bg-white rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all">
                <ReactQuill
                  theme="snow"
                  modules={quillModules}
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Mulai menulis artikel edukasi yang luar biasa di sini..."
                  className="min-h-[500px] [&>.ql-container]:min-h-[450px] [&>.ql-container]:text-base [&>.ql-editor]:min-h-[450px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Pengaturan */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5 sticky top-6">
            <h3 className="font-bold text-slate-900 border-b border-slate-50 pb-3 text-lg">Pengaturan</h3>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Kategori</label>
              <select
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-slate-100 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                disabled={loadingCategories}
              >
                <option value="">
                  {loadingCategories ? 'Memuat kategori...' : categoryError ? 'Gagal memuat kategori' : 'Pilih Kategori'}
                </option>
                {categories.map((cat) => (
                  <option key={cat.category_uid} value={cat.category_uid}>
                    {cat.name_category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Status</label>
              <select
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-slate-100 outline-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
              >
                <option value="1">Draft</option>
                <option value="0">Publish</option>
              </select>
            </div>

            <div className="space-y-3 pt-4">
              <button type="submit" disabled={loading} className="w-full flex justify-center items-center bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-all active:scale-95 shadow-sm">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Perbarui Artikel
                  </>
                )}
              </button>
              <Link href="/admin/article" className="block text-center w-full p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors">
                Batal
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
