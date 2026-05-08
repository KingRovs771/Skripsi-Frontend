'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, CheckCircle2, AlertTriangle, PlayCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

export default function DiagnosisIntroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userUid, setUserUid] = useState<string | null>(null);

  React.useEffect(() => {
    // Get user UID dari local storage (disimpan saat login)
    const uid = localStorage.getItem('student_uid') || '';
    setUserUid(uid);
  }, []);

  const handleStart = async () => {
    if (!userUid) {
      toast.error('User tidak terautentikasi. Silakan login ulang.');
      return;
    }

    setLoading(true);
    try {
      // ── STEP 1: Mulai sesi tes di backend ──────────────────────────────────
      const res = await fetchApi('/api/diagnosis/startTes', {
        method: 'POST',
        body: JSON.stringify({ user_uid: userUid }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        // Simpan session_uid agar dipakai di halaman quiz saat submit
        const sessionUid: string =
          json.session_id ||
          json.Data?.session_id ||
          json.data?.session_id ||
          json.session_uid ||
          json.diagnosa_uid ||
          '';

        if (sessionUid) {
          sessionStorage.setItem('diagnosis_session_uid', sessionUid);
        } else {
          console.error("Backend response tidak menyertakan session_id:", json);
        }

        router.push('/student/test/quiz');
      } else {
        toast.error(json.Message || json.message || json.error || 'Gagal memulai sesi tes. Coba lagi.');
      }
    } catch {
      toast.error('Gagal terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 fade-in">
      <Card className="rounded-3xl shadow-xl border-none overflow-hidden bg-white">
        <div className="bg-slate-900 p-12 text-center text-white space-y-4">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Tes Deteksi Dini Kesehatan Mental</h1>
          <p className="text-slate-300 font-medium max-w-xl mx-auto leading-relaxed">
            Pahami kondisi emosional dan psikologis Anda bersama instrumen deteksi sistem pakar resmi kami.
          </p>
        </div>

        <CardContent className="p-8 md:p-12 space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> Panduan Pengisian
              </h3>
              <ul className="text-sm text-slate-600 space-y-3 leading-relaxed">
                <li className="flex gap-2"><b>1.</b> Uji ini berisi pertanyaan akurat bedasarkan pengetahuan dari pakar.</li>
                <li className="flex gap-2"><b>2.</b> Jawablah dengan <b>Jujur</b> sesuai keadaan emosi yang Anda rasakan belakangan ini.</li>
                <li className="flex gap-2"><b>3.</b> Tidak ada jawaban benar maupun salah. Kami menghargai Privasi Anda.</li>
              </ul>
            </div>

            <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 flex flex-col justify-center gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
              <p className="text-sm text-slate-700 font-medium">
                Sistem pakar (Certainty Factor) ini bertindak sebagai skrining awal, BUKAN diagnosis medis mutlak.
                Temui psikolog atau Guru BK jika membutuhkan pendampingan lebih lanjut.
              </p>
            </div>
          </div>

          <div className="pt-6 flex justify-center border-t border-slate-100">
            <Button
              onClick={handleStart}
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white text-lg h-14 px-12 rounded-full font-bold shadow-lg shadow-slate-900/20 transition-all hover:scale-105 active:scale-95 flex items-center disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Memulai Sesi...
                </>
              ) : (
                <>
                  <PlayCircle className="w-6 h-6 mr-3" />
                  Mulai Tes Sekarang
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
