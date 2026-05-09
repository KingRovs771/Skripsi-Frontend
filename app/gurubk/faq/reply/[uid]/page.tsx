'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, MessageCircleQuestion, MessagesSquare } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';

export default function GuruBkReplyFaqPage() {
  const router = useRouter();
  const params = useParams();
  const faqUid = params?.uid as string;

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [studentInfo, setStudentInfo] = useState({
    nisn: '',
    nama_lengkap: '',
    faq_pertanyaan: '',
  });

  const [formData, setFormData] = useState({
    jawaban: '',
  });

  useEffect(() => {
    if (!faqUid) return;

    const loadData = async () => {
      try {
        const res = await fetchApi(`/api/gurubk/faq/getFaq/${faqUid}`);
        const json = await res.json();

        if (res.ok) {
          const d = json.Data;
          setStudentInfo({
            nisn: d.nisn ?? '',
            nama_lengkap: d.nama_lengkap ?? '',
            faq_pertanyaan: d.faq_pertanyaan ?? '',
          });
          setFormData({
            jawaban: d.faq_jawaban ?? '',
          });
        } else {
          toast.error(json.Message || 'Data tidak ditemukan');
          router.push('/gurubk/faq');
        }
      } catch (err) {
        toast.error('Gagal terhubung ke server');
      } finally {
        setLoadingPage(false);
      }
    };
    loadData();
  }, [faqUid, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      const res = await fetchApi(`/api/gurubk/faq/replyFaq/${faqUid}`, {
        method: 'POST',
        body: JSON.stringify({ jawaban: formData.jawaban }),
      });

      if (res.ok) {
        toast.success('Balasan berhasil dikirimkan!');
        router.push('/gurubk/faq');
      } else {
        const json = await res.json();
        toast.error(json.Message || 'Gagal mengirim balasan');
        setLoadingSubmit(false);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan jaringan.');
      setLoadingSubmit(false);
    }
  };

  const inputClass = "w-full px-5 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-base hover:border-slate-300";

  if (loadingPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-3" />
        <p className="text-sm font-medium text-slate-500">Memuat detail pertanyaan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
      <Link href="/gurubk/faq" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900">Tanggapi Siswa</h1>
        <p className="text-sm font-medium text-slate-500">Berikan dukungan atau jawaban untuk siswa Anda.</p>
      </div>

      <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-2xl overflow-hidden mt-6">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3 shrink-0 space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Identitas Siswa</h2>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Nama Lengkap</p>
                <p className="text-slate-900 font-bold text-lg">{studentInfo.nama_lengkap}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">NISN</p>
                <p className="text-slate-700 font-medium">{studentInfo.nisn}</p>
              </div>
            </div>
          </div>

          <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-slate-200 pt-6 md:pt-0 md:pl-8 space-y-3">
             <div className="flex items-center gap-2 mb-2">
                <MessageCircleQuestion className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Pertanyaan Siswa:</h2>
             </div>
             <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <p className="text-slate-700 leading-relaxed font-medium">"{studentInfo.faq_pertanyaan}"</p>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 bg-white border-t border-slate-100">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <MessagesSquare className="w-5 h-5 text-emerald-600" />
                <label className="text-sm font-bold text-slate-800">Tanggapan Anda (Guru BK):</label>
            </div>
            <textarea 
              className={`${inputClass} min-h-[250px] resize-y leading-relaxed text-slate-700 font-medium`} 
              placeholder="Tuliskan saran atau motivasi Anda..." 
              required 
              value={formData.jawaban}
              onChange={(e) => setFormData({ ...formData, jawaban: e.target.value })}
            />
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <Link href="/gurubk/faq">
              <Button variant="ghost" className="h-12 px-8 rounded-xl">Batal</Button>
            </Link>
            <Button type="submit" disabled={loadingSubmit} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl shadow-md transition-all active:scale-95">
              {loadingSubmit ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />} 
              Kirim Balasan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
