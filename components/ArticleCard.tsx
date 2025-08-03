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
  id: number;
  slug: string;
  title: string;
  summary: string;
  date: string;
  author: string;
  thumbnail: string;
};

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <Link href={`/public/article/${article.slug}`}>
        <Image
          src={article.thumbnail}
          alt={article.title}
          width={600}
          height={400}
          className="w-full h-48 object-cover"
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
        <p className="text-slate-600 line-clamp-3">{article.summary}</p>
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
