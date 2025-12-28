import { useCallback, useEffect, useState } from 'react';
import { HistoryItem } from './historyTypes';
import {
  deleteHistoryItem,
  listHistory,
  updateHistoryItem,
} from './historyRepository';
import { exportHistoryItemToDevice } from './exportHistoryItem';

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

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, isLoading, refresh, remove, exportToDevice };
}
