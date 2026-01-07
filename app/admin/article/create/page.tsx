'use client';
import React, { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner'; // 1. Import toast dari sonner

export default function CreateArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    status: 'draft',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fungsi untuk menangani perubahan gambar
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran file (contoh: max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran gambar terlalu besar. Maksimal 2MB.');
        return;
      }

      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      toast.info('Gambar berhasil dipilih'); // Feedback saat upload
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

    // Validasi sederhana sebelum kirim
    if (!formData.title || !formData.content || !formData.category) {
      toast.warning('Mohon lengkapi semua data artikel');
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('category', formData.category);
    data.append('status', formData.status);
    if (selectedFile) {
      data.append('image', selectedFile);
    }

    try {
      const response = await fetch('http://localhost:8080/pakar/article', {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        // 2. Notifikasi Sukses
        toast.success('Artikel dan Gambar berhasil disimpan!');
        router.push('/admin/article');
      } else {
        // 3. Notifikasi Gagal dari Server
        toast.error('Gagal menyimpan artikel. Silakan cek kembali data Anda.');
      }
    } catch (error) {
      // 4. Notifikasi Error Koneksi
      toast.error('Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/article" className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Tambah Artikel Baru</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
              <label className="text-sm font-semibold text-slate-700">Thumbnail Artikel</label>
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
                        <span>Upload gambar</span>
                        <input id="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                      </label>
                      <p className="pl-1 text-slate-500">atau drag and drop</p>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PNG, JPG up to 2MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Konten */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Isi Konten</label>
              <textarea
                className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[300px] resize-none leading-relaxed text-slate-800"
                placeholder="Tuliskan isi artikel edukasi di sini..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
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
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-slate-100 outline-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Pilih Kategori</option>
                <option value="Anxiety">Anxiety</option>
                <option value="Depresi">Depresi</option>
                <option value="Stress">Stress</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Status</label>
              <select
                className="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-slate-100 outline-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="publish">Publish</option>
              </select>
            </div>

            <div className="space-y-3 pt-4">
              <button type="submit" disabled={loading} className="w-full flex justify-center items-center bg-slate-900 text-white p-3 rounded-xl font-bold hover:bg-slate-800 disabled:bg-slate-300 transition-all active:scale-95 shadow-sm">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Simpan Artikel
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
