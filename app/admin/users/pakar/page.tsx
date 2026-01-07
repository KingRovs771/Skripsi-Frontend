'use client';
import React, { useState } from 'react';
import { Stethoscope, Plus, Pencil, Trash2, ShieldCheck, Mail } from 'lucide-react';
import Link from 'next/link';

export default function ManajemenPakar() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Data Pakar</h1>
          <p className="text-slate-500">Manajemen tenaga ahli Psikologi dan Psikiater.</p>
        </div>
        <Link href="/admin/users/pakar/create">
          <button className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg">
            <Plus className="w-5 h-5" /> Registrasi Pakar
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card Style untuk Pakar agar lebih Eksklusif */}
        <div className="bg-white border-2 border-slate-200 rounded-[32px] p-6 shadow-sm hover:border-purple-500 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Stethoscope className="w-7 h-7" />
            </div>
            <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase">Aktif</span>
          </div>
          <h3 className="font-black text-xl text-slate-900">Dr. Sarah Smith</h3>
          <p className="text-sm font-bold text-purple-600 mb-4 tracking-tight">Psikolog Klinis</p>

          <div className="space-y-2 border-t border-slate-50 pt-4">
            <div className="flex items-center text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-3 h-3 mr-2" /> SIP: 2025/HEALTH/001
            </div>
            <div className="flex items-center text-xs text-slate-500 font-medium">
              <Mail className="w-3 h-3 mr-2" /> sarah@pakar.com
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">Edit</button>
            <button className="p-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
