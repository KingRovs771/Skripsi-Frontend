import Link from "next/link";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/ArticleCard";
import { mockArticles } from "@/lib/data";

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-100 to-slate-50 py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            Kesehatan Mentalmu, Prioritas Utama.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600">
            Sistem pakar kami membantu mendeteksi dini potensi masalah kesehatan
            mental. Kenali dirimu lebih baik dan temukan dukungan yang tepat.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild className="px-8 py-3 text-lg">
              <Link href="/public/test">Mulai Tes</Link>
            </Button>
            <Button variant="outline" asChild className="px-8 py-3 text-lg">
              <Link href="/public/article">Baca Artikel</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Tentang Sistem Pakar Kami
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-slate-600">
              Aplikasi ini menggunakan metode sistem pakar dengan kaidah IF-THEN
              (backward chaining) yang dirancang bersama para ahli psikologi
              untuk memberikan indikasi awal. Ini bukan diagnosis medis,
              melainkan alat bantu untuk meningkatkan kesadaran diri.
            </p>
          </div>
        </div>
      </section>

      {/* Articles Preview */}
      <section className="bg-slate-100 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Artikel Edukatif Terbaru
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockArticles.slice(0, 3).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
