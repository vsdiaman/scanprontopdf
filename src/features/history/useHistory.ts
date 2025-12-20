import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { listHistory } from './historyRepository';
import { HistoryItem } from './historyTypes';

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listHistory();
      setItems(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { items, isLoading, reload };
}
