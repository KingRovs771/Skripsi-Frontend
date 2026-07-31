'use client';
import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Calendar,
  Loader2,
  Trophy,
  Activity,
  AlertCircle,
  CheckCircle2,
  EyeOff,
  Clock,
  Brain,
  BadgeCheck,
  AlertTriangle,
  Heart,
} from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import TrendChart from '@/components/TrendChart';

interface MyTestHistory {
  id: number;
  nama_tes: string;
  skor: number;
  kategori: string;
  tanggal: string;
  rekomendasi: string;
  is_visible_to_student: boolean;
  reviewed_by_gurubk: boolean;
  depresi_penyakit?: string;
  cemas_penyakit?: string;
  depresi_saran?: string;
  cemas_saran?: string;
  nn_depresi_confidence?: number;
  nn_cemas_confidence?: number;
  // Status validasi per-diagnosis (CONFIRMED, ADJUSTED, URGENT_INTERVENTION)
  is_depresi_validated?: boolean;
  is_cemas_validated?: boolean;
  status_validasi_depresi?: 'CONFIRMED' | 'ADJUSTED' | 'URGENT_INTERVENTION' | string;
  status_validasi_kecemasan?: 'CONFIRMED' | 'ADJUSTED' | 'URGENT_INTERVENTION' | string;
  status_validasi_cemas?: 'CONFIRMED' | 'ADJUSTED' | 'URGENT_INTERVENTION' | string;
  depresi_status_validasi?: string;
  cemas_status_validasi?: string;
}

function getCategoryStyle(skor: number, kategori: string) {
  const lowerKat = kategori.toLowerCase();
  if (lowerKat.includes('berat') || lowerKat.includes('parah') || skor > 20) {
    return {
      bar: 'bg-red-500',
      badge: 'bg-red-50 text-red-700 border-red-200',
    };
  }
  if (lowerKat.includes('sedang') || lowerKat.includes('moderat') || (skor > 10 && skor <= 20)) {
    return {
      bar: 'bg-amber-400',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }
  return {
    bar: 'bg-green-400',
    badge: 'bg-green-50 text-green-700 border-green-200',
  };
}

function getValidationStatusConfig(status?: string | boolean) {
  if (status === undefined || status === null || status === false) {
    return {
      label: 'Belum Divalidasi',
      badge: 'bg-slate-100 text-slate-500 border-slate-200',
      icon: <AlertTriangle className="w-3 h-3 text-slate-400" />,
    };
  }

  if (typeof status === 'boolean') {
    return status
      ? {
          label: 'CONFIRMED',
          badge: 'bg-green-50 text-green-700 border-green-200',
          icon: <BadgeCheck className="w-3 h-3 text-green-600" />,
        }
      : {
          label: 'Belum Divalidasi',
          badge: 'bg-slate-100 text-slate-500 border-slate-200',
          icon: <AlertTriangle className="w-3 h-3 text-slate-400" />,
        };
  }

  const normalized = String(status).trim().toUpperCase();

  switch (normalized) {
    case 'CONFIRMED':
      return {
        label: 'CONFIRMED',
        badge: 'bg-green-50 text-green-700 border-green-200',
        icon: <BadgeCheck className="w-3 h-3 text-green-600" />,
      };
    case 'ADJUSTED':
      return {
        label: 'ADJUSTED',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <BadgeCheck className="w-3 h-3 text-blue-600" />,
      };
    case 'URGENT_INTERVENTION':
    case 'URGENT':
      return {
        label: 'URGENT INTERVENTION',
        badge: 'bg-red-50 text-red-700 border-red-200 font-bold animate-pulse',
        icon: <AlertTriangle className="w-3 h-3 text-red-600" />,
      };
    default:
      return {
        label: String(status),
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: <BadgeCheck className="w-3 h-3 text-slate-500" />,
      };
  }
}

export default function StudentHistoryPage() {
  const [history, setHistory] = useState<MyTestHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentUid, setStudentUid] = useState<string>('');

  useEffect(() => {
    const uid = localStorage.getItem('student_uid') || '';
    setStudentUid(uid);
    const fetchMyHistory = async () => {
      try {
        const res = await fetchApi('/api/siswa/my-history', { method: 'GET' });
        const data = await res.json().catch(() => ({}));
        setHistory(data.Data || data.data || []);
      } catch (error) {
        console.error('Gagal memuat riwayat:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyHistory();
  }, []);

  // Pisahkan: yang sudah approved (visible) vs belum/belum ditinjau
  const visibleHistory = history.filter((h) => h.is_visible_to_student);
  const pendingHistory = history.filter((h) => !h.is_visible_to_student);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Riwayat Tes Saya</h1>
          <p className="text-slate-500">Lihat perkembangan kesehatan mental kamu dari waktu ke waktu.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 font-bold text-sm">
          <Trophy className="w-4 h-4" />
          Total Tes: {history.length}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-slate-300 mb-4" />
          <p className="text-slate-400 font-medium">Mengambil catatan tes kamu...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <p className="text-slate-500 font-medium">Kamu belum pernah melakukan tes diagnosis.</p>
          <Link href="/student/test">
            <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all">
              Mulai Tes Sekarang
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Trend Chart (Fitur 2) */}
          {studentUid && visibleHistory.length >= 2 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Grafik Tren Longitudinal
              </h2>
              <TrendChart studentUid={studentUid} />
            </div>
          )}

          {/* Hasil yang sudah disetujui untuk ditampilkan */}
          {visibleHistory.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Hasil yang Tersedia ({visibleHistory.length})
              </h2>
              <div className="grid grid-cols-1 gap-6">

                {visibleHistory.map((item) => {
                  const style = getCategoryStyle(item.skor, item.kategori);
                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
                    >
                      {/* Status Indicator Bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-2 ${style.bar}`} />

                      <div className="pl-4 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-slate-100 rounded-2xl text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                              <Activity className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-black text-xl text-slate-900">{item.nama_tes}</h3>
                              <p className="text-sm text-slate-400 flex items-center gap-1 font-medium">
                                <Calendar className="w-3 h-3" />
                                {item.tanggal
                                  ? new Date(item.tanggal).toLocaleDateString('id-ID', {
                                      day: '2-digit',
                                      month: 'long',
                                      year: 'numeric',
                                    })
                                  : item.tanggal}
                              </p>
                            </div>
                          </div>

                          {/* Detail Diagnosis & Confidence Breakdown */}
                          {(item.depresi_penyakit || item.cemas_penyakit) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Depresi */}
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Depresi</span>
                                  {item.nn_depresi_confidence != null && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      (item.nn_depresi_confidence * 100) >= 80 ? 'bg-green-100 text-green-700' :
                                      (item.nn_depresi_confidence * 100) >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'
                                    }`}>
                                      {Math.round(item.nn_depresi_confidence * 100)}%
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-bold text-slate-800">{item.depresi_penyakit || 'Normal'}</p>

                                {/* Status Validasi Depresi */}
                                {(() => {
                                  const valConfig = getValidationStatusConfig(
                                    item.status_validasi_depresi ?? item.depresi_status_validasi ?? item.is_depresi_validated
                                  );
                                  return (
                                    <div className="flex items-center justify-between text-[11px] pt-1">
                                      <span className="font-semibold text-slate-500">Status Validasi:</span>
                                      <div className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md border ${valConfig.badge}`}>
                                        {valConfig.icon}
                                        {valConfig.label}
                                      </div>
                                    </div>
                                  );
                                })()}

                                {item.nn_depresi_confidence != null ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                                      <Brain className="w-3 h-3" /> Neural Network Confidence
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          (item.nn_depresi_confidence * 100) >= 80 ? 'bg-green-500' :
                                          (item.nn_depresi_confidence * 100) >= 60 ? 'bg-amber-400' : 'bg-red-400'
                                        }`}
                                        style={{ width: `${Math.round(item.nn_depresi_confidence * 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-slate-400 italic">Confidence tidak tersedia</p>
                                )}
                              </div>

                              {/* Kecemasan */}
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kecemasan</span>
                                  {item.nn_cemas_confidence != null && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      (item.nn_cemas_confidence * 100) >= 80 ? 'bg-green-100 text-green-700' :
                                      (item.nn_cemas_confidence * 100) >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'
                                    }`}>
                                      {Math.round(item.nn_cemas_confidence * 100)}%
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-bold text-slate-800">{item.cemas_penyakit || 'Normal'}</p>

                                {/* Status Validasi Kecemasan */}
                                {(() => {
                                  const valConfig = getValidationStatusConfig(
                                    item.status_validasi_kecemasan ?? item.status_validasi_cemas ?? item.cemas_status_validasi ?? item.is_cemas_validated
                                  );
                                  return (
                                    <div className="flex items-center justify-between text-[11px] pt-1">
                                      <span className="font-semibold text-slate-500">Status Validasi:</span>
                                      <div className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md border ${valConfig.badge}`}>
                                        {valConfig.icon}
                                        {valConfig.label}
                                      </div>
                                    </div>
                                  );
                                })()}

                                {item.nn_cemas_confidence != null ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                                      <Brain className="w-3 h-3" /> Neural Network Confidence
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          (item.nn_cemas_confidence * 100) >= 80 ? 'bg-green-500' :
                                          (item.nn_cemas_confidence * 100) >= 60 ? 'bg-amber-400' : 'bg-red-400'
                                        }`}
                                        style={{ width: `${Math.round(item.nn_cemas_confidence * 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-slate-400 italic">Confidence tidak tersedia</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Status Konfirmasi */}
                          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border ${
                            item.reviewed_by_gurubk
                              ? 'bg-green-50 border-green-200'
                              : 'bg-amber-50 border-amber-200'
                          }`}>
                            {item.reviewed_by_gurubk ? (
                              <>
                                <BadgeCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-bold text-green-800">Diagnosis Dikonfirmasi oleh Guru BK</p>
                                  <p className="text-[10px] text-green-600 mt-0.5">Hasil ini telah ditinjau dan disetujui</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-bold text-amber-800">Belum Dikonfirmasi</p>
                                  <p className="text-[10px] text-amber-600 mt-0.5">Menunggu tinjauan Guru BK</p>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Bagian Rekomendasi */}
                          {item.rekomendasi && (
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                  Catatan Pakar
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                                &ldquo;{item.rekomendasi}&rdquo;
                              </p>
                            </div>
                          )}

                          {/* Saran Penanganan Dari Pakar (Fitur 5) */}
                          {(item.depresi_saran || item.cemas_saran) && (
                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                              <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-blue-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
                                  Saran Penanganan Klinis Pakar
                                </span>
                              </div>
                              <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed font-semibold">
                                {item.depresi_saran && (
                                  <div>
                                    <span className="font-bold text-slate-900 block mb-0.5">Terkait Depresi:</span>
                                    <p className="font-medium whitespace-pre-wrap">{item.depresi_saran}</p>
                                  </div>
                                )}
                                {item.cemas_saran && (
                                  <div className={item.depresi_saran ? "pt-2 border-t border-blue-100" : ""}>
                                    <span className="font-bold text-slate-900 block mb-0.5">Terkait Kecemasan:</span>
                                    <p className="font-medium whitespace-pre-wrap">{item.cemas_saran}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        </div>

                        {/* Badge Skor & Kategori */}
                        <div className="flex items-center gap-6 md:border-l border-slate-100 md:pl-8">
                          <div className="text-center">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
                              Skor Kamu
                            </p>
                            <div className="text-5xl font-black text-slate-900 leading-none">{item.skor}</div>
                          </div>
                          <div className="min-w-[140px]">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">
                              Hasil Analisis
                            </p>
                            <div className={`px-4 py-2 rounded-xl text-xs font-black border text-center ${style.badge}`}>
                              {item.kategori}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hasil yang belum / tidak ditampilkan oleh Guru BK */}
          {pendingHistory.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Menunggu Tinjauan Guru BK ({pendingHistory.length})
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {pendingHistory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4 opacity-70"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-200 rounded-xl">
                        <EyeOff className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">{item.nama_tes}</p>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.tanggal
                            ? new Date(item.tanggal).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })
                            : item.tanggal}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 bg-slate-200 px-3 py-1.5 rounded-lg whitespace-nowrap">
                      {item.reviewed_by_gurubk ? 'Disembunyikan' : 'Menunggu Tinjauan'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                Hasil ini masih dalam proses tinjauan oleh Guru BK dan belum dapat ditampilkan.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Info Card Bawah */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <AlertCircle className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 rotate-12" />
        <h4 className="text-lg font-bold mb-2 flex items-center gap-2">Butuh teman bercerita?</h4>
        <p className="text-slate-300 text-sm max-w-md leading-relaxed">
          Jangan ragu untuk menghubungi Guru BK atau Pakar Psikologi melalui menu{' '}
          <span className="text-white font-bold underline">Tanya Jawab</span> jika kamu merasa butuh
          bantuan lebih lanjut.
        </p>
      </div>
    </div>
  );
}
