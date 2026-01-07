import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockBasisPengetahuanPenyakit } from '@/lib/data';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function PakarFaqPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Data Penyakit</h1>
        <Link href="/pakar/basisdata/penyakit/create">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" /> Tambah Penyakit
          </Button>
        </Link>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Kode Penyakit</TableHead>
                <TableHead>Nama Penyakit</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBasisPengetahuanPenyakit.map((penyakit) => (
                <TableRow key={penyakit.id}>
                  <TableCell className="font-medium">{penyakit.id}</TableCell>
                  <TableCell className="font-medium">{penyakit.kodepenyakit}</TableCell>
                  <TableCell>{penyakit.NamaPenyakit}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="mr-2">
                      <Pencil className="w-4 h-4" />
                    </Button>
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
