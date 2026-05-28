import { svgToBlob, svgToPngBlob } from './qr.js';

export async function createSvgExport(svgString) {
  return svgToBlob(svgString);
}

export async function createPngExport(svgString) {
  return svgToPngBlob(svgString, 1024);
}

export async function createPdfExport(svgString) {
  const [{ jsPDF }, { svg2pdf }] = await Promise.all([import('jspdf'), import('svg2pdf.js')]);
  const pdf = new jsPDF({ format: 'a4', orientation: 'portrait', unit: 'mm' });
  const svgElement = parseSvg(svgString);

  await svg2pdf(svgElement, pdf, {
    x: 45,
    y: 58,
    width: 120,
    height: 120,
  });

  pdf.setFontSize(10);
  pdf.setTextColor(89, 99, 95);
  pdf.text('QR Recast', 105, 284, { align: 'center' });

  return pdf.output('blob');
}

export async function createDocxExport(svgString) {
  const [{ AlignmentType, Document, ImageRun, Packer, Paragraph }, pngBlob] = await Promise.all([
    import('docx'),
    svgToPngBlob(svgString, 1024),
  ]);
  const svgBytes = new TextEncoder().encode(svgString);
  const pngBuffer = await pngBlob.arrayBuffer();
  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                type: 'svg',
                data: svgBytes,
                transformation: {
                  width: 320,
                  height: 320,
                },
                fallback: {
                  type: 'png',
                  data: pngBuffer,
                },
                altText: {
                  title: 'QR Recast',
                  description: 'Recast QR code',
                  name: 'QR Recast',
                },
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            text: 'QR Recast',
          }),
        ],
      },
    ],
  });

  return Packer.toBlob(document);
}

function parseSvg(svgString) {
  const document = new DOMParser().parseFromString(svgString, 'image/svg+xml');
  const parserError = document.querySelector('parsererror');

  if (parserError) {
    throw new Error('SVG export failed.');
  }

  return document.documentElement;
}
