import { useCallback, useEffect, useState } from 'react';
import { HistoryItem } from './historyTypes';
import {
  addHistoryItem,
  deleteHistoryItem,
  listHistory,
  updateHistoryItem,
} from './historyRepository';
import { exportHistoryItemToDevice } from './exportHistoryItem';
import { mergePdfFilesToAppFolder } from './mergePdfService';

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
    async (id: string) => {
      await deleteHistoryItem(id);
      await refresh();
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
    async (pdfItems: HistoryItem[], outputBaseName: string) => {
      if (pdfItems.length < 2) {
        throw new Error('Selecione pelo menos 2 PDFs para juntar.');
      }
      const hasNonPdf = pdfItems.some(i => i.format !== 'PDF');
      if (hasNonPdf) {
        throw new Error('Por enquanto, junte apenas PDFs.');
      }

      const { baseName, mergedPdfPath } = await mergePdfFilesToAppFolder({
        inputPdfPaths: pdfItems.map(i => i.savedInAppPath),
        outputBaseName,
      });

      const fileName = `${baseName}.pdf`;

      // exporta usando sua lógica existente
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

      await addHistoryItem({
        fileName,
        format: 'PDF',
        savedInAppPath: mergedPdfPath,
        exportedPath: exportResult.exportedPath,
      });

      await refresh();

      const message = exportResult.exportedPath
        ? 'PDF unificado salvo no app e exportado para Downloads.'
        : 'PDF unificado salvo no app. (Falhou exportar para Downloads.)';

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
    exportToDevice,
    mergePdfsAndExport,
  };
}
