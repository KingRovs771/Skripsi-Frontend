"use client";
import React, { useState, useMemo } from "react";
import ArticleCard from "@/components/ArticleCard";
import { Input } from "@/components/ui/input";
import { mockArticles } from "@/lib/data";
import { Search } from "lucide-react";

export default function ArticleListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Semua");

  const filteredArticles = useMemo(() => {
    return mockArticles
      .filter(
        (article) =>
          filterCategory === "Semua" || article.category === filterCategory
      )
      .filter((article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [searchTerm, filterCategory]);

  const categories = ["Semua", ...new Set(mockArticles.map((a) => a.category))];

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
        {filteredArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
