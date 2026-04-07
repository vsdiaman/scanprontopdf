import { useCallback, useEffect, useState } from 'react';
import { Share } from 'react-native';
import RNFS from 'react-native-fs';
import { HistoryItem } from './historyTypes';
import {
  addHistoryItem,
  deleteHistoryItem,
  listHistory,
  updateHistoryItem,
} from './historyRepository';
import { exportHistoryItemToDevice } from './exportHistoryItem';
import { mergePdfFilesToAppFolder } from './mergePdfService';
import { t } from '../../i18n';

function stripFileScheme(path: string) {
  return path.startsWith('file://') ? path.replace('file://', '') : path;
}

function splitFileName(fileName: string) {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex <= 0) {
    return { base: fileName, ext: '' };
  }

  return {
    base: fileName.slice(0, dotIndex),
    ext: fileName.slice(dotIndex),
  };
}

function sanitizeBaseName(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 60);
}

async function buildUniquePath(
  folderPath: string,
  baseName: string,
  extension: string,
) {
  const cleanBaseName = sanitizeBaseName(baseName) || `${Date.now()}`;
  let attempt = 0;

  while (attempt < 200) {
    const suffix = attempt === 0 ? '' : `_${Date.now()}_${attempt}`;
    const candidateName = `${cleanBaseName}${suffix}${extension}`;
    const candidatePath = `${folderPath}/${candidateName}`;

    const exists = await RNFS.exists(candidatePath);
    if (!exists) {
      return {
        fileName: candidateName,
        fullPath: candidatePath,
      };
    }

    attempt += 1;
  }

  throw new Error(t('history.duplicateFailed'));
}

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listHistory();
      setItems(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const remove = useCallback(
    async (item: HistoryItem) => {
      const appPath = stripFileScheme(item.savedInAppPath);
      const exists = await RNFS.exists(appPath);

      if (exists) {
        await RNFS.unlink(appPath);
      }

      await deleteHistoryItem(item.id);
      await refresh();
    },
    [refresh],
  );

  const rename = useCallback(
    async (item: HistoryItem, nextBaseName: string) => {
      const appPath = stripFileScheme(item.savedInAppPath);
      const exists = await RNFS.exists(appPath);
      if (!exists) {
        throw new Error(t('export.fileMissing'));
      }

      const folderPath = appPath.slice(0, appPath.lastIndexOf('/'));
      const { ext } = splitFileName(item.fileName);
      const sanitizedBase = sanitizeBaseName(nextBaseName);
      if (!sanitizedBase) {
        throw new Error(t('export.invalidName'));
      }

      const nextFileName = `${sanitizedBase}${ext}`;
      const nextPath = `${folderPath}/${nextFileName}`;

      if (nextPath !== appPath) {
        const conflict = await RNFS.exists(nextPath);
        if (conflict) {
          throw new Error(t('export.nameAlreadyExists'));
        }

        await RNFS.moveFile(appPath, nextPath);
      }

      await updateHistoryItem(item.id, {
        fileName: nextFileName,
        savedInAppPath: nextPath,
      });
      await refresh();
    },
    [refresh],
  );

  const share = useCallback(async (item: HistoryItem) => {
    const appPath = stripFileScheme(item.savedInAppPath);
    const exists = await RNFS.exists(appPath);
    if (!exists) {
      throw new Error(t('export.fileMissing'));
    }

    await Share.share({
      title: item.fileName,
      url: `file://${appPath}`,
      message: item.fileName,
    });
  }, []);

  const duplicate = useCallback(
    async (item: HistoryItem) => {
      const appPath = stripFileScheme(item.savedInAppPath);
      const exists = await RNFS.exists(appPath);
      if (!exists) {
        throw new Error(t('export.fileMissing'));
      }

      const folderPath = appPath.slice(0, appPath.lastIndexOf('/'));
      const { base, ext } = splitFileName(item.fileName);

      const copyBaseName = `${base}_copy`;
      const unique = await buildUniquePath(folderPath, copyBaseName, ext);

      await RNFS.copyFile(appPath, unique.fullPath);

      const created = await addHistoryItem({
        fileName: unique.fileName,
        format: item.format,
        savedInAppPath: unique.fullPath,
      });

      await refresh();
      return created;
    },
    [refresh],
  );

  const exportToDevice = useCallback(
    async (item: HistoryItem, exportBaseName?: string) => {
      const result = await exportHistoryItemToDevice(item, { exportBaseName });

      if (result.exportedPath) {
        await updateHistoryItem(item.id, { exportedPath: result.exportedPath });
        await refresh();
      }

      return result;
    },
    [refresh],
  );

  const mergePdfsAndExport = useCallback(
    async (
      pdfItems: HistoryItem[],
      outputBaseName: string,
      onProgress?: (progress: number, status: string) => void,
    ) => {
      const notifyProgress = (progress: number, status: string) => {
        onProgress?.(Math.max(0, Math.min(100, Math.round(progress))), status);
      };

      if (pdfItems.length < 2) {
        throw new Error(t('history.mergeNeedAtLeastTwo'));
      }
      const hasNonPdf = pdfItems.some(i => i.format !== 'PDF');
      if (hasNonPdf) {
        throw new Error(t('history.mergePdfOnly'));
      }
      notifyProgress(3, t('history.mergeProgressValidating'));

      const { baseName, mergedPdfPath } = await mergePdfFilesToAppFolder({
        inputPdfPaths: pdfItems.map(i => i.savedInAppPath),
        outputBaseName,
        onProgress: notifyProgress,
      });

      const fileName = `${baseName}.pdf`;

      const tempItem: HistoryItem = {
        id: 'temp',
        createdAt: Date.now(),
        fileName,
        format: 'PDF',
        savedInAppPath: mergedPdfPath,
      };

      const exportResult = await exportHistoryItemToDevice(tempItem, {
        exportBaseName: baseName,
      });
      notifyProgress(95, t('history.mergeProgressFinalizing'));

      await addHistoryItem({
        fileName,
        format: 'PDF',
        savedInAppPath: mergedPdfPath,
        exportedPath: exportResult.exportedPath,
      });

      await refresh();
      notifyProgress(100, t('history.mergeProgressDone'));

      const message = exportResult.exportedPath
        ? t('history.mergedExported')
        : t('history.mergedSavedOnly');

      return { ...exportResult, message };
    },
    [refresh],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    items,
    isLoading,
    refresh,
    remove,
    rename,
    share,
    duplicate,
    exportToDevice,
    mergePdfsAndExport,
  };
}
