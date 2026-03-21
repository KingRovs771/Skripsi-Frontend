'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Pencil, Trash2, Loader2, Stethoscope, ShieldCheck, Mail, Phone, Users, UserCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ── Tipe Data ──────────────────────────────────────────────────────────────────
interface Pakar {
  pakar_uid?: string;
  user_uid?: string;
  uid?: string;
  id?: number;
  nama_lengkap: string;
  email: string;
  // Field lama & baru (toleran terhadap keduanya)
  no_hp?: string;
  phone?: string;
  no_sip?: string;
  nomor_sip?: string;
  spesialisasi?: string;
  jenis_spesialis?: string;
  // Foto
  photo_url?: string;
  foto?: string;
  photo_file?: string; // kadang backend mengembalikan base64
}

const getUid = (p: Pakar): string =>
  p.pakar_uid ?? p.user_uid ?? p.uid ?? String(p.id ?? '');

/** Ambil URL foto — toleran terhadap berbagai field name */
const getPhotoSrc = (p: Pakar): string | null => {
  const raw = p.photo_url ?? p.foto ?? null;
  if (!raw) return null;
  if (raw.startsWith('http') || raw.startsWith('data:')) return raw;
  return `${API_BASE}${raw}`;
};

/** Avatar: foto asli atau inisial nama */
function PakarAvatar({ pakar }: { pakar: Pakar }) {
  const [imgError, setImgError] = React.useState(false);
  const src = getPhotoSrc(pakar);
  const initials = pakar.nama_lengkap
    .replace(/Dr\.?\s*/i, '')
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={pakar.nama_lengkap}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <span className="text-base font-black text-purple-600 group-hover:text-white transition-colors">
      {initials || <UserCircle className="w-7 h-7" />}
    </span>
  );
}

export default function ManajemenPakar() {
  const [pakars, setPakars] = useState<Pakar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete state
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchPakars = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/api/users/getAllPakar');
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setPakars(json.Data || json.data || []);
      } else {
        toast.error(json.Message || json.message || 'Gagal memuat data pakar');
      }
    } catch {
      toast.error('Koneksi ke server gagal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPakars(); }, []);

  // ── Search filter ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return pakars;
    return pakars.filter(
      (p) =>
        p.nama_lengkap.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.spesialisasi ?? '').toLowerCase().includes(q) ||
        (p.no_sip ?? '').toLowerCase().includes(q)
    );
  }, [pakars, searchQuery]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const onClickDelete = (uid: string) => {
    setSelectedUid(uid);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUid) return;
    setIsDeleting(true);
    try {
      const res = await fetchApi(`/api/users/deletePakar/${selectedUid}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Data pakar berhasil dihapus');
        setPakars((prev) => prev.filter((p) => getUid(p) !== selectedUid));
      } else {
        toast.error(json.Message || json.message || 'Gagal menghapus data pakar');
      }
    } catch {
      toast.error('Koneksi ke server gagal');
    } finally {
      setIsDeleting(false);
      setOpenConfirm(false);
      setSelectedUid(null);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Data Pakar</h1>
          <p className="text-sm text-slate-500 mt-1">Manajemen tenaga ahli psikologi dan psikiater.</p>
        </div>
        <Link href="/admin/users/pakar/create">
          <Button className="bg-slate-900 hover:bg-slate-800 rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Registrasi Pakar
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-sm"
          placeholder="Cari nama, email, atau spesialisasi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3" />
          <p className="text-sm">Memuat data pakar...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Users className="w-10 h-10 mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">
            {searchQuery ? 'Tidak ada pakar yang cocok dengan pencarian.' : 'Belum ada data pakar.'}
          </p>
        </div>
      )}

      {/* Card Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((pakar, idx) => {
            const uid = getUid(pakar);
            return (
              <div
                key={uid || idx}
                className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm hover:border-purple-400 hover:shadow-md transition-all group"
              >
                {/* Top: Foto + Badge Aktif */}
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center overflow-hidden group-hover:bg-purple-600 transition-all shrink-0">
                    <PakarAvatar pakar={pakar} />
                  </div>
                  <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                    Aktif
                  </span>
                </div>

                {/* Info Utama */}
                <h3 className="font-black text-lg text-slate-900 leading-snug">{pakar.nama_lengkap}</h3>
                <p className="text-sm font-semibold text-purple-600 mb-4 mt-0.5">
                  {pakar.jenis_spesialis ?? pakar.spesialisasi ?? 'Pakar'}
                </p>

                {/* Detail */}
                <div className="space-y-1.5 border-t border-slate-100 pt-4">
                  {(pakar.nomor_sip ?? pakar.no_sip) && (
                    <div className="flex items-center text-xs text-slate-500 font-medium gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      SIP: {pakar.nomor_sip ?? pakar.no_sip}
                    </div>
                  )}
                  <div className="flex items-center text-xs text-slate-500 font-medium gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    {pakar.email}
                  </div>
                  {(pakar.phone ?? pakar.no_hp) && (
                    <div className="flex items-center text-xs text-slate-500 font-medium gap-2">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      {pakar.phone}
                    </div>
                  )}
                </div>

                {/* Aksi */}
                <div className="mt-5 flex gap-2">
                  <Link href={`/admin/users/pakar/edit/${uid}`} className="flex-1">
                    <button className="w-full bg-slate-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => onClickDelete(uid)}
                    className="p-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Counter */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          Menampilkan {filtered.length} dari {pakars.length} pakar
        </p>
      )}

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent className="bg-white rounded-3xl border-none shadow-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Hapus Data Pakar?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Data pakar akan dihapus secara permanen dari database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-slate-600">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium px-6 transition-all"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
