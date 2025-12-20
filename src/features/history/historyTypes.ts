export type HistoryFormat = 'PDF' | 'JPEG';

export type HistoryItem = {
  id: string;
  fileName: string;
  format: HistoryFormat;
  savedInAppPath: string;
  exportedPath?: string;
  createdAt: number;
};

export type AddHistoryInput = Omit<HistoryItem, 'id' | 'createdAt'>;
