'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Shield, Award, Fingerprint, Camera, Key, LogOut, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

export interface Role {
  role_id: number;
  role_uid: string;
  role_name: string;
  description: string;
  created_at: string;
  update_at: string;
}

export interface Administrator {
  admin_id: number;
  admin_uid: string;
  role_uid: string;
  nama_lengkap: string;
  phone: string;
  email: string;
  alamat: string;
  password?: string;
  face_data?: string;
  created_at: string;
  update_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<Administrator | null>(null);
  const [roleInfo, setRoleInfo] = useState<Role | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetchApi('/api/profileAdministrator', {
          method: 'GET',
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || 'Gagal mengambil data profil. Silakan login kembali.');
        }

        const adminData = data.Data || data.admin || data;
        setAdmin(adminData);
        if (data.Role) {
          setRoleInfo(data.Role);
        } else {
          setRoleInfo({
            role_id: 1,
            role_uid: adminData.role_uid,
            role_name: adminData.role_name,
            description: 'Memiliki akses khusus pada dashboard administrasi.',
            created_at: '',
            update_at: ''
          });
        }
      } catch (error: any) {
        toast.error(error.message);
        router.push('/auth/login/admin');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetchApi('/auth/logoutAdmin', {
        method: 'POST',
      }).catch((err) => {
        console.warn('Gagal memanggil API logout backend, mengeksekusi logout lokal.', err);
      });

      localStorage.removeItem('token');
      toast.success('Berhasil logout dari sistem.');
      router.push('/auth/login/admin');
    } catch (error) {
      toast.error('Kehilangan konektivitas saat logout.');
    }
  };

  if (loading || !admin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        <p className="text-sm font-medium text-slate-500">Memuat data profil...</p>
      </div>
    );
  }

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
                  {admin.face_data ? (
                    <img src={`data:image/jpeg;base64,${admin.face_data}`} alt="Profile" className="object-cover w-full h-full" />
                  ) : (
                    <User className="w-16 h-16 text-slate-400" />
                  )}
                </div>
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center md:text-left pt-11">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{admin.nama_lengkap}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full flex items-center">
                  <Shield className="w-3 h-3 mr-1" /> {roleInfo?.role_name || 'Admin'}
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
              <button className="text-sm font-bold text-slate-900 hover:underline">Edit Profil</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                  <Mail className="w-3 h-3 mr-1" /> Email
                </label>
                <p className="text-slate-900 font-medium">{admin.email}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                  <Phone className="w-3 h-3 mr-1" /> No. Telepon
                </label>
                <p className="text-slate-900 font-medium">{admin.phone || '-'}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                  <MapPin className="w-3 h-3 mr-1" /> Alamat Lengkap
                </label>
                <p className="text-slate-900 font-medium leading-relaxed">{admin.alamat || 'Belum ada data alamat'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
                <Award className="w-4 h-4 mr-2 text-slate-400" /> Informasi Akses
              </h4>
              <div className="p-5 bg-slate-900 text-white rounded-2xl shadow-inner">
                <div className="grid gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Role UID</label>
                    <p className="text-sm font-mono text-slate-300">{admin.role_uid}</p>
                  </div>
                  {roleInfo?.description && (
                    <div>
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Deskripsi Akses</label>
                      <p className="text-sm text-white/90">{roleInfo.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Keamanan & Status */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-6">
            <h3 className="font-bold text-slate-900">Spesifikasi Akun</h3>
            <div className="flex flex-col gap-3">
              <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl text-left border border-slate-100">
                <p className="text-xs font-bold uppercase mb-1">Admin UID</p>
                <p className="text-sm font-mono break-all">{admin.admin_uid}</p>
              </div>
              {admin.created_at && (
                <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl text-left border border-blue-100">
                  <p className="text-xs font-bold uppercase mb-1">Akun Dibuat</p>
                  <p className="text-sm font-medium">{new Date(admin.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              )}
              {admin.update_at && (
                <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl text-left border border-slate-100">
                  <p className="text-xs font-bold uppercase mb-1">Terakhir Diperbarui</p>
                  <p className="text-sm font-medium">{new Date(admin.update_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all group"
            >
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
                <p className="text-xs text-slate-500 mt-1">Sistem menggunakan Role UID terenkripsi untuk otorisasi yang aman.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
