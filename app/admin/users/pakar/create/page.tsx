'use client';
import React from 'react';
import { ArrowLeft, Save, Stethoscope, ShieldCheck, Mail, Phone, Lock, UserCircle, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CreatePakar() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users/pakar" className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Daftar Pakar
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Registrasi Pakar Baru</h1>
        <p className="text-slate-500 text-sm">Daftarkan tenaga ahli psikologi atau psikiater untuk verifikasi diagnosis klinis.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <form className="p-8 space-y-8">
          {/* Section 1: Profil Profesional */}
          <section className="space-y-6">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Stethoscope className="w-4 h-4 text-purple-600" /> Informasi Profesional
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nama Lengkap & Gelar</label>
                <input className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none transition-all" placeholder="Contoh: Dr. Sarah Smith, M.Psi" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nomor SIP (Izin Praktik)</label>
                <input className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none transition-all" placeholder="SIP/2026/XXX" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Spesialisasi</label>
                <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none transition-all appearance-none">
                  <option>Psikolog Klinis</option>
                  <option>Psikiater (Sp.KJ)</option>
                  <option>Konselor Kesehatan Mental</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">No. Telepon Aktif</label>
                <input className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none transition-all" placeholder="0812xxxx" />
              </div>
            </div>
          </section>

          {/* Section 2: Akun Login */}
          <section className="space-y-6">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Mail className="w-4 h-4 text-purple-600" /> Akses Sistem
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Alamat Email</label>
                <input type="email" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none transition-all" placeholder="sarah@pakar.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <input type="password" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none transition-all" placeholder="********" />
              </div>
            </div>
          </section>

          <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
            <Link href="/admin/users/pakar" className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
              Batal
            </Link>
            <button className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg">Simpan Data</button>
          </div>
        </form>
      </div>
    </div>
  );
}
