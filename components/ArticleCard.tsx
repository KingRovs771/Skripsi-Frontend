"use client";
import React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Definisikan tipe untuk prop 'article'
type Article = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  author: string;
  thumbnail: string;
};

// Helpert utk hapus tags HTML dari Content Summary
const stripHtml = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
};

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <Link href={`/public/article/${article.slug}`}>
        {/* Menggunakan tag img standar agar tidak error dari domain backend yg blm di-whitelist */}
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/home/articles/${article.slug}/thumbnail`}
          alt={article.title}
          className="w-full h-96 object-cover"
          onError={(e) => {
            // Fallback skeleton/logo jika gambar kosong di database
            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' font-weight='600' fill='%2394a3b8'%3EGambar Tidak Tersedia%3C/text%3E%3C/svg%3E";
          }}
        />
      </Link>
      <CardHeader>
        <CardTitle>
          <Link
            href={`/public/article/${article.slug}`}
            className="hover:text-slate-700"
          >
            {article.title}
          </Link>
        </CardTitle>
        <CardDescription className="mt-2 text-slate-500">
          {article.date} • {article.author}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-slate-600 line-clamp-3 text-sm">{stripHtml(article.summary)}</p>
      </CardContent>
      <CardFooter>
        <Button variant="link" className="p-0 h-auto font-semibold" asChild>
          <Link href={`/public/article/${article.slug}`}>
            Baca Selengkapnya →
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
