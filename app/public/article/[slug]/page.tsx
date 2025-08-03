import { mockArticles } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ArticleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = mockArticles.find((a) => a.slug === params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
      <Image
        src={article.thumbnail}
        alt={article.title}
        width={1200}
        height={600}
        className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
      />
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
        {article.title}
      </h1>
      <p className="text-slate-500 mb-8">
        {article.author} • {article.date}
      </p>
      <div className="prose lg:prose-xl max-w-none text-slate-700">
        <p className="lead">{article.summary}</p>
        <h3>Apa Itu Gangguan Kecemasan?</h3>
        <p>
          Gangguan kecemasan adalah kondisi kesehatan mental yang ditandai
          dengan perasaan khawatir, cemas, atau takut yang cukup kuat untuk
          mengganggu aktivitas sehari-hari. Berbeda dengan kecemasan biasa yang
          datang dan pergi, gangguan kecemasan bersifat persisten dan dapat
          memburuk seiring waktu jika tidak ditangani.
        </p>
        <h3>Gejala Umum pada Remaja</h3>
        <ul>
          <li>
            Rasa khawatir yang berlebihan tentang berbagai hal (sekolah, teman,
            masa depan).
          </li>
          <li>Kesulitan berkonsentrasi dan mudah tersinggung.</li>
          <li>Menghindari situasi sosial atau tempat-tempat tertentu.</li>
          <li>
            Gejala fisik seperti sakit perut, sakit kepala, detak jantung cepat,
            atau gemetar.
          </li>
        </ul>
        <h3>Bagaimana Cara Mengelolanya?</h3>
        <p>
          Mengelola kecemasan adalah sebuah proses. Langkah pertama adalah
          menyadari dan menerima bahwa apa yang Anda rasakan adalah valid.
          Berbicara dengan orang dewasa yang tepercaya, seperti orang tua, guru,
          atau konselor sekolah, adalah langkah penting. Selain itu, teknik
          relaksasi seperti pernapasan dalam, mindfulness, dan aktivitas fisik
          teratur dapat sangat membantu mengurangi gejala kecemasan.
        </p>
        <p>
          Ingat, mencari bantuan adalah tanda kekuatan, bukan kelemahan. Ada
          banyak sumber daya yang tersedia untuk membantu Anda merasa lebih
          baik.
        </p>
      </div>
      <div className="mt-12 text-center">
        <Button asChild variant="outline">
          <Link href="/artikel">← Kembali ke Daftar Artikel</Link>
        </Button>
      </div>
    </div>
  );
}
