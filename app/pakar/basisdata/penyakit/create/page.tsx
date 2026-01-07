'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateGAD7Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [questionText, setQuestionText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/pakar/questions/gad7', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_text: questionText }),
      });

      if (response.ok) {
        alert('Pertanyaan berhasil ditambahkan!');
        router.push('/pakar/question/gad7');
      } else {
        alert('Gagal menyimpan data.');
      }
    } catch (error) {
      alert('Kesalahan koneksi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-4">
        <Link href="/pakar/basisdata/penyakit" className="p-2 hover:bg-white rounded-full transition-colors border border-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Tambah Penyakit</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Kode Penyakit</label>
            <input type="text" className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="Masukkan Kode Aturan....." required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nama Penyakit</label>
            <input type="text" className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="Masukkan Nama Penyakit....." required />
          </div>

          <div className="flex space-x-3 pt-4 border-t border-slate-100">
            <button type="submit" disabled={loading} className="flex-1 flex justify-center items-center bg-slate-900 text-white p-2.5 rounded-lg font-medium hover:bg-slate-800 disabled:bg-slate-400 transition-colors">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Simpan Penyakit
                </>
              )}
            </button>
            <Link href="/pakar/basisdata/penyakit" className="flex-1 block text-center p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
