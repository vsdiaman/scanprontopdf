import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { PDFDocument } from 'pdf-lib';
import { Buffer } from 'buffer';
import { t } from '../i18n';

export type SaveFormat = 'PDF' | 'JPEG';

type SaveInput = {
  fileName: string;
  format: SaveFormat;

  imageUri?: string;
  imageUris?: string[];
  pdfUri?: string;
};

type SaveResult = {
  savedInAppPath: string;
  exportedPath?: string;
};

const APP_FOLDER = `${RNFS.DocumentDirectoryPath}/ScannerProntoPDF`;
const GALLERY_ALBUM = 'Scanner Pronto PDF';

function stripFileScheme(uri: string) {
  return uri.startsWith('file://') ? uri.replace('file://', '') : uri;
}

function withFileScheme(path: string) {
  return path.startsWith('file://') ? path : `file://${path}`;
}

function sanitizeFileName(rawName: string) {
  return rawName
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '');
}

async function ensureAppFolder() {
  const exists = await RNFS.exists(APP_FOLDER);
  if (!exists) await RNFS.mkdir(APP_FOLDER);
}

async function ensureFileExists(path: string, message: string) {
  const exists = await RNFS.exists(path);
  if (!exists) throw new Error(message);
}

function normalizeInputUri(rawUri: string) {
  const trimmed = rawUri.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('file://') || trimmed.startsWith('content://')
    ? trimmed
    : withFileScheme(trimmed);
}

function normalizeImageUris(imageUri?: string, imageUris?: string[]) {
  const list = (imageUris ?? []).filter(Boolean).map(normalizeInputUri);
  if (imageUri) list.unshift(normalizeInputUri(imageUri));

  const seen = new Set<string>();
  return list.filter(Boolean).filter(uri => {
    if (seen.has(uri)) return false;
    seen.add(uri);
    return true;
  });
}

async function readUriAsBase64(uri: string) {
  if (uri.startsWith('content://')) {
    try {
      return await ReactNativeBlobUtil.fs.readFile(uri, 'base64');
    } catch {
      const tempPath = `${RNFS.CachesDirectoryPath}/scan_${Date.now()}.tmp`;
      await RNFS.copyFile(uri, tempPath);
      const base64 = await RNFS.readFile(tempPath, 'base64');
      await RNFS.unlink(tempPath).catch(() => {
        // ignore cleanup failure
      });
      return base64;
    }
  }

  const path = stripFileScheme(uri);
  await ensureFileExists(path, t('save.noImagesFromScanner'));
  return RNFS.readFile(path, 'base64');
}

async function copyUriToPath(sourceUri: string, destinationPath: string) {
  const alreadyExists = await RNFS.exists(destinationPath);
  if (alreadyExists) await RNFS.unlink(destinationPath);

  if (sourceUri.startsWith('content://')) {
    try {
      await RNFS.copyFile(sourceUri, destinationPath);
      return;
    } catch {
      const base64 = await readUriAsBase64(sourceUri);
      await RNFS.writeFile(destinationPath, base64, 'base64');
      return;
    }
  }

  const sourcePath = stripFileScheme(sourceUri);
  await ensureFileExists(sourcePath, t('save.noImagesFromScanner'));
  await RNFS.copyFile(sourcePath, destinationPath);
}

async function saveJpegToAppFolder(sourceUri: string, safeName: string) {
  const destinationPath = `${APP_FOLDER}/${safeName}.jpg`;
  await copyUriToPath(sourceUri, destinationPath);
  await ensureFileExists(destinationPath, t('preview.modalSaveErrorFallback'));
  return destinationPath;
}

async function exportJpegToGallery(appJpegPath: string) {
  const galleryUri = await CameraRoll.save(withFileScheme(appJpegPath), {
    type: 'photo',
    album: GALLERY_ALBUM,
  });

  return galleryUri;
}

function fitIntoBox(
  imageWidth: number,
  imageHeight: number,
  boxWidth: number,
  boxHeight: number,
) {
  const scale = Math.min(boxWidth / imageWidth, boxHeight / imageHeight);
  const width = Math.floor(imageWidth * scale);
  const height = Math.floor(imageHeight * scale);
  return { width, height };
}

async function buildPdfFromImagesToAppFolder(
  imageUris: string[],
  safeName: string,
) {
  const pageWidth = 595;
  const pageHeight = 842;
  const padding = 24;

  const boxW = pageWidth - padding * 2;
  const boxH = pageHeight - padding * 2;

  const pdf = await PDFDocument.create();

  for (const uri of imageUris) {
    const base64 = await readUriAsBase64(uri);
    const bytes = Buffer.from(base64, 'base64');

    let embedded: any;
    try {
      embedded = await pdf.embedJpg(bytes);
    } catch {
      embedded = await pdf.embedPng(bytes);
    }

    const fitted = fitIntoBox(embedded.width, embedded.height, boxW, boxH);

    const x = Math.floor((pageWidth - fitted.width) / 2);
    const y = Math.floor((pageHeight - fitted.height) / 2);

    const page = pdf.addPage([pageWidth, pageHeight]);
    page.drawImage(embedded, {
      x,
      y,
      width: fitted.width,
      height: fitted.height,
    });
  }

  const pdfBytes = await pdf.save();
  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

  const finalPdfPath = `${APP_FOLDER}/${safeName}.pdf`;
  const exists = await RNFS.exists(finalPdfPath);
  if (exists) await RNFS.unlink(finalPdfPath);

  await RNFS.writeFile(finalPdfPath, pdfBase64, 'base64');
  await ensureFileExists(finalPdfPath, t('preview.modalSaveErrorFallback'));
  return finalPdfPath;
}

async function savePdfUriToAppFolder(pdfUri: string, safeName: string) {
  const finalPdfPath = `${APP_FOLDER}/${safeName}.pdf`;
  await copyUriToPath(pdfUri, finalPdfPath);
  await ensureFileExists(finalPdfPath, t('preview.modalSaveErrorFallback'));
  return finalPdfPath;
}

async function exportPdfToDownloads(appPdfPath: string, safeName: string) {
  if (Platform.OS !== 'android') return undefined;

  const pdfPath = stripFileScheme(appPdfPath);
  const displayName = `${safeName}.pdf`;
  const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : 0;

  if (apiLevel >= 29) {
    try {
      const mediaCollection = (ReactNativeBlobUtil as any)?.MediaCollection;

      if (mediaCollection?.copyToMediaStore) {
        const contentUri = await mediaCollection.copyToMediaStore(
          {
            name: displayName,
            parentFolder: 'ScannerProntoPDF',
            mimeType: 'application/pdf',
          },
          'Download',
          pdfPath,
        );

        return contentUri as string;
      }
    } catch {
      // fallback
    }
  }

  const downloadsDir = RNFS.DownloadDirectoryPath;
  if (!downloadsDir) return undefined;

  const exportedPath = `${downloadsDir}/${displayName}`;
  try {
    const exists = await RNFS.exists(exportedPath);
    if (exists) await RNFS.unlink(exportedPath);

    await RNFS.copyFile(pdfPath, exportedPath);
    return exportedPath;
  } catch {
    return undefined;
  }
}

export async function saveScanAndExport(input: SaveInput): Promise<SaveResult> {
  const { fileName, format, pdfUri } = input;

  try {
    await ensureAppFolder();

    const safeName = sanitizeFileName(fileName) || `scan_${Date.now()}`;
    const imageUris = normalizeImageUris(input.imageUri, input.imageUris);

    if (format === 'JPEG') {
      if (imageUris.length !== 1) {
        throw new Error(t('save.jpegSinglePageOnly'));
      }

      const savedInAppPath = await saveJpegToAppFolder(imageUris[0], safeName);
      const exportedPath = await exportJpegToGallery(savedInAppPath);
      return { savedInAppPath, exportedPath };
    }

    let savedInAppPath: string;

    if (pdfUri) {
      savedInAppPath = await savePdfUriToAppFolder(pdfUri, safeName);
    } else {
      if (imageUris.length === 0) {
        throw new Error(t('save.noImagesFromScanner'));
      }
      savedInAppPath = await buildPdfFromImagesToAppFolder(imageUris, safeName);
    }

    const exportedPath = await exportPdfToDownloads(savedInAppPath, safeName);
    return { savedInAppPath, exportedPath };
  } catch (error) {
    console.error('[scanSaveService] saveScanAndExport failed', {
      format,
      fileName,
      imageCount: input.imageUris?.length ?? (input.imageUri ? 1 : 0),
      pdfUriProvided: Boolean(pdfUri),
      error,
    });
    throw error;
  }
}

export function buildSaveSuccessMessage(
  format: SaveFormat,
  exportedPath?: string,
) {
  if (format === 'JPEG') return t('save.jpegSaved');
  if (exportedPath) return t('save.pdfSavedAndExported');
  return t('save.pdfSavedOnly');
}
