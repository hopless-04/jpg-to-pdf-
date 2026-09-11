const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');
const { createCanvas } = require('@napi-rs/canvas');

const BASE_URL = 'http://localhost:5000';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('STARTING PDF ↔ JPG CONVERTER FULL VERIFICATION SUITE');
  console.log('====================================================\n');

  // Start the backend server programmatically
  const { app, server } = require('./server');
  await sleep(1000);

  const testDir = path.join(__dirname, 'test-artifacts');
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      testsPassed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      testsFailed++;
    }
  }

  try {
    // 1. Health check
    console.log('--- Test 1: Health Check Endpoint ---');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthJson = await healthRes.json();
    assert(healthRes.status === 200 && healthJson.status === 'ok', 'GET /api/health returns 200 OK');

    // 2. Generate a synthetic 3-page test PDF
    console.log('\n--- Test 2: Synthesize Multi-page PDF ---');
    const pdfDoc = await PDFDocument.create();
    for (let i = 1; i <= 3; i++) {
      const page = pdfDoc.addPage([500, 700]);
      page.drawText(`PDF Test Document - Page ${i}`, {
        x: 50,
        y: 600,
        size: 28,
        color: rgb(i === 1 ? 0.8 : 0.1, i === 2 ? 0.7 : 0.2, i === 3 ? 0.9 : 0.3)
      });
    }
    const pdfBytes = await pdfDoc.save();
    const testPdfPath = path.join(testDir, 'multipage-sample.pdf');
    fs.writeFileSync(testPdfPath, pdfBytes);
    assert(fs.existsSync(testPdfPath), 'Synthetic 3-page PDF generated');

    // 3. Test PDF Info
    console.log('\n--- Test 3: POST /api/pdf-info ---');
    const formInfo = new FormData();
    formInfo.append('file', new Blob([fs.readFileSync(testPdfPath)], { type: 'application/pdf' }), 'multipage-sample.pdf');
    const infoRes = await fetch(`${BASE_URL}/api/pdf-info`, { method: 'POST', body: formInfo });
    const infoJson = await infoRes.json();
    assert(infoRes.status === 200 && infoJson.success === true, 'PDF Info endpoint responded successfully');
    assert(infoJson.data.pageCount === 3, 'Correctly detected 3 pages in PDF');

    // 4. Test PDF to JPG Conversion (All pages, 150 DPI, Medium quality)
    console.log('\n--- Test 4: POST /api/pdf-to-jpg (All Pages) ---');
    const formConvAll = new FormData();
    formConvAll.append('file', new Blob([fs.readFileSync(testPdfPath)], { type: 'application/pdf' }), 'multipage-sample.pdf');
    formConvAll.append('quality', 'medium');
    formConvAll.append('dpi', '150');
    formConvAll.append('pageRange', 'all');

    const convAllRes = await fetch(`${BASE_URL}/api/pdf-to-jpg`, { method: 'POST', body: formConvAll });
    const convAllJson = await convAllRes.json();
    assert(convAllRes.status === 200 && convAllJson.success === true, 'PDF to JPG conversion succeeded');
    assert(convAllJson.data.pages.length === 3, 'Generated exactly 3 JPG pages');
    assert(!!convAllJson.data.zipDownloadUrl, 'ZIP download URL provided');

    // Download first page and verify it's a real JPEG
    const firstPageUrl = `${BASE_URL}${convAllJson.data.pages[0].downloadUrl}`;
    const pageDownloadRes = await fetch(firstPageUrl);
    const pageBuffer = Buffer.from(await pageDownloadRes.arrayBuffer());
    assert(
      pageDownloadRes.status === 200 &&
      pageBuffer[0] === 0xFF && pageBuffer[1] === 0xD8 && pageBuffer[2] === 0xFF,
      'Downloaded page 1 is a valid JPEG binary'
    );

    // Download ZIP archive and verify signature (PK..)
    const zipUrl = `${BASE_URL}${convAllJson.data.zipDownloadUrl}`;
    const zipRes = await fetch(zipUrl);
    const zipBuffer = Buffer.from(await zipRes.arrayBuffer());
    assert(
      zipRes.status === 200 &&
      zipBuffer[0] === 0x50 && zipBuffer[1] === 0x4B,
      'Downloaded ZIP is a valid zip archive binary'
    );

    // 5. Test PDF to JPG with Custom Page Range ("1,3")
    console.log('\n--- Test 5: POST /api/pdf-to-jpg (Custom Page Range "1,3") ---');
    const formConvRange = new FormData();
    formConvRange.append('file', new Blob([fs.readFileSync(testPdfPath)], { type: 'application/pdf' }), 'multipage-sample.pdf');
    formConvRange.append('quality', 'high');
    formConvRange.append('dpi', '300');
    formConvRange.append('pageRange', '1,3');

    const convRangeRes = await fetch(`${BASE_URL}/api/pdf-to-jpg`, { method: 'POST', body: formConvRange });
    const convRangeJson = await convRangeRes.json();
    assert(convRangeRes.status === 200 && convRangeJson.data.pages.length === 2, 'Generated exactly 2 pages for range "1,3"');
    assert(convRangeJson.data.pages[0].pageNumber === 1 && convRangeJson.data.pages[1].pageNumber === 3, 'Pages numbers match 1 and 3');

    // 6. Test Synthesizing Images for JPG to PDF
    console.log('\n--- Test 6: Synthesize Sample Images ---');
    const imgPaths = [];
    for (let i = 1; i <= 3; i++) {
      const c = createCanvas(600, 400);
      const ctx = c.getContext('2d');
      ctx.fillStyle = i === 1 ? '#e11d48' : (i === 2 ? '#2563eb' : '#059669');
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '32px sans-serif';
      ctx.fillText(`Image Number ${i}`, 180, 210);

      const buf = c.toBuffer('image/jpeg', 85);
      const imgPath = path.join(testDir, `test-img-${i}.jpg`);
      fs.writeFileSync(imgPath, buf);
      imgPaths.push(imgPath);
    }
    assert(imgPaths.length === 3, 'Synthesized 3 distinct JPEG images');

    // 7. Test JPG to PDF Conversion with Custom Options
    console.log('\n--- Test 7: POST /api/jpg-to-pdf ---');
    const formJpgToPdf = new FormData();
    for (const p of imgPaths) {
      formJpgToPdf.append('files', new Blob([fs.readFileSync(p)], { type: 'image/jpeg' }), path.basename(p));
    }
    formJpgToPdf.append('pageSize', 'a4');
    formJpgToPdf.append('orientation', 'auto');
    formJpgToPdf.append('imageFit', 'fit');
    formJpgToPdf.append('margin', 'small');
    formJpgToPdf.append('pdfName', 'my_portfolio');
    // Test custom reordering: [3, 1, 2]
    formJpgToPdf.append('order', JSON.stringify(['test-img-3.jpg', 'test-img-1.jpg', 'test-img-2.jpg']));

    const jpgToPdfRes = await fetch(`${BASE_URL}/api/jpg-to-pdf`, { method: 'POST', body: formJpgToPdf });
    const jpgToPdfJson = await jpgToPdfRes.json();
    assert(jpgToPdfRes.status === 200 && jpgToPdfJson.success === true, 'JPG to PDF conversion succeeded');
    assert(jpgToPdfJson.data.pageCount === 3, 'Resulting PDF reports 3 pages');

    // Download generated PDF and verify
    const genPdfRes = await fetch(`${BASE_URL}${jpgToPdfJson.data.downloadUrl}`);
    const genPdfBytes = Buffer.from(await genPdfRes.arrayBuffer());
    assert(genPdfBytes.subarray(0, 5).toString('ascii') === '%PDF-', 'Downloaded file is a genuine PDF');

    const loadedGenPdf = await PDFDocument.load(genPdfBytes);
    assert(loadedGenPdf.getPageCount() === 3, 'pdf-lib verified generated PDF has exactly 3 pages');

    // 8. Test Invalid File Upload (Spoofed Extension)
    console.log('\n--- Test 8: Security & Header Validation (Spoofed File) ---');
    const fakePdfPath = path.join(testDir, 'fake.pdf');
    fs.writeFileSync(fakePdfPath, 'This is plain text pretending to be a PDF file.');
    const formFake = new FormData();
    formFake.append('file', new Blob([fs.readFileSync(fakePdfPath)], { type: 'application/pdf' }), 'fake.pdf');

    const fakeRes = await fetch(`${BASE_URL}/api/pdf-to-jpg`, { method: 'POST', body: formFake });
    const fakeJson = await fakeRes.json();
    assert(
      fakeRes.status === 400 && fakeJson.success === false && !fakeJson.stack,
      'Spoofed text file rejected with 400 and no stack trace leak'
    );

    // 9. Test Invalid Image Upload
    console.log('\n--- Test 9: Security & Header Validation (Invalid Image) ---');
    const fakeImgPath = path.join(testDir, 'corrupted.jpg');
    fs.writeFileSync(fakeImgPath, 'not a real jpeg content');
    const formFakeImg = new FormData();
    formFakeImg.append('files', new Blob([fs.readFileSync(fakeImgPath)], { type: 'image/jpeg' }), 'corrupted.jpg');

    const fakeImgRes = await fetch(`${BASE_URL}/api/jpg-to-pdf`, { method: 'POST', body: formFakeImg });
    const fakeImgJson = await fakeImgRes.json();
    assert(
      fakeImgRes.status === 400 && fakeImgJson.success === false,
      'Invalid image header rejected cleanly'
    );

    // Cleanup test artifacts
    fs.rmSync(testDir, { recursive: true, force: true });

    console.log('\n====================================================');
    console.log(`TEST SUITE RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
    console.log('====================================================');

  } catch (err) {
    console.error('Test suite error:', err);
    testsFailed++;
  } finally {
    server.close();
    process.exit(testsFailed > 0 ? 1 : 0);
  }
}

runTestSuite();
