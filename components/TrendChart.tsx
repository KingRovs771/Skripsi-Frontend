'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface TrendDataPoint {
  tanggal_tes: string;
  total_score_phq9: number;
  total_score_gad7: number;
  kategori_depresi_final: string;
  kategori_cemas_final: string;
}

interface TrendChartProps {
  studentUid: string;
}

export default function TrendChart({ studentUid }: TrendChartProps) {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentUid) return;
    const fetchTrend = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchApi(`/api/siswa/tren-diagnosis/${studentUid}`);
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          setData(json.Data || json.data || []);
        } else {
          setError(json.Message || 'Gagal memuat tren diagnosis');
        }
      } catch {
        setError('Koneksi ke server gagal');
      } finally {
        setLoading(false);
      }
    };
    fetchTrend();
  }, [studentUid]);

  // Format data untuk Recharts
  const chartData = useMemo(() => {
    return data.map((d) => {
      const date = new Date(d.tanggal_tes);
      const formattedDate = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
      });
      return {
        ...d,
        displayDate: formattedDate,
        'PHQ-9 (Depresi)': d.total_score_phq9,
        'GAD-7 (Cemas)': d.total_score_gad7,
      };
    });
  }, [data]);

  // Hitung tren analisis
  const trendAnalysis = useMemo(() => {
    if (data.length < 2) {
      return {
        text: 'Belum cukup data sesi tes untuk menganalisis tren longitudinal (butuh min. 2 sesi)',
        color: 'text-slate-400',
        icon: <Minus className="w-4 h-4" />,
      };
    }

    const n = data.length;
    const latest = data[n - 1];
    const prev = data[n - 2];

    // Cek apakah 3 sesi terakhir memburuk berturut-turut
    if (n >= 3) {
      const last3 = data.slice(-3);
      const phqWorsening = last3[2].total_score_phq9 > last3[1].total_score_phq9 && last3[1].total_score_phq9 > last3[0].total_score_phq9;
      const gadWorsening = last3[2].total_score_gad7 > last3[1].total_score_gad7 && last3[1].total_score_gad7 > last3[0].total_score_gad7;

      if (phqWorsening || gadWorsening) {
        return {
          text: 'Perlu perhatian — tren memburuk dalam 3 sesi terakhir berturut-turut',
          color: 'bg-red-50 text-red-700 border border-red-200',
          icon: <TrendingUp className="w-5 h-5 text-red-600 shrink-0" />,
          isAlert: true,
        };
      }
    }

    // Bandingkan sesi terakhir dengan rata-rata seluruh sesi sebelumnya
    let sumPhq = 0;
    let sumGad = 0;
    for (let i = 0; i < n - 1; i++) {
      sumPhq += data[i].total_score_phq9;
      sumGad += data[i].total_score_gad7;
    }
    const avgPhq = sumPhq / (n - 1);
    const avgGad = sumGad / (n - 1);

    const latestTotal = latest.total_score_phq9 + latest.total_score_gad7;
    const prevTotal = prev.total_score_phq9 + prev.total_score_gad7;
    const avgTotal = avgPhq + avgGad;

    if (latestTotal < prevTotal - 1 || latestTotal < avgTotal - 1) {
      return {
        text: 'Kondisi membaik dibanding sesi-sesi sebelumnya',
        color: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        icon: <TrendingDown className="w-5 h-5 text-emerald-600 shrink-0" />,
      };
    } else if (latestTotal > prevTotal + 1 || latestTotal > avgTotal + 1) {
      return {
        text: 'Perlu perhatian — tren skor meningkat akhir-akhir ini',
        color: 'bg-red-50 text-red-700 border border-red-200',
        icon: <TrendingUp className="w-5 h-5 text-red-600 shrink-0" />,
      };
    }

    return {
      text: 'Kondisi cenderung stabil dan konsisten',
      color: 'bg-slate-50 text-slate-700 border border-slate-200',
      icon: <Minus className="w-5 h-5 text-slate-500 shrink-0" />,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-100 rounded-2xl bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        <span className="text-xs font-semibold">Memuat grafik tren longitudinal...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-red-500 gap-2 border border-red-100 rounded-2xl bg-red-50/50 p-4 text-center">
        <AlertCircle className="w-6 h-6 text-red-600" />
        <span className="text-xs font-bold">{error}</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-100 rounded-2xl bg-white p-4 text-center">
        <Sparkles className="w-6 h-6 opacity-30" />
        <span className="text-xs font-medium">Belum ada riwayat tes untuk menampilkan grafik tren.</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header Analisis Tren */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${trendAnalysis.color}`}>
        {trendAnalysis.icon}
        <span className="text-xs font-bold leading-relaxed">{trendAnalysis.text}</span>
      </div>

      {/* Chart */}
      <div className="h-72 w-full pr-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
            />
            <YAxis
              domain={[0, 27]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingBottom: '10px' }}
            />
            
            {/* Reference Lines untuk PHQ-9 Kategori Depresi */}
            <ReferenceLine y={5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Ringan', position: 'right', fill: '#d97706', fontSize: 8, fontWeight: 700 }} />
            <ReferenceLine y={10} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Sedang', position: 'right', fill: '#ea580c', fontSize: 8, fontWeight: 700 }} />
            <ReferenceLine y={15} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Sedang Berat', position: 'right', fill: '#dc2626', fontSize: 8, fontWeight: 700 }} />
            <ReferenceLine y={20} stroke="#b91c1c" strokeDasharray="3 3" label={{ value: 'Berat', position: 'right', fill: '#991b1b', fontSize: 8, fontWeight: 700 }} />

            <Line
              type="monotone"
              dataKey="PHQ-9 (Depresi)"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="GAD-7 (Cemas)"
              stroke="#f43f5e"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-slate-400 text-center font-medium">
        Garis putus-putus horizontal menunjukkan ambang batas keparahan untuk PHQ-9 (Depresi).
      </p>
    </div>
  );
}
