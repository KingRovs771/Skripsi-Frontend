'use client';
import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, BookOpen, Award, Fingerprint, Camera, Key, Save, LogOut, Loader2 } from 'lucide-react';

// Simulasi Role (Biasanya didapat dari Context/Auth)
type Role = 'ADMIN' | 'PAKAR' | 'GURU' | 'SISWA';

export default function ProfilePage() {
  const [role, setRole] = useState<Role>('PAKAR'); // Contoh Role Pakar
  const [loading, setLoading] = useState(false);

  // Data tambahan berdasarkan Role
  const renderRoleSpecificInfo = () => {
    switch (role) {
      case 'SISWA':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <label className="text-xs font-bold text-slate-400 uppercase">NISN</label>
              <p className="text-slate-900 font-mono">0092837465</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <label className="text-xs font-bold text-slate-400 uppercase">Kelas</label>
              <p className="text-slate-900">XII IPA 1</p>
            </div>
          </div>
        );
      case 'GURU':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <label className="text-xs font-bold text-slate-400 uppercase">NIP</label>
              <p className="text-slate-900 font-mono">19880212 201503 1 002</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <label className="text-xs font-bold text-slate-400 uppercase">Wali Kelas</label>
              <p className="text-slate-900">X IPS 2</p>
            </div>
          </div>
        );
      case 'PAKAR':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <label className="text-xs font-bold text-slate-400 uppercase">Spesialisasi</label>
              <p className="text-slate-900">Psikolog Klinis</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <label className="text-xs font-bold text-slate-400 uppercase">No. Izin Praktik (SIP)</label>
              <p className="text-slate-900">SIP/2025/001-HEALTH</p>
            </div>
          </div>
        );
      case 'ADMIN':
        return (
          <div className="p-4 bg-slate-900 text-white rounded-xl shadow-inner">
            <label className="text-xs font-bold text-white/50 uppercase">Tingkat Akses</label>
            <p className="text-lg font-bold">Super Administrator</p>
            <p className="text-xs text-white/60">Memiliki akses penuh ke konfigurasi sistem.</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Profile */}
      <div className="relative h-48 bg-slate-900 rounded-3xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-200 via-slate-900 to-slate-900"></div>
      </div>

      <div className="px-6 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-2xl">
                <div className="w-full h-full rounded-[20px] bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-100">
                  <User className="w-16 h-16 text-slate-400" />
                  {/* <img src="/avatar.jpg" className="object-cover" /> */}
                </div>
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center md:text-left pt-4">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Drs. Ahmad Subarjo</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full flex items-center">
                  <Shield className="w-3 h-3 mr-1" /> {role}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Aktif</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
              <Key className="w-4 h-4 mr-2" /> Ganti Password
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Informasi Personal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                <Fingerprint className="w-5 h-5 mr-2 text-slate-400" /> Detail Profil
              </h3>
              <button className="text-sm font-bold text-slate-900 hover:underline">Edit</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                  <Mail className="w-3 h-3 mr-1" /> Email
                </label>
                <p className="text-slate-900 font-medium">ahmad.subarjo@sekolah.sch.id</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                  <Phone className="w-3 h-3 mr-1" /> No. Telepon
                </label>
                <p className="text-slate-900 font-medium">+62 812 3456 7890</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                  <MapPin className="w-3 h-3 mr-1" /> Alamat Lengkap
                </label>
                <p className="text-slate-900 font-medium leading-relaxed">Jl. Merdeka No. 123, Kelurahan Bahagia, Kota Sragen, Jawa Tengah.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
                <Award className="w-4 h-4 mr-2 text-slate-400" /> Informasi {role}
              </h4>
              {renderRoleSpecificInfo()}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Keamanan & Status */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-6">
            <h3 className="font-bold text-slate-900">Keamanan Akun</h3>
            <div className="flex flex-col gap-3">
              <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl text-left border border-blue-100">
                <p className="text-xs font-bold uppercase mb-1">Terakhir Login</p>
                <p className="text-sm font-medium">Selasa, 30 Des 2025</p>
              </div>
              <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl text-left border border-slate-100">
                <p className="text-xs font-bold uppercase mb-1">Lokasi Akses</p>
                <p className="text-sm font-medium">Sragen, Indonesia</p>
              </div>
            </div>
            <button className="w-full flex items-center justify-center py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all group">
              <LogOut className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" /> Logout
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-inner">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-900 rounded-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Privasi Terjamin</h4>
                <p className="text-xs text-slate-500 mt-1">Data Anda diamankan dengan enkripsi standar industri.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
