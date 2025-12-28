import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { HistoryItem } from './historyTypes';

const GALLERY_ALBUM = 'Scanner Pronto PDF';

function stripFileScheme(path: string) {
  return path.startsWith('file://') ? path.replace('file://', '') : path;
}

function withFileScheme(path: string) {
  return path.startsWith('file://') ? path : `file://${path}`;
}

function stripExt(fileName: string) {
  return fileName.replace(/\.(pdf|jpe?g)$/i, '');
}

function sanitizeBaseName(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 60);
}

function ensureExtension(baseOrName: string, ext: '.pdf' | '.jpg') {
  const name = baseOrName.trim();
  if (!name) return '';
  if (name.toLowerCase().endsWith(ext)) return name;
  // se vier com outra extensão, remove e aplica a correta
  const base = stripExt(name);
  return `${base}${ext}`;
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

async function exportImageAndroid29Plus(appPath: string, displayName: string) {
  const mediaCollection = (ReactNativeBlobUtil as any)?.MediaCollection;
  if (!mediaCollection?.copyToMediaStore) {
    throw new Error('MediaStore indisponível neste aparelho.');
  }

  const contentUri = await mediaCollection.copyToMediaStore(
    {
      name: displayName,
      parentFolder: 'ScannerProntoPDF',
      mimeType: 'image/jpeg',
    },
    'Image',
    stripFileScheme(appPath),
  );

  return contentUri as string; // content://...
}

async function exportPdfAndroid29Plus(appPath: string, displayName: string) {
  const mediaCollection = (ReactNativeBlobUtil as any)?.MediaCollection;
  if (!mediaCollection?.copyToMediaStore) {
    throw new Error('MediaStore indisponível neste aparelho.');
  }

  const contentUri = await mediaCollection.copyToMediaStore(
    {
      name: displayName,
      parentFolder: 'ScannerProntoPDF',
      mimeType: 'application/pdf',
    },
    'Download',
    stripFileScheme(appPath),
  );

  return contentUri as string; // content://...
}

async function exportPdfLegacy(appPath: string, displayName: string) {
  const downloadsDir = RNFS.DownloadDirectoryPath;
  if (!downloadsDir) return undefined;

  const exportedPath = `${downloadsDir}/${displayName}`;

  const exists = await RNFS.exists(exportedPath);
  if (exists) await RNFS.unlink(exportedPath);

  await RNFS.copyFile(stripFileScheme(appPath), exportedPath);
  return exportedPath;
}

type ExportOptions = {
  exportBaseName?: string; // sem extensão (ex: "meu_doc_2025")
};

export async function exportHistoryItemToDevice(
  item: HistoryItem,
  options?: ExportOptions,
) {
  const exists = await RNFS.exists(stripFileScheme(item.savedInAppPath));
  if (!exists) {
    throw new Error('Arquivo não existe mais no app (foi apagado).');
  }

  const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : 0;

  const baseFromHistory = stripExt(item.fileName);
  const baseName = sanitizeBaseName(options?.exportBaseName ?? baseFromHistory);

  if (item.format === 'JPEG') {
    const displayName = ensureExtension(baseName || baseFromHistory, '.jpg');
    if (!displayName) throw new Error('Nome inválido.');

    if (Platform.OS === 'android' && apiLevel >= 29) {
      const exportedPath = await exportImageAndroid29Plus(
        item.savedInAppPath,
        displayName,
      );
      return { exportedPath, message: 'JPEG exportado para a Galeria.' };
    }

    // fallback (nome pode não ficar exatamente como você quer em aparelhos antigos)
    const allowed = await ensureLegacyWritePermission();
    if (!allowed) throw new Error('Permissão negada para salvar na galeria.');

    const exportedPath = await CameraRoll.save(
      withFileScheme(item.savedInAppPath),
      {
        type: 'photo',
        album: GALLERY_ALBUM,
      },
    );

    return { exportedPath, message: 'JPEG exportado para a Galeria.' };
  }

  // PDF
  const displayName = ensureExtension(baseName || baseFromHistory, '.pdf');
  if (!displayName) throw new Error('Nome inválido.');

  if (Platform.OS === 'android' && apiLevel >= 29) {
    const exportedPath = await exportPdfAndroid29Plus(
      item.savedInAppPath,
      displayName,
    );
    return { exportedPath, message: 'PDF exportado para Downloads.' };
  }

  const allowed = await ensureLegacyWritePermission();
  if (!allowed) throw new Error('Permissão negada para salvar em Downloads.');

  const exportedPath = await exportPdfLegacy(item.savedInAppPath, displayName);
  if (exportedPath)
    return { exportedPath, message: 'PDF exportado para Downloads.' };

  return {
    exportedPath: undefined,
    message: 'PDF salvo no app, mas falhou exportar para Downloads.',
  };
}
