import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useHistory } from './useHistory';
import { HistoryItem } from './historyTypes';

interface HistoryCardProps {
  externalSelectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  isSelectionEnabled: boolean;
  onToggleSelectionMode: (enabled: boolean) => void;
}

export function HistoryCard({
  externalSelectedIds,
  onSelectionChange,
  isSelectionEnabled,
  onToggleSelectionMode,
}: HistoryCardProps) {
  const { items, isLoading, remove, exportToDevice } = useHistory();

  const toggleItem = (id: string) => {
    if (!isSelectionEnabled) onToggleSelectionMode(true);

    const newSelection = externalSelectedIds.includes(id)
      ? externalSelectedIds.filter(item => item !== id)
      : [...externalSelectedIds, id];

    onSelectionChange(newSelection);
    if (newSelection.length === 0) onToggleSelectionMode(false);
  };

  const renderItem = (item: HistoryItem) => {
    const isSelected = externalSelectedIds.includes(item.id);

    return (
      <Pressable
        key={item.id}
        onPress={() => (isSelectionEnabled ? toggleItem(item.id) : null)}
        onLongPress={() => toggleItem(item.id)}
        style={[styles.itemCard, isSelected && styles.itemSelected]}
      >
        <View style={styles.itemContent}>
          <View style={styles.iconContainer}>
            <Icon
              name={isSelected ? 'check-circle' : 'file-pdf-box'}
              size={30}
              color={isSelected ? '#2563EB' : '#EF4444'}
            />
          </View>

          <View style={styles.info}>
            <Text style={styles.fileName} numberOfLines={1}>
              {item.fileName}
            </Text>
            <Text style={styles.fileDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {!isSelectionEnabled && (
            <Pressable
              style={styles.moreButton}
              onPress={() => exportToDevice(item)}
            >
              <Icon name="dots-vertical" size={20} color="#64748B" />
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Documentos Recentes</Text>
        {isSelectionEnabled && (
          <Pressable
            onPress={() => {
              onSelectionChange([]);
              onToggleSelectionMode(false);
            }}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : items.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum documento encontrado.</Text>
      ) : (
        <View style={styles.list}>{items.map(renderItem)}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  cancelText: { color: '#EF4444', fontWeight: '700' },
  list: { gap: 12 },
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemSelected: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  itemContent: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { marginRight: 15 },
  info: { flex: 1 },
  fileName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  fileDate: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  moreButton: { padding: 5 },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 20,
    fontSize: 14,
  },
});
