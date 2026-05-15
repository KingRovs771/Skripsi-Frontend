"use client";
import React, { useState, useMemo, useEffect } from "react";
import ArticleCard from "@/components/ArticleCard";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function ArticleListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetchApi('/api/home/articles');
        const json = await res.json();
        setArticles(json.Data || []);
      } catch (err) {
        console.error("Gagal mendapatkan artikel:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    return articles
      .filter(
        (article) =>
          filterCategory === "Semua" || article.category_name === filterCategory
      )
      .filter((article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [searchTerm, filterCategory, articles]);

  const categories = ["Semua", ...new Set(articles.map((a) => a.category_name).filter(Boolean))];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Artikel Kesehatan Mental</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Cari judul artikel..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-slate-300 bg-white px-3 py-2"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
             <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
          </div>
        ) : filteredArticles.length > 0 ? (
          filteredArticles.map((article: any, idx: number) => (
            <ArticleCard key={article.slug || idx} article={article} />
          ))
        ) : (
          <div className="col-span-full text-center text-slate-500 py-12">
            Belum ada artikel yang cocok dengan pencarian Anda.
          </div>
        )}
      </div>
    </div>
  );
}
