import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  InteractionManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from '@react-native-documents/picker';
import RNFS from 'react-native-fs';

import { AppHeader } from '../../components/AppHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { HistoryCard } from '../../features/history/historyCard';
import { BannerBottom } from '../../components/BannerBottom';
import { useHistory } from '../../features/history/useHistory';
import { addHistoryItem } from '../../features/history/historyRepository';

export function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { items, refresh, mergePdfsAndExport } = useHistory();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionEnabled, setIsSelectionEnabled] = useState(false);

  const handleStartScan = () => navigation.navigate('Scan');

  const handleUploadPDF = useCallback(() => {
    // InteractionManager garante que a UI thread está livre (essencial no RN 0.83)
    InteractionManager.runAfterInteractions(async () => {
      try {
        // Pequeno delay para estabilizar o contexto da Activity no Bridgeless
        await new Promise(resolve => setTimeout(resolve, 100));

        const pickerResult = await DocumentPicker.pick({
          type: [DocumentPicker.types.pdf],
          mode: 'import',
          copyTo: 'cachesDirectory',
        });

        const file = pickerResult[0];
        if (!file?.uri) return;

        const folderPath = `${RNFS.DocumentDirectoryPath}/ScannerProntoPDF`;

        if (!(await RNFS.exists(folderPath))) {
          await RNFS.mkdir(folderPath);
        }

        const fileName = `${Date.now()}_${file.name || 'documento.pdf'}`;
        const destinationPath = `${folderPath}/${fileName}`;

        // RNFS precisa do path limpo no Android
        const cleanSrc = file.uri.replace('file://', '');
        await RNFS.copyFile(cleanSrc, destinationPath);

        // Plugando no seu historyRepository
        await addHistoryItem({
          fileName: file.name || 'Importado',
          format: 'PDF',
          savedInAppPath: destinationPath,
        });

        refresh();
      } catch (err: any) {
        if (!DocumentPicker.isCancel(err)) {
          console.log('Erro Picker:', err);
        }
      }
    });
  }, [refresh]);

  const handleMergeSelection = async () => {
    const selectedItems = items.filter(item => selectedIds.includes(item.id));
    if (selectedItems.length < 2) return;

    try {
      const mergedFileName = `Merged_${Date.now()}`;
      await mergePdfsAndExport(selectedItems, mergedFileName);
      setSelectedIds([]);
      setIsSelectionEnabled(false);
      Alert.alert('Sucesso', 'PDFs mesclados!');
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <AppHeader title="DocStack" subtitle="Gerencie seus documentos" />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.uploadCard} onPress={handleUploadPDF}>
          <View style={styles.uploadCircle}>
            <Icon name="file-upload-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.uploadTitle}>Importar PDF</Text>
          <Text style={styles.uploadSubtitle}>
            Escolha um arquivo do seu celular
          </Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStartScan}
          >
            <Icon name="camera-plus-outline" size={24} color="#1E293B" />
            <Text style={styles.buttonText}>Escanear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mergeButton,
              selectedIds.length < 2 && styles.buttonDisabled,
            ]}
            onPress={handleMergeSelection}
            disabled={selectedIds.length < 2}
          >
            <Icon
              name="set-merge"
              size={24}
              color={selectedIds.length < 2 ? '#94A3B8' : '#1E293B'}
            />
            <Text
              style={[
                styles.buttonText,
                selectedIds.length < 2 && { color: '#94A3B8' },
              ]}
            >
              Mesclar ({selectedIds.length})
            </Text>
          </TouchableOpacity>
        </View>

        <HistoryCard
          externalSelectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          isSelectionEnabled={isSelectionEnabled}
          onToggleSelectionMode={setIsSelectionEnabled}
        />
      </ScrollView>

      <View style={[styles.bannerWrap, { paddingBottom: insets.bottom }]}>
        <BannerBottom />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerWrap: { backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  uploadCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  uploadSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionButton: {
    flex: 1,
    height: 60,
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  mergeButton: {
    flex: 1,
    height: 60,
    borderWidth: 2,
    borderColor: '#1E293B',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: { fontWeight: '700', fontSize: 15, color: '#1E293B' },
  buttonDisabled: { opacity: 0.4, borderColor: '#CBD5E1' },
  bannerWrap: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
});
