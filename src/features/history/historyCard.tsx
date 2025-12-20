import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Card } from '../../components/Card';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useHistory } from './useHistory';
import Icon from 'react-native-vector-icons/MaterialIcons';

function formatDate(ts: number) {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm} ${hh}:${min}`;
}

export function HistoryCard() {
  const { items, isLoading, remove, refresh } = useHistory();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // >>> isso aqui resolve: sempre que voltar pra Home, atualiza a lista
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const count = items.length;

  const headerRight = useMemo(() => {
    if (isLoading) return '...';
    if (count === 0) return 'Nenhum documento';
    return String(count);
  }, [isLoading, count]);

  const visibleItems = items.slice(0, 5);

  const pendingItem = pendingDeleteId
    ? items.find(i => i.id === pendingDeleteId)
    : undefined;

  const onAskDelete = (id: string) => setPendingDeleteId(id);

  const onCancelDelete = () => setPendingDeleteId(null);

  const onConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    await remove(id);
  };

  return (
    <>
      <Card>
        <View style={styles.header}>
          <Text style={styles.title}>Recentes</Text>
          <Text style={styles.right}>{headerRight}</Text>
        </View>

        {isLoading ? (
          <Text style={styles.desc}>Carregando...</Text>
        ) : count === 0 ? (
          <Text style={styles.desc}>Nenhum arquivo ainda.</Text>
        ) : (
          <View style={styles.list}>
            {visibleItems.map(item => (
              <View key={item.id} style={styles.row}>
                <View style={styles.left}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {item.fileName}
                  </Text>
                  <Text style={styles.meta}>
                    {item.format} • {formatDate(item.createdAt)}
                  </Text>
                </View>

                <View style={styles.rightActions}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.format}</Text>
                  </View>

                  <Pressable
                    onPress={() => onAskDelete(item.id)}
                    hitSlop={10}
                    style={styles.deleteButton}
                  >
                    <Icon name="delete" size={18} color={colors.danger} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      <ConfirmDeleteModal
        visible={!!pendingDeleteId}
        title="Apagar documento"
        message={
          pendingItem
            ? `Tem certeza que quer apagar "${pendingItem.fileName}" da listagem?`
            : 'Tem certeza que quer apagar este documento da listagem?'
        }
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: { color: colors.text, fontSize: 14, fontWeight: '900' },
  right: { color: colors.mutedText, fontSize: 12, fontWeight: '900' },

  desc: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.xs,
  },

  list: { gap: spacing.sm, marginTop: spacing.sm },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  left: { flex: 1 },
  fileName: { color: colors.text, fontSize: 12, fontWeight: '900' },
  meta: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },

  rightActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: { color: colors.text, fontSize: 11, fontWeight: '900' },

  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
