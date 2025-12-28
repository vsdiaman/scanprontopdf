import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryItem } from './historyTypes';

const HISTORY_KEY = '@scanprontopdf_history_v1';

export async function listHistory(): Promise<HistoryItem[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    const items = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function addHistoryItem(
  item: Omit<HistoryItem, 'id' | 'createdAt'>,
) {
  const current = await listHistory();

  const newItem: HistoryItem = {
    id: String(Date.now()),
    createdAt: Date.now(),
    ...item,
  };

  const next = [newItem, ...current];
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return newItem;
}

export async function deleteHistoryItem(id: string) {
  const current = await listHistory();
  const next = current.filter(item => item.id !== id);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export async function updateHistoryItem(
  id: string,
  patch: Partial<Omit<HistoryItem, 'id' | 'createdAt'>>,
) {
  const current = await listHistory();

  const next = current.map(item => {
    if (item.id !== id) return item;
    return { ...item, ...patch };
  });

  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}
