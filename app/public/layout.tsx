import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
    </div>
  );
}
