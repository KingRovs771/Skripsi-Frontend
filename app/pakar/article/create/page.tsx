'use client';
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
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

export default function PakarCreateArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Menyimpan data profile pakar (seperti nama_lengkap)
  const [authorName, setAuthorName] = useState('Pakar Edukasi');

  // Fetch data profile dan kategori saat mount
  useEffect(() => {
    // 1. Fetch Categories
    const fetchCategories = async () => {
      try {
        const res = await fetchApi('/categories/getAllCategories', { method: 'GET' });
        if (!res.ok) throw new Error('Gagal memuat kategori');
        const json = await res.json();
        setCategories(json.data || json.Data || []);
      } catch (err) {
        setCategoryError('Gagal memuat kategori');
        toast.error('Gagal memuat data kategori dari server');
      } finally {
        setLoadingCategories(false);
      }
    };

    // 2. Fetch Profile Pakar untuk author
    const fetchProfile = async () => {
      try {
        const res = await fetchApi('/api/profilePakars', { method: 'GET' });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.Data && json.Data.nama_lengkap) {
          setAuthorName(json.Data.nama_lengkap);
        }
      } catch (err) {
        console.warn('Gagal menarik profil Pakar', err);
      }
    };

    fetchCategories();
    fetchProfile();
  }, []);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    status: 0, // Default to Draft
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    toast.success('Gambar dihapus');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.category) {
      toast.warning('Mohon lengkapi seluruh isian data tulisan Anda.');
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('judul_article', formData.title);
    data.append('isi_article', formData.content);
    data.append('category_uid', formData.category);
    data.append('author', authorName || 'Pakar Psikologi'); // Identitas dinamis dari server
    data.append('status', formData.status.toString());

    if (selectedFile) {
      data.append('thumbnails', selectedFile);
    }

    try {
      const response = await fetchApi('/api/article/pakar/createArticles', {
        method: 'POST',
        body: data,
      });

      const json = await response.json().catch(() => ({}));

      if (response.ok || json.Status === 'Success') {
        toast.success('Tulisan Artikel Anda berhasil diterbitkan!');
        router.push('/pakar/article');
      } else {
        toast.error(json.error || json.Message || 'Gagal menyimpan artikel. Silakan cek kembali jaringan Anda.');
      }
    } catch (error) {
      toast.error('Gagal mempublikasikan Artikel karena terputus dari Server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/pakar/article" className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mulai Tulis Artikel</h1>
          <p className="text-slate-500 font-medium">Bagikan wawasan dan pengetahuan secara luas ke publik.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            {/* Input Judul */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Judul Artikel</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium text-slate-900"
                placeholder="Ex: Menghadapi Kepanikan Berlebih saat Ujian Kelulusan..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Upload Area */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Thumbnail Cover Artikel</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:border-slate-400 transition-colors bg-slate-50/50 relative">
                {imagePreview ? (
                  <div className="relative w-full text-center group">
                    <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-xl shadow-md object-cover transition-transform duration-300" />
                    <button type="button" onClick={removeImage} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 hover:scale-110 transition-all shadow-lg border-2 border-white">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 text-center">
                    <div className="bg-white p-4 rounded-full w-fit mx-auto shadow-sm border border-slate-100">
                      <ImageIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <div className="flex text-sm text-slate-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer font-bold text-blue-600 hover:text-blue-700">
                        <span>Pilih Berkas Gambar</span>
                        <input id="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                      </label>
                      <p className="pl-1 text-slate-500">atau seret file ke sini</p>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Format PNG/JPG Max 2 Megabytes</p>
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-slate-400 mt-1">Sertakan gambar thumbnail berkualitas agar memikat atensi audiens siswa.</p>
            </div>

            {/* Konten dengan Rich Text Editor */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Materi Artikel</label>
              <div className="bg-white rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all">
                <ReactQuill
                  theme="snow"
                  modules={quillModules}
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Ketik seluruh pemikiran riset psikologi terdepan di sini..."
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
                  {loadingCategories ? 'Sedang Sinkronisasi Kategori...' : categoryError ? 'Gagal memuat kategori' : 'Tentukan Opsi Kategori'}
                </option>
                {categories.map((cat) => (
                  <option key={cat.category_uid} value={cat.category_uid}>
                    {cat.name_category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Visibilitas Status</label>
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
              <button type="submit" disabled={loading} className="w-full flex justify-center items-center bg-slate-900 text-white p-3.5 rounded-xl font-bold hover:bg-slate-800 disabled:bg-slate-300 transition-all active:scale-95 shadow-sm shadow-slate-900/10">
                {loading ? (
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
