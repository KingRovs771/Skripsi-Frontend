"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, FileText, AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { mockDashboardData } from "@/lib/data"; // Pastikan Anda sudah memisahkan mock data

const StatCard = ({
  icon: Icon,
  title,
  value,
  color = "text-slate-900",
}: {
  icon: React.ElementType;
  title: string;
  value: number | string;
  color?: string;
}) => (
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
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Statistik</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Total Siswa"
          value={mockDashboardData.totalStudents}
        />
        <StatCard
          icon={FileText}
          title="Tes Selesai"
          value={mockDashboardData.testsTaken}
        />
        <StatCard
          icon={AlertTriangle}
          title="Butuh Perhatian"
          value={mockDashboardData.needsAttention}
          color="text-red-500"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Grafik Sebaran Indikasi Kesehatan Mental</CardTitle>
          <CardDescription>
            Berdasarkan hasil tes yang telah diselesaikan siswa.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockDashboardData.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Jumlah Siswa" fill="#0f172a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
