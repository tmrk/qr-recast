import { createQrSvg, getSvgDimensions, hashTextPrefix, svgToBlob } from '../../lib/qr.js';
import { createDecoratedQrSvg } from '../branding/decorator.js';

const svgPage = Object.freeze({
  width: 794,
  height: 1123,
  margin: 56,
  gutter: 34,
  qrSize: 224,
  cellHeight: 318,
  footerY: 1084,
});
const pdfPage = Object.freeze({
  width: 210,
  height: 297,
  margin: 15,
  gutter: 10,
  qrSize: 58,
  cellHeight: 78,
  footerY: 286,
});
const columns = 2;
const rowsPerPage = 3;
const itemsPerPage = columns * rowsPerPage;

export async function createBatchExport(items, format) {
  const safeItems = items.filter((item) => item?.payload);
  const hash = await hashTextPrefix(
    safeItems.map((item) => `${item.name}\n${item.payload}`).join('\n---\n'),
  );
  const fileName = `qr-recast-batch-${safeItems.length}-${hash}.${format}`;

  if (format === 'svg') {
    return {
      blob: svgToBlob(await createBatchSheetSvg(safeItems)),
      fileName,
    };
  }

  if (format === 'png') {
    const svgString = await createBatchSheetSvg(safeItems);

    return {
      blob: await batchSvgToPngBlob(svgString, {
        height: Math.max(
          svgPage.height,
          Math.ceil(safeItems.length / itemsPerPage) * svgPage.height,
        ),
        width: svgPage.width,
      }),
      fileName,
    };
  }

  if (format === 'pdf') {
    return {
      blob: await createBatchPdf(safeItems),
      fileName,
    };
  }

  if (format === 'docx') {
    return {
      blob: await createBatchDocx(safeItems),
      fileName,
    };
  }

  throw new Error('Unsupported batch export format.');
}

export async function createBatchSheetSvg(items) {
  const qrItems = await createRenderableItems(items);
  const pageCount = Math.max(1, Math.ceil(qrItems.length / itemsPerPage));
  const height = pageCount * svgPage.height;
  const cellWidth = (svgPage.width - svgPage.margin * 2 - svgPage.gutter) / columns;
  const pages = Array.from({ length: pageCount }, (_value, pageIndex) =>
    renderSvgPage({
      cellWidth,
      items: qrItems.slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage),
      pageCount,
      pageIndex,
    }),
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgPage.width} ${height}" role="img" aria-label="QR Recast batch sheet">
<rect width="${svgPage.width}" height="${height}" fill="#f7fbf8"/>
${pages}
</svg>`;
}

async function createBatchPdf(items) {
  const [{ jsPDF }, { svg2pdf }] = await Promise.all([import('jspdf'), import('svg2pdf.js')]);
  const qrItems = await createRenderableItems(items);
  const pdf = new jsPDF({ format: 'a4', orientation: 'portrait', unit: 'mm' });
  const pageCount = Math.max(1, Math.ceil(qrItems.length / itemsPerPage));
  const cellWidth = (pdfPage.width - pdfPage.margin * 2 - pdfPage.gutter) / columns;

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    await renderPdfPage(pdf, {
      cellWidth,
      items: qrItems.slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage),
      pageCount,
      pageIndex,
      svg2pdf,
    });
  }

  return pdf.output('blob');
}

async function createBatchDocx(items) {
  const [
    { AlignmentType, Document, ImageRun, Packer, Paragraph, Table, TableCell, TableRow, WidthType },
    qrItems,
  ] = await Promise.all([import('docx'), createRenderableItems(items)]);
  const pages = chunkItems(qrItems, itemsPerPage);
  const sections = await Promise.all(
    pages.map(async (pageItems, pageIndex) => ({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 180 },
          text: 'QR Recast',
        }),
        new Table({
          rows: await createDocxRows(pageItems, {
            AlignmentType,
            ImageRun,
            Paragraph,
            TableCell,
            TableRow,
            WidthType,
          }),
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 180 },
          text: `QR Recast · ${pageIndex + 1} / ${pages.length}`,
        }),
      ],
      properties: {},
    })),
  );
  const document = new Document({ sections });

  return Packer.toBlob(document);
}

async function createRenderableItems(items) {
  return Promise.all(
    items.map(async (item) => {
      let qrInput = item.payload;
      if (Array.isArray(item.modulesGrid) && item.modulesGrid.length) {
        qrInput = { text: item.payload, version: item.version, modulesGrid: item.modulesGrid };
      } else if (item.version != null || item.maskPattern != null || item.errorCorrectionLevel) {
        qrInput = {
          text: item.payload,
          version: item.version,
          maskPattern: item.maskPattern,
          errorCorrectionLevel: item.errorCorrectionLevel,
        };
      }
      const canonicalSvg = await createQrSvg(qrInput);
      const svg = createDecoratedQrSvg(canonicalSvg, item.type, {
        enabled: item.branding?.enabled !== false,
      });

      return {
        ...item,
        caption: normaliseCaption(item.name),
        svg,
      };
    }),
  );
}

function renderSvgPage({ cellWidth, items, pageCount, pageIndex }) {
  const pageTop = pageIndex * svgPage.height;
  const cells = items
    .map((item, itemIndex) => {
      const column = itemIndex % columns;
      const row = Math.floor(itemIndex / columns);
      const x = svgPage.margin + column * (cellWidth + svgPage.gutter);
      const y = pageTop + 96 + row * svgPage.cellHeight;
      const qrX = x + (cellWidth - svgPage.qrSize) / 2;

      return `<g>
<rect x="${x}" y="${y - 18}" width="${cellWidth}" height="${svgPage.cellHeight - 26}" rx="18" fill="#ffffff" stroke="#d8e4de"/>
${renderNestedSvg(item.svg, qrX, y, svgPage.qrSize)}
${renderSvgCaption(item.caption, x + cellWidth / 2, y + svgPage.qrSize + 34, cellWidth - 20)}
</g>`;
    })
    .join('');

  return `<g>
<rect x="0" y="${pageTop}" width="${svgPage.width}" height="${svgPage.height}" fill="#f7fbf8"/>
<text x="${svgPage.margin}" y="${pageTop + 52}" fill="#1f2933" font-family="Roboto Flex, Roboto, Arial, sans-serif" font-size="24" font-weight="700">QR Recast</text>
${cells}
<text x="${svgPage.width / 2}" y="${pageTop + svgPage.footerY}" text-anchor="middle" fill="#5f6f69" font-family="Roboto Flex, Roboto, Arial, sans-serif" font-size="12">QR Recast · ${pageIndex + 1} / ${pageCount}</text>
</g>`;
}

async function renderPdfPage(pdf, { cellWidth, items, pageCount, pageIndex, svg2pdf }) {
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pdfPage.width, pdfPage.height, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(31, 41, 51);
  pdf.text('QR Recast', pdfPage.margin, 18);

  for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
    const item = items[itemIndex];
    const column = itemIndex % columns;
    const row = Math.floor(itemIndex / columns);
    const x = pdfPage.margin + column * (cellWidth + pdfPage.gutter);
    const y = 28 + row * pdfPage.cellHeight;
    const qrX = x + (cellWidth - pdfPage.qrSize) / 2;
    const svgElement = parseSvg(item.svg);

    pdf.setDrawColor(216, 228, 222);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(x, y - 4, cellWidth, pdfPage.cellHeight - 8, 4, 4, 'FD');
    pdf.saveGraphicsState();
    try {
      await svg2pdf(svgElement, pdf, {
        height: pdfPage.qrSize,
        width: pdfPage.qrSize,
        x: qrX,
        y,
      });
    } finally {
      pdf.restoreGraphicsState();
    }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(31, 41, 51);
    pdf.text(item.caption, x + cellWidth / 2, y + pdfPage.qrSize + 9, {
      align: 'center',
      maxWidth: cellWidth - 8,
    });
  }

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(95, 111, 105);
  pdf.text(`QR Recast · ${pageIndex + 1} / ${pageCount}`, pdfPage.width / 2, pdfPage.footerY, {
    align: 'center',
  });
}

async function createDocxRows(pageItems, docx) {
  const rows = [];

  for (let index = 0; index < pageItems.length; index += columns) {
    const rowItems = pageItems.slice(index, index + columns);
    const cells = await Promise.all(
      Array.from({ length: columns }, (_value, columnIndex) =>
        createDocxCell(rowItems[columnIndex], docx),
      ),
    );

    rows.push(new docx.TableRow({ children: cells }));
  }

  return rows;
}

async function createDocxCell(item, { AlignmentType, ImageRun, Paragraph, TableCell, WidthType }) {
  if (!item) {
    return new TableCell({
      children: [new Paragraph('')],
      width: { size: 50, type: WidthType.PERCENTAGE },
    });
  }

  const sourceSize = getSvgDimensions(item.svg);
  const rasterSize = fitDimensions(sourceSize, { maxHeight: 720, maxWidth: 720 });
  const pngBlob = await batchSvgToPngBlob(item.svg, {
    height: Math.max(1, Math.round(rasterSize.height)),
    width: Math.max(1, Math.round(rasterSize.width)),
  });
  const svgBytes = new TextEncoder().encode(item.svg);
  const pngBuffer = await pngBlob.arrayBuffer();
  const artworkSize = fitDimensions(sourceSize, {
    maxHeight: 210,
    maxWidth: 170,
  });

  return new TableCell({
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
              description: item.caption,
              name: item.caption,
              title: item.caption,
            },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        text: item.caption,
      }),
    ],
    margins: {
      bottom: 180,
      left: 180,
      right: 180,
      top: 180,
    },
    width: { size: 50, type: WidthType.PERCENTAGE },
  });
}

function renderNestedSvg(svgString, x, y, size) {
  const parsedSvg = parseSvg(svgString);
  const serializer = new XMLSerializer();
  const innerMarkup = Array.from(parsedSvg.childNodes)
    .map((node) => serializer.serializeToString(node))
    .join('');
  const viewBox = parsedSvg.getAttribute('viewBox') || '0 0 360 360';

  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${escapeXml(viewBox)}">${innerMarkup}</svg>`;
}

function renderSvgCaption(caption, x, y, maxWidth) {
  return `<text x="${x}" y="${y}" text-anchor="middle" fill="#1f2933" font-family="Roboto Flex, Roboto, Arial, sans-serif" font-size="18" font-weight="700" textLength="${Math.min(maxWidth, caption.length * 9)}" lengthAdjust="spacingAndGlyphs">${escapeXml(caption)}</text>`;
}

async function batchSvgToPngBlob(svgString, { contain = false, height, width }) {
  const image = new Image();
  const url = URL.createObjectURL(svgToBlob(svgString));
  const scale = 2;

  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = url;
    });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas is unavailable.');
    }

    canvas.width = width * scale;
    canvas.height = height * scale;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawImageToCanvas(context, image, svgString, {
      contain,
      height: canvas.height,
      width: canvas.width,
    });

    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error('PNG export failed.'));
      }, 'image/png');
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function drawImageToCanvas(context, image, svgString, { contain, height, width }) {
  if (!contain) {
    context.drawImage(image, 0, 0, width, height);
    return;
  }

  const sourceSize = getSvgDimensions(svgString);
  const fittedSize = fitDimensions(sourceSize, { maxHeight: height, maxWidth: width });
  const x = (width - fittedSize.width) / 2;
  const y = (height - fittedSize.height) / 2;

  context.drawImage(image, x, y, fittedSize.width, fittedSize.height);
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

function chunkItems(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks.length ? chunks : [[]];
}

function normaliseCaption(value) {
  const caption = String(value ?? '').trim() || 'QR';

  return Array.from(caption).slice(0, 48).join('');
}

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&apos;';
      default:
        return character;
    }
  });
}
