/* global document, window */
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import sharp from 'sharp';

const matterPayload = 'MT:OA3126F-034OCH6VQ00';
const desktopUrlPayload = 'https://example.com/guide?proof=a+b';
const batchFixtures = [
  { name: 'Hallway sensor', payload: matterPayload },
  { name: 'Porch light', payload: 'X-HM://0081YCYEP3QYT' },
  { name: 'Guest Wi-Fi', payload: 'WIFI:T:WPA;S:Guest;P:correct-horse;H:false;;' },
  { name: 'Studio guide', payload: 'https://example.com/guide' },
  { name: 'Studio email', payload: 'mailto:studio+qr@example.com?subject=Hello' },
  { name: 'Reception', payload: 'tel:+441234567890' },
  { name: 'Proof note', payload: 'QR Recast batch proof' },
];

test.describe('mobile recast journey', () => {
  test.use({
    colorScheme: 'light',
    hasTouch: true,
    isMobile: true,
    viewport: { height: 800, width: 360 },
  });

  test('uploads, styles, shares, and exports one QR code', async ({ context, page }, testInfo) => {
    const browserErrors = captureBrowserErrors(context);
    await installDeterministicSharing(context);
    await captureAnalyticsCommands(context);
    await openScanner(page);
    await uploadQr(page, matterPayload);

    await expect(page.getByRole('heading', { name: 'Your recast QR' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Recast QR code' })).toBeVisible();
    await expect(page.getByText('Matter device', { exact: true }).first()).toBeVisible();

    const cleanButton = page.getByRole('button', { name: 'Clean', exact: true });
    const labelledButton = page.getByRole('button', { name: 'Labelled', exact: true });
    const resultSvg = page.locator('.result-view__qr > svg');

    await expect(labelledButton).toHaveAttribute('aria-pressed', 'true');
    await expect(resultSvg).toHaveAttribute('viewBox', '0 0 320 418');

    await cleanButton.click();
    await expect(cleanButton).toHaveAttribute('aria-pressed', 'true');
    await expect(resultSvg).toHaveAttribute('viewBox', /^0 0 (\d+) \1$/);

    await labelledButton.click();
    await expect(labelledButton).toHaveAttribute('aria-pressed', 'true');
    await expect(resultSvg).toHaveAttribute('viewBox', '0 0 320 418');
    await expectMatterRowsToAlign(page);

    await expect(page.getByRole('button', { name: 'Copy URL' })).toBeEnabled();
    await page.getByRole('button', { name: 'Copy URL' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Copied' })).toBeVisible();

    const sharedUrl = await page.evaluate(() => window.__qrRecastCopiedText);
    const parsedSharedUrl = new URL(sharedUrl);

    expect(parsedSharedUrl.search).toBe('');
    expect(parsedSharedUrl.hash).toMatch(/^#q=.+/);
    expect(new URLSearchParams(parsedSharedUrl.hash.slice(1)).get('q')).toBeTruthy();

    const sharedPage = await context.newPage();
    await sharedPage.goto(sharedUrl);
    await expect(sharedPage.getByRole('heading', { name: 'Your recast QR' })).toBeVisible();
    await expect.poll(() => sharedPage.url()).not.toContain('#q=');
    await expect
      .poll(() =>
        sharedPage.evaluate(() =>
          window.__qrRecastAnalyticsCommands.find(
            (command) => command[0] === 'event' && command[1] === 'shared_url_loaded',
          ),
        ),
      )
      .toEqual([
        'event',
        'shared_url_loaded',
        expect.objectContaining({
          page_location: 'http://127.0.0.1:4173/qr-recast/',
          payload_kind: 'matter',
          result: 'success',
          source: 'shared_url',
        }),
      ]);
    await sharedPage.getByRole('button', { name: 'Show text' }).click();
    await expect(sharedPage.locator('.result-view__payload')).toHaveText(matterPayload);
    await sharedPage.close();

    const svgDownload = await downloadExport(page, 'SVG', testInfo);
    const svgText = svgDownload.contents.toString('utf8');

    expect(svgDownload.fileName).toMatch(/^qr-recast-[a-f0-9]{8}\.svg$/);
    expect(svgText).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(svgText).toContain('viewBox="0 0 320 418"');
    expect(svgText).toContain('x="16" y="68" width="288" height="288"');
    expectMatterSvgRowsToAlign(svgText);
    expect(svgText.trimEnd()).toMatch(/<\/svg>$/);

    const pngDownload = await downloadExport(page, 'PNG', testInfo);

    expect(pngDownload.fileName).toMatch(/^qr-recast-[a-f0-9]{8}\.png$/);
    expect(pngDownload.contents.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(pngDownload.contents.readUInt32BE(16)).toBeLessThan(
      pngDownload.contents.readUInt32BE(20),
    );

    const pdfDownload = await downloadExport(page, 'PDF', testInfo);

    expect(pdfDownload.fileName).toMatch(/^qr-recast-[a-f0-9]{8}\.pdf$/);
    expect(pdfDownload.contents.subarray(0, 5).toString('ascii')).toBe('%PDF-');
    expect(pdfDownload.contents.subarray(-2_048).toString('ascii')).toContain('%%EOF');

    const docxDownload = await downloadExport(page, 'DOCX', testInfo);
    const docxEntries = readZipEntryNames(docxDownload.contents);

    expect(docxDownload.fileName).toMatch(/^qr-recast-[a-f0-9]{8}\.docx$/);
    expect(docxDownload.contents.subarray(0, 4).toString('hex')).toBe('504b0304');
    expect(docxEntries).toContain('[Content_Types].xml');
    expect(docxEntries).toContain('word/document.xml');
    expect(docxEntries.some((name) => /^word\/media\/.+\.svg$/.test(name))).toBe(true);
    expect(docxEntries.some((name) => /^word\/media\/.+\.png$/.test(name))).toBe(true);
    expect(browserErrors).toEqual([]);
  });
});

test.describe('desktop smoke check', () => {
  test.use({
    colorScheme: 'dark',
    hasTouch: false,
    isMobile: false,
    viewport: { height: 1_000, width: 1_440 },
  });

  test('keeps the scanner and result within the viewport', async ({ context, page }) => {
    const browserErrors = captureBrowserErrors(context);
    await installDeterministicSharing(context);
    await openScanner(page);
    await expect(page.locator('html')).toHaveAttribute('data-dark', '');
    await expect(page.locator('.app-shell')).toHaveCSS('background-color', 'rgb(13, 18, 16)');
    await expectNoHorizontalOverflow(page);

    await page.getByRole('button', { name: 'Toggle between light and dark' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-light', '');
    await expect(page.locator('.app-shell')).toHaveCSS('background-color', 'rgb(239, 238, 231)');

    await uploadQr(page, desktopUrlPayload);
    await expect(page.getByRole('heading', { name: 'Your recast QR' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Recast QR code' })).toBeVisible();
    await page.getByRole('button', { name: 'Show text' }).click();

    const externalLink = page.getByRole('link', { name: 'Open link' });

    await expect(externalLink).toHaveAttribute('href', desktopUrlPayload);
    await expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(externalLink).toHaveAttribute('target', '_blank');
    await page.getByRole('button', { name: 'Close decoded text' }).click();
    await expectNoHorizontalOverflow(page);
    expect(browserErrors).toEqual([]);
  });
});

test.describe('batch proofing journey', () => {
  test.use({
    colorScheme: 'light',
    hasTouch: true,
    isMobile: true,
    viewport: { height: 900, width: 390 },
  });

  test('reorders, restyles, persists, and exports a two-page batch', async ({
    context,
    page,
  }, testInfo) => {
    const browserErrors = captureBrowserErrors(context);
    await installDeterministicSharing(context);
    await openScanner(page);
    await seedBatch(page, batchFixtures);
    await page.reload();
    await page.getByRole('button', { name: 'Batch', exact: true }).click();

    const items = page.locator('.batch-panel__item');

    await expect(items).toHaveCount(batchFixtures.length);
    await expect(page.getByText('7 codes saved')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const firstItem = items.first();
    const moveDownButton = firstItem.getByRole('button', { name: 'Move down' });
    const deleteButton = firstItem.getByRole('button', { name: 'Delete' });

    expect(
      await moveDownButton.evaluate((element) => window.getComputedStyle(element).color),
    ).not.toBe(await deleteButton.evaluate((element) => window.getComputedStyle(element).color));
    expect((await moveDownButton.boundingBox())?.height).toBeGreaterThanOrEqual(40);
    await firstItem.getByRole('button', { name: 'Artwork: Labelled' }).click();
    await expect(firstItem.getByRole('button', { name: 'Artwork: Clean' })).toBeVisible();

    const firstName = firstItem.getByRole('textbox', { name: 'Name' });
    await firstName.fill('Hall sensor proof');
    await firstName.press('Enter');
    await firstItem.getByRole('button', { name: 'Move down' }).click();
    await expect(items.first().getByRole('textbox', { name: 'Name' })).toHaveValue('Porch light');
    await expect(items.nth(1).getByRole('textbox', { name: 'Name' })).toHaveValue(
      'Hall sensor proof',
    );

    const savedBatch = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem('qr-recast:batch:v2')),
    );

    expect(savedBatch.items[1].name).toBe('Hall sensor proof');
    expect(savedBatch.items[1].branding.enabled).toBe(false);

    await page.locator('.batch-panel').screenshot({
      path: testInfo.outputPath('batch-contact-sheet.png'),
    });

    const svgDownload = await downloadBatchExport(page, 'SVG', testInfo);
    const pngDownload = await downloadBatchExport(page, 'PNG', testInfo);
    const pdfDownload = await downloadBatchExport(page, 'PDF', testInfo);
    const docxDownload = await downloadBatchExport(page, 'DOCX', testInfo);
    const sharedStem = svgDownload.fileName.replace(/\.svg$/, '');

    expect(sharedStem).toMatch(/^qr-recast-batch-7-[a-f0-9]{8}$/);
    expect(pngDownload.fileName).toBe(`${sharedStem}.png`);
    expect(pdfDownload.fileName).toBe(`${sharedStem}.pdf`);
    expect(docxDownload.fileName).toBe(`${sharedStem}.docx`);

    const svgText = svgDownload.contents.toString('utf8');

    expect(svgText).toContain('viewBox="0 0 794 2246"');
    expect(svgText).toContain('QR Recast · 1 / 2');
    expect(svgText).toContain('QR Recast · 2 / 2');
    expect(svgText.match(/shape-rendering="crispEdges"/g)).toHaveLength(batchFixtures.length - 1);

    expect(pngDownload.contents.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(pngDownload.contents.readUInt32BE(16)).toBe(1_588);
    expect(pngDownload.contents.readUInt32BE(20)).toBe(4_492);
    await expectBatchPngToDecode(
      pngDownload.contents,
      [batchFixtures[1], batchFixtures[0], ...batchFixtures.slice(2)].map(({ payload }) => payload),
    );

    expect(pdfDownload.contents.subarray(0, 5).toString('ascii')).toBe('%PDF-');
    expect(pdfDownload.contents.toString('latin1')).toContain('/Count 2');
    expect(pdfDownload.contents.subarray(-2_048).toString('ascii')).toContain('%%EOF');

    const docxEntries = readZipEntryNames(docxDownload.contents);

    expect(docxDownload.contents.subarray(0, 4).toString('hex')).toBe('504b0304');
    expect(docxEntries.filter((name) => /^word\/media\/.+\.svg$/.test(name))).toHaveLength(7);
    expect(docxEntries.filter((name) => /^word\/media\/.+\.png$/.test(name))).toHaveLength(7);
    expect(browserErrors).toEqual([]);
  });
});

function captureBrowserErrors(context) {
  const errors = [];
  const attachedPages = new WeakSet();

  function attach(page) {
    if (attachedPages.has(page)) return;
    attachedPages.add(page);
    page.on('pageerror', (error) => errors.push(`Page error: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`Console error: ${message.text()}`);
    });
  }

  context.pages().forEach(attach);
  context.on('page', attach);

  return errors;
}

async function installDeterministicSharing(context) {
  await context.addInitScript(() => {
    window.__qrRecastCopiedText = '';
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text) => {
          window.__qrRecastCopiedText = text;
        },
      },
    });
  });
}

async function captureAnalyticsCommands(context) {
  await context.addInitScript(() => {
    window.__qrRecastAnalyticsCommands = [];
    const dataLayer = [];

    dataLayer.push = (args) => {
      window.__qrRecastAnalyticsCommands.push(args);
      return Array.prototype.push.call(dataLayer, args);
    };
    window.dataLayer = dataLayer;
  });
}

async function openScanner(page) {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Point at a QR code' })).toBeVisible();
}

async function uploadQr(page, payload) {
  const qrImage = await QRCode.toBuffer(payload, {
    errorCorrectionLevel: 'H',
    margin: 4,
    type: 'png',
    width: 512,
  });

  await page.locator('input[type="file"][aria-label="Upload image"]').setInputFiles({
    buffer: qrImage,
    mimeType: 'image/png',
    name: 'matter-setup-code.png',
  });
}

async function expectMatterRowsToAlign(page) {
  const artwork = page.locator('.result-view__qr > svg');
  const rows = await artwork.evaluate((svg) => {
    const elements = [...svg.children];
    const logo = elements.find(
      (element) => element.tagName.toLowerCase() === 'svg' && element.getAttribute('y') === '18',
    );
    const qr = elements.find(
      (element) => element.tagName.toLowerCase() === 'svg' && element.getAttribute('y') === '68',
    );
    const code = elements.find(
      (element) => element.tagName.toLowerCase() === 'text' && element.getAttribute('y') === '386',
    );

    return {
      code: {
        width: code?.getAttribute('data-registration-width'),
        x: code?.getAttribute('data-registration-x'),
      },
      logo: { width: logo?.getAttribute('width'), x: logo?.getAttribute('x') },
      qr: {
        viewBox: qr?.getAttribute('viewBox'),
        width: qr?.getAttribute('width'),
        x: qr?.getAttribute('x'),
      },
    };
  });

  expectMatterRowMeasurements(rows);
}

async function downloadExport(page, format, testInfo) {
  await page.getByRole('button', { name: 'Download', exact: true }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: format, exact: true }).click();
  const download = await downloadPromise;
  const fileName = download.suggestedFilename();
  const path = testInfo.outputPath(fileName);

  await download.saveAs(path);

  return {
    contents: await readFile(path),
    fileName,
  };
}

async function downloadBatchExport(page, format, testInfo) {
  await page.getByRole('button', { name: 'Export batch', exact: true }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: format, exact: true }).click();
  const download = await downloadPromise;
  const fileName = download.suggestedFilename();
  const path = testInfo.outputPath(fileName);

  await download.saveAs(path);

  return {
    contents: await readFile(path),
    fileName,
  };
}

async function seedBatch(page, fixtures) {
  await page.evaluate((entries) => {
    const timestamp = new Date().toISOString();
    const items = entries.map((entry, index) => ({
      id: `batch-proof-${index + 1}`,
      name: entry.name,
      payload: entry.payload,
      branding: { enabled: true, kind: '' },
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    window.localStorage.setItem(
      'qr-recast:batch:v2',
      JSON.stringify({ items, updatedAt: timestamp, version: 2 }),
    );
  }, fixtures);
}

async function expectBatchPngToDecode(pngBuffer, payloads) {
  const pageWidth = 794;
  const pageHeight = 1_123;
  const margin = 56;
  const gutter = 34;
  const cellWidth = (pageWidth - margin * 2 - gutter) / 2;
  const qrSize = 224;
  const scale = 2;

  for (let index = 0; index < payloads.length; index += 1) {
    const pageIndex = Math.floor(index / 6);
    const itemIndex = index % 6;
    const column = itemIndex % 2;
    const row = Math.floor(itemIndex / 2);
    const x = margin + column * (cellWidth + gutter) + (cellWidth - qrSize) / 2;
    const y = pageIndex * pageHeight + 96 + row * 318;
    const { data, info } = await sharp(pngBuffer)
      .extract({
        height: qrSize * scale,
        left: Math.round(x * scale),
        top: Math.round(y * scale),
        width: qrSize * scale,
      })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const result = jsQR(new Uint8ClampedArray(data), info.width, info.height, {
      inversionAttempts: 'attemptBoth',
    });

    expect(result?.data).toBe(payloads[index]);
  }
}

async function expectNoHorizontalOverflow(page) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.body.scrollWidth <= window.innerWidth &&
          document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
}

function readZipEntryNames(buffer) {
  const endOfCentralDirectory = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));

  expect(endOfCentralDirectory).toBeGreaterThanOrEqual(0);

  const entryCount = buffer.readUInt16LE(endOfCentralDirectory + 10);
  let offset = buffer.readUInt32LE(endOfCentralDirectory + 16);
  const names = [];

  for (let index = 0; index < entryCount; index += 1) {
    expect(buffer.readUInt32LE(offset)).toBe(0x02014b50);

    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);

    names.push(buffer.subarray(offset + 46, offset + 46 + nameLength).toString('utf8'));
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return names;
}

function expectMatterSvgRowsToAlign(svg) {
  const logo = svg.match(/<svg x="([^"]+)" y="18" width="([^"]+)"/);
  const qr = svg.match(/<svg x="([^"]+)" y="68" width="([^"]+)"[^>]+viewBox="([^"]+)"/);
  const code = svg.match(
    /<text x="[^"]+" y="386"[^>]+data-registration-x="([^"]+)" data-registration-width="([^"]+)"/,
  );

  expect(logo).not.toBeNull();
  expect(qr).not.toBeNull();
  expect(code).not.toBeNull();
  expectMatterRowMeasurements({
    code: { width: code[2], x: code[1] },
    logo: { width: logo[2], x: logo[1] },
    qr: { viewBox: qr[3], width: qr[2], x: qr[1] },
  });
}

function expectMatterRowMeasurements({ code, logo, qr }) {
  const viewBoxWidth = Number(qr.viewBox.split(/\s+/)[2]);
  const quietZone = (4 / viewBoxWidth) * Number(qr.width);
  const symbolX = Number(qr.x) + quietZone;
  const symbolWidth = Number(qr.width) - quietZone * 2;

  expect(logo.x).toBe(code.x);
  expect(logo.width).toBe(code.width);
  expect(Number(logo.x)).toBeCloseTo(symbolX, 3);
  expect(Number(logo.width)).toBeCloseTo(symbolWidth, 3);
}
