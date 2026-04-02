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
  ]);

  autoTable(doc, {
    startY: 43,
    head: [['No', 'Klien', 'Nama Kasus', 'Tipe', 'Hukum', 'Tanggal', 'Status', 'Durasi', 'Pengacara']],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Footer summary
  const finalY = (doc as any).lastAutoTable?.finalY || 200;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Jam Konsultasi: ${summary.totalFormatted}`, 14, finalY + 10);

  doc.save(`laporan-konsultasi-${Date.now()}.pdf`);
}

export function exportToCSV(data: Consultation[], filterLabel: string) {
  const summary = buildSummary(data);
  const headers = ['No', 'Klien', 'Nama Kasus', 'Tipe', 'Layanan', 'Hukum', 'Tanggal', 'Status', 'Durasi (menit)', 'Pengacara'];
  const rows = data.map((c, i) => [
    i + 1, c.clientName, c.caseName, typeLabel[c.consultationType], c.serviceType, c.lawType, c.date, statusLabel[c.status], c.duration || 0, c.lawyerName || '-',
  ]);

  let csv = `Laporan Konsultasi Hukum\nFilter: ${filterLabel}\n\n`;
  csv += headers.join(',') + '\n';
  rows.forEach(r => { csv += r.map(v => `"${v}"`).join(',') + '\n'; });
  csv += `\nTotal Konsultasi,${summary.total}\nTotal Durasi,${summary.totalFormatted}\n`;

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

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Konsultasi');
  XLSX.writeFile(wb, `laporan-konsultasi-${Date.now()}.xlsx`);
}
