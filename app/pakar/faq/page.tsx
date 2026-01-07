import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockFaqData } from '@/lib/data';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function PakarFaqPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Data Tanya Jawab</h1>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Kode UID</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFaqData.map((faqData) => (
                <TableRow key={faqData.id}>
                  <TableCell className="font-medium">{faqData.nomor}</TableCell>
                  <TableCell>{faqData.kodeUID}</TableCell>
                  <TableCell>{faqData.namaLengkap}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">{faqData.status}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Link href={`/pakar/faq/reply/${faqData.id}`}>
                      <Button variant="ghost" size="icon" className="mr-2">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
