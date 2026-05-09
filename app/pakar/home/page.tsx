'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FileText, AlertTriangle, Loader2, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

const StatCard = ({ icon: Icon, title, value, description, color, loading }: {
  icon: React.ElementType;
  title: string;
  value: number | string;
  description?: string;
  color: 'blue' | 'emerald' | 'rose' | 'amber';
  loading: boolean;
}) => {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-600',
    emerald: 'text-emerald-600 bg-emerald-600',
    rose: 'text-rose-600 bg-rose-600',
    amber: 'text-amber-600 bg-amber-600',
  };

  const selectedColor = colorMap[color];
  const bgMain = selectedColor.split(' ')[1];
  const textColor = selectedColor.split(' ')[0];

  return (
    <Card className="overflow-hidden border-none shadow-md bg-white">
      <div className={`h-1 w-full ${bgMain}`} />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${bgMain}/10 ${textColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
        ) : (
          <>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
            {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default function PakarDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    stats: { total_siswa: number; tes_selesai: number; butuh_perhatian: number };
    grafik: { kategori: string; jumlah: number }[];
  } | null>(null);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const res = await fetchApi('/api/pakar/dashboard');
        const json = await res.json();

        if (res.ok) {
          setData(json.Data || json.data);
        } else {
          toast.error(json.Message || 'Gagal memuat data dashboard');
        }
      } catch (error) {
        console.error('Dashboard Error:', error);
        toast.error('Koneksi server terputus');
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, []);

  // Format data untuk Recharts dengan pengamanan ekstra
  const chartData = (data?.grafik || []).map(item => ({
    name: item.kategori || 'Tidak Diketahui',
    jumlah: item.jumlah
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Ringkasan</h1>
        <p className="text-slate-500 mt-1">Pantau statistik kesehatan mental siswa secara real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          title="Total Siswa"
          value={data?.stats?.total_siswa || 0}
          description="Terdaftar dalam sistem"
          color="blue"
          loading={loading}
        />
        <StatCard
          icon={FileText}
          title="Tes Selesai"
          value={data?.stats?.tes_selesai || 0}
          description="Diagnosis yang dihasilkan"
          color="emerald"
          loading={loading}
        />
        <StatCard
          icon={AlertTriangle}
          title="Butuh Perhatian"
          value={data?.stats?.butuh_perhatian || 0}
          description="Confidence score > 75%"
          color="rose"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-md overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Sebaran Indikasi Mental
              </CardTitle>
              <CardDescription>Berdasarkan diagnosis final sistem</CardDescription>
            </div>
            {!loading && <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Live Update
            </div>}
          </CardHeader>
          <CardContent className="h-[400px] mt-4">
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm text-slate-400">Menyusun grafik...</p>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="jumlah" radius={[6, 6, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <FileText className="w-12 h-12 opacity-20" />
                <p className="text-sm">Belum ada data diagnosis tersedia.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Informasi Sistem</CardTitle>
            <CardDescription>Status server dan database saat ini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-slate-700">API Server</span>
              </div>
              <span className="text-xs font-bold text-emerald-600">ONLINE</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-slate-700">Database</span>
              </div>
              <span className="text-xs font-bold text-emerald-600">CONNECTED</span>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Tips Pakar</h4>
              <ul className="space-y-3">
                {[
                  'Tinjau hasil diagnosis dengan confidence score tinggi.',
                  'Perbarui basis pengetahuan secara berkala.',
                  'Gunakan artikel untuk memberikan edukasi ke siswa.'
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3 text-xs text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
