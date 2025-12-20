import AsyncStorage from '@react-native-async-storage/async-storage';
import { AddHistoryInput, HistoryItem } from './historyTypes';

const STORAGE_KEY = 'scanner_pronto_pdf.history.v1';

export async function listHistory(): Promise<HistoryItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const data = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function addHistoryItem(
  input: AddHistoryInput,
): Promise<HistoryItem> {
  const current = await listHistory();

  const item: HistoryItem = {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(),
    ...input,
  };

  const next = [item, ...current].slice(0, 50); // limita
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));

  return item;
}

export async function clearHistory() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
