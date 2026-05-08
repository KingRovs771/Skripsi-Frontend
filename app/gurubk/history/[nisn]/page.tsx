'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ClipboardList,
  Calendar,
  Loader2,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Activity,
  RefreshCw,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

interface TestResult {
  id: number;
  session_uid?: string;
  nama_tes: string;
  skor: number;
  skor_phq9: number;
  skor_gad7: number;
  kategori: string;
  depresi_penyakit: string;
  cemas_penyakit: string;
  tanggal: string;
  rekomendasi?: string;
  cerita_siswa?: string;
  // Visibilitas: apakah hasil ini bisa dilihat siswa?
  is_visible_to_student: boolean;
  // Status review oleh guru BK
  reviewed_by_gurubk: boolean;
}

interface StudentInfo {
  nisn: string;
  nama: string;
  kelas?: string;
  email?: string;
}

type VisibilityStatus = 'loading' | 'idle';

function getCategoryStyle(kategori: string, skor: number) {
  const lowerKat = kategori.toLowerCase();
  if (lowerKat.includes('berat') || lowerKat.includes('parah') || skor > 20) {
    return {
      bar: 'bg-red-500',
      badge: 'bg-red-50 text-red-700 border-red-200',
      icon: 'text-red-500',
    };
  }
  if (lowerKat.includes('sedang') || lowerKat.includes('moderat') || (skor > 10 && skor <= 20)) {
    return {
      bar: 'bg-amber-400',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: 'text-amber-500',
    };
  }
  return {
    bar: 'bg-green-400',
    badge: 'bg-green-50 text-green-700 border-green-200',
    icon: 'text-green-500',
  };
}

export default function GurubkStudentDetailPage() {
  const params = useParams();
  const nisn = params.nisn as string;

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<TestResult[]>([]);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [visibilityStatus, setVisibilityStatus] = useState<Record<number, VisibilityStatus>>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi(`/api/gurubk/history/${nisn}`, { method: 'GET' });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        const data = json.Data || json.data || {};
        setStudentInfo(data.student || data.siswa || { nisn });
        setResults(data.results || data.riwayat || []);
      } else {
        setError(json.message || 'Gagal memuat detail riwayat siswa.');
      }
    } catch (err) {
      setError('Tidak dapat terhubung ke server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [nisn]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  /**
   * Toggle visibilitas hasil tes ke siswa.
   * Memanggil endpoint PATCH /api/gurubk/history/review/{session_id}
   */
  const handleToggleVisibility = async (test: TestResult) => {
    const testId = test.id;
    const newVisibility = !test.is_visible_to_student;

    // Tandai sedang loading untuk item ini
    setVisibilityStatus((prev) => ({ ...prev, [testId]: 'loading' }));

    try {
      const res = await fetchApi(`/api/gurubk/history/review/${testId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          is_visible_to_student: newVisibility,
          reviewed_by_gurubk: true,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        // Update state lokal tanpa refetch
        setResults((prev) =>
          prev.map((r) =>
            r.id === testId
              ? { ...r, is_visible_to_student: newVisibility, reviewed_by_gurubk: true }
              : r
          )
        );
        toast.success(
          newVisibility
            ? `Hasil tes berhasil ditampilkan ke siswa.`
            : `Hasil tes berhasil disembunyikan dari siswa.`
        );
      } else {
        toast.error(json.message || 'Gagal memperbarui status visibilitas.');
      }
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.');
    } finally {
      setVisibilityStatus((prev) => ({ ...prev, [testId]: 'idle' }));
    }
  };

  const visibleCount = results.filter((r) => r.is_visible_to_student).length;
  const reviewedCount = results.filter((r) => r.reviewed_by_gurubk).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back + Title */}
      <div className="flex items-center space-x-4">
        <Link
          href="/gurubk/history"
          className="p-2 hover:bg-white rounded-full transition-colors border border-slate-200 shadow-sm flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Riwayat Siswa</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Tinjauan Hasil Tes</h1>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium flex-1">{error}</p>
          <button
            onClick={fetchDetail}
            className="flex items-center gap-1 text-xs font-bold hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
          </button>
        </div>
      )}

      {/* Student Info Card */}
      {!loading && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center font-black text-2xl border border-white/10 flex-shrink-0">
                <User className="w-7 h-7 text-white/70" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Siswa dengan NISN</p>
                <p className="text-xl font-black font-mono tracking-wide">{nisn}</p>
                {studentInfo?.nama && (
                  <p className="text-slate-300 font-semibold mt-0.5">{studentInfo.nama}</p>
                )}
                {studentInfo?.kelas && (
                  <p className="text-slate-400 text-sm">{studentInfo.kelas}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 md:gap-6 text-center">
              <div className="bg-white/10 rounded-xl px-4 py-3 border border-white/10">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Tes</p>
                <p className="text-2xl font-black mt-0.5">{results.length}</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3 border border-white/10">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Ditinjau</p>
                <p className="text-2xl font-black mt-0.5">{reviewedCount}</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3 border border-white/10">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Ditampilkan</p>
                <p className="text-2xl font-black mt-0.5 text-green-400">{visibleCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend / Petunjuk */}
      {!loading && results.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-bold mb-1">Petunjuk Tinjauan</p>
            <p className="text-blue-700 leading-relaxed">
              Sebagai Guru BK, Anda dapat memutuskan apakah hasil tes ini{' '}
              <span className="font-bold">boleh dilihat oleh siswa</span> atau tidak.
              Gunakan tombol <span className="font-bold">Tampilkan / Sembunyikan</span> pada setiap
              baris hasil tes untuk mengatur visibilitasnya.
            </p>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-slate-400" />
          Riwayat Hasil Tes
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl">
            <Loader2 className="w-9 h-9 animate-spin text-slate-300 mb-3" />
            <p className="text-slate-400 font-medium text-sm">Memuat riwayat tes...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <Activity className="w-10 h-10 mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 font-semibold">Siswa ini belum memiliki riwayat tes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {results.map((test) => {
              const style = getCategoryStyle(test.kategori, test.skor);
              const isUpdating = visibilityStatus[test.id] === 'loading';

              return (
                <div
                  key={test.id}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Color bar kiri */}
                  <div className="flex">
                    <div className={`w-1.5 flex-shrink-0 ${style.bar}`} />

                    <div className="flex-1 p-5">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {/* Info Tes */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className={`p-2.5 rounded-xl bg-slate-100 flex-shrink-0`}>
                              <Activity className={`w-5 h-5 ${style.icon}`} />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-base">{test.nama_tes}</h4>
                              <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {test.tanggal
                                  ? new Date(test.tanggal).toLocaleDateString('id-ID', {
                                      weekday: 'long',
                                      day: '2-digit',
                                      month: 'long',
                                      year: 'numeric',
                                    })
                                  : '-'}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2">
                            <button
                              onClick={() => setSelectedTest(test)}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors inline-flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              Lihat Detail Diagnosis
                            </button>
                          </div>
                        </div>

                        {/* Skor + Kategori + Visibility */}
                        <div className="flex md:flex-col items-center md:items-end gap-4 md:gap-3 flex-shrink-0">
                          {/* Skor */}
                          <div className="text-center md:text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skor</p>
                            <p className="text-4xl font-black text-slate-900 leading-none">{test.skor}</p>
                          </div>

                          {/* Kategori Badge */}
                          <div className={`px-3 py-1.5 rounded-xl text-xs font-black border text-center ${style.badge}`}>
                            {test.kategori}
                          </div>

                          {/* Status Badge */}
                          {test.reviewed_by_gurubk && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              Sudah Ditinjau
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-100 mt-4 pt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Status visibilitas saat ini */}
                          <div className="flex items-center gap-2">
                            {test.is_visible_to_student ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-sm text-green-700 font-semibold">
                                  Hasil ditampilkan ke siswa
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                <span className="text-sm text-slate-500 font-medium">
                                  Hasil disembunyikan dari siswa
                                </span>
                              </>
                            )}
                          </div>

                          {/* Toggle Button */}
                          <button
                            id={`toggle-visibility-${test.id}`}
                            onClick={() => handleToggleVisibility(test)}
                            disabled={isUpdating}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm
                              ${test.is_visible_to_student
                                ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                              }`}
                          >
                            {isUpdating ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Memperbarui...
                              </>
                            ) : test.is_visible_to_student ? (
                              <>
                                <EyeOff className="w-4 h-4" />
                                Sembunyikan dari Siswa
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                Tampilkan ke Siswa
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Modal Detail */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Detail Hasil Diagnosis</h3>
              <button 
                onClick={() => setSelectedTest(null)} 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Skor Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skor PHQ-9 (Depresi)</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{selectedTest.skor_phq9 ?? '-'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skor GAD-7 (Cemas)</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{selectedTest.skor_gad7 ?? '-'}</p>
                </div>
              </div>

              {/* Diagnosis Section */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Hasil Diagnosis</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                    <span className="text-sm font-semibold text-slate-600">Depresi</span>
                    <span className="text-sm font-bold text-slate-900">{selectedTest.depresi_penyakit || 'Normal'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                    <span className="text-sm font-semibold text-slate-600">Kecemasan</span>
                    <span className="text-sm font-bold text-slate-900">{selectedTest.cemas_penyakit || 'Normal'}</span>
                  </div>
                </div>
              </div>

              {/* Feedback Section */}
              {selectedTest.cerita_siswa && (
                <div>
                  <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" /> Cerita & Keluhan Siswa
                  </h4>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900 italic leading-relaxed">
                    &ldquo;{selectedTest.cerita_siswa}&rdquo;
                  </div>
                </div>
              )}

              {/* Rekomendasi Section */}
              {selectedTest.rekomendasi && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Catatan / Rekomendasi</h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                    {selectedTest.rekomendasi}
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedTest(null)} 
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors shadow-md"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
