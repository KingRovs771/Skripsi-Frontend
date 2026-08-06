'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, Eye, FileClock, Loader2, Users, AlertCircle,
  ChevronRight, Filter, X, Brain, Activity, Upload, Download, CheckCircle2
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

interface StudentHistory {
  nisn: string;
  nama: string;
  kelas: string;
  total_tes: number;
  terakhir_tes: string;
  skor_phq9: number;
  skor_gad7: number;
  depresi_penyakit: string;
  cemas_penyakit: string;
}

// ─── Colour helpers ────────────────────────────────────────────────────────────
function getCategoryColor(kategori: string): string {
  const k = (kategori || '').toLowerCase();
  if (k.includes('normal') || k.includes('minimal') || k.includes('tidak ada'))
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (k.includes('ringan') || k.includes('mild'))
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  if (k.includes('sedang') || k.includes('moderate'))
    return 'bg-orange-50 text-orange-700 border-orange-200';
  if (k.includes('berat') || k.includes('parah') || k.includes('severe') || k.includes('ekstrem'))
    return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
}

function getScoreColor(type: 'phq9' | 'gad7', score: number): string {
  if (type === 'phq9') {
    if (score <= 4)  return 'text-emerald-600 font-bold';
    if (score <= 9)  return 'text-yellow-600 font-bold';
    if (score <= 14) return 'text-orange-600 font-bold';
    return 'text-red-600 font-bold';
  } else {
    if (score <= 4)  return 'text-emerald-600 font-bold';
    if (score <= 9)  return 'text-yellow-600 font-bold';
    if (score <= 14) return 'text-orange-600 font-bold';
    return 'text-red-600 font-bold';
  }
}

export default function GurubkHistoryPage() {
  const [searchTerm, setSearchTerm]         = useState('');
  const [filterKelas, setFilterKelas]       = useState('');
  const [filterDepresi, setFilterDepresi]   = useState('');
  const [filterCemas, setFilterCemas]       = useState('');
  const [students, setStudents]             = useState<StudentHistory[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  // ── Import Siswa States ────────────────────────────────────
  const [showImportModal, setShowImportModal] = useState(false);
  const [importingFile, setImportingFile]     = useState(false);
  const [selectedFile, setSelectedFile]       = useState<File | null>(null);
  const [importResult, setImportResult]       = useState<{
    inserted: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const downloadCSVTemplate = () => {
    const headers = 'nisn,nama_lengkap,no_hp,alamat,kelas,email,password\n';
    const sampleRow = '1234567890,Ahmad Fauzi,08123456789,Jl. Mawar No. 12,XII-A,ahmad@sekolah.sch.id,Siswa123!\n';
    const blob = new Blob([headers + sampleRow], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_import_siswa.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setImportingFile(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetchApi('/api/gurubk/history/import-students', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setImportResult({
          inserted: json.inserted || 0,
          failed: json.failed || 0,
          errors: json.errors || [],
        });
        toast.success('Proses import selesai!');
        fetchHistory(); // refresh list
      } else {
        toast.error(json.error || 'Gagal mengupload file import');
      }
    } catch {
      toast.error('Tidak dapat menghubungi server');
    } finally {
      setImportingFile(false);
    }
  };

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetchApi('/api/gurubk/history', { method: 'GET' });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setStudents(json.Data || json.data || []);
      } else {
        setError(json.message || 'Gagal memuat data riwayat siswa.');
      }
    } catch (err) {
      setError('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // ── Unique filter options derived from data ─────────────────────────────────
  const kelasList    = useMemo(() => Array.from(new Set(students.map(s => s.kelas).filter(Boolean))).sort(), [students]);
  const depresiList  = useMemo(() => Array.from(new Set(students.map(s => s.depresi_penyakit).filter(Boolean))).sort(), [students]);
  const cemasList    = useMemo(() => Array.from(new Set(students.map(s => s.cemas_penyakit).filter(Boolean))).sort(), [students]);

  const hasActiveFilter = filterKelas || filterDepresi || filterCemas;

  const clearFilters = () => {
    setFilterKelas('');
    setFilterDepresi('');
    setFilterCemas('');
    setSearchTerm('');
  };

  const filteredStudents = useMemo(() =>
    students.filter((s) => {
      const matchSearch  = s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || s.nisn.includes(searchTerm);
      const matchKelas   = !filterKelas   || s.kelas === filterKelas;
      const matchDepresi = !filterDepresi || s.depresi_penyakit === filterDepresi;
      const matchCemas   = !filterCemas   || s.cemas_penyakit === filterCemas;
      return matchSearch && matchKelas && matchDepresi && matchCemas;
    }),
  [students, searchTerm, filterKelas, filterDepresi, filterCemas]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Manajemen</p>
          <h1 className="text-3xl font-bold text-slate-900">Riwayat Tes Siswa</h1>
          <p className="text-slate-500 mt-1">
            Pantau hasil diagnosis dan tinjau ulang visibilitas hasil kepada siswa.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setImportResult(null);
              setShowImportModal(true);
            }}
            className="flex items-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-600/10 active:scale-95 shrink-0"
          >
            <Upload className="w-4 h-4" /> Import Siswa (CSV)
          </button>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-600 text-sm font-semibold shadow-sm">
            <Users className="w-4 h-4 text-slate-400" />
            {loading ? '...' : `${filteredStudents.length} / ${students.length} Siswa`}
          </div>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="search-siswa"
            type="text"
            placeholder="Cari berdasarkan Nama atau NISN siswa..."
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white shadow-sm text-slate-800 placeholder:text-slate-400 transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-slate-400 text-sm mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-medium">Filter:</span>
          </div>

          {/* Filter Kelas */}
          <select
            id="filter-kelas"
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm"
          >
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>

          {/* Filter Depresi */}
          <select
            id="filter-depresi"
            value={filterDepresi}
            onChange={(e) => setFilterDepresi(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm"
          >
            <option value="">Semua Kategori Depresi</option>
            {depresiList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Filter Kecemasan */}
          <select
            id="filter-cemas"
            value={filterCemas}
            onChange={(e) => setFilterCemas(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm"
          >
            <option value="">Semua Kategori Kecemasan</option>
            {cemasList.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Clear filters */}
          {(hasActiveFilter || searchTerm) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg px-3 py-1.5 transition-colors font-medium"
            >
              <X className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6 font-semibold text-slate-500 text-xs uppercase tracking-widest whitespace-nowrap">#</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest whitespace-nowrap">NISN</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest whitespace-nowrap">Nama Lengkap</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest whitespace-nowrap">Kelas</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest whitespace-nowrap">Tes Terakhir</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest whitespace-nowrap text-center">
                  <span className="flex items-center justify-center gap-1">
                    <Brain className="w-3.5 h-3.5" /> PHQ-9
                  </span>
                </th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest whitespace-nowrap text-center">
                  <span className="flex items-center justify-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> GAD-7
                  </span>
                </th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest whitespace-nowrap">Depresi</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest whitespace-nowrap">Kecemasan</th>
                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-widest whitespace-nowrap text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto text-slate-300" />
                    <p className="text-slate-400 mt-3 text-sm font-medium">Memuat data siswa...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center">
                    <FileClock className="w-10 h-10 mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-500 font-semibold">
                      {searchTerm || hasActiveFilter ? 'Tidak ada siswa yang cocok dengan filter.' : 'Belum ada data riwayat tes.'}
                    </p>
                    {(searchTerm || hasActiveFilter) && (
                      <button onClick={clearFilters} className="mt-2 text-xs text-slate-400 underline hover:text-slate-600">
                        Reset filter
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr key={s.nisn} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 pl-6 text-slate-400 text-sm font-medium">{idx + 1}</td>
                    <td className="p-4 font-mono text-sm text-slate-600 font-semibold">{s.nisn}</td>
                    <td className="p-4 font-semibold text-slate-900 whitespace-nowrap">{s.nama}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 whitespace-nowrap">
                        {s.kelas || '-'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-sm whitespace-nowrap">
                      {s.terakhir_tes ? new Date(s.terakhir_tes).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      }) : '-'}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-sm tabular-nums ${getScoreColor('phq9', s.skor_phq9)}`}>
                        {s.skor_phq9 ?? '-'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-sm tabular-nums ${getScoreColor('gad7', s.skor_gad7)}`}>
                        {s.skor_gad7 ?? '-'}
                      </span>
                    </td>
                    <td className="p-4">
                      {s.depresi_penyakit ? (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap ${getCategoryColor(s.depresi_penyakit)}`}>
                          {s.depresi_penyakit}
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="p-4">
                      {s.cemas_penyakit ? (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap ${getCategoryColor(s.cemas_penyakit)}`}>
                          {s.cemas_penyakit}
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="p-4 text-center">
                      <Link href={`/gurubk/history/${s.nisn}`}>
                        <button
                          id={`btn-detail-${s.nisn}`}
                          className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition-all active:scale-95 shadow-sm gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Tinjau
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-slate-300" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              {searchTerm || hasActiveFilter ? 'Tidak ada siswa yang cocok.' : 'Belum ada data riwayat tes.'}
            </div>
          ) : (
            filteredStudents.map((s) => (
              <Link key={s.nisn} href={`/gurubk/history/${s.nisn}`} className="block">
                <div className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{s.nama}</p>
                      <p className="font-mono text-xs text-slate-500 mt-0.5">{s.nisn} · {s.kelas || '-'}</p>

                      {/* Score badges */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-bold border border-slate-200">
                          PHQ-9: <span className={getScoreColor('phq9', s.skor_phq9)}>{s.skor_phq9 ?? '-'}</span>
                        </span>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-bold border border-slate-200">
                          GAD-7: <span className={getScoreColor('gad7', s.skor_gad7)}>{s.skor_gad7 ?? '-'}</span>
                        </span>
                      </div>

                      {/* Category badges */}
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {s.depresi_penyakit && (
                          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${getCategoryColor(s.depresi_penyakit)}`}>
                            {s.depresi_penyakit}
                          </span>
                        )}
                        {s.cemas_penyakit && (
                          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${getCategoryColor(s.cemas_penyakit)}`}>
                            {s.cemas_penyakit}
                          </span>
                        )}
                      </div>

                      {s.terakhir_tes && (
                        <p className="text-slate-400 text-xs mt-1.5">
                          Terakhir: {new Date(s.terakhir_tes).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Modal Import Siswa */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] transition-all">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-white/80" />
                <h3 className="font-black text-base tracking-tight">Import Data Siswa</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleImportSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Panduan */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 leading-relaxed text-slate-600">
                <p className="font-bold text-slate-900 text-sm">Panduan Import CSV:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Format file harus berupa <b>CSV (.csv)</b> menggunakan pemisah koma.</li>
                  <li>Header kolom wajib di baris pertama: <b>nisn, nama_lengkap, email</b>.</li>
                  <li>Kolom opsional: <b>no_hp, alamat, kelas, password</b>.</li>
                  <li>Jika password dikosongkan, default password adalah <b>Siswa123!</b></li>
                  <li>Siswa yang diimport otomatis terdaftar di bawah sekolah Anda.</li>
                </ul>
                <button
                  type="button"
                  onClick={downloadCSVTemplate}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-indigo-700 hover:text-indigo-900 font-bold border-b border-indigo-200 hover:border-indigo-950 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template CSV
                </button>
              </div>

              {/* Uploader */}
              {!importResult && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">Pilih File CSV</label>
                    <input
                      type="file"
                      accept=".csv"
                      required
                      disabled={importingFile}
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                    />
                  </div>

                  {selectedFile && (
                    <div className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between">
                      <span className="truncate">{selectedFile.name}</span>
                      <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                    </div>
                  )}
                </div>
              )}

              {/* Hasil Import */}
              {importResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Sukses Diimport</p>
                      <p className="text-3xl font-black text-emerald-800 mt-1">{importResult.inserted}</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-wider">Gagal / Dilewati</p>
                      <p className="text-3xl font-black text-red-800 mt-1">{importResult.failed}</p>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        Log Error / Kendala Laporan
                      </p>
                      <div className="border border-slate-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto bg-slate-50 p-3 font-mono text-[10px] text-slate-500 space-y-1.5">
                        {importResult.errors.map((err, idx) => (
                          <div key={idx} className="border-b border-slate-150 pb-1.5 last:border-0 last:pb-0">
                            • {err}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {importResult.failed === 0 && (
                    <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl px-5 py-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold">Import Sukses Sempurna!</p>
                        <p className="text-emerald-700 leading-relaxed mt-0.5">
                          Seluruh baris siswa di dalam file berhasil diimport ke dalam sistem.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                {!importResult ? (
                  <>
                    <button
                      type="button"
                      disabled={importingFile}
                      onClick={() => setShowImportModal(false)}
                      className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={importingFile || !selectedFile}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      {importingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Mulai Import
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setImportResult(null);
                      setSelectedFile(null);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    Import File Lain
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
