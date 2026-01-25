"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Hash,
  School,
  User,
  Lock,
  Search,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

export default function CreateSiswa() {
  const [npsnSearch, setNpsnSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState({ npsn: "", nama_sekolah: "" });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users/students"
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Siswa
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          Tambah Siswa Baru
        </h1>
        <p className="text-slate-500 text-sm">
          Pastikan NISN dan data sekolah sudah sesuai untuk keperluan pelaporan.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <form className="p-8 space-y-8">
          {/* Section 1: Identitas */}
          <section className="space-y-6">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Hash className="w-4 h-4 text-blue-600" /> Identitas Siswa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Nomor Induk (NISN)
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="0092xxxxxx"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Nama Lengkap
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Contoh: Rizky Ramadhan"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Nomor Whatsapp
              </label>
              <input
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="0821xxxxxxxx"
              />
            </div> 
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Alamat
              </label>
              <textarea
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Contoh: Rizky Ramadhan"
              />
            </div>
          </section>

          {/* Section 2: Akademik */}
          <section className="space-y-6">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <GraduationCap className="w-4 h-4 text-blue-600" /> Informasi
              Akademik
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2 relative">
                <label className="text-sm font-medium text-slate-700">
                  Cari Sekolah (NPSN)
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                    placeholder="Ketik NPSN atau Nama Sekolah..."
                    value={formData.nama_sekolah || npsnSearch}
                    onChange={(e) => setNpsnSearch(e.target.value)}
                  />
                  {formData.npsn && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Jenjang
                </label>
                <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none">
                  <option>SMA / SMK / MA</option>
                  <option>SMP / MTs</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Kelas
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Contoh: XII RPL 1"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Akun */}
          <section className="space-y-6">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Lock className="w-4 h-4 text-blue-600" /> Akses Login
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Email Siswa
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="siswa@mail.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Password Default
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="********"
                />
              </div>
            </div>
          </section>

          <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
            <Link
              href="/admin/users/students"
              className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
            >
              Batal
            </Link>
            <button className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg">
              Simpan Data Siswa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
