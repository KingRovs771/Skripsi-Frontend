'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FileText, AlertTriangle, Server, Database, RefreshCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchApi } from '@/lib/api';

// Komponen Card Statistik yang sudah ada
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

export default function AdminDashboardPage() {
  const [serverStatus, setServerStatus] = useState<'online' | 'offline'>('offline');
  const [dbStatus, setDbStatus] = useState<'online' | 'offline'>('offline');
  const [isChecking, setIsChecking] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    testsTaken: 0,
    needsAttention: 0,
    chartData: [] as any[],
  });

  // Fungsi untuk mengambil data dashboard full ke Backend Go (/healthcheck)
  const fetchDashboardData = async () => {
    setIsChecking(true);
    try {
      const response = await fetchApi('/api/admin/healthcheck', { cache: 'no-store' });
      const json = await response.json();

      if (response.ok && json.Data) {
        const { status_system, stats, grafik } = json.Data;

        // Update Server Status UI
        setServerStatus(status_system.api_server === 'ONLINE' ? 'online' : 'offline');
        setDbStatus(status_system.database === 'CONNECTED' ? 'online' : 'offline');

        // Update Stat Cards dan Charts
        setDashboardData({
          totalStudents: stats.total_siswa || 0,
          testsTaken: stats.tes_selesai || 0,
          needsAttention: stats.butuh_perhatian || 0,
          chartData: grafik ? grafik.map((g: any) => ({
            name: g.kategori,
            "Jumlah Siswa": g.jumlah
          })) : []
        });
      } else {
        setServerStatus('offline');
        setDbStatus('offline');
      }
    } catch (error) {
      setServerStatus('offline');
      setDbStatus('offline');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Sinkronisasi otomatis setiap 30 detik
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Statistik</h1>
        <button onClick={fetchDashboardData} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
          <RefreshCcw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Monitoring Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-l-4 border-l-slate-900 shadow-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${serverStatus === 'online' ? 'bg-green-50' : 'bg-red-50'}`}>
                <Server className={`w-6 h-6 ${serverStatus === 'online' ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">API Server Status</p>
                <h3 className="text-xl font-bold uppercase tracking-tight">{serverStatus === 'online' ? 'Service Online' : 'Service Offline'}</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`relative flex h-3 w-3`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${serverStatus === 'online' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${serverStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase">{serverStatus}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-slate-900 shadow-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${dbStatus === 'online' ? 'bg-green-50' : 'bg-red-50'}`}>
                <Database className={`w-6 h-6 ${dbStatus === 'online' ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">PostgreSQL Database</p>
                <h3 className="text-xl font-bold uppercase tracking-tight">{dbStatus === 'online' ? 'DB Connected' : 'DB Disconnected'}</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`relative flex h-3 w-3`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dbStatus === 'online' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${dbStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase">{dbStatus}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={Users} title="Total Siswa Terdaftar" value={dashboardData.totalStudents} />
        <StatCard icon={FileText} title="Tes Selesai" value={dashboardData.testsTaken} />
        <StatCard icon={AlertTriangle} title="Butuh Perhatian (Skor > 75)" value={dashboardData.needsAttention} color="text-red-600" />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Grafik Sebaran Indikasi Kesehatan Mental</CardTitle>
          <CardDescription>Berdasarkan hasil tes keseluruhan yang telah diselesaikan siswa.</CardDescription>
        </CardHeader>
        <CardContent className="h-96 w-full">
          {dashboardData.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="Jumlah Siswa" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={60} />
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
