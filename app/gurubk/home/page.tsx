'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchApi } from '@/lib/api';

const StatCard = ({ icon: Icon, title, value, color = 'text-slate-900' }: { icon: React.ElementType; title: string; value: number | string; color?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="w-4 h-4 text-slate-500" />
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </CardContent>
  </Card>
);

export default function GuruBKDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    sekolah: { nama_sekolah: 'Memuat...', npsn: '...' },
    stats: { total_siswa: 0, tes_selesai: 0, butuh_perhatian: 0 },
    grafik: [] as any[],
  });

  const fetchDashboardData = async () => {
    try {
      const response = await fetchApi('/api/gurubk/dashboard', { cache: 'no-store' });
      const json = await response.json();

      if (response.ok && json.Data) {
        setDashboardData(json.Data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Statistik</h1>
          <p className="text-slate-500 font-medium">
            {dashboardData.sekolah.nama_sekolah} • ID: {dashboardData.sekolah.npsn}
          </p>
        </div>
        <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-600">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
        <StatCard icon={Users} title="Total Siswa" value={loading ? '...' : dashboardData.stats.total_siswa} />
        <StatCard icon={FileText} title="Tes Selesai" value={loading ? '...' : dashboardData.stats.tes_selesai} />
        <StatCard icon={AlertTriangle} title="Butuh Perhatian (Skor > 75)" value={loading ? '...' : dashboardData.stats.butuh_perhatian} color="text-red-500" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grafik Sebaran Indikasi Kesehatan Mental</CardTitle>
          <CardDescription>Berdasarkan hasil tes yang telah diselesaikan siswa.</CardDescription>
        </CardHeader>
        <CardContent className="h-96">
          {loading ? (
             <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
               <Loader2 className="w-8 h-8 animate-spin mb-3 text-slate-300" />
               <p className="font-medium text-sm">Memuat grafik...</p>
             </div>
          ) : dashboardData.grafik.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.grafik}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="kategori" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="jumlah" name="Jumlah Siswa" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
               <FileText className="w-12 h-12 mb-3 opacity-20" />
               <p className="font-medium">Belum ada data grafik histori tes siswa saat ini.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
