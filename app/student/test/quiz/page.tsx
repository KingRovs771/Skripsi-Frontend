'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Loader2, Brain, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';

// Opsi jawaban berserta nilai User CF
const CF_OPTIONS = [
  { label: 'Sangat Sering / Sangat Yakin', value: 1.0 },
  { label: 'Sering / Yakin', value: 0.8 },
  { label: 'Kadang-kadang / Cukup Yakin', value: 0.6 },
  { label: 'Jarang / Kurang Yakin', value: 0.4 },
  { label: 'Sangat Jarang / Hampir Tidak Pernah', value: 0.2 },
  { label: 'Tidak Pernah sama sekali', value: 0.0 },
];

// DATA DUMMY SEMENTARA SESUAI PERMINTAAN USER
const DUMMY_QUESTIONS = [
  { id: 'Q01', category: 'Kecemasan (Anxiety)', text: 'Saya merasa tegang, cemas, atau gelisah secara berlebihan.' },
  { id: 'Q02', category: 'Kecemasan (Anxiety)', text: 'Saya merasa seperti ada sesuatu yang buruk akan terjadi.' },
  { id: 'Q03', category: 'Depresi (Depression)', text: 'Saya merasa sedih, murung, dan kehilangan minat pada hal yang dulu saya sukai.' },
  { id: 'Q04', category: 'Gejala Somatik', text: 'Saya mengalami kesulitan tidur (insomnia) atau sering terbangun di malam hari.' },
  { id: 'Q05', category: 'Trauma & Stres', text: 'Saya sering menghindari keramaian karena merasa terancam tanpa alasan jelas.' },
];

type AppState = 'TEST' | 'COMPUTING' | 'RESULT';

export default function DiagnosisQuizPage() {
  const router = useRouter();
  const [appState, setAppState] = useState<AppState>('TEST');

  // Status Tes
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const handleAnswer = (value: number) => {
    const currentQ = DUMMY_QUESTIONS[currentIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: value
    }));

    if (currentIndex < DUMMY_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 300);
    } else {
      // Pertanyaan Habis -> Submit
      handleSubmitTest();
    }
  };

  const handleSubmitTest = async () => {
    setAppState('COMPUTING');

    try {
      // Simulasi proses penyimpanan sesi kuis ke Database Guru BK
      await new Promise(resolve => setTimeout(resolve, 2000));

      setAppState('RESULT');
    } catch (err) {
      toast.error('Gagal mengirimkan tanggapan tes!');
      setAppState('TEST');
    }
  };

  // ----------------------------------------------------------------------
  // VIEW: COMPUTING ENGINE (MENGIRIM JAWABAN)
  // ----------------------------------------------------------------------
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

  // ----------------------------------------------------------------------
  // VIEW: RESULT (DISERAHKAN KE GURU BK)
  // ----------------------------------------------------------------------
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
              <Button onClick={() => router.push('/student/home')} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-14 px-10 font-bold shadow-lg shadow-slate-900/20 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto">
                 Kembali ke Beranda
              </Button>
            </div>
         </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW: TEST IN PROGRESS (THE QUIZ WIZARD)
  // ----------------------------------------------------------------------
  const currentQ = DUMMY_QUESTIONS[currentIndex];
  const progressPercent = ((currentIndex) / DUMMY_QUESTIONS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Navigasi Kembali */}
      <button 
         onClick={() => router.back()} 
         className="mb-8 flex items-center text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors"
      >
         <ArrowLeft className="w-4 h-4 mr-2" /> Batal & Kembali
      </button>

      {/* Progress Header */}
      <div className="mb-10 space-y-4">
        <div className="flex justify-between items-end">
           <div>
             <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-1">Pertanyaan {currentIndex + 1} dari {DUMMY_QUESTIONS.length}</p>
             <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{currentQ.category}</h2>
           </div>
           <p className="text-sm font-bold text-slate-400">{Math.round(progressPercent)}%</p>
        </div>
        <Progress value={progressPercent} className="h-2.5 bg-slate-100 rounded-full overflow-hidden [&>div]:bg-slate-900" />
      </div>

      {/* Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl p-8 md:p-12 mb-8 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
        {/* Ornamen */}
        <div className="absolute top-0 right-0 p-8 scale-150 opacity-10 pointer-events-none">
          <Brain className="w-32 h-32 text-white" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug relative z-10 text-center">
          "{currentQ.text}"
        </h1>
      </div>

      {/* Answers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-1">
        {CF_OPTIONS.map((opt, i) => {
          const isSelected = answers[currentQ.id] === opt.value;
          return (
            <button
              key={i}
              onClick={() => handleAnswer(opt.value)}
              className={`text-left px-6 py-5 rounded-2xl border-2 transition-all duration-200 font-bold flex items-center justify-between ${
                isSelected 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/30 ring-2 ring-slate-900/50 scale-[0.98]' 
                  : `bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98]`
              }`}
            >
              <span className="text-[15px]">{opt.label}</span>
              {isSelected && <CheckCircle2 className="w-5 h-5 opacity-80" />}
            </button>
          );
        })}
      </div>

      {/* Footer Nav */}
      <div className="mt-12 flex justify-between items-center border-t border-slate-200 pt-6">
         <Button 
            variant="ghost" 
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="text-slate-500 font-bold hover:bg-slate-100 hover:text-slate-900 rounded-full px-6 transition-all"
         >
           <ChevronLeft className="w-5 h-5 mr-1" /> Sebelumnya
         </Button>

         <span className="text-xs font-bold text-slate-300 tracking-wider hidden md:block">MODE DUMMY . CERTAINTY FACTOR</span>

         <Button 
            variant="ghost"
            onClick={() => setCurrentIndex(prev => prev + 1)}
            disabled={answers[currentQ.id] === undefined || currentIndex === DUMMY_QUESTIONS.length - 1}
            className="text-slate-500 font-bold hover:bg-slate-100 hover:text-slate-900 rounded-full px-6 transition-all"
         >
           Lewati <ChevronRight className="w-5 h-5 ml-1" />
         </Button>
      </div>
    </div>
  );
}
