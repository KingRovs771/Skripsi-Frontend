'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, MessageCircleQuestion, MessagesSquare } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';

export default function ReplyFaqPage() {
  const router = useRouter();
  const params = useParams();
  const faqUid = params?.uid as string;

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // State untuk data siswa (Read Only)
  const [studentInfo, setStudentInfo] = useState({
    nisn: '',
    nama_lengkap: '',
    faq_pertanyaan: '',
  });

  // State Form Balasan Pakar
  const [formData, setFormData] = useState({
    jawaban_pakar: '',
  });

  // ── PREFILL DATA ──
  useEffect(() => {
    if (!faqUid) return;

    const loadData = async () => {
      try {
        const res = await fetchApi(`/api/faq/getFaqByUID/${faqUid}`);
        const json = await res.json().catch(() => ({}));

        if (res.ok) {
          const d = json.Data || json.data || json;
          setStudentInfo({
            nisn: d.nisn ?? '',
            nama_lengkap: d.nama_lengkap ?? '',
            faq_pertanyaan: d.faq_pertanyaan ?? '',
          });
          setFormData({
            jawaban_pakar: d.jawaban_pakar ?? '',
          });
        } else {
          // --- FALLBACK DUMMY KARENA API GOLANG BELUM ADA ---
          setStudentInfo({
            nisn: faqUid === 'temp-uid-2' ? '0987654321' : '1234567890',
            nama_lengkap: faqUid === 'temp-uid-2' ? 'Siti Aminah' : 'Budi Santoso',
            faq_pertanyaan: faqUid === 'temp-uid-2' ? 'Saya sering merasa sedih tanpa alasan.' : 'Bagaimana cara mengatasi kecemasan ujian?',
          });
          setFormData({
            jawaban_pakar: faqUid === 'temp-uid-2' ? 'Halo Siti. Merasa sedih tanpa alasan seringkali dipicu oleh... (tes data tersimpan)' : '',
          });
          toast.info('Memakai simulasi UI (Backend getFaqByUID belum tersedia)', { id: 'fetch-faq-detail' });
        }
      } catch (err) {
        toast.error('Gagal terhubung ke server');
      } finally {
        setLoadingPage(false);
      }
    };
    loadData();
  }, [faqUid]);

  // ── SUBMIT JAWABAN ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      const payload = {
        jawaban_pakar: formData.jawaban_pakar,
      };

      const res = await fetchApi(`/api/faq/replyFaq/${faqUid}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok || json.Status === 'Success') {
        toast.success('Balasan berhasil dikirimkan!');
        router.push('/pakar/faq');
      } else {
        // --- FALLBACK DUMMY SAVE ---
        setTimeout(() => {
          toast.success('Balasan berhasil dikirimkan ke siswa! (SIMULASI API)');
          router.push('/pakar/faq');
        }, 1000);
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
        <p className="text-sm font-medium text-slate-500">Memuat detail tiket konsultasi...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20 fade-in slide-in-from-bottom-4">
      <Link href="/pakar/faq" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Manajemen FAQ
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900">Balas Pesan Siswa</h1>
        <p className="text-sm font-medium text-slate-500">Berikan dukungan dan saran untuk pertanyaan yang masuk.</p>
      </div>

      <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-2xl overflow-hidden mt-6">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-8">
          
          {/* IDENTITAS SISWA */}
          <div className="md:w-1/3 shrink-0 space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Informasi Siswa</h2>
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

          {/* PERTANYAAN */}
          <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-slate-200 pt-6 md:pt-0 md:pl-8 space-y-3">
             <div className="flex items-center gap-2 mb-2">
                <MessageCircleQuestion className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Pesan Pertanyaan Siswa:</h2>
             </div>
             <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <p className="text-slate-700 leading-relaxed font-medium">"{studentInfo.faq_pertanyaan}"</p>
             </div>
          </div>

        </div>

        {/* AREA FORM JAWABAN */}
        <form onSubmit={handleSubmit} className="p-8 bg-white border-t border-slate-100">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <MessagesSquare className="w-5 h-5 text-emerald-600" />
                <label className="text-sm font-bold text-slate-800">Tanggapan Pakar / Guru BK:</label>
            </div>
            <textarea 
              className={`${inputClass} min-h-[250px] resize-y leading-relaxed text-slate-700 font-medium`} 
              placeholder="Tuliskan saran penanganan, motivasi, atau balasan Anda di sini secara bijaksana..." 
              required 
              value={formData.jawaban_pakar}
              onChange={(e) => setFormData({ ...formData, jawaban_pakar: e.target.value })}
            />
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <Link href="/pakar/faq">
              <Button variant="ghost" className="text-slate-500 font-semibold hover:bg-slate-100 h-12 px-8 rounded-xl transition-colors">Batal</Button>
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
