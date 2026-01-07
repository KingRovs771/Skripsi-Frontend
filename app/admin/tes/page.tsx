'use client';
import React, { useState } from 'react';
import { BarChart3, Activity, Users, ToggleLeft as Toggle, Power, History, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data untuk grafik tren
const usageData = [
  { name: 'Senin', total: 40 },
  { name: 'Selasa', total: 120 },
  { name: 'Rabu', total: 150 },
  { name: 'Kamis', total: 80 },
  { name: 'Jumat', total: 200 },
];

export default function AdminMonitoringTes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Monitoring Operasional Tes</h1>
        <p className="text-slate-500 font-medium">Pantau stabilitas sistem dan statistik penggunaan instrumen diagnosis.</p>
      </div>

      {/* STATS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Selesai', value: '1,240', icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Sesi Aktif', value: '12', icon: Activity, color: 'text-blue-600' },
          { label: 'Tes Terdaftar', value: '4', icon: BarChart3, color: 'text-slate-900' },
          { label: 'Laporan Error', value: '0', icon: ShieldAlert, color: 'text-slate-300' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
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
            <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase">Real-time Data</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="p-4">Nama Tes</th>
                <th className="p-4">Versi</th>
                <th className="p-4 text-center">Penggunaan</th>
                <th className="p-4 text-right">Akses Siswa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'PHQ-9 (Depresi)', ver: 'v2.1', total: 850, status: 'Active' },
                { name: 'GAD-7 (Kecemasan)', ver: 'v1.4', total: 390, status: 'Active' },
              ].map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 text-sm">{item.name}</td>
                  <td className="p-4 font-mono text-xs text-slate-400">{item.ver}</td>
                  <td className="p-4 text-center">
                    <span className="font-black text-slate-700">{item.total}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="inline-flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm hover:bg-red-500 transition-all">
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
            <History className="w-4 h-4 text-slate-400" /> Tren Mingguan
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={4} dot={{ r: 6, fill: '#0f172a' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase mt-4 tracking-widest">Traffic tertinggi: Jumat</p>
        </div>
      </div>
    </div>
  );
}
