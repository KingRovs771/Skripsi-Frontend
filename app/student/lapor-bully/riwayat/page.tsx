'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, Clock, AlertTriangle, ShieldCheck, HelpCircle, FileText, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';

interface BullyReport {
  report_uid: string;
  jenis_bully: string;
  nama_terlapor: string;
  kelas_terlapor: string;
  deskripsi_kejadian: string;
  lokasi_kejadian: string;
  tanggal_kejadian: string | null;
  is_anonim: boolean;
  tingkat_urgensi: string;
  status: string;
  catatan_penanganan: string | null;
  created_at: string;
}

export default function StudentBullyReportsHistoryPage() {
  const router = useRouter();
  const [reports, setReports] = useState<BullyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi('/api/siswa/bully-report/my-reports');
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.Data) {
        setReports(json.Data || []);
      } else {
        toast.error(json.error || 'Gagal memuat riwayat laporan');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const toggleExpand = (uid: string) => {
    setExpandedReport(expandedReport === uid ? null : uid);
  };

  const getUrgencyBadge = (urgensi: string) => {
    switch (urgensi) {
      case 'Tinggi/Darurat':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Tinggi / Darurat
          </span>
        );
      case 'Sedang':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Sedang
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Rendah
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SELESAI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
            Selesai
          </span>
        );
      case 'DITINDAKLANJUTI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
            Ditindaklanjuti
          </span>
        );
      case 'DITOLAK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-slate-100 text-slate-500 border border-slate-200">
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse">
            Baru
          </span>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Back Link */}
      <Link
        href="/student/lapor-bully"
        className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Form Laporan
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-indigo-600" />
          Riwayat Laporan Bully
        </h1>
        <p className="text-slate-500 mt-1.5 leading-relaxed">
          Berikut adalah daftar seluruh kasus perundungan yang telah kamu laporkan ke Guru BK.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <div className="animate-spin w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm font-bold">Memuat riwayat laporan...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 font-medium">Belum ada riwayat laporan bully yang kamu buat.</p>
          <Link
            href="/student/lapor-bully"
            className="inline-block py-2.5 px-6 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors"
          >
            Buat Laporan Baru
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const isExpanded = expandedReport === report.report_uid;
            return (
              <div
                key={report.report_uid}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Collapsed Header Summary */}
                <div
                  onClick={() => toggleExpand(report.report_uid)}
                  className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 text-xs font-extrabold rounded-md">
                        {report.jenis_bully}
                      </span>
                      {getUrgencyBadge(report.tingkat_urgensi)}
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(report.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="font-mono text-[10px]">
                        Ref: {report.report_uid.substring(0, 8)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-5 space-y-4 bg-slate-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Nama Terlapor</span>
                        <span className="text-slate-800 font-bold flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {report.nama_terlapor ? `${report.nama_terlapor} (Kelas: ${report.kelas_terlapor || '—'})` : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Lokasi &amp; Waktu Kejadian</span>
                        <span className="text-slate-800 font-bold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {report.lokasi_kejadian || '—'} 
                          {report.tanggal_kejadian ? ` (${new Date(report.tanggal_kejadian).toLocaleDateString('id-ID')})` : ''}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Deskripsi Kejadian</span>
                      <div className="text-sm text-slate-700 bg-white border border-slate-200 rounded-xl p-3.5 leading-relaxed">
                        {report.deskripsi_kejadian}
                      </div>
                    </div>

                    {/* Catatan Penanganan BK */}
                    {report.catatan_penanganan ? (
                      <div className="border border-indigo-100 bg-indigo-50/30 rounded-xl p-4 space-y-2">
                        <span className="text-xs font-black text-indigo-700 flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-indigo-500" />
                          Catatan / Tindak Lanjut Guru BK:
                        </span>
                        <p className="text-sm text-indigo-900 leading-relaxed">
                          {report.catatan_penanganan}
                        </p>
                      </div>
                    ) : (
                      report.status === 'BARU' && (
                        <div className="border border-slate-200 border-dashed rounded-xl p-4 text-center text-slate-400 text-xs font-medium">
                          Laporan baru masuk dan menunggu peninjauan dari Guru BK.
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
