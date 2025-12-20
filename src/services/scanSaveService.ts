import { Image, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { generatePDF } from 'react-native-html-to-pdf';

export type SaveFormat = 'PDF' | 'JPEG';

type SaveInput = {
  imageUri: string; // file://...
  fileName: string;
  format: SaveFormat;
};

type SaveResult = {
  savedInAppPath: string; // path local do app
  exportedPath?: string; // URI pública (content://...) ou path
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

function getImageSize(uri: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      error => reject(error),
    );
  });
}

function fitIntoBox(
  imageWidth: number,
  imageHeight: number,
  boxWidth: number,
  boxHeight: number,
) {
  const imageRatio = imageWidth / imageHeight;
  const boxRatio = boxWidth / boxHeight;

  if (imageRatio > boxRatio) {
    const width = boxWidth;
    const height = Math.round(boxWidth / imageRatio);
    return { width, height };
  }

  const height = boxHeight;
  const width = Math.round(boxHeight * imageRatio);
  return { width, height };
}

async function saveJpegToAppFolder(sourceUri: string, safeName: string) {
  const sourcePath = stripFileScheme(sourceUri);
  const destinationPath = `${APP_FOLDER}/${safeName}.jpg`;

  const alreadyExists = await RNFS.exists(destinationPath);
  if (alreadyExists) await RNFS.unlink(destinationPath);

  await RNFS.copyFile(sourcePath, destinationPath);
  return destinationPath;
}

async function exportJpegToGallery(appJpegPath: string) {
  // CameraRoll já salva em MediaStore e cria álbum
  const galleryUri = await CameraRoll.save(withFileScheme(appJpegPath), {
    type: 'photo',
    album: GALLERY_ALBUM,
  });

  return galleryUri;
}

/**
 * PDF via HTML: gera no Documents e move pro APP_FOLDER.
 * Usa generatePDF (API atual).
 */
async function savePdfToAppFolder(sourceUri: string, safeName: string) {
  const sourcePath = stripFileScheme(sourceUri);
  const imageUri = withFileScheme(sourcePath);

  // “A4” em px pro render do HTML->PDF (bom o suficiente pro MVP)
  const pageWidth = 794;
  const pageHeight = 1123;
  const padding = 24;

  const { width: imgW, height: imgH } = await getImageSize(imageUri);
  const boxW = pageWidth - padding * 2;
  const boxH = pageHeight - padding * 2;

  const fitted = fitIntoBox(imgW, imgH, boxW, boxH);

  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0; padding:0; width:${pageWidth}px; height:${pageHeight}px;">
        <div style="
          width:${pageWidth}px;
          height:${pageHeight}px;
          display:flex;
          justify-content:center;
          align-items:center;
          padding:${padding}px;
          box-sizing:border-box;
        ">
          <img
            src="${imageUri}"
            style="
              width:${fitted.width}px;
              height:${fitted.height}px;
              object-fit:contain;
            "
          />
        </div>
      </body>
    </html>
  `;

  const result = await generatePDF({
    html,
    fileName: safeName,
    base64: false,
    directory: 'Documents',
    width: pageWidth,
    height: pageHeight,
  });

  if (!result?.filePath) {
    throw new Error('PDF generation failed');
  }

  const generatedPdfPath = stripFileScheme(result.filePath);
  const finalPdfPath = `${APP_FOLDER}/${safeName}.pdf`;

  const finalExists = await RNFS.exists(finalPdfPath);
  if (finalExists) await RNFS.unlink(finalPdfPath);

  await RNFS.moveFile(generatedPdfPath, finalPdfPath);
  return finalPdfPath;
}

async function exportPdfToDownloads(appPdfPath: string, safeName: string) {
  if (Platform.OS !== 'android') return undefined;

  const pdfPath = stripFileScheme(appPdfPath);
  const displayName = `${safeName}.pdf`;

  const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : 0;

  // Android 10+ (API 29+) — salva em Downloads via MediaStore
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

        return contentUri as string; // content://...
      }
    } catch {
      // cai pro fallback
    }
  }

  // Android 9 ou menor — tenta copiar pro /Download (precisa WRITE_EXTERNAL_STORAGE)
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

export async function saveScanAndExport({
  imageUri,
  fileName,
  format,
}: SaveInput): Promise<SaveResult> {
  await ensureAppFolder();

  const safeName = sanitizeFileName(fileName) || `scan_${Date.now()}`;

  if (format === 'JPEG') {
    const savedInAppPath = await saveJpegToAppFolder(imageUri, safeName);
    const exportedPath = await exportJpegToGallery(savedInAppPath);
    return { savedInAppPath, exportedPath };
  }

  const savedInAppPath = await savePdfToAppFolder(imageUri, safeName);
  const exportedPath = await exportPdfToDownloads(savedInAppPath, safeName);
  return { savedInAppPath, exportedPath };
}

export function buildSaveSuccessMessage(
  format: SaveFormat,
  exportedPath?: string,
) {
  if (format === 'JPEG') return 'JPEG salvo no app e na galeria.';
  if (exportedPath) return 'PDF salvo no app e salvo em Downloads.';
  return 'PDF salvo no app. (Falhou exportar para Downloads neste aparelho.)';
}
