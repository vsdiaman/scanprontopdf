import RNFS from 'react-native-fs';
import { PDFDocument } from 'pdf-lib';
import { Buffer } from 'buffer';
import { t } from '../../i18n';

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
  inputPdfPaths: string[];
  outputBaseName: string;
  onProgress?: (progress: number, status: string) => void;
}) {
  const { inputPdfPaths, outputBaseName, onProgress } = params;

  const notifyProgress = (progress: number, status: string) => {
    onProgress?.(Math.max(0, Math.min(100, Math.round(progress))), status);
  };

  if (inputPdfPaths.length < 2) {
    throw new Error(t('history.mergeNeedAtLeastTwo'));
  }
  notifyProgress(5, t('history.mergeProgressValidating'));

  await ensureAppFolder();
  notifyProgress(12, t('history.mergeProgressPreparing'));

  const baseName = sanitizeBaseName(outputBaseName) || `merge_${Date.now()}`;
  const mergedPdfPath = `${APP_FOLDER}/${baseName}.pdf`;

  const alreadyExists = await RNFS.exists(mergedPdfPath);
  if (alreadyExists) await RNFS.unlink(mergedPdfPath);

  const mergedDoc = await PDFDocument.create();
  notifyProgress(20, t('history.mergeProgressReading'));

  for (const [index, rawPath] of inputPdfPaths.entries()) {
    const pdfPath = stripFileScheme(rawPath);

    const exists = await RNFS.exists(pdfPath);
    if (!exists) {
      throw new Error(t('history.mergeMissingPdf'));
    }

    const base64 = await RNFS.readFile(pdfPath, 'base64');
    const bytes = Buffer.from(base64, 'base64');

    const srcDoc = await PDFDocument.load(bytes);
    const pages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
    for (const page of pages) mergedDoc.addPage(page);

    const ratio = (index + 1) / inputPdfPaths.length;
    notifyProgress(20 + ratio * 55, t('history.mergeProgressMerging'));
  }

  notifyProgress(80, t('history.mergeProgressWriting'));
  const mergedBytes = await mergedDoc.save();
  const mergedBase64 = Buffer.from(mergedBytes).toString('base64');

  await RNFS.writeFile(mergedPdfPath, mergedBase64, 'base64');
  notifyProgress(90, t('history.mergeProgressFinalizing'));

  return { baseName, mergedPdfPath };
}
