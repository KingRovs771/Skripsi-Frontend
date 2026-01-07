'use client';
import React, { useState, useEffect } from 'react';
import { Send, Clock, CheckCircle2, Search, Loader2, MessageCircle, UserCircle, GraduationCap, Stethoscope, ChevronLeft, ArrowRight } from 'lucide-react';

type Destination = 'BK' | 'PAKAR' | null;

export default function StudentFAQPage() {
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Pilih Tujuan, Step 2: Tulis Pertanyaan
  const [destination, setDestination] = useState<Destination>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyQuestions();
  }, []);

  const fetchMyQuestions = async () => {
    try {
      const response = await fetch('http://localhost:8080/siswa/my-questions');
      const data = await response.json();
      setQuestions(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:8080/siswa/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pertanyaan: newQuestion,
          tujuan: destination, // Mengirim tujuan (BK atau PAKAR) ke API
        }),
      });

      if (response.ok) {
        setNewQuestion('');
        setStep(1);
        setDestination(null);
        fetchMyQuestions();
        alert(`Pertanyaanmu telah terkirim ke ${destination === 'BK' ? 'Guru BK' : 'Pakar'}!`);
      }
    } catch (error) {
      alert('Gagal mengirim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Tanya & Konsultasi</h1>
        <p className="text-slate-500 font-medium">Pilih kepada siapa kamu ingin bercerita hari ini.</p>
      </div>

      {/* STEP 1: PILIH TUJUAN */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => {
              setDestination('BK');
              setStep(2);
            }}
            className="group bg-white border-2 border-slate-200 p-8 rounded-[32px] text-left hover:border-slate-900 hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all flex flex-col justify-between min-h-[240px]"
          >
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Guru BK</h3>
              <p className="text-slate-500 text-sm mt-1">Cocok untuk masalah sekolah, pertemanan, atau harian.</p>
            </div>
            <div className="flex items-center text-slate-900 font-bold text-sm mt-4">
              Pilih Guru BK <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => {
              setDestination('PAKAR');
              setStep(2);
            }}
            className="group bg-white border-2 border-slate-200 p-8 rounded-[32px] text-left hover:border-slate-900 hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all flex flex-col justify-between min-h-[240px]"
          >
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Pakar Psikologi</h3>
              <p className="text-slate-500 text-sm mt-1">Untuk konsultasi mendalam mengenai kesehatan mental.</p>
            </div>
            <div className="flex items-center text-slate-900 font-bold text-sm mt-4">
              Pilih Pakar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>
        </div>
      )}

      {/* STEP 2: TULIS PERTANYAAN */}
      {step === 2 && (
        <div className="bg-white border-2 border-slate-900 rounded-[32px] p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button onClick={() => setStep(1)} className="flex items-center text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Kembali Pilih Tujuan
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${destination === 'BK' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>{destination === 'BK' ? <GraduationCap className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}</div>
            <div>
              <h2 className="font-black text-slate-900">Tanya ke {destination === 'BK' ? 'Guru BK' : 'Pakar'}</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">Privasi Terjamin & Anonim</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-slate-900 transition-all min-h-[160px] resize-none font-medium"
              placeholder={`Ceritakan apa yang ingin kamu sampaikan kepada ${destination === 'BK' ? 'Guru BK' : 'Pakar'}...`}
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              required
            />
            <button type="submit" disabled={submitting || !newQuestion} className="w-full flex justify-center items-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-[0.98]">
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" /> Kirim Pesan Sekarang
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* RIWAYAT (Tetap tampil di bawah) */}
      <div className="space-y-6 pt-10">
        <h3 className="font-black text-2xl text-slate-900">Konsultasi Sebelumnya</h3>
        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-200" />
        ) : (
          <div className="grid gap-4">
            {questions.map((q: any) => (
              <div key={q.id} className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${q.tujuan === 'BK' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                    Kepada: {q.tujuan}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">{q.tanggal}</span>
                </div>
                <p className="font-bold text-slate-800">{q.pertanyaan}</p>
                {q.jawaban && (
                  <div className="mt-2 p-4 bg-slate-50 rounded-2xl border-l-4 border-slate-900">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Jawaban:</p>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{q.jawaban}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
