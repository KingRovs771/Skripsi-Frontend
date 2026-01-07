'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FileText, AlertTriangle, Activity, Server, Database, Wifi, WifiOff, RefreshCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockDashboardData } from '@/lib/data';

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

  // Fungsi untuk mengecek status ke Backend Go
  const checkHealth = async () => {
    setIsChecking(true);
    try {
      // Pastikan Anda membuat endpoint /api/health di Go
      const response = await fetch('http://localhost:8080/api/health', { cache: 'no-store' });
      const data = await response.json();

      if (response.ok) {
        setServerStatus('online');
        setDbStatus(data.database === 'connected' ? 'online' : 'offline');
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
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Cek otomatis setiap 30 detik
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Statistik</h1>
        <button onClick={checkHealth} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95">
          <RefreshCcw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Monitoring Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-l-4 border-l-slate-900">
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

        <Card className="border-l-4 border-l-slate-900">
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
        <StatCard icon={Users} title="Total Siswa" value={mockDashboardData.totalStudents} />
        <StatCard icon={FileText} title="Tes Selesai" value={mockDashboardData.testsTaken} />
        <StatCard icon={AlertTriangle} title="Butuh Perhatian" value={mockDashboardData.needsAttention} color="text-red-500" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grafik Sebaran Indikasi Kesehatan Mental</CardTitle>
          <CardDescription>Berdasarkan hasil tes yang telah diselesaikan siswa.</CardDescription>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockDashboardData.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Legend />
              <Bar dataKey="Jumlah Siswa" fill="#0f172a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
