import { getSvgDimensions, svgToBlob, svgToPngBlob } from './qr.js';

const pdfPage = Object.freeze({ footerY: 284, height: 297, width: 210 });
const docxPage = Object.freeze({
  footer: 708,
  height: 16_838,
  margin: 1_440,
  width: 11_906,
});

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
  const artworkSize = fitDimensions(getSvgDimensions(svgString), {
    maxHeight: 176,
    maxWidth: 128,
  });
  const artworkPosition = {
    x: (pdfPage.width - artworkSize.width) / 2,
    y: (pdfPage.height - artworkSize.height) / 2,
  };

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pdfPage.width, pdfPage.height, 'F');
  pdf.saveGraphicsState();
  try {
    await svg2pdf(svgElement, pdf, {
      height: artworkSize.height,
      width: artworkSize.width,
      x: artworkPosition.x,
      y: artworkPosition.y,
    });
  } finally {
    pdf.restoreGraphicsState();
  }

  pdf.setFontSize(10);
  pdf.setTextColor(89, 99, 95);
  pdf.text('QR Recast', pdfPage.width / 2, pdfPage.footerY, { align: 'center' });

  return pdf.output('blob');
}

export async function createDocxExport(svgString) {
  const [{ AlignmentType, Document, Footer, ImageRun, Packer, Paragraph, TextRun }, pngBlob] =
    await Promise.all([import('docx'), svgToPngBlob(svgString, 1024)]);
  const svgBytes = new TextEncoder().encode(svgString);
  const pngBuffer = await pngBlob.arrayBuffer();
  const artworkSize = fitDimensions(getSvgDimensions(svgString), {
    maxHeight: 430,
    maxWidth: 320,
  });
  const document = new Document({
    styles: {
      default: {
        document: {
          run: { color: '1F2933', font: 'Arial', size: 22 },
        },
      },
    },
    sections: [
      {
        footers: {
          default: createDocxFooter({ AlignmentType, Footer, Paragraph, TextRun }),
        },
        properties: {
          page: {
            margin: {
              bottom: docxPage.margin,
              footer: docxPage.footer,
              gutter: 0,
              header: docxPage.footer,
              left: docxPage.margin,
              right: docxPage.margin,
              top: Math.round((docxPage.height - Math.round(artworkSize.height) * 15) / 2),
            },
            size: { height: docxPage.height, width: docxPage.width },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                type: 'svg',
                data: svgBytes,
                transformation: {
                  height: Math.round(artworkSize.height),
                  width: Math.round(artworkSize.width),
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
        ],
      },
    ],
  });

  return Packer.toBlob(document);
}

function createDocxFooter({ AlignmentType, Footer, Paragraph, TextRun }) {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            color: '5F6F69',
            font: 'Arial',
            size: 20,
            text: 'QR Recast',
          }),
        ],
      }),
    ],
  });
}

function fitDimensions({ height, width }, { maxHeight, maxWidth }) {
  if (!Number.isFinite(height) || !Number.isFinite(width) || height <= 0 || width <= 0) {
    return { height: maxWidth, width: maxWidth };
  }

  const scale = Math.min(maxWidth / width, maxHeight / height);

  return {
    height: height * scale,
    width: width * scale,
  };
}

function parseSvg(svgString) {
  const document = new DOMParser().parseFromString(svgString, 'image/svg+xml');
  const parserError = document.querySelector('parsererror');

  if (parserError) {
    throw new Error('SVG export failed.');
  }

  return document.documentElement;
}
