import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { HistoryItem } from './historyTypes';

const GALLERY_ALBUM = 'Scanner Pronto PDF';

function withFileScheme(path: string) {
  return path.startsWith('file://') ? path : `file://${path}`;
}

function stripExt(fileName: string) {
  return fileName.replace(/\.(pdf|jpe?g)$/i, '');
}

function sanitizeFileName(rawName: string) {
  return rawName
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '');
}

async function ensureLegacyWritePermission() {
  if (Platform.OS !== 'android') return true;

  const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : 0;
  if (apiLevel >= 29) return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

async function exportJpegToGallery(appJpegPath: string) {
  const allowed = await ensureLegacyWritePermission();
  if (!allowed) throw new Error('Permissão negada para salvar na galeria.');

  return CameraRoll.save(withFileScheme(appJpegPath), {
    type: 'photo',
    album: GALLERY_ALBUM,
  });
}

async function exportPdfToDownloads(appPdfPath: string, fileName: string) {
  if (Platform.OS !== 'android') return undefined;

  const allowed = await ensureLegacyWritePermission();
  if (!allowed) throw new Error('Permissão negada para salvar em Downloads.');

  const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : 0;

  const baseName = sanitizeFileName(stripExt(fileName)) || `scan_${Date.now()}`;
  const displayName = fileName.toLowerCase().endsWith('.pdf')
    ? fileName
    : `${baseName}.pdf`;

  // Android 10+ (API 29+) -> MediaStore (sem permissão ampla)
  if (apiLevel >= 29) {
    const mediaCollection = (ReactNativeBlobUtil as any)?.MediaCollection;

    if (mediaCollection?.copyToMediaStore) {
      const contentUri = await mediaCollection.copyToMediaStore(
        {
          name: displayName,
          parentFolder: 'ScannerProntoPDF',
          mimeType: 'application/pdf',
        },
        'Download',
        appPdfPath,
      );

      return contentUri as string; // content://...
    }
  }

  // Android 9 ou menor -> copia pro /Download (precisa permissão legacy)
  const downloadsDir = RNFS.DownloadDirectoryPath;
  if (!downloadsDir) return undefined;

  const exportedPath = `${downloadsDir}/${displayName}`;

  const exists = await RNFS.exists(exportedPath);
  if (exists) await RNFS.unlink(exportedPath);

  await RNFS.copyFile(appPdfPath, exportedPath);
  return exportedPath;
}

export async function exportHistoryItemToDevice(item: HistoryItem) {
  const exists = await RNFS.exists(item.savedInAppPath);
  if (!exists) {
    throw new Error('Arquivo não existe mais no app (foi apagado).');
  }

  if (item.format === 'JPEG') {
    const exportedPath = await exportJpegToGallery(item.savedInAppPath);
    return { exportedPath, message: 'JPEG exportado para a Galeria.' };
  }

  const exportedPath = await exportPdfToDownloads(
    item.savedInAppPath,
    item.fileName,
  );
  if (exportedPath) {
    return { exportedPath, message: 'PDF exportado para Downloads.' };
  }

  return {
    exportedPath: undefined,
    message: 'PDF salvo no app, mas falhou exportar para Downloads.',
  };
}
