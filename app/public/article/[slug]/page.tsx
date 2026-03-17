import { notFound } from "next/navigation";
import Link from "next/link";
import React from "react";
import SafeImage from "@/components/SafeImage";
import { ArrowLeft, Calendar, User, Tag, Clock } from "lucide-react";

async function getArticleDetail(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  try {
    const res = await fetch(`${baseUrl}/api/home/articles/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.Data || json.data || null;
  } catch {
    return null;
  }
}

async function getOtherArticles(currentSlug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  try {
    const res = await fetch(`${baseUrl}/api/home/articles`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    const all = json.data || json.Data || [];
    // Filter out the current article
    return all.filter((a: any) => a.article_uid !== currentSlug && a.slug !== currentSlug).slice(0, 6);
  } catch {
    return [];
  }
}

function stripHtml(html: string) {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').trim();
}

export default async function ArticleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [article, otherArticles] = await Promise.all([
    getArticleDetail(params.slug),
    getOtherArticles(params.slug),
  ]);

  if (!article) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const dateObj = new Date(article.created_at || Date.now());
  const dateString = dateObj.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Tombol Kembali */}
        <Link
          href="/public/article"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors group mb-6"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Kembali ke Daftar Artikel
        </Link>

        {/* Two-column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ===================== LEFT: Main Article ===================== */}
          <div className="w-full lg:flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

              {/* Hero Image */}
              <SafeImage
                src={`${baseUrl}/api/home/articles/${article.article_uid}/thumbnail`}
                alt={article.judul_article}
                className="w-full h-52 sm:h-72 object-cover"
              />

              <div className="p-5 sm:p-8">
                {/* Badge Kategori */}
                {article.category?.name_category && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                      <Tag className="w-3 h-3" />
                      {article.category.name_category}
                    </span>
                  </div>
                )}

                {/* Judul */}
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-4">
                  {article.judul_article}
                </h1>

                {/* Meta: Author + Tanggal */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-6 pb-5 border-b border-gray-100">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">{article.author}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {dateString}
                  </span>
                </div>

                {/* Isi Artikel */}
                <div
                  className="
                    overflow-x-hidden w-full
                    text-gray-700 text-base leading-7
                    [&_p]:mb-4 [&_p]:text-gray-700 [&_p]:w-full [&_p]:break-words
                    [&_*]:max-w-full
                    [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:break-words
                    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:break-words
                    [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-6 [&_h3]:mb-2
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4
                    [&_li]:mb-1
                    [&_a]:text-blue-600 [&_a]:underline [&_a]:break-all
                    [&_strong]:font-semibold [&_strong]:text-gray-900
                    [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_blockquote]:my-5 [&_blockquote]:break-words
                    [&_img]:rounded-lg [&_img]:my-5 [&_img]:w-full [&_img]:h-auto
                    [&_span]:break-words
                  "
                  style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                  dangerouslySetInnerHTML={{ __html: article.isi_article || '' }}
                />

                {/* Footer artikel */}
                <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
                  <Link
                    href="/public/article"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Daftar Artikel
                  </Link>
                  {article.category?.name_category && (
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                      {article.category.name_category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ============ Artikel Lainnya (Below on Mobile/Left) ============ */}
            {otherArticles.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Artikel Lainnya</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {otherArticles.slice(0, 4).map((a: any) => (
                    <Link
                      key={a.article_uid || a.slug}
                      href={`/public/article/${a.slug || a.article_uid}`}
                      className="flex gap-3 bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-shadow group"
                    >
                      <div className="w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <SafeImage
                          src={`${baseUrl}/api/home/articles/${a.article_uid}/thumbnail`}
                          alt={a.judul_article || a.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1 group-hover:text-blue-600 transition-colors">
                          {a.judul_article || a.title}
                        </p>
                        <p className="text-xs text-gray-400">{a.author}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ===================== RIGHT: Sidebar ===================== */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">

            {/* Artikel Terkait */}
            {otherArticles.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-base font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Artikel Terbaru
                </h3>
                <div className="space-y-4">
                  {otherArticles.map((a: any, idx: number) => (
                    <Link
                      key={a.article_uid || idx}
                      href={`/public/article/${a.slug || a.article_uid}`}
                      className="flex gap-3 group cursor-pointer"
                    >
                      <div className="w-16 h-12 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <SafeImage
                          src={`${baseUrl}/api/home/articles/${a.article_uid}/thumbnail`}
                          alt={a.judul_article || a.title || ''}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                          {a.judul_article || a.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{a.author}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-blue-800 mb-2">💡 Tentang MentalCare</h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Platform ini menyediakan berbagai artikel seputar kesehatan mental remaja, ditulis oleh para pakar dan profesional di bidangnya.
              </p>
              <Link
                href="/public"
                className="mt-3 inline-block text-xs font-bold text-blue-600 hover:text-blue-800 underline"
              >
                Kunjungi Beranda →
              </Link>
            </div>

            {/* Kategori */}
            {article.category?.name_category && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-gray-100">
                  Kategori Artikel
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
                  <Tag className="w-3 h-3" />
                  {article.category.name_category}
                </span>
              </div>
            )}

          </aside>

        </div>
      </div>
    </div>
  );
}
