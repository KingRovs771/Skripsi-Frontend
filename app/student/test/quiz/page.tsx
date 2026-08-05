'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Loader2, Brain, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { fetchApi } from '@/lib/api';

interface Pertanyaan {
  pertanyaan_uid: string;
  kode_pertanyaan: string;
  kategori_pertanyaan: string;
  pertanyaan: string;
  bobot: number;
}

const LIKERT_OPTIONS = [
  { label: 'Tidak Pernah', value: 0 },
  { label: 'Beberapa Hari', value: 1 },
  { label: 'Lebih dari Separuh Hari', value: 2 },
  { label: 'Hampir Setiap Hari', value: 3 },
];

type AppState = 'LOADING' | 'TEST' | 'FEEDBACK' | 'COMPUTING' | 'RESULT' | 'ERROR';

export default function DiagnosisQuizPage() {
  const router = useRouter();
  const [appState, setAppState] = useState<AppState>('LOADING');

  const [questions, setQuestions] = useState<Pertanyaan[]>([]);

  const [sessionUid, setSessionUid] = useState<string>('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [ceritaSiswa, setCeritaSiswa] = useState<string>('');

  // Penghitung karakter real-time (minimal 30 karakter, bukan kata)
  const MIN_CHARS   = 30;
  const charCount   = useMemo(() => ceritaSiswa.trim().length, [ceritaSiswa]);
  const isReady     = charCount >= MIN_CHARS;
  const charsLeft   = Math.max(0, MIN_CHARS - charCount);
  const progressPct = Math.min(100, Math.round((charCount / MIN_CHARS) * 100));

  useEffect(() => {
    // Baca session_uid yang disimpan saat startTes di halaman intro
    const storedUid = sessionStorage.getItem('diagnosis_session_uid') || '';
    if (!storedUid) {
      toast.error('Sesi tes tidak ditemukan. Silakan mulai ulang dari halaman awal.');
      router.replace('/student/test');
      return;
    }
    setSessionUid(storedUid);

    const fetchQuestions = async () => {
      try {
        const res = await fetchApi('/api/pertanyaan/getAllPertanyaans');
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          const data: Pertanyaan[] = json.Data || json.data || [];
          if (data.length === 0) {
            toast.error('Tidak ada pertanyaan yang tersedia saat ini.');
            setAppState('ERROR');
          } else {
            setQuestions(data);
            setAppState('TEST');
          }
        } else {
          toast.error(json.Message || json.error || 'Gagal memuat pertanyaan dari server.');
          setAppState('ERROR');
        }
      } catch {
        toast.error('Gagal terhubung ke server. Pastikan koneksi internet Anda aktif.');
        setAppState('ERROR');
      }
    };

    fetchQuestions();
  }, [router]);

  const handleAnswer = (value: number) => {
    const currentQ = questions[currentIndex];
    const newAnswers = { ...answers, [currentQ.kode_pertanyaan]: value };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 300);
    } else {
      setTimeout(() => {
        setAppState('FEEDBACK');
      }, 300);
    }
  };

  const handleSubmitTest = async () => {
    setAppState('COMPUTING');
    const userUid = localStorage.getItem('student_uid') || '';

    const payload = {
      session_id: sessionUid,
      user_uid: userUid,
      cerita_siswa: ceritaSiswa,
      jawaban: Object.entries(answers).map(([kode_pertanyaan, nilai]) => ({
        kode_pertanyaan,
        nilai,
      })),
    };

    try {
      const res = await fetchApi('/api/diagnosis/submitTes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        sessionStorage.removeItem('diagnosis_session_uid');
        setAppState('RESULT');
      } else {
        toast.error(json.Message || json.message || json.error || 'Gagal mengirimkan jawaban tes!');
        setAppState('TEST');
      }
    } catch {
      toast.error('Koneksi terputus. Gagal mengirim jawaban ke server.');
      setAppState('TEST');
    }
  };

  if (appState === 'LOADING') {
    return (
      <div className="max-w-2xl mx-auto py-32 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-32 h-32 relative mb-8">
          <div className="absolute inset-0 bg-slate-200 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-white rounded-full p-6 shadow-xl border border-slate-100">
            <Brain className="w-20 h-20 text-slate-900 animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Memuat Pertanyaan...</h2>
        <p className="text-slate-500 font-medium max-w-sm">Mohon tunggu, sistem sedang menyiapkan kuesioner untuk Anda.</p>
      </div>
    );
  }

  if (appState === 'ERROR') {
    return (
      <div className="max-w-2xl mx-auto py-32 px-4 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Gagal Memuat Kuesioner</h2>
        <p className="text-slate-500 font-medium max-w-sm mb-8">Terjadi kesalahan saat mengambil data pertanyaan. Coba lagi beberapa saat.</p>
        <Button onClick={() => router.push('/student/home')} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 px-8 font-bold">
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  if (appState === 'FEEDBACK') {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 fade-in">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-slate-100 rounded-2xl text-slate-700">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Bagaimana Perasaanmu?</h2>
              <p className="text-slate-500 font-medium text-sm">
                Ceritakan masalah atau beban yang kamu rasakan.{' '}
                <span className="font-bold text-slate-700">Minimal 30 karakter</span> untuk melanjutkan.
              </p>
            </div>
          </div>

          <div className="mb-6">
            {/* Textarea cerita */}
            <textarea
              className={`w-full h-52 p-5 border-2 rounded-2xl bg-slate-50 focus:bg-white focus:ring-0 transition-all resize-none text-slate-700 placeholder:text-slate-400 ${
                isReady
                  ? 'border-emerald-300 focus:border-emerald-500'
                  : 'border-slate-200 focus:border-slate-900'
              }`}
              placeholder="Saya merasa kesulitan karena... (ceritakan dengan bebas, minimal 30 karakter)"
              value={ceritaSiswa}
              onChange={(e) => setCeritaSiswa(e.target.value)}
            />

            {/* Progress bar & character counter */}
            <div className="mt-3 space-y-2">
              {/* Bar */}
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isReady ? 'bg-emerald-500' : 'bg-amber-400'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Label */}
              <div className="flex items-center justify-between">
                <p
                  className={`text-xs font-bold transition-colors ${
                    isReady ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {isReady ? (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {charCount} karakter — syarat terpenuhi!
                    </span>
                  ) : (
                    `${charCount} / ${MIN_CHARS} karakter — tambah ${charsLeft} karakter lagi`
                  )}
                </p>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  {progressPct}%
                </p>
              </div>

              {/* Privasi note */}
              <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                Cerita kamu akan dijaga kerahasiaannya dan hanya dapat dibaca oleh Guru BK.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end items-center gap-4 border-t border-slate-100 pt-6">
            <Button
              variant="ghost"
              onClick={() => setAppState('TEST')}
              className="text-slate-500 font-bold hover:bg-slate-100 rounded-xl px-6 h-12 w-full sm:w-auto"
            >
              Kembali ke Kuesioner
            </Button>
            <Button
              onClick={() => handleSubmitTest()}
              disabled={!isReady}
              title={!isReady ? `Tambahkan ${charsLeft} karakter lagi untuk melanjutkan` : undefined}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-slate-900/20 w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100 transition-all"
            >
              Kirim Jawaban &amp; Selesai
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'COMPUTING') {
    return (
      <div className="max-w-2xl mx-auto py-32 px-4 flex flex-col items-center justify-center text-center fade-in">
        <div className="w-32 h-32 relative mb-8">
          <div className="absolute inset-0 bg-slate-200 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-white rounded-full p-6 shadow-xl border border-slate-100">
            <Brain className="w-20 h-20 text-slate-900 animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Memproses dan Menyimpan Jawaban...</h2>
        <p className="text-slate-500 font-medium max-w-sm">Mohon jangan tutup jendela ini, kami sedang merapikan riwayat tes Anda untuk dianalisis oleh Guru BK.</p>
      </div>
    );
  }

  if (appState === 'RESULT') {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 fade-in slide-in-from-bottom-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-none text-center p-12">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Kuesioner Selesai! 🎉</h1>
          <p className="text-base text-slate-600 leading-relaxed font-medium max-w-lg mx-auto mb-8">
            Terima kasih karena telah menjawab dan mengutarakan isi perasaan Anda dengan jujur hari ini.
            Kuisioner kesehatan mental Anda telah disimpan dan diteruskan secara rahasia ke kotak masuk Guru BK sekolah Anda.
          </p>

          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 text-amber-800 text-sm font-medium mx-auto max-w-md mb-10 text-left flex gap-4">
            <Brain className="w-8 h-8 shrink-0 text-amber-500" />
            <p>Guru BK (Konselor) akan memantau hasil analisis tes dari sistem pakar diagnostik dan akan menjadwalkan sesi bimbingan bersama Anda jika mendesak. Tetap semangat, Anda tidak berjuang sendirian!</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              onClick={() => router.push('/student/home')}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-14 px-10 font-bold shadow-lg shadow-slate-900/20 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    );
  }
  const currentQ = questions[currentIndex];
  const progressPercent = (currentIndex / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <button
        onClick={() => router.back()}
        className="mb-8 flex items-center text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Batal &amp; Kembali
      </button>

      {/* Progress Header */}
      <div className="mb-10 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-1">
              Pertanyaan {currentIndex + 1} dari {questions.length}
            </p>
            <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{currentQ.kategori_pertanyaan}</h2>
          </div>
          <p className="text-sm font-bold text-slate-400">{Math.round(progressPercent)}%</p>
        </div>
        <Progress value={progressPercent} className="h-2.5 bg-slate-100 rounded-full overflow-hidden [&>div]:bg-slate-900" />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl p-8 md:p-12 mb-8 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">

        <div className="absolute top-0 right-0 p-8 scale-150 opacity-10 pointer-events-none">
          <Brain className="w-32 h-32 text-white" />
        </div>

        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 relative z-10 text-center">
          {currentQ.kode_pertanyaan}
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug relative z-10 text-center">
          &ldquo;{currentQ.pertanyaan}&rdquo;
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LIKERT_OPTIONS.map((opt, i) => {
          const isSelected = answers[currentQ.kode_pertanyaan] === opt.value;
          return (
            <button
              key={i}
              onClick={() => handleAnswer(opt.value)}
              className={`text-left px-6 py-5 rounded-2xl border-2 transition-all duration-200 font-bold flex items-center justify-between ${isSelected
                ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/30 ring-2 ring-slate-900/50 scale-[0.98]'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98]'
                }`}
            >
              <span className="text-[15px]">{opt.label}</span>
              {isSelected && <CheckCircle2 className="w-5 h-5 opacity-80 shrink-0" />}
            </button>
          );
        })}
      </div>

      <div className="mt-12 flex justify-between items-center border-t border-slate-200 pt-6">
        <Button
          variant="ghost"
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="text-slate-500 font-bold hover:bg-slate-100 hover:text-slate-900 rounded-full px-6 transition-all"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Sebelumnya
        </Button>

        <span className="text-xs font-bold text-slate-300 tracking-wider hidden md:block">LIKERT SCALE · CERTAINTY FACTOR</span>

        <Button
          variant="ghost"
          onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
          disabled={answers[currentQ.pertanyaan_uid] === undefined || currentIndex === questions.length - 1}
          className="text-slate-500 font-bold hover:bg-slate-100 hover:text-slate-900 rounded-full px-6 transition-all"
        >
          Lewati <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
