'use client';
import React, { useState } from 'react';
import { GraduationCap, Plus, Pencil, Trash2, Search, School } from 'lucide-react';
import Link from 'next/link';

export default function ManajemenGuru() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Data Guru BK</h1>
          <p className="text-slate-500">Kelola akun Bimbingan Konseling tingkat sekolah.</p>
        </div>
        <Link href="/admin/users/teachers/create">
          <button className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg">
            <Plus className="w-5 h-5" /> Tambah Guru
          </button>
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none" placeholder="Cari Guru atau NIP..." />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="p-5">Nama / NIP</th>
              <th className="p-5">Unit Sekolah</th>
              <th className="p-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-5">
                <p className="font-bold text-slate-900">Budi Santoso, S.Pd</p>
                <p className="text-xs font-mono text-slate-400">NIP. 19880212 201503 1 002</p>
              </td>
              <td className="p-5">
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-blue-500" />
                  <span className="font-bold text-slate-700 text-sm">SMK Negeri 1 Sragen</span>
                </div>
              </td>
              <td className="p-5 text-right">
                <button className="p-2 text-slate-400 hover:text-slate-900 transition-all">
                  <Pencil className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-400 hover:text-red-600 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
