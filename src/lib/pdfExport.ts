import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function downloadCertificatePdf(
  elementId: string,
  fileName: string = 'InFast_Certificate.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found.`);
  }

  // Ensure high quality rasterization (scale: 2 or 3 for 300 DPI equivalent)
  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png', 1.0);

  // 16:9 Landscape dimensions in mm (297mm width x 167.06mm height)
  const pdfWidth = 297;
  const pdfHeight = (297 * 9) / 16; // ~167.06 mm

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [pdfWidth, pdfHeight],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  pdf.save(fileName);
}

export function printCertificate(elementId?: string): void {
  window.print();
}
