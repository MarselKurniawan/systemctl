import { Consultation } from '@/types/consultation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const typeLabel: Record<string, string> = { chat: 'Chat', offline: 'Offline', video_call: 'Video Call' };
const statusLabel: Record<string, string> = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' };

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
  };
}

export function exportToPDF(data: Consultation[], filterLabel: string) {
  const doc = new jsPDF({ orientation: 'landscape' });
  const summary = buildSummary(data);

  // Title
  doc.setFontSize(16);
  doc.text('Laporan Konsultasi Hukum', 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Filter: ${filterLabel}`, 14, 25);
  doc.text(`Diekspor: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 30);

  // Summary
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Total: ${summary.total}  |  Pending: ${summary.pending}  |  In Progress: ${summary.inProgress}  |  Selesai: ${summary.completed}  |  Total Durasi: ${summary.totalFormatted}`, 14, 38);

  // Table
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
    c.startPhoto ? 'Ada' : '-',
    c.endPhoto ? 'Ada' : '-',
  ]);

  autoTable(doc, {
    startY: 43,
    head: [['No', 'Klien', 'Nama Kasus', 'Tipe', 'Hukum', 'Tanggal', 'Status', 'Durasi', 'Pengacara', 'Foto Mulai', 'Foto Selesai']],
    body: rows,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  let currentY = (doc as any).lastAutoTable?.finalY || 200;

  // Add proof photos section
  const photosData = data.filter(c => c.startPhoto || c.endPhoto);
  if (photosData.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Bukti Konsultasi (Foto)', 14, 18);
    
    let photoY = 28;
    for (const c of photosData) {
      if (photoY > 170) {
        doc.addPage();
        photoY = 18;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${c.clientName} - ${c.caseName} (${c.date})`, 14, photoY);
      photoY += 6;

      try {
        if (c.startPhoto) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.text('Foto Mulai:', 14, photoY);
          doc.addImage(c.startPhoto, 'JPEG', 14, photoY + 2, 50, 35);
          
          if (c.endPhoto) {
            doc.text('Foto Selesai:', 74, photoY);
            doc.addImage(c.endPhoto, 'JPEG', 74, photoY + 2, 50, 35);
          }
          photoY += 42;
        } else if (c.endPhoto) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.text('Foto Selesai:', 14, photoY);
          doc.addImage(c.endPhoto, 'JPEG', 14, photoY + 2, 50, 35);
          photoY += 42;
        }
      } catch (e) {
        doc.setFontSize(8);
        doc.text('(Foto tidak dapat dimuat)', 14, photoY);
        photoY += 8;
      }
    }
  }

  // Footer summary on last page
  const lastPage = doc.getNumberOfPages();
  doc.setPage(lastPage);
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(`Total Jam Konsultasi: ${summary.totalFormatted}`, 14, pageHeight - 15);

  doc.save(`laporan-konsultasi-${Date.now()}.pdf`);
}

export function exportToCSV(data: Consultation[], filterLabel: string) {
  const summary = buildSummary(data);
  const headers = ['No', 'Klien', 'Nama Kasus', 'Tipe', 'Layanan', 'Hukum', 'Tanggal', 'Status', 'Durasi (menit)', 'Pengacara', 'Bukti Foto Mulai', 'Bukti Foto Selesai'];
  const rows = data.map((c, i) => [
    i + 1, c.clientName, c.caseName, typeLabel[c.consultationType], c.serviceType, c.lawType, c.date, statusLabel[c.status], c.duration || 0, c.lawyerName || '-',
    c.startPhoto ? 'Ada' : '-',
    c.endPhoto ? 'Ada' : '-',
  ]);

  let csv = `Laporan Konsultasi Hukum\nFilter: ${filterLabel}\n\n`;
  csv += headers.join(',') + '\n';
  rows.forEach(r => { csv += r.map(v => `"${v}"`).join(',') + '\n'; });
  csv += `\nTotal Konsultasi,${summary.total}\nTotal Durasi,${summary.totalFormatted}\nPending,${summary.pending}\nIn Progress,${summary.inProgress}\nSelesai,${summary.completed}\n`;

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
    'Bukti Foto Mulai': c.startPhoto ? 'Ada (lihat di sistem)' : '-',
    'Bukti Foto Selesai': c.endPhoto ? 'Ada (lihat di sistem)' : '-',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const summaryRows = [
    {}, {},
    { 'No': 'SUMMARY' },
    { 'No': 'Total Konsultasi', 'Klien': summary.total },
    { 'No': 'Total Durasi', 'Klien': summary.totalFormatted },
    { 'No': 'Pending', 'Klien': summary.pending },
    { 'No': 'In Progress', 'Klien': summary.inProgress },
    { 'No': 'Selesai', 'Klien': summary.completed },
    { 'No': 'Filter', 'Klien': filterLabel },
  ];
  XLSX.utils.sheet_add_json(ws, summaryRows, { skipHeader: true, origin: -1 });

  // Set column widths
  ws['!cols'] = [
    { wch: 5 }, { wch: 25 }, { wch: 30 }, { wch: 12 }, { wch: 30 }, { wch: 20 },
    { wch: 18 }, { wch: 12 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Konsultasi');
  XLSX.writeFile(wb, `laporan-konsultasi-${Date.now()}.xlsx`);
}
