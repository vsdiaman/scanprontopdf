import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { HistoryItem } from './historyTypes';
import { t } from '../../i18n';

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
  const base = stripExt(name);
  return `${base}${ext}`;
}

function addUniqueSuffix(fileName: string) {
  const ts = Date.now();
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex <= 0) return `${fileName}_${ts}`;

  const base = fileName.slice(0, dotIndex);
  const ext = fileName.slice(dotIndex); // inclui o "."
  return `${base}_${ts}${ext}`;
}

function isNameConflictError(error: unknown) {
  const message = String((error as any)?.message ?? '').toLowerCase();
  const code = String((error as any)?.code ?? '').toLowerCase();

  return (
    code === 'eexist' ||
    message.includes('already exists') ||
    message.includes('already-exists') ||
    message.includes('file exists') ||
    message.includes('name already') ||
    message.includes('duplicate')
  );
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
    throw new Error(t('export.mediaStoreUnavailable'));
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

  return contentUri as string;
}

async function exportPdfAndroid29Plus(appPath: string, displayName: string) {
  const mediaCollection = (ReactNativeBlobUtil as any)?.MediaCollection;
  if (!mediaCollection?.copyToMediaStore) {
    throw new Error(t('export.mediaStoreUnavailable'));
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

  return contentUri as string;
}

async function exportPdfLegacy(
  appPath: string,
  displayName: string,
  isRenaming: boolean,
) {
  const downloadsDir = RNFS.DownloadDirectoryPath;
  if (!downloadsDir) return undefined;

  let exportedPath = `${downloadsDir}/${displayName}`;

  const exists = await RNFS.exists(exportedPath);
  if (exists) {
    if (isRenaming) throw new Error(t('export.nameAlreadyExists'));
    exportedPath = `${downloadsDir}/${addUniqueSuffix(displayName)}`;
  }

  await RNFS.copyFile(stripFileScheme(appPath), exportedPath);
  return exportedPath;
}

type ExportOptions = {
  exportBaseName?: string;
};

export async function exportHistoryItemToDevice(
  item: HistoryItem,
  options?: ExportOptions,
) {
  const exists = await RNFS.exists(stripFileScheme(item.savedInAppPath));
  if (!exists) {
    throw new Error(t('export.fileMissing'));
  }

  const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : 0;

  const baseFromHistory = stripExt(item.fileName);
  const baseName = sanitizeBaseName(options?.exportBaseName ?? baseFromHistory);

  const isRenaming = !!options?.exportBaseName;

  // ✅ Se já foi exportado e o usuário NÃO pediu renomear, não exporta de novo.
  if (item.exportedPath && !isRenaming) {
    return {
      exportedPath: item.exportedPath,
      message: t('export.alreadyExported'),
    };
  }

  if (item.format === 'JPEG') {
    const displayName = ensureExtension(baseName || baseFromHistory, '.jpg');
    if (!displayName) throw new Error(t('export.invalidName'));

    if (Platform.OS === 'android' && apiLevel >= 29) {
      try {
        const exportedPath = await exportImageAndroid29Plus(
          item.savedInAppPath,
          displayName,
        );
        return { exportedPath, message: t('export.jpegExported') };
      } catch (error) {
        // Se o usuário escolheu nome (rename), não mexe no nome: manda ele trocar.
        if (isRenaming) {
          if (isNameConflictError(error)) {
            throw new Error(t('export.nameAlreadyExists'));
          }
          throw error;
        }

        if (!isNameConflictError(error)) {
          throw error;
        }

        // Se foi clique normal, tenta com sufixo pra evitar conflito.
        const fallbackName = addUniqueSuffix(displayName);
        const exportedPath = await exportImageAndroid29Plus(
          item.savedInAppPath,
          fallbackName,
        );
        return { exportedPath, message: t('export.jpegExported') };
      }
    }

    const allowed = await ensureLegacyWritePermission();
    if (!allowed) throw new Error(t('export.permissionDeniedGallery'));

    const exportedPath = await CameraRoll.save(
      withFileScheme(item.savedInAppPath),
      {
        type: 'photo',
        album: GALLERY_ALBUM,
      },
    );

    return { exportedPath, message: t('export.jpegExported') };
  }

  const displayName = ensureExtension(baseName || baseFromHistory, '.pdf');
  if (!displayName) throw new Error(t('export.invalidName'));

  if (Platform.OS === 'android' && apiLevel >= 29) {
    try {
      const exportedPath = await exportPdfAndroid29Plus(
        item.savedInAppPath,
        displayName,
      );
      return { exportedPath, message: t('export.pdfExported') };
    } catch (error) {
      if (isRenaming) {
        if (isNameConflictError(error)) {
          throw new Error(t('export.nameAlreadyExists'));
        }
        throw error;
      }

      if (!isNameConflictError(error)) {
        throw error;
      }

      const fallbackName = addUniqueSuffix(displayName);
      const exportedPath = await exportPdfAndroid29Plus(
        item.savedInAppPath,
        fallbackName,
      );
      return { exportedPath, message: t('export.pdfExported') };
    }
  }

  const allowed = await ensureLegacyWritePermission();
  if (!allowed) throw new Error(t('export.permissionDeniedDownloads'));

  const exportedPath = await exportPdfLegacy(
    item.savedInAppPath,
    displayName,
    isRenaming,
  );
  if (exportedPath) return { exportedPath, message: t('export.pdfExported') };

  return { exportedPath: undefined, message: t('export.pdfSavedOnly') };
}
