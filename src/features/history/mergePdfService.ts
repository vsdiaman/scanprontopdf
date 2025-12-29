import RNFS from 'react-native-fs';
import { PDFDocument } from 'pdf-lib';
import { Buffer } from 'buffer';

const APP_FOLDER = `${RNFS.DocumentDirectoryPath}/ScannerProntoPDF`;

function stripFileScheme(path: string) {
  return path.startsWith('file://') ? path.replace('file://', '') : path;
}

async function ensureAppFolder() {
  const exists = await RNFS.exists(APP_FOLDER);
  if (!exists) await RNFS.mkdir(APP_FOLDER);
}

function sanitizeBaseName(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 60);
}

export async function mergePdfFilesToAppFolder(params: {
  inputPdfPaths: string[]; // savedInAppPath de cada PDF
  outputBaseName: string; // sem extensão
}) {
  const { inputPdfPaths, outputBaseName } = params;

  if (inputPdfPaths.length < 2) {
    throw new Error('Selecione pelo menos 2 PDFs para juntar.');
  }

  await ensureAppFolder();

  const baseName = sanitizeBaseName(outputBaseName) || `merge_${Date.now()}`;
  const mergedPdfPath = `${APP_FOLDER}/${baseName}.pdf`;

  const alreadyExists = await RNFS.exists(mergedPdfPath);
  if (alreadyExists) await RNFS.unlink(mergedPdfPath);

  const mergedDoc = await PDFDocument.create();

  for (const rawPath of inputPdfPaths) {
    const pdfPath = stripFileScheme(rawPath);

    const exists = await RNFS.exists(pdfPath);
    if (!exists) {
      throw new Error('Um dos PDFs selecionados não existe mais no app.');
    }

    const base64 = await RNFS.readFile(pdfPath, 'base64');
    const bytes = Buffer.from(base64, 'base64');

    const srcDoc = await PDFDocument.load(bytes);
    const pages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
    for (const page of pages) mergedDoc.addPage(page);
  }

  const mergedBytes = await mergedDoc.save();
  const mergedBase64 = Buffer.from(mergedBytes).toString('base64');

  await RNFS.writeFile(mergedPdfPath, mergedBase64, 'base64');

  return { baseName, mergedPdfPath };
}
