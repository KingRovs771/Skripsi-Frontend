'use client';
import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { AlertTriangle, CheckCircle2, Play, Loader2, ArrowRight, X, Sparkles, Scale, Info } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DraftRule {
  kode_penyakit: string;
  kode_pertanyaan: string;
  min_value: number;
  is_mandatory: number;
  tipe_aturan?: string;
  berlaku_untuk_semua_tingkat?: boolean;
}

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  draftRule: DraftRule;
}

interface SimulationDetail {
  session_id: string;
  tanggal: string;
  original_depresi: string;
  simulated_depresi: string;
  original_cemas: string;
  simulated_cemas: string;
  is_different: boolean;
}

export default function SimulationModal({ isOpen, onClose, onConfirm, draftRule }: SimulationModalProps) {
  const [sampleSize, setSampleSize] = useState(50);
  const [loading, setLoading] = useState(false);
  const [simResults, setSimResults] = useState<{
    total_tested: number;
    total_same: number;
    total_diff: number;
    details: SimulationDetail[];
  } | null>(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/api/aturan/simulasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sample_size: sampleSize,
          draft_rules: [
            {
              kode_penyakit: draftRule.kode_penyakit,
              kode_pertanyaan: draftRule.kode_pertanyaan,
              min_value: Number(draftRule.min_value),
              is_mandatory: Number(draftRule.is_mandatory),
              tipe_aturan: draftRule.tipe_aturan || 'GEJALA_INTI',
              berlaku_untuk_semua_tingkat: !!draftRule.berlaku_untuk_semua_tingkat,
            },
          ],
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setSimResults(json.Data || json.data || null);
      } else {
        setSimResults(null);
      }
    } catch {
      setSimResults(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && draftRule.kode_penyakit && draftRule.kode_pertanyaan) {
      runSimulation();
    } else {
      setSimResults(null);
    }
  }, [isOpen, sampleSize]);

  if (!isOpen) return null;

  const diffDetails = simResults?.details.filter((d) => d.is_different) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-white/80" />
            <h3 className="font-black text-base tracking-tight">Simulasi &amp; Uji Coba Aturan Baru</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Draft Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-600 grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 block mb-0.5">Aturan yang Diuji</span>
              <span className="text-slate-900 font-bold block text-sm">
                Penyakit {draftRule.kode_penyakit} &bull; Gejala {draftRule.kode_pertanyaan}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Konfigurasi Draft</span>
              <span className="text-slate-900 font-bold block text-sm">
                Min. Nilai: {draftRule.min_value} &bull; Sifat:{' '}
                {Number(draftRule.is_mandatory) === 1 ? 'Wajib' : 'Opsional'}
              </span>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-200 flex items-center gap-2">
              <span className="text-slate-400">Tipe Aturan:</span>
              {draftRule.tipe_aturan === 'RED_FLAG' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black rounded-full bg-red-50 text-red-700 border border-red-100">
                  🚩 Red Flag — Berlaku Lintas Semua Tingkat
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  Gejala Inti — Satu Kelas Penyakit
                </span>
              )}
            </div>
          </div>

          {/* Sample Selector */}
          <div className="flex items-center justify-between border border-slate-100 rounded-xl p-3 bg-slate-50/50">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-400" /> Jumlah Sampel Historis Sesi Tes:
            </span>
            <select
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              disabled={loading}
              className="text-xs font-bold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
            >
              <option value={10}>10 sesi terakhir</option>
              <option value={30}>30 sesi terakhir</option>
              <option value={50}>50 sesi terakhir</option>
              <option value={100}>100 sesi terakhir</option>
            </select>
          </div>

          {loading ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-slate-500" />
              <span className="text-xs font-bold">Menjalankan mesin inferensi simulasi...</span>
            </div>
          ) : simResults ? (
            <div className="space-y-6">
              {/* Summary charts/visuals */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-4 text-center">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Hasil SAMA</p>
                  <p className="text-3xl font-black text-emerald-800 mt-1">{simResults.total_same}</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">
                    {Math.round((simResults.total_same / simResults.total_tested) * 100)}% dari total sampel
                  </p>
                </div>
                <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-4 text-center">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Hasil BERUBAH</p>
                  <p className="text-3xl font-black text-amber-800 mt-1">{simResults.total_diff}</p>
                  <p className="text-[10px] text-amber-600 mt-0.5">
                    {Math.round((simResults.total_diff / simResults.total_tested) * 100)}% dari total sampel
                  </p>
                </div>
              </div>

              {/* Progress Bar Visual (Simple Donut Chart equivalent) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Hasil Sama ({simResults.total_same})</span>
                  <span>Hasil Berubah ({simResults.total_diff})</span>
                </div>
                <div className="w-full h-3 bg-amber-200 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(simResults.total_same / simResults.total_tested) * 100}%` }}
                  />
                </div>
              </div>

              {/* Details of Changes */}
              {diffDetails.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    Daftar Sesi Terdampak Perubahan Aturan
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 sticky top-0">
                        <TableRow>
                          <TableHead className="py-2 text-[10px] font-bold">Tanggal</TableHead>
                          <TableHead className="py-2 text-[10px] font-bold">Diagnosis Asli</TableHead>
                          <TableHead className="py-2 text-[10px] font-bold text-right">Diagnosis Baru</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {diffDetails.map((det, idx) => (
                          <TableRow key={idx} className="text-[10px] hover:bg-slate-50/50">
                            <TableCell className="font-semibold text-slate-600">
                              {new Date(det.tanggal).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: '2-digit',
                              })}
                            </TableCell>
                            <TableCell className="font-medium text-slate-500">
                              {det.original_depresi || 'P01'} / {det.original_cemas || 'K01'}
                            </TableCell>
                            <TableCell className="font-bold text-slate-900 text-right">
                              {det.simulated_depresi || 'P01'} / {det.simulated_cemas || 'K01'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl px-5 py-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold">Simulasi Aman!</p>
                    <p className="text-emerald-700 leading-relaxed mt-0.5">
                      Draft aturan baru ini menghasilkan diagnosis yang 100% konsisten dengan data historis.
                      Tidak ada perubahan diagnosis pada total sampel uji.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-red-500 gap-2 border border-dashed border-red-200 bg-red-50/50 rounded-2xl p-4 text-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <span className="text-xs font-bold">Simulasi gagal dieksekusi. Silakan periksa kembali draft aturan.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            Batal &amp; Sesuaikan Aturan
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Terapkan &amp; Simpan Aturan
          </button>
        </div>
      </div>
    </div>
  );
}
