import { Consultation } from '@/types/consultation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const typeLabel: Record<string, string> = { chat: 'Chat', offline: 'Offline', video_call: 'Video Call' };
const statusLabel: Record<string, string> = { pending: 'Belum Mulai', in_progress: 'Sedang Berlangsung', completed: 'Selesai' };

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} jam ${m} menit` : `${m} menit`;
}

function buildSummary(data: Consultation[]) {
  const totalMinutes = data.reduce((sum, c) => sum + (c.duration || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainMinutes = totalMinutes % 60;
  return {
    total: data.length,
    pending: data.filter(c => c.status === 'pending').length,
    inProgress: data.filter(c => c.status === 'in_progress').length,
    completed: data.filter(c => c.status === 'completed').length,
    totalMinutes,
    totalFormatted: `${totalHours} jam ${remainMinutes} menit`,
    avgDuration: data.length > 0 ? Math.round(totalMinutes / data.length) : 0,
  };
}

// Helper to load image as base64 from URL
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function exportToPDF(data: Consultation[], filterLabel: string) {
  const doc = new jsPDF({ orientation: 'landscape' });
  const summary = buildSummary(data);
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const exportDate = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // === PAGE 1: Cover & Summary ===
  // Header bar
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN KONSULTASI HUKUM', 14, 22);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Bantuan Hukum Online`, pageWidth - 14, 15, { align: 'right' });
  doc.text(`Diekspor: ${exportDate}`, pageWidth - 14, 22, { align: 'right' });
  doc.text(`Filter: ${filterLabel}`, pageWidth - 14, 29, { align: 'right' });

  // Summary cards
  doc.setTextColor(0);
  const cardY = 45;
  const cardW = (pageWidth - 70) / 5;
  const cards = [
    { label: 'Total Konsultasi', value: String(summary.total), color: [59, 130, 246] },
    { label: 'Belum Mulai', value: String(summary.pending), color: [245, 158, 11] },
    { label: 'Berlangsung', value: String(summary.inProgress), color: [59, 130, 246] },
    { label: 'Selesai', value: String(summary.completed), color: [16, 185, 129] },
    { label: 'Total Durasi', value: summary.totalFormatted, color: [139, 92, 246] },
  ];

  cards.forEach((card, i) => {
    const x = 14 + i * (cardW + 10);
    doc.setFillColor(card.color[0], card.color[1], card.color[2]);
    doc.roundedRect(x, cardY, cardW, 28, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(card.label, x + cardW / 2, cardY + 10, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value, x + cardW / 2, cardY + 22, { align: 'center' });
  });

  // Breakdown by type
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Ringkasan Berdasarkan Tipe Konsultasi', 14, 88);

  const typeBreakdown = [
    { type: 'Offline', count: data.filter(c => c.consultationType === 'offline').length, mins: data.filter(c => c.consultationType === 'offline').reduce((s, c) => s + (c.duration || 0), 0) },
    { type: 'Chat', count: data.filter(c => c.consultationType === 'chat').length, mins: data.filter(c => c.consultationType === 'chat').reduce((s, c) => s + (c.duration || 0), 0) },
    { type: 'Video Call', count: data.filter(c => c.consultationType === 'video_call').length, mins: data.filter(c => c.consultationType === 'video_call').reduce((s, c) => s + (c.duration || 0), 0) },
  ];

  autoTable(doc, {
    startY: 93,
    head: [['Tipe', 'Jumlah', 'Total Durasi', 'Rata-rata Durasi']],
    body: typeBreakdown.map(t => [
      t.type,
      t.count,
      formatDuration(t.mins),
      t.count > 0 ? formatDuration(Math.round(t.mins / t.count)) : '-',
    ]),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [55, 65, 81], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { fontStyle: 'bold' } },
    theme: 'grid',
  });

  // Rating summary
  const ratedData = data.filter(c => c.rating);
  if (ratedData.length > 0) {
    const avgRating = (ratedData.reduce((s, c) => s + (c.rating || 0), 0) / ratedData.length).toFixed(1);
    const ratingY = (doc as any).lastAutoTable?.finalY + 15 || 140;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Ringkasan Rating', 14, ratingY);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total yang dirating: ${ratedData.length} dari ${data.length} konsultasi`, 14, ratingY + 7);
    doc.text(`Rata-rata rating: ${avgRating} / 5 ${'★'.repeat(Math.round(Number(avgRating)))}${'☆'.repeat(5 - Math.round(Number(avgRating)))}`, 14, ratingY + 14);
  }

  // === PAGE 2+: Data Table ===
  doc.addPage();
  doc.setFillColor(55, 65, 81);
  doc.rect(0, 0, pageWidth, 18, 'F');
  doc.setTextColor(255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DATA KONSULTASI', 14, 12);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.length} data  |  Filter: ${filterLabel}`, pageWidth - 14, 12, { align: 'right' });

  const rows = data.map((c, i) => [
    i + 1,
    c.clientName,
    c.caseName,
    typeLabel[c.consultationType],
    c.lawType,
    c.date,
    statusLabel[c.status],
    c.duration ? formatDuration(c.duration) : '-',
    c.lawyerName || '-',
    c.rating ? `${c.rating}/5` : '-',
  ]);

  autoTable(doc, {
    startY: 24,
    head: [['No', 'Klien', 'Nama Kasus', 'Tipe', 'Hukum', 'Tanggal', 'Status', 'Durasi', 'Pengacara', 'Rating']],
    body: rows,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 30 },
      2: { cellWidth: 35 },
      6: { fontStyle: 'bold' },
    },
    didDrawPage: (data: any) => {
      // Footer on each page
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(`Halaman ${doc.getNumberOfPages()}`, pageWidth - 14, pageHeight - 5, { align: 'right' });
      doc.text('Laporan Konsultasi Hukum — Bantuan Hukum Online', 14, pageHeight - 5);
    },
  });

  // === PAGES: Detail per consultation with photos ===
  const detailData = data.filter(c => c.startPhoto || c.endPhoto || c.rating || c.review);
  if (detailData.length > 0) {
    doc.addPage('portrait');

    doc.setFillColor(55, 65, 81);
    doc.rect(0, 0, doc.internal.pageSize.width, 18, 'F');
    doc.setTextColor(255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAIL & BUKTI KONSULTASI', 14, 12);

    let detailY = 28;
    const pw = doc.internal.pageSize.width;
    const ph = doc.internal.pageSize.height;

    for (const c of detailData) {
      if (detailY > ph - 80) {
        doc.addPage('portrait');
        detailY = 18;
      }

      // Card header
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(10, detailY - 4, pw - 20, 22, 2, 2, 'F');
      doc.setTextColor(0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${c.clientName}`, 14, detailY + 4);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`${c.caseName}  |  ${typeLabel[c.consultationType]}  |  ${c.date}  |  ${statusLabel[c.status]}`, 14, detailY + 12);
      
      // Status & duration on right
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'bold');
      doc.text(c.duration ? formatDuration(c.duration) : '-', pw - 14, detailY + 4, { align: 'right' });
      if (c.rating) {
        doc.setTextColor(245, 158, 11);
        doc.text(`${'★'.repeat(c.rating)}${'☆'.repeat(5 - c.rating)}`, pw - 14, detailY + 12, { align: 'right' });
      }
      
      detailY += 24;

      // Detail info
      doc.setTextColor(0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const details = [
        `Pengacara: ${c.lawyerName || '-'}`,
        `Layanan: ${c.serviceType}`,
        `Jenis Hukum: ${c.lawType}`,
        c.nik ? `NIK: ${c.nik}` : '',
        c.telp ? `Telp: ${c.telp}` : '',
      ].filter(Boolean);
      doc.text(details.join('  |  '), 14, detailY);
      detailY += 6;

      if (c.review) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(80);
        const reviewLines = doc.splitTextToSize(`Ulasan: "${c.review}"`, pw - 28);
        doc.text(reviewLines, 14, detailY);
        detailY += reviewLines.length * 4 + 2;
      }

      // Photos
      if (c.startPhoto || c.endPhoto) {
        const photoWidth = 60;
        const photoHeight = 42;
        
        if (detailY + photoHeight + 10 > ph) {
          doc.addPage('portrait');
          detailY = 18;
        }

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);

        try {
          if (c.startPhoto) {
            doc.text('FOTO MULAI', 14, detailY + 2);
            // Try to load the image
            const startImg = await loadImageAsBase64(c.startPhoto);
            if (startImg) {
              doc.addImage(startImg, 'JPEG', 14, detailY + 4, photoWidth, photoHeight);
            } else {
              // Try direct - might be base64 already
              try {
                doc.addImage(c.startPhoto, 'JPEG', 14, detailY + 4, photoWidth, photoHeight);
              } catch {
                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(150);
                doc.text('(Foto tidak dapat dimuat)', 14, detailY + 20);
              }
            }
          }
          if (c.endPhoto) {
            const endX = c.startPhoto ? 84 : 14;
            doc.setTextColor(0);
            doc.setFont('helvetica', 'bold');
            doc.text('FOTO SELESAI', endX, detailY + 2);
            const endImg = await loadImageAsBase64(c.endPhoto);
            if (endImg) {
              doc.addImage(endImg, 'JPEG', endX, detailY + 4, photoWidth, photoHeight);
            } else {
              try {
                doc.addImage(c.endPhoto, 'JPEG', endX, detailY + 4, photoWidth, photoHeight);
              } catch {
                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(150);
                doc.text('(Foto tidak dapat dimuat)', endX, detailY + 20);
              }
            }
          }
          detailY += photoHeight + 10;
        } catch {
          doc.setFontSize(7);
          doc.setTextColor(150);
          doc.text('(Foto tidak dapat dimuat)', 14, detailY + 4);
          detailY += 12;
        }
      }

      // Separator
      doc.setDrawColor(220);
      doc.line(14, detailY, pw - 14, detailY);
      detailY += 8;
    }
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.setFont('helvetica', 'normal');
    const currentPageHeight = doc.internal.pageSize.height;
    const currentPageWidth = doc.internal.pageSize.width;
    doc.text(`Halaman ${i} dari ${totalPages}`, currentPageWidth - 14, currentPageHeight - 5, { align: 'right' });
    doc.text('Laporan Konsultasi Hukum — Bantuan Hukum Online', 14, currentPageHeight - 5);
  }

  doc.save(`laporan-konsultasi-${Date.now()}.pdf`);
}

export function exportToCSV(data: Consultation[], filterLabel: string) {
  const summary = buildSummary(data);
  const headers = ['No', 'Klien', 'Nama Kasus', 'Tipe', 'Layanan', 'Hukum', 'Tanggal', 'Status', 'Durasi (menit)', 'Pengacara', 'Rating', 'Ulasan', 'URL Foto Mulai', 'URL Foto Selesai'];
  const rows = data.map((c, i) => [
    i + 1, c.clientName, c.caseName, typeLabel[c.consultationType], c.serviceType, c.lawType, c.date, statusLabel[c.status], c.duration || 0, c.lawyerName || '-',
    c.rating || '-', c.review || '-',
    c.startPhoto || '-',
    c.endPhoto || '-',
  ]);

  let csv = `Laporan Konsultasi Hukum\nFilter: ${filterLabel}\n\n`;
  csv += headers.join(',') + '\n';
  rows.forEach(r => { csv += r.map(v => `"${v}"`).join(',') + '\n'; });
  csv += `\nTotal Konsultasi,${summary.total}\nTotal Durasi,${summary.totalFormatted}\nBelum Mulai,${summary.pending}\nSedang Berlangsung,${summary.inProgress}\nSelesai,${summary.completed}\n`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `laporan-konsultasi-${Date.now()}.csv`);
}

export function exportToExcel(data: Consultation[], filterLabel: string) {
  const summary = buildSummary(data);
  const rows = data.map((c, i) => ({
    'No': i + 1,
    'Klien': c.clientName,
    'Nama Kasus': c.caseName,
    'Tipe': typeLabel[c.consultationType],
    'Layanan': c.serviceType,
    'Hukum': c.lawType,
    'Tanggal': c.date,
    'Status': statusLabel[c.status],
    'Durasi (menit)': c.duration || 0,
    'Pengacara': c.lawyerName || '-',
    'Rating': c.rating || '-',
    'Ulasan': c.review || '-',
    'URL Foto Mulai': c.startPhoto || '-',
    'URL Foto Selesai': c.endPhoto || '-',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const summaryRows = [
    {}, {},
    { 'No': 'SUMMARY' },
    { 'No': 'Total Konsultasi', 'Klien': summary.total },
    { 'No': 'Total Durasi', 'Klien': summary.totalFormatted },
    { 'No': 'Belum Mulai', 'Klien': summary.pending },
    { 'No': 'Sedang Berlangsung', 'Klien': summary.inProgress },
    { 'No': 'Selesai', 'Klien': summary.completed },
    { 'No': 'Filter', 'Klien': filterLabel },
  ];
  XLSX.utils.sheet_add_json(ws, summaryRows, { skipHeader: true, origin: -1 });

  ws['!cols'] = [
    { wch: 5 }, { wch: 25 }, { wch: 30 }, { wch: 12 }, { wch: 30 }, { wch: 20 },
    { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 8 }, { wch: 30 }, { wch: 20 }, { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Konsultasi');
  XLSX.writeFile(wb, `laporan-konsultasi-${Date.now()}.xlsx`);
}
