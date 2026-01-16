export const mockArticles = [
  {
    id: 1,
    slug: 'mengenal-kecemasan',
    title: 'Mengenal Gangguan Kecemasan di Kalangan Remaja',
    summary: 'Kecemasan adalah hal yang wajar, namun bisa menjadi masalah jika berlebihan. Pelajari gejalanya di sini.',
    category: 'Kecemasan',
    author: 'Dr. Anisa',
    date: '2024-07-28',
    content: 'Konten lengkap artikel tentang gangguan kecemasan...',
    thumbnail: 'https://placehold.co/600x400/a7c5eb/ffffff?text=Kecemasan',
  },
  {
    id: 2,
    slug: 'strategi-melawan-stres',
    title: '5 Strategi Efektif Melawan Stres Jelang Ujian',
    summary: 'Jangan biarkan stres mengganggu persiapan ujianmu. Coba lima strategi jitu ini untuk tetap tenang dan fokus.',
    category: 'Stres',
    author: 'Budi Santoso, M.Psi.',
    date: '2024-07-25',
    content: 'Konten lengkap artikel tentang strategi stres...',
    thumbnail: 'https://placehold.co/600x400/c1e1c1/ffffff?text=Stres',
  },
  {
    id: 3,
    slug: 'pentingnya-tidur-cukup',
    title: 'Pentingnya Tidur Cukup untuk Kesehatan Mental',
    summary: 'Tidur bukan hanya soal istirahat fisik. Kualitas tidur sangat berpengaruh pada kestabilan emosi dan mental.',
    category: 'Gaya Hidup',
    author: 'Dr. Anisa',
    date: '2024-07-22',
    content: 'Konten lengkap artikel tentang pentingnya tidur...',
    thumbnail: 'https://placehold.co/600x400/b2d8d8/ffffff?text=Tidur',
  },
  {
    id: 4,
    slug: 'social-media-detox',
    title: 'Manfaat Detoks Media Sosial untuk Ketenangan Jiwa',
    summary: 'Terlalu banyak media sosial bisa melelahkan. Cari tahu kapan dan bagaimana cara melakukan detoks yang sehat.',
    category: 'Gaya Hidup',
    author: 'Budi Santoso, M.Psi.',
    date: '2024-07-20',
    content: 'Konten lengkap artikel tentang detoks medsos...',
    thumbnail: 'https://placehold.co/600x400/e6ccb2/ffffff?text=Medsos',
  },
];

export const mockQuestions = [
  {
    id: 1,
    text: 'Saya merasa tegang, cemas, atau gelisah tanpa alasan yang jelas.',
  },
  {
    id: 2,
    text: 'Saya tidak mampu menghentikan atau mengendalikan rasa khawatir.',
  },
  {
    id: 3,
    text: 'Saya mudah merasa kesal, tidak sabar, atau marah pada hal-hal kecil.',
  },
  {
    id: 4,
    text: 'Saya kehilangan minat atau kesenangan dalam melakukan hobi atau aktivitas yang biasanya saya nikmati.',
  },
  {
    id: 5,
    text: 'Saya merasa sedih, putus asa, atau merasa murung hampir sepanjang hari.',
  },
  {
    id: 6,
    text: 'Saya mengalami kesulitan untuk tidur, sering terbangun, atau tidur terlalu banyak.',
  },
  {
    id: 7,
    text: 'Saya merasa lelah atau kekurangan energi hampir setiap hari.',
  },
  {
    id: 8,
    text: 'Saya sulit berkonsentrasi pada sesuatu, seperti membaca atau menonton TV.',
  },
  {
    id: 9,
    text: 'Saya merasa tidak berharga atau merasa bersalah secara berlebihan.',
  },
  {
    id: 10,
    text: 'Saya berpikir untuk menyakiti diri sendiri atau berpikir bahwa lebih baik saya mati.',
  },
];

export const likertScale = [
  { value: 1, label: 'Tidak Pernah' },
  { value: 2, label: 'Beberapa Hari' },
  { value: 3, label: 'Lebih dari Separuh Hari' },
  { value: 4, label: 'Hampir Setiap Hari' },
];

export const mockDashboardData = {
  totalStudents: 1250,
  testsTaken: 980,
  needsAttention: 120,
  chartData: [
    { name: 'Depresi', 'Jumlah Siswa': 45 },
    { name: 'Kecemasan', 'Jumlah Siswa': 88 },
    { name: 'Stres', 'Jumlah Siswa': 150 },
    { name: 'ADHD', 'Jumlah Siswa': 30 },
    { name: 'Lainnya', 'Jumlah Siswa': 25 },
  ],
};

export const mockFaqData = [
  {
    id: 1,
    nomor: 1,
    kodeUID: 'AS789',
    namaLengkap: 'Rizky Budiarto',
    status: 'Belum Tejawab',
  },
  {
    id: 2,
    nomor: 2,
    kodeUID: 'MAS789',
    namaLengkap: 'Fajar Muhammad Yusup',
    status: 'Belum Tejawab',
  },
  {
    id: 3,
    nomor: 3,
    kodeUID: 'DAS789',
    namaLengkap: 'Yusuf Ariel Diaz',
    status: 'Belum Tejawab',
  },
  {
    id: 4,
    nomor: 4,
    kodeUID: 'EAS789',
    namaLengkap: 'Faza Maulana Akbar',
    status: 'Sudah Terjawab',
  },
];

export const mockBasisPengetahuanPenyakit = [
  {
    id: 1,
    penyakitUID: 'SKJSNALN341',
    kodepenyakit: 'P1',
    NamaPenyakit: 'Depresi',
    Description: 'asdasd',
    Solution: 'asdasd',
  },
  {
    id: 2,
    penyakitUID: 'SKJSNALN341',
    kodepenyakit: 'P2',
    NamaPenyakit: 'Kecemasan',
    Description: 'asdasd',
    Solution: 'asdasd',
  },
  {
    id: 3,
    penyakitUID: 'SKJSNALN341',
    kodepenyakit: 'P3',
    NamaPenyakit: 'Stres',
    Description: 'asdasd',
    Solution: 'asdasdasd',
  },
];

export const mockBasisPengetahuanGejala = [
  {
    id: 1,
    gejalaUID: 'SKJSNALN341',
    kodegajala: 'G1',
    kategori: 'PHQ9',
    namagejala: 'Kesulitan Tidur?',
  },
  {
    id: 2,
    gejalaUID: 'SKJSNALN341',
    kodegajala: 'G2',
    kategori: 'PHQ9',
    namagejala: 'Jantung Berdebar - debar',
  },
  {
    id: 3,
    gejalaUID: 'SKJSNALN341',
    kodegajala: 'G3',
    kategori: 'PHQ9',
    namagejala: 'Sering lelah',
  },
];
export const mockBasisPengetahuanAturan = [
  {
    id: 1,
    aturanUID: 'SKJSNALN341',
    kodeaturan: 'P1',
    kodepertanyaan: 'PH01',
    min_value: '1',
    is_mandatory: 'FALSE',
  },
  {
    id: 2,
    aturanUID: 'SKJSNALN341',
    kodeaturan: 'P2',
    kodepertanyaan: 'PH02',
    min_value: '1',
    is_mandatory: 'TRUE',
  },
  {
    id: 3,
    aturanUID: 'SKJSNALN341',
    kodeaturan: 'P3',
    kodepertanyaan: 'PH03',
    min_value: '1',
    is_mandatory: 'FALSE',
  },
  {
    id: 4,
    aturanUID: 'SKJSNALN341',
    kodeaturan: 'P4',
    kodepertanyaan: 'PH04',
    min_value: '1',
    is_mandatory: 'TRUE',
  },
];
