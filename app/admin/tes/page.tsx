'use client';
import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, Power, History, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchApi } from '@/lib/api';

export default function AdminMonitoringTes() {
  const [loading, setLoading] = useState(true);
  const [monitorData, setMonitorData] = useState({
    stats: {
      totalSelesai: 0,
      sesiAktif: 0,
      tesTerdaftar: 2,
      laporanError: 0
    },
    instrumenStatus: [] as any[],
    trenMingguan: [] as any[]
  });

  const fetchMonitoring = async () => {
    try {
      const res = await fetchApi('/api/admin/healthcheck');
      const json = await res.json();
      if (res.ok && json.Data) {
        const d = json.Data;
        setMonitorData({
          stats: {
            totalSelesai: d.stats.tes_selesai,
            sesiAktif: d.stats.sesi_aktif,
            tesTerdaftar: 2,
            laporanError: 0
          },
          instrumenStatus: d.instrumen_status || [],
          trenMingguan: d.tren_mingguan?.map((t: any) => ({
            name: t.hari,
            total: t.total
          })) || []
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoring();
    const interval = setInterval(fetchMonitoring, 10000); // Update setiap 10 detik
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-200 mb-4" />
        <p className="text-slate-400 font-medium">Menghubungkan ke Monitoring System...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Monitoring Operasional Tes</h1>
        <p className="text-slate-500 font-medium">Pantau stabilitas sistem dan statistik penggunaan instrumen diagnosis.</p>
      </div>

      {/* STATS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Selesai', value: monitorData.stats.totalSelesai.toLocaleString(), icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Sesi Aktif', value: monitorData.stats.sesiAktif.toLocaleString(), icon: Activity, color: 'text-blue-600' },
          { label: 'Tes Terdaftar', value: monitorData.stats.tesTerdaftar, icon: BarChart3, color: 'text-slate-900' },
          { label: 'Laporan Error', value: monitorData.stats.laporanError, icon: ShieldAlert, color: 'text-slate-300' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TABEL KONTROL SISTEM */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Status Instrumen Live</h3>
            <span className="text-[10px] font-black bg-green-50 text-green-600 px-3 py-1 rounded-full uppercase tracking-widest">Real-time Data</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="p-4">Nama Tes</th>
                <th className="p-4 text-center">Total Penggunaan</th>
                <th className="p-4 text-right">Akses Sistem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monitorData.instrumenStatus.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 text-sm">{item.nama}</td>
                  <td className="p-4 text-center">
                    <span className="font-black text-slate-700">{item.total}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="inline-flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm hover:opacity-80 transition-all">
                      <Power className="w-3 h-3" /> {item.status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GRAFIK TREN PENGGUNAAN */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" /> Tren Aktivitas (7 Hari)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monitorData.trenMingguan}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#0f172a" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#0f172a', strokeWidth: 0 }} 
                  activeDot={{ r: 8, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase mt-4 tracking-widest italic">Data diupdate otomatis setiap 10 detik</p>
        </div>
      </div>
    </div>
  );
}

