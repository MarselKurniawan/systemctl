import { Consultation } from '@/types/consultation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const typeLabel: Record<string, string> = { chat: 'Chat', offline: 'Offline', video_call: 'Video Call' };
const statusLabel: Record<string, string> = { pending: 'Belum Mulai', in_progress: 'Sedang Berlangsung', completed: 'Selesai' };

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h} jam ${m} menit ${s} detik`;
  if (m > 0) return `${m} menit ${s} detik`;
  return `${s} detik`;
}

function formatDurationHMS(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function buildSummary(data: Consultation[]) {
  const totalSeconds = data.reduce((sum, c) => sum + (c.duration || 0), 0);
  return {
    total: data.length,
    pending: data.filter(c => c.status === 'pending').length,
    inProgress: data.filter(c => c.status === 'in_progress').length,
    completed: data.filter(c => c.status === 'completed').length,
    totalSeconds,
    totalFormatted: formatDurationHMS(totalSeconds),
    avgDuration: data.length > 0 ? Math.round(totalSeconds / data.length) : 0,
  };
}

// Helper to load image as base64 from URL
async function loadImageAsBase64(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function detectImageFormat(dataUrl: string): 'JPEG' | 'PNG' {
  if (dataUrl.startsWith('data:image/png')) return 'PNG';
  return 'JPEG';
}

export async function exportToPDF(data: Consultation[], filterLabel: string) {
  const doc = new jsPDF({ orientation: 'landscape' });
  const summary = buildSummary(data);
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const exportDate = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // === PAGE 1: Cover & Summary ===
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

  // === PAGE 2+: Data Table with embedded photos ===
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

  // Pre-load all photos as base64 (combined start+end into one "Bukti" cell)
  const photoCache: Array<{ start: string | null; end: string | null }> = [];
  for (const c of data) {
    photoCache.push({
      start: c.startPhoto ? await loadImageAsBase64(c.startPhoto) : null,
      end: c.endPhoto ? await loadImageAsBase64(c.endPhoto) : null,
    });
  }

  const rows = data.map((c, i) => [
    i + 1,
    c.clientName,
    c.caseName,
    typeLabel[c.consultationType],
    c.lawType || '-',
    c.date,
    statusLabel[c.status],
    c.duration ? formatDurationHMS(c.duration) : '-',
    c.lawyerName || '-',
    c.rating ? `${c.rating}/5` : '-',
    '', // Bukti column - drawn manually
  ]);

  autoTable(doc, {
    startY: 24,
    head: [['No', 'Klien', 'Nama Kasus', 'Tipe', 'Hukum', 'Tanggal', 'Status', 'Durasi', 'Pengacara', 'Rating', 'Bukti']],
    body: rows,
    styles: { fontSize: 7, cellPadding: 2, valign: 'middle' },
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 28 },
      2: { cellWidth: 30 },
      3: { cellWidth: 14 },
      4: { cellWidth: 18 },
      5: { cellWidth: 18 },
      6: { cellWidth: 18, fontStyle: 'bold' },
      7: { cellWidth: 18 },
      8: { cellWidth: 25 },
      9: { cellWidth: 12 },
      10: { cellWidth: 36, minCellHeight: 22 },
    },
    didDrawCell: (hookData: any) => {
      if (hookData.section === 'body' && hookData.column.index === 10) {
        const idx = hookData.row.index;
        const photos = photoCache[idx];
        if (!photos) return;
        const cell = hookData.cell;
        const imgW = 14;
        const imgH = 18;
        const padding = 2;
        let x = cell.x + padding;
        const y = cell.y + (cell.height - imgH) / 2;
        if (photos.start) {
          try { doc.addImage(photos.start, detectImageFormat(photos.start), x, y, imgW, imgH); } catch {}
          x += imgW + 2;
        }
        if (photos.end) {
          try { doc.addImage(photos.end, detectImageFormat(photos.end), x, y, imgW, imgH); } catch {}
        }
        if (!photos.start && !photos.end) {
          doc.setFontSize(7);
          doc.setTextColor(150);
          doc.text('-', cell.x + cell.width / 2, cell.y + cell.height / 2 + 1, { align: 'center' });
        }
      }
    },
    didDrawPage: () => {
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(`Halaman ${doc.getNumberOfPages()}`, pageWidth - 14, pageHeight - 5, { align: 'right' });
      doc.text('Laporan Konsultasi Hukum — Bantuan Hukum Online', 14, pageHeight - 5);
    },
  });

  // === LAST PAGE: Summary & Notes ===
  doc.addPage('portrait');
  const lpw = doc.internal.pageSize.width;
  let noteY = 20;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(`Jumlah Data: ${data.length}`, 14, noteY);
  noteY += 7;
  doc.text(`Total Durasi: ${summary.totalFormatted}`, 14, noteY);
  noteY += 14;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Catatan :', 14, noteY);
  noteY += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const catatanLines = [
    'Jenis Layanan berupa:',
    'a. Pemberian Informasi, Konsultasi, atau Advis Hukum',
    'b. Bantuan Pembuatan Dokumen Hukum',
    'c. Penyediaan Informasi Daftar Organisasi Bantuan Hukum Yang Dapat',
    '   Memberikan bantuan Hukum Cuma-Cuma',
    '   (Pasal 25 Perma No. 1 Tahun 2014)',
  ];
  catatanLines.forEach(line => {
    doc.text(line, 18, noteY);
    noteY += 5;
  });

  noteY += 20;
  const sigX = lpw - 90;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Semarang , _________________________', sigX, noteY, { align: 'left' });
  noteY += 12;
  doc.text('Nama Mitra Hukum', sigX, noteY, { align: 'left' });
  noteY += 25;
  doc.text('_________________________________', sigX, noteY, { align: 'left' });

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
  const headers = ['No', 'Klien', 'Nama Kasus', 'Tipe', 'Layanan', 'Hukum', 'Tanggal', 'Status', 'Durasi', 'Pengacara', 'Rating', 'Ulasan', 'Bukti'];
  const rows = data.map((c, i) => {
    const bukti = [c.startPhoto, c.endPhoto].filter(Boolean).join(' | ') || '-';
    return [
      i + 1, c.clientName, c.caseName, typeLabel[c.consultationType], c.serviceType, c.lawType, c.date, statusLabel[c.status],
      c.duration ? formatDurationHMS(c.duration) : '-', c.lawyerName || '-',
      c.rating || '-', c.review || '-', bukti,
    ];
  });

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
    'Durasi': c.duration ? formatDurationHMS(c.duration) : '-',
    'Pengacara': c.lawyerName || '-',
    'Rating': c.rating || '-',
    'Ulasan': c.review || '-',
    'Bukti': [c.startPhoto, c.endPhoto].filter(Boolean).join(' | ') || '-',
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
    { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 8 }, { wch: 30 }, { wch: 50 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Konsultasi');
  XLSX.writeFile(wb, `laporan-konsultasi-${Date.now()}.xlsx`);
}
