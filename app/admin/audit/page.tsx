'use client';
import React, { useState, useEffect } from 'react';
import { ScrollText, Search, Filter, Eye, ArrowRight, Loader2, ChevronLeft, ChevronRight, Check, X, Edit3, Trash2, Plus } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface AuditLog {
  log_id: number;
  log_uid: string;
  operator_uid: string;
  operator_name: string;
  operator_role: string;
  tabel_terdampak: string;
  record_id_terdampak: string;
  aksi: string;
  data_sebelum: string | null;
  data_sesudah: string | null;
  created_at: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(15);

  // Filters
  const [searchName, setSearchName] = useState('');
  const [filterTable, setFilterTable] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Selected Log for detail modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (searchName) params.append('operator_name', searchName);
      if (filterTable) params.append('tabel_terdampak', filterTable);
      if (filterAction) params.append('aksi', filterAction);
      if (filterRole) params.append('operator_role', filterRole);

      const res = await fetchApi(`/api/admin/audit-logs?${params.toString()}`);
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setLogs(json.Data?.logs || json.data?.logs || []);
        setTotal(json.Data?.total || json.data?.total || 0);
      } else {
        toast.error(json.Message || 'Gagal memuat log audit');
      }
    } catch {
      toast.error('Koneksi ke server gagal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filterTable, filterAction, filterRole]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleClearFilters = () => {
    setSearchName('');
    setFilterTable('');
    setFilterAction('');
    setFilterRole('');
    setPage(1);
  };

  // Helper to render diff between before and after snapshots
  const renderDiff = (beforeStr: string | null, afterStr: string | null) => {
    let beforeObj: Record<string, any> = {};
    let afterObj: Record<string, any> = {};

    try {
      if (beforeStr) beforeObj = JSON.parse(beforeStr);
    } catch {}
    try {
      if (afterStr) afterObj = JSON.parse(afterStr);
    } catch {}

    // Exclude metadata fields that pollute changes
    const excludeKeys = ['created_at', 'update_at', 'penyakit_id', 'pertanyaan_id', 'aturan_id'];

    const allKeys = Array.from(
      new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)])
    ).filter((key) => !excludeKeys.includes(key));

    return (
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-bold text-xs">Field / Properti</TableHead>
            <TableHead className="font-bold text-xs">Sebelum Perubahan</TableHead>
            <TableHead className="font-bold text-xs">Sesudah Perubahan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allKeys.map((key) => {
            const beforeVal = beforeObj[key];
            const afterVal = afterObj[key];
            const isDifferent = JSON.stringify(beforeVal) !== JSON.stringify(afterVal);

            let rowClass = 'hover:bg-slate-50/50';
            let beforeText = String(beforeVal ?? '—');
            let afterText = String(afterVal ?? '—');

            if (beforeVal === undefined && afterVal !== undefined) {
              rowClass = 'bg-green-50/80 hover:bg-green-100/50 text-green-900';
            } else if (beforeVal !== undefined && afterVal === undefined) {
              rowClass = 'bg-red-50/80 hover:bg-red-100/50 text-red-900 line-through';
            } else if (isDifferent) {
              rowClass = 'bg-amber-50/80 hover:bg-amber-100/50 text-amber-900';
            }

            // Formatting boolean values to be pretty
            if (typeof beforeVal === 'boolean') beforeText = beforeVal ? 'Ya' : 'Tidak';
            if (typeof afterVal === 'boolean') afterText = afterVal ? 'Ya' : 'Tidak';

            return (
              <TableRow key={key} className={`text-xs transition-colors ${rowClass}`}>
                <TableCell className="font-bold font-mono">{key}</TableCell>
                <TableCell className="font-medium max-w-[200px] break-all">{beforeText}</TableCell>
                <TableCell className="font-bold max-w-[200px] break-all">{afterText}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <ScrollText className="w-7 h-7 text-slate-800" />
          Audit Log Basis Pengetahuan
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-0.5">
          Pantau riwayat penambahan, modifikasi, dan penghapusan aturan, pertanyaan, serta data penyakit.
        </p>
      </div>

      {/* Filter panel */}
      <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
        <CardContent className="p-5 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 transition-all shadow-sm"
                placeholder="Cari nama operator..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              Cari
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
            >
              Reset
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filter:</span>
            </div>

            <select
              value={filterTable}
              onChange={(e) => {
                setFilterTable(e.target.value);
                setPage(1);
              }}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
            >
              <option value="">Semua Tabel</option>
              <option value="penyakits">Tabel Penyakit</option>
              <option value="pertanyaans">Tabel Pertanyaan</option>
              <option value="aturans">Tabel Aturan</option>
            </select>

            <select
              value={filterAction}
              onChange={(e) => {
                setFilterAction(e.target.value);
                setPage(1);
              }}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
            >
              <option value="">Semua Aksi</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
            </select>

            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setPage(1);
              }}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
            >
              <option value="">Semua Peran</option>
              <option value="admin">Administrator</option>
              <option value="pakar">Pakar Psikologi</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold py-4 pl-6">Waktu Perubahan</TableHead>
                <TableHead className="font-bold">Operator</TableHead>
                <TableHead className="font-bold">Tabel / Record</TableHead>
                <TableHead className="font-bold text-center">Aksi</TableHead>
                <TableHead className="text-right font-bold pr-6">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-400">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Memuat log audit...</p>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-400">
                    <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-35" />
                    <p className="text-sm font-semibold">Belum ada log audit yang terdaftar.</p>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const dateFormatted = new Date(log.created_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <TableRow key={log.log_uid} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="py-4 pl-6">
                        <p className="font-bold text-slate-900 text-sm">{dateFormatted}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{log.log_uid.slice(0, 8)}...</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-slate-800 text-sm">{log.operator_name}</p>
                        <span
                          className={`inline-flex px-2 py-0.2 mt-0.5 rounded-full text-[9px] font-black uppercase border tracking-wider ${
                            log.operator_role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          {log.operator_role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-bold text-slate-700">tabel: <span className="font-mono text-slate-950 font-black">{log.tabel_terdampak}</span></p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 font-mono">ID: {log.record_id_terdampak}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wider ${
                            log.aksi === 'CREATE'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : log.aksi === 'UPDATE'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {log.aksi === 'CREATE' && <Plus className="w-3 h-3 mr-1" />}
                          {log.aksi === 'UPDATE' && <Edit3 className="w-3 h-3 mr-1" />}
                          {log.aksi === 'DELETE' && <Trash2 className="w-3 h-3 mr-1" />}
                          {log.aksi}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setOpenModal(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-black text-slate-800 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl px-3 py-1.5 shadow-sm transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Bandingkan
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs font-semibold text-slate-500">
          <span>Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, total)} dari {total} log</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-800">Halaman {page} dari {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dialog Detail Comparison */}
      <AlertDialog open={openModal} onOpenChange={setOpenModal}>
        <AlertDialogContent className="bg-white rounded-3xl border-none shadow-2xl max-w-2xl overflow-hidden max-h-[85vh] flex flex-col p-0">
          <AlertDialogHeader className="px-6 py-4 bg-slate-900 text-white flex-shrink-0">
            <div className="flex justify-between items-center w-full">
              <AlertDialogTitle className="text-lg font-black flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-white/80" />
                Perbandingan Data Perubahan
              </AlertDialogTitle>
              <AlertDialogCancel
                onClick={() => setOpenModal(false)}
                className="bg-transparent border-none text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </AlertDialogCancel>
            </div>
          </AlertDialogHeader>

          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {selectedLog && (
              <>
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-600">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Operator</span>
                    <span className="text-slate-950 font-bold text-sm">{selectedLog.operator_name}</span>
                    <span className="block text-[10px] text-slate-400 font-normal uppercase mt-0.5">{selectedLog.operator_role} ({selectedLog.operator_uid.slice(0, 8)})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Aksi / Target</span>
                    <span className="text-slate-950 font-bold text-sm flex items-center gap-1.5 uppercase">
                      {selectedLog.aksi} <ArrowRight className="w-3.5 h-3.5 text-slate-400" /> {selectedLog.tabel_terdampak}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">Record ID: {selectedLog.record_id_terdampak}</span>
                  </div>
                </div>

                {/* Diff table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  {renderDiff(selectedLog.data_sebelum, selectedLog.data_sesudah)}
                </div>
              </>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
