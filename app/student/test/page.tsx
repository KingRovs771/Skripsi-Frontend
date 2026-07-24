'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Brain, CheckCircle2, AlertTriangle, PlayCircle, Loader2,
  Clock, CalendarX2, ArrowRight, RotateCcw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type PageState =
  | 'CHECKING'       // Sedang mengecek status tes terakhir
  | 'BERJALAN'       // Ada sesi yang sedang berjalan → arahkan langsung ke quiz
  | 'COOLDOWN'       // Belum 14 hari sejak tes terakhir
  | 'READY';         // Boleh mulai tes baru

interface TestStatusResponse {
  can_start: boolean;
  status: 'READY' | 'COOLDOWN' | 'BERJALAN';
  // Jika COOLDOWN:
  next_available_date?: string;   // ISO 8601, e.g. "2026-08-07T09:00:00Z"
  last_test_date?: string;        // ISO 8601
  days_remaining?: number;
  // Jika BERJALAN:
  active_session_uid?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getDaysRemaining(nextDateIso: string): number {
  const now  = new Date();
  const next = new Date(nextDateIso);
  const diff = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

// ─── Sub-component: Cooldown Card ─────────────────────────────────────────────

function CooldownCard({
  nextDate,
  lastDate,
  daysRemaining,
  onViewHistory,
}: {
  nextDate: string;
  lastDate?: string;
  daysRemaining: number;
  onViewHistory: () => void;
}) {
  // Countdown timer — update setiap menit
  const [liveRemaining, setLiveRemaining] = useState(daysRemaining);

  useEffect(() => {
    setLiveRemaining(getDaysRemaining(nextDate));
    const timer = setInterval(() => {
      const remaining = getDaysRemaining(nextDate);
      setLiveRemaining(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 60_000);
    return () => clearInterval(timer);
  }, [nextDate]);

  const segments = [
    { label: 'Hari Tersisa', value: liveRemaining, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 fade-in">
      <Card className="rounded-3xl shadow-xl border-none overflow-hidden bg-white">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-12 text-center text-white space-y-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner">
            <Clock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Tes Belum Tersedia
          </h1>
          <p className="text-amber-100 font-medium max-w-xl mx-auto leading-relaxed">
            Untuk menjaga akurasi dan relevansi hasil diagnosis, tes hanya dapat diulang
            setiap <strong className="text-white">14 hari</strong> sekali.
          </p>
        </div>

        <CardContent className="p-8 md:p-12 space-y-8">
          {/* Countdown Display */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-2 px-10 py-6 rounded-3xl border-2 border-amber-100 bg-amber-50">
              <span className="text-6xl md:text-7xl font-black text-amber-600 tabular-nums leading-none">
                {liveRemaining}
              </span>
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                hari lagi
              </span>
            </div>
          </div>

          {/* Info Tanggal */}
          <div className="grid md:grid-cols-2 gap-4">
            {lastDate && (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <CalendarX2 className="w-3 h-3" /> Tes Terakhir
                </p>
                <p className="font-bold text-slate-900 text-sm">{formatDate(lastDate)}</p>
              </div>
            )}
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" /> Tes Berikutnya Tersedia
              </p>
              <p className="font-bold text-emerald-800 text-sm">{formatDate(nextDate)}</p>
            </div>
          </div>

          {/* Penjelasan */}
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex gap-4">
            <AlertTriangle className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700 space-y-1.5">
              <p className="font-bold text-slate-900">Mengapa ada jeda 14 hari?</p>
              <p className="leading-relaxed text-slate-600">
                Instrumen PHQ-9 dan GAD-7 dirancang untuk mengukur kondisi mental dalam{' '}
                <em>2 minggu terakhir</em>. Mengerjakan tes terlalu sering dapat menghasilkan
                data yang tidak valid karena kondisi belum berubah secara bermakna.
              </p>
            </div>
          </div>

          {/* Tombol */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center border-t border-slate-100">
            <Button
              onClick={onViewHistory}
              variant="outline"
              className="border-slate-200 text-slate-700 hover:bg-slate-50 h-12 px-8 rounded-2xl font-bold flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Lihat Riwayat Tes Saya
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sub-component: Active Session Card ───────────────────────────────────────

function ActiveSessionCard({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 fade-in">
      <Card className="rounded-3xl shadow-xl border-none overflow-hidden bg-white">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-center text-white space-y-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner">
            <RotateCcw className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Tes Sedang Berlangsung
          </h1>
          <p className="text-blue-100 font-medium max-w-xl mx-auto leading-relaxed">
            Kamu memiliki sesi tes yang belum diselesaikan. Lanjutkan dari mana kamu berhenti.
          </p>
        </div>

        <CardContent className="p-8 md:p-12 space-y-8">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
            <Brain className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 leading-relaxed">
              Sesi tesmu sebelumnya masih aktif. Klik tombol di bawah untuk melanjutkan mengisi
              kuesioner dari pertanyaan yang sudah kamu jawab.
            </p>
          </div>

          <div className="pt-2 flex justify-center border-t border-slate-100">
            <Button
              onClick={onContinue}
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg h-14 px-12 rounded-full font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              <PlayCircle className="w-6 h-6" />
              Lanjutkan Tes Sekarang
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DiagnosisIntroPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>('CHECKING');
  const [loading, setLoading] = useState(false);

  // Data cooldown dari server
  const [cooldownData, setCooldownData] = useState<{
    nextDate: string;
    lastDate?: string;
    daysRemaining: number;
  } | null>(null);

  // ── Saat mount: cek status tes terakhir ──────────────────────────────────────
  useEffect(() => {
    const checkTestStatus = async () => {
      const userUid = localStorage.getItem('student_uid') || '';
      if (!userUid) {
        setPageState('READY'); // fallback — biarkan backend yang reject
        return;
      }

      try {
        const res  = await fetchApi('/api/diagnosis/checkStatus', { method: 'GET' });
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          // Jika endpoint belum ada / error, biarkan siswa lanjut (graceful)
          console.warn('checkStatus API error:', json);
          setPageState('READY');
          return;
        }

        const statusData: TestStatusResponse = json.Data || json.data || json;

        if (statusData.status === 'BERJALAN' && statusData.active_session_uid) {
          // Simpan session uid yang masih aktif lalu redirect
          sessionStorage.setItem('diagnosis_session_uid', statusData.active_session_uid);
          setPageState('BERJALAN');
        } else if (statusData.status === 'COOLDOWN' && statusData.next_available_date) {
          setCooldownData({
            nextDate: statusData.next_available_date,
            lastDate: statusData.last_test_date,
            daysRemaining: statusData.days_remaining ?? getDaysRemaining(statusData.next_available_date),
          });
          setPageState('COOLDOWN');
        } else {
          setPageState('READY');
        }
      } catch {
        // Network error — biarkan lanjut, backend yang akan handle
        setPageState('READY');
      }
    };

    checkTestStatus();
  }, []);

  // ── Handler: mulai tes baru ───────────────────────────────────────────────────
  const handleStart = async () => {
    const userUid = localStorage.getItem('student_uid') || '';
    if (!userUid) {
      toast.error('User tidak terautentikasi. Silakan login ulang.');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetchApi('/api/diagnosis/startTes', {
        method: 'POST',
        body: JSON.stringify({ user_uid: userUid }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        const sessionUid: string =
          json.session_id       ||
          json.Data?.session_id ||
          json.data?.session_id ||
          json.session_uid      ||
          json.diagnosa_uid     ||
          '';

        if (sessionUid) {
          sessionStorage.setItem('diagnosis_session_uid', sessionUid);
        } else {
          console.error('Backend tidak mengembalikan session_id:', json);
        }

        router.push('/student/test/quiz');
      } else {
        // Backend menolak karena cooldown (belum 14 hari) — parse info tanggal
        if (res.status === 429 || json.status === 'COOLDOWN') {
          const nextDate: string = json.next_available_date || json.Data?.next_available_date || '';
          if (nextDate) {
            setCooldownData({
              nextDate,
              lastDate: json.last_test_date || json.Data?.last_test_date,
              daysRemaining: getDaysRemaining(nextDate),
            });
            setPageState('COOLDOWN');
            return;
          }
        }
        toast.error(json.Message || json.message || json.error || 'Gagal memulai sesi tes. Coba lagi.');
      }
    } catch {
      toast.error('Gagal terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render states ─────────────────────────────────────────────────────────────

  // 1. Sedang mengecek
  if (pageState === 'CHECKING') {
    return (
      <div className="max-w-4xl mx-auto py-32 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 relative mb-6">
          <div className="absolute inset-0 bg-slate-200 rounded-full animate-ping opacity-60" />
          <div className="relative bg-white rounded-full p-4 shadow-lg border border-slate-100">
            <Brain className="w-8 h-8 text-slate-900 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-500 font-medium">Memeriksa status tesmu...</p>
      </div>
    );
  }

  // 2. Ada sesi yang sedang berjalan
  if (pageState === 'BERJALAN') {
    return (
      <ActiveSessionCard
        onContinue={() => router.push('/student/test/quiz')}
      />
    );
  }

  // 3. Masih dalam cooldown 14 hari
  if (pageState === 'COOLDOWN' && cooldownData) {
    return (
      <CooldownCard
        nextDate={cooldownData.nextDate}
        lastDate={cooldownData.lastDate}
        daysRemaining={cooldownData.daysRemaining}
        onViewHistory={() => router.push('/student/history')}
      />
    );
  }

  // 4. READY — halaman intro normal dengan tombol aktif
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 fade-in">
      <Card className="rounded-3xl shadow-xl border-none overflow-hidden bg-white">
        <div className="bg-slate-900 p-12 text-center text-white space-y-4">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Tes Deteksi Dini Kesehatan Mental
          </h1>
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
                <li className="flex gap-2">
                  <b>1.</b> Uji ini berisi pertanyaan akurat berdasarkan pengetahuan dari pakar.
                </li>
                <li className="flex gap-2">
                  <b>2.</b> Jawablah dengan <b>Jujur</b> sesuai keadaan emosi yang Anda rasakan belakangan ini.
                </li>
                <li className="flex gap-2">
                  <b>3.</b> Tidak ada jawaban benar maupun salah. Kami menghargai Privasi Anda.
                </li>
              </ul>
            </div>

            <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 flex flex-col justify-center gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
              <p className="text-sm text-slate-700 font-medium">
                Sistem pakar (Certainty Factor) ini bertindak sebagai skrining awal,{' '}
                <strong>BUKAN</strong> diagnosis medis mutlak. Temui psikolog atau Guru BK jika
                membutuhkan pendampingan lebih lanjut.
              </p>
            </div>
          </div>

          {/* Info cooldown */}
          <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <p className="text-xs text-slate-500 font-medium">
              Tes dapat diulang setiap <strong className="text-slate-700">14 hari</strong> sekali
              sejak tes terakhir diselesaikan.
            </p>
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
