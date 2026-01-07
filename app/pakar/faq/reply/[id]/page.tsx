'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Send, Loader2, User, MessageCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface FaqDetail {
  id: string;
  namaLengkap: string;
  kodeUID: string;
  pertanyaan: string;
  tanggal: string;
  status: string;
}

export default function ReplyFaqPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // State untuk data dari user
  const [data, setData] = useState<FaqDetail | null>(null);
  // State untuk input balasan pakar
  const [reply, setReply] = useState('');

  useEffect(() => {
    // Simulasi Fetch data berdasarkan ID dari params
    const fetchData = async () => {
      try {
        // Ganti dengan endpoint API asli Anda: http://localhost:8080/pakar/faq/${params.id}
        const response = await fetch(`http://localhost:8080/pakar/faq/${params.id}`);
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8080/pakar/faq/reply/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply_message: reply }),
      });

      if (response.ok) {
        alert('Balasan berhasil dikirim!');
        router.push('/pakar/faq');
      } else {
        alert('Gagal mengirim balasan.');
      }
    } catch (error) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Navigasi */}
      <div className="flex items-center space-x-4">
        <Link href="/pakar/faq" className="p-2 hover:bg-white rounded-full transition-colors border border-slate-200 shadow-sm">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Balas Pertanyaan</h1>
          <p className="text-slate-500 text-sm">Berikan jawaban edukatif untuk membantu pengguna.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* SISI KIRI: Pesan Masuk (Read Only) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center border-b border-slate-100 pb-3">
              <User className="w-4 h-4 mr-2 text-slate-400" /> Informasi Pengguna
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                <p className="text-slate-900 font-medium">{data?.namaLengkap || 'Anonim'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">UID Pengguna</label>
                <p className="text-slate-600 font-mono text-sm">{data?.kodeUID || '-'}</p>
              </div>
              <div className="flex items-center text-slate-500 text-xs">
                <Clock className="w-3 h-3 mr-1" /> Dikirim pada: {data?.tanggal || 'Baru saja'}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-6 shadow-md relative overflow-hidden">
            <MessageCircle className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5" />
            <h3 className="font-bold mb-3 flex items-center">
              <MessageCircle className="w-4 h-4 mr-2" /> Pertanyaan Masuk:
            </h3>
            <p className="text-slate-200 italic leading-relaxed">"{data?.pertanyaan || 'Tidak ada detail pertanyaan.'}"</p>
          </div>
        </div>

        {/* SISI KANAN: Form Balasan */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSendReply} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
            <h3 className="font-bold text-slate-900 mb-4 text-lg">Jawaban Pakar</h3>

            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 italic text-slate-400">Tuliskan jawaban Anda di bawah ini:</label>
                <textarea
                  className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[300px] resize-none text-slate-800 leading-relaxed"
                  placeholder="Halo, terima kasih sudah bertanya. Berdasarkan keluhan Anda..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400 max-w-[200px]">Balasan Anda akan dikirim langsung ke dashboard pengguna.</p>
              <div className="flex space-x-3">
                <Link href="/pakar/faq">
                  <button type="button" className="px-6 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                    Batal
                  </button>
                </Link>
                <button type="submit" disabled={loading || !reply} className="flex items-center bg-slate-900 text-white px-8 py-2 rounded-lg font-medium hover:bg-slate-800 disabled:bg-slate-400 transition-all shadow-lg active:scale-95">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Kirim Balasan <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
