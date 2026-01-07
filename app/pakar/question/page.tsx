'use client';
import React, { useState } from 'react';
import { FileText, Settings2, ListTodo, Award, Plus, Save, Trash2, Pencil, ChevronRight, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

type ViewMode = 'list' | 'edit';
type TabMode = 'general' | 'questions' | 'scoring';

export default function ConfigTesPage() {
  const [view, setView] = useState<ViewMode>('list');
  const [activeTab, setActiveTab] = useState<TabMode>('general');
  const [loading, setLoading] = useState(false);

  // Mock Data untuk List Tes
  const [testList] = useState([
    { id: 1, kode: 'PHQ-9', nama: 'Patient Health Questionnaire', questions: 9, status: 'Active' },
    { id: 2, kode: 'GAD-7', nama: 'Generalized Anxiety Disorder', questions: 7, status: 'Active' },
    { id: 3, kode: 'STRESS-10', nama: 'Perceived Stress Scale', questions: 10, status: 'Draft' },
  ]);

  return (
    <div className="space-y-6">
      {view === 'list' ? (
        <>
          {/* HEADER LIST */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Konfigurasi Tes</h1>
              <p className="text-slate-500">Atur parameter instrumen diagnosis kesehatan mental.</p>
            </div>
            <button onClick={() => setView('edit')} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95">
              <Plus className="w-5 h-5" /> Buat Tes Baru
            </button>
          </div>

          {/* GRID DAFTAR TES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testList.map((test) => (
              <div key={test.id} className="bg-white border-2 border-slate-200 rounded-[32px] p-6 hover:border-slate-900 transition-all group relative overflow-hidden">
                <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-widest ${test.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                  {test.status}
                </div>

                <div className="space-y-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-900">{test.kode}</h3>
                    <p className="text-sm text-slate-500 leading-snug">{test.nama}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-xs font-bold text-slate-400">{test.questions} Pertanyaan</span>
                    <button onClick={() => setView('edit')} className="text-slate-900 font-black text-sm flex items-center gap-1 hover:underline">
                      Konfigurasi <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* EDITOR MODE */
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
            </button>
            <div className="flex gap-3">
              <button className="px-6 py-2 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Simpan Draft</button>
              <button className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
                <Save className="w-4 h-4" /> Publikasikan
              </button>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-900 rounded-[40px] shadow-[16px_16px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
            {/* TABS NAVIGATION */}
            <div className="flex border-b-2 border-slate-900">
              <button
                onClick={() => setActiveTab('general')}
                className={`flex-1 py-4 font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${activeTab === 'general' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'}`}
              >
                <Settings2 className="w-4 h-4" /> Umum
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`flex-1 py-4 font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${activeTab === 'questions' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'}`}
              >
                <ListTodo className="w-4 h-4" /> Pertanyaan
              </button>
              <button
                onClick={() => setActiveTab('scoring')}
                className={`flex-1 py-4 font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${activeTab === 'scoring' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'}`}
              >
                <Award className="w-4 h-4" /> Penilaian
              </button>
            </div>

            <div className="p-10">
              {/* TAB 1: INFORMASI UMUM */}
              {activeTab === 'general' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Kode Tes</label>
                      <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 outline-none font-bold" placeholder="Contoh: PHQ-9" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nama Instrumen</label>
                      <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 outline-none font-bold" placeholder="Contoh: Patient Health Questionnaire" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Deskripsi Penjelasan</label>
                    <textarea
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 outline-none min-h-[150px] resize-none font-medium text-slate-600"
                      placeholder="Jelaskan tujuan dari tes ini bagi siswa..."
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: MANAJEMEN PERTANYAAN */}
              {activeTab === 'questions' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-slate-900">Butir Pertanyaan</h3>
                    <button className="text-sm font-bold bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors">+ Tambah Soal</button>
                  </div>

                  <div className="space-y-3">
                    {[1, 2, 3].map((num) => (
                      <div key={num} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-slate-900 transition-all group">
                        <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">{num}</span>
                        <input className="flex-1 bg-transparent border-none outline-none font-bold text-slate-700" defaultValue="Merasa kurang bertenaga atau mudah lelah?" />
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: PENILAIAN (SCORING) */}
              {activeTab === 'scoring' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed font-medium">Tentukan ambang batas skor (threshold) untuk setiap kategori diagnosis. Skor akan dikalkulasi secara otomatis oleh sistem.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 font-black text-[10px] text-slate-400 uppercase tracking-widest px-4">
                      <div className="col-span-3">Rentang Skor</div>
                      <div className="col-span-5">Label Diagnosis</div>
                      <div className="col-span-4 text-right">Aksi</div>
                    </div>

                    {[
                      { range: '0 - 4', label: 'Indikasi Minimal', color: 'bg-green-500' },
                      { range: '5 - 9', label: 'Indikasi Ringan', color: 'bg-blue-500' },
                      { range: '10 - 14', label: 'Indikasi Sedang', color: 'bg-amber-500' },
                      { range: '15+', label: 'Indikasi Berat', color: 'bg-red-500' },
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-12 gap-4 items-center p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                        <div className="col-span-3 font-mono font-bold text-slate-900">{row.range}</div>
                        <div className="col-span-5 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${row.color}`}></div>
                          <span className="font-bold text-slate-700 text-sm">{row.label}</span>
                        </div>
                        <div className="col-span-4 text-right">
                          <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
