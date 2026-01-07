'use client';
import React, { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X, Loader2, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';

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
      setSelectedFile(file);
      // Membuat URL sementara untuk preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Fungsi untuk menghapus gambar yang dipilih
  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Gunakan FormData karena kita mengirim file (Multipart)
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
        // Jangan set Content-Type manual saat mengirim FormData,
        // browser akan mengaturnya secara otomatis menjadi multipart/form-data
        body: data,
      });

      if (response.ok) {
        alert('Artikel dan Gambar berhasil disimpan!');
        router.push('/pakar/article');
      } else {
        alert('Gagal menyimpan artikel.');
      }
    } catch (error) {
      alert('Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-4">
        <Link href="/pakar/article" className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Tambah Artikel Baru</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Konten Utama */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Judul Artikel</label>
              <input
                type="text"
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Masukkan judul artikel..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Bagian Upload Gambar */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Thumbnail Artikel</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:border-slate-400 transition-colors bg-slate-50 relative">
                {imagePreview ? (
                  <div className="relative w-full">
                    <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg object-cover" />
                    <button type="button" onClick={removeImage} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-slate-900 hover:underline">
                        <span>Upload gambar</span>
                        <input id="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                      </label>
                      <p className="pl-1">atau drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 2MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Isi Konten</label>
              <textarea
                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[300px]"
                placeholder="Tuliskan isi artikel..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Pengaturan */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 sticky top-6">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 text-lg">Pengaturan</h3>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Kategori</label>
              <select className="w-full p-2 border border-slate-200 rounded-lg bg-white" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                <option value="">Pilih Kategori</option>
                <option value="Anxiety">Anxiety</option>
                <option value="Depresi">Depresi</option>
                <option value="Stress">Stress</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Status</label>
              <select className="w-full p-2 border border-slate-200 rounded-lg bg-white" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="publish">Publish</option>
              </select>
            </div>

            <div className="space-y-2 pt-4">
              <button type="submit" disabled={loading} className="w-full flex justify-center items-center bg-slate-900 text-white p-2 rounded-lg font-medium hover:bg-slate-800 disabled:bg-slate-400">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Simpan Artikel
                  </>
                )}
              </button>
              <Link href="/pakar/article" className="block text-center w-full p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium">
                Batal
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
