'use client';
import React, { useState } from 'react';
import { Search, GraduationCap, Pencil, Trash2, Plus, School, Hash } from 'lucide-react';
import Link from 'next/link';

export default function ManajemenSiswa() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Data Siswa</h1>
          <p className="text-slate-500">Kelola informasi akademik dan akun seluruh siswa.</p>
        </div>
        <Link href="/admin/users/students/create">
          <button className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg">
            <Plus className="w-5 h-5" /> Tambah Siswa
          </button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="Cari Nama atau NISN..." />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="p-5">Siswa</th>
              <th className="p-5">Identitas (NISN)</th>
              <th className="p-5">Sekolah / Kelas</th>
              <th className="p-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-5">
                <p className="font-bold text-slate-900">Rizky Ramadhan</p>
                <p className="text-xs text-slate-400">rizky@siswa.com</p>
              </td>
              <td className="p-5 font-mono text-sm font-bold text-slate-600">0092112233</td>
              <td className="p-5">
                <p className="text-sm font-bold text-slate-700">SMP Negeri 1 Sragen</p>
                <p className="text-xs text-slate-400">Kelas 9A</p>
              </td>
              <td className="p-5 text-right space-x-2">
                <button className="p-2 text-slate-400 hover:text-slate-900">
                  <Pencil className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-400 hover:text-red-600">
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
