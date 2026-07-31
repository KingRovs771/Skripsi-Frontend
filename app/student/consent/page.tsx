'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Eye, Users, Clock, BookOpen, AlertTriangle, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

const CONSENT_SECTIONS = [
  {
    icon: BookOpen,
    title: 'Data yang Kami Kumpulkan',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    items: [
      'Jawaban kuesioner PHQ-9 (depresi) dan GAD-7 (kecemasan) — berupa pilihan angka 0–3 per pertanyaan.',
      'Narasi bebas / cerita yang Anda tuliskan sendiri sebelum mengirim hasil tes (opsional, namun dianjurkan).',
      'Hasil analisis diagnosis sistem: kategori tingkat keparahan dan skor total.',
      'Metadata teknis: tanggal dan waktu pengerjaan tes, IP address saat memberikan persetujuan ini.',
    ],
  },
  {
    icon: Users,
    title: 'Siapa yang Dapat Mengakses Data Anda',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    items: [
      'Guru BK sekolah Anda — dapat melihat seluruh hasil tes termasuk narasi, untuk keperluan pendampingan dan tindak lanjut.',
      'Pakar / psikolog yang berwenang dalam sistem — dapat meninjau dan memvalidasi hasil diagnosis.',
      'Admin sistem — hanya melihat data agregat (skor dan kategori) tanpa narasi pribadi, sesuai prinsip least privilege UU PDP.',
      'Anda sendiri — dapat melihat seluruh riwayat tes Anda melalui halaman Riwayat.',
    ],
  },
  {
    icon: Clock,
    title: 'Berapa Lama Data Disimpan',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    items: [
      'Data disimpan selama Anda berstatus siswa aktif di sekolah.',
      'Setelah Anda lulus atau pindah, data disimpan maksimal 2 tahun untuk keperluan tindak lanjut dan penelitian agregat.',
      'Setelah melewati masa retensi, data pribadi Anda (nama, narasi, NISN) akan dianonimisasi secara otomatis.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Hak Anda Sebagai Pemilik Data',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    items: [
      'Anda berhak meminta data Anda dihapus kapan saja — hubungi Guru BK atau Admin sistem.',
      'Data Anda tidak akan dibagikan kepada pihak luar sekolah tanpa persetujuan Anda.',
      'Anda berhak menolak persetujuan ini — namun tanpa persetujuan, fitur tes diagnosis tidak dapat digunakan.',
      'Persetujuan ini dapat ditinjau ulang jika kebijakan privasi diperbarui; Anda akan diminta menyetujui kembali.',
    ],
  },
];

export default function ConsentPage() {
  const router = useRouter();
  const [hasRead, setHasRead] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAgree = async () => {
    if (!hasRead) return;
    setIsSubmitting(true);
    try {
      const res = await fetchApi('/api/siswa/consent/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_agreed: true }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Persetujuan berhasil disimpan. Memulai tes...');
        router.push('/student/test');
      } else {
        toast.error(json.Message || 'Gagal menyimpan persetujuan');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisagree = async () => {
    setIsSubmitting(true);
    try {
      await fetchApi('/api/siswa/consent/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_agreed: false }),
      });
    } catch {
      // Catat di background, tidak perlu blokir UX
    } finally {
      setIsSubmitting(false);
    }
    toast.info('Anda memilih tidak menyetujui. Fitur tes tidak dapat digunakan tanpa persetujuan.');
    router.push('/student/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/25 mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Persetujuan Penggunaan Data Pribadi
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">
            Sesuai <strong className="text-slate-700">UU PDP No. 27/2022</strong>, kami memerlukan persetujuan eksplisit Anda
            sebelum mengumpulkan data kesehatan mental yang termasuk kategori data pribadi spesifik.
          </p>
        </div>

        {/* Urgency notice */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 font-semibold leading-relaxed">
            Harap baca seluruh informasi di bawah dengan seksama. Persetujuan ini diperlukan satu kali
            dan hanya akan diminta ulang jika kebijakan privasi kami diperbarui.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4 mb-6">
          {CONSENT_SECTIONS.map((section, idx) => (
            <div key={idx} className={`border ${section.border} rounded-2xl overflow-hidden bg-white shadow-sm`}>
              <div className={`${section.bg} px-5 py-3.5 flex items-center gap-3 border-b ${section.border}`}>
                <section.icon className={`w-5 h-5 ${section.color} shrink-0`} />
                <h2 className={`font-black text-sm ${section.color}`}>{section.title}</h2>
              </div>
              <ul className="px-5 py-4 space-y-2.5">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-600 leading-relaxed font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group mb-6 select-none">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={hasRead}
              onChange={(e) => setHasRead(e.target.checked)}
            />
            <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center
              ${hasRead
                ? 'bg-blue-600 border-blue-600'
                : 'border-slate-300 bg-white group-hover:border-blue-400'
              }`}
            >
              {hasRead && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>
          <span className="text-sm font-semibold text-slate-700 leading-relaxed">
            Saya telah membaca dan memahami seluruh informasi di atas, dan dengan ini saya memberikan
            persetujuan eksplisit atas pengumpulan dan penggunaan data kesehatan mental saya oleh sistem SINDAS
            sesuai dengan tujuan yang telah dijelaskan.
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAgree}
            disabled={!hasRead || isSubmitting}
            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-sm rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            {isSubmitting ? 'Menyimpan...' : 'Saya Setuju — Mulai Tes'}
          </button>
          <button
            onClick={handleDisagree}
            disabled={isSubmitting}
            className="sm:w-auto px-5 py-3.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <XCircle className="w-4 h-4" />
            Saya Tidak Setuju
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-4 font-medium">
          Persetujuan ini direkam dengan timestamp dan IP address untuk keperluan jejak audit UU PDP.
          Versi kebijakan: <span className="font-bold">v1</span>
        </p>
      </div>
    </div>
  );
}
