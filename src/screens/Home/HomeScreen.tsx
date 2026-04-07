import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  InteractionManager,
  Modal,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
import { t } from '../../i18n';
import { Loading } from '../../components/Loading';
import { HistoryItem } from '../../features/history/historyTypes';
import { RenameFileModal } from '../../components/RenameFileModal';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';
import { MergeProgressOverlay } from '../../components/MergeProgressOverlay';

export function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const {
    items,
    refresh,
    isLoading,
    exportToDevice,
    mergePdfsAndExport,
    rename,
    share,
    duplicate,
    remove,
  } = useHistory();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMergeMode, setIsMergeMode] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [mergeStatusText, setMergeStatusText] = useState('');
  const [mergeSuccessVisible, setMergeSuccessVisible] = useState(false);

  const [activeItem, setActiveItem] = useState<HistoryItem | null>(null);
  const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);
  const [isRenameVisible, setIsRenameVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);

  const handleStartScan = () => navigation.navigate('Scan');

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleUploadPDF = useCallback(() => {
    if (isImporting) return;
    setIsImporting(true);

    InteractionManager.runAfterInteractions(async () => {
      try {
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

        const fileName = `${Date.now()}_${
          file.name || t('home.importedDefaultFileName')
        }`;
        const destinationPath = `${folderPath}/${fileName}`;

        const cleanSrc = file.uri.replace('file://', '');
        await RNFS.copyFile(cleanSrc, destinationPath);

        await addHistoryItem({
          fileName: file.name || t('home.importedDefaultName'),
          format: 'PDF',
          savedInAppPath: destinationPath,
        });

        await refresh();
      } catch (err: any) {
        if (!DocumentPicker.isCancel(err)) {
          console.log(t('home.importErrorLog'), err);
          Alert.alert(t('common.error'), t('preview.modalSaveErrorFallback'));
        }
      } finally {
        setIsImporting(false);
      }
    });
  }, [isImporting, refresh]);

  const handleMergeSelection = async () => {
    if (!isMergeMode) {
      setIsMergeMode(true);
      return;
    }

    if (isMerging) return;

    const selectedItems = items.filter(item => selectedIds.includes(item.id));
    if (selectedItems.length < 2) return;

    try {
      setIsMerging(true);
      setMergeSuccessVisible(false);
      setMergeProgress(0);
      setMergeStatusText(t('history.mergeProgressPreparing'));
      const mergedFileName = `Merged_${Date.now()}`;
      const result = await mergePdfsAndExport(
        selectedItems,
        mergedFileName,
        (progress, status) => {
          setMergeProgress(progress);
          setMergeStatusText(status);
        },
      );
      setMergeProgress(100);
      setMergeStatusText(t('history.mergeProgressDone'));
      setMergeSuccessVisible(true);
      await new Promise(resolve => setTimeout(resolve, 650));
      setSelectedIds([]);
      setIsMergeMode(false);
      Alert.alert(
        t('common.success'),
        result.message || t('history.mergedSuccessAlert'),
      );
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message);
    } finally {
      setIsMerging(false);
      setMergeSuccessVisible(false);
      setMergeStatusText('');
      setMergeProgress(0);
    }
  };

  const closeActionMenu = useCallback(() => {
    setIsActionMenuVisible(false);
  }, []);

  const openActionMenu = useCallback((item: HistoryItem) => {
    setActiveItem(item);
    setIsActionMenuVisible(true);
  }, []);

  const activeBaseName = useMemo(() => {
    if (!activeItem) return '';
    const dotIndex = activeItem.fileName.lastIndexOf('.');
    if (dotIndex <= 0) return activeItem.fileName;
    return activeItem.fileName.slice(0, dotIndex);
  }, [activeItem]);

  const runItemAction = useCallback(
    async (action: () => Promise<void>) => {
      closeActionMenu();
      try {
        await action();
      } catch (error: any) {
        Alert.alert(
          t('common.error'),
          error?.message || t('preview.modalSaveErrorFallback'),
        );
      }
    },
    [closeActionMenu],
  );

  const handleExport = useCallback(() => {
    if (!activeItem) return;
    runItemAction(async () => {
      const result = await exportToDevice(activeItem);
      Alert.alert(
        t('common.success'),
        result.message || t('history.exportFail'),
      );
    });
  }, [activeItem, exportToDevice, runItemAction]);

  const handleShare = useCallback(() => {
    if (!activeItem) return;
    runItemAction(async () => {
      await share(activeItem);
    });
  }, [activeItem, runItemAction, share]);

  const handleDuplicate = useCallback(() => {
    if (!activeItem) return;
    runItemAction(async () => {
      await duplicate(activeItem);
      Alert.alert(t('common.success'), t('history.duplicateSuccess'));
    });
  }, [activeItem, duplicate, runItemAction]);

  const openRename = useCallback(() => {
    closeActionMenu();
    setIsRenameVisible(true);
  }, [closeActionMenu]);

  const openDeleteConfirm = useCallback(() => {
    closeActionMenu();
    setIsDeleteVisible(true);
  }, [closeActionMenu]);

  const handleRenameConfirm = useCallback(
    async (nextBaseName: string) => {
      if (!activeItem) return;

      try {
        await rename(activeItem, nextBaseName);
        setIsRenameVisible(false);
      } catch (error: any) {
        Alert.alert(
          t('common.error'),
          error?.message || t('preview.modalSaveErrorFallback'),
        );
      }
    },
    [activeItem, rename],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!activeItem) return;

    try {
      await remove(activeItem);
      setIsDeleteVisible(false);
      setActiveItem(null);
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error?.message || t('preview.modalSaveErrorFallback'),
      );
    }
  }, [activeItem, remove]);

  return (
    <View style={styles.container}>
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <AppHeader
          title={t('home.headerTitle')}
          subtitle={t('home.headerSubtitle')}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.uploadCard}
          onPress={handleUploadPDF}
          disabled={isImporting}
        >
          <View style={styles.uploadCircle}>
            <Icon name="file-upload-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.uploadTitle}>{t('home.importPdfTitle')}</Text>
          <Text style={styles.uploadSubtitle}>
            {t('home.importPdfSubtitle')}
          </Text>
          {isImporting ? <Loading inline size="small" /> : null}
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStartScan}
          >
            <Icon name="camera-plus-outline" size={24} color="#1E293B" />
            <Text style={styles.buttonText}>{t('home.scanButton')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mergeButton,
              (!isMergeMode || selectedIds.length < 2 || isMerging) &&
                styles.buttonDisabled,
            ]}
            onPress={handleMergeSelection}
            disabled={isMerging}
          >
            <Icon
              name="set-merge"
              size={24}
              color={
                !isMergeMode || selectedIds.length < 2 || isMerging
                  ? '#94A3B8'
                  : '#1E293B'
              }
            />
            <Text
              style={[
                styles.buttonText,
                (!isMergeMode || selectedIds.length < 2 || isMerging) && {
                  color: '#000000',
                },
              ]}
            >
              {isMergeMode
                ? t('home.mergeButton', { count: selectedIds.length })
                : t('home.mergeEnterSelection')}
            </Text>
          </TouchableOpacity>
        </View>

        <HistoryCard
          items={items}
          isLoading={isLoading}
          onOpenActions={openActionMenu}
          externalSelectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          isMergeMode={isMergeMode}
          onMergeModeChange={setIsMergeMode}
        />
      </ScrollView>

      <MergeProgressOverlay
        visible={isMerging}
        progress={mergeProgress}
        statusText={mergeStatusText}
        isSuccess={mergeSuccessVisible}
      />

      <Modal
        visible={isActionMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeActionMenu}
      >
        <Pressable style={styles.actionBackdrop} onPress={closeActionMenu} />
        <View style={styles.actionModalWrap}>
          <View style={styles.actionCard}>
            <Pressable style={styles.actionMenuItem} onPress={openRename}>
              <Text style={styles.actionMenuText}>
                {t('history.renameAction')}
              </Text>
            </Pressable>
            <Pressable style={styles.actionMenuItem} onPress={handleShare}>
              <Text style={styles.actionMenuText}>
                {t('history.shareAction')}
              </Text>
            </Pressable>
            <Pressable style={styles.actionMenuItem} onPress={handleExport}>
              <Text style={styles.actionMenuText}>
                {t('history.exportAction')}
              </Text>
            </Pressable>
            <Pressable style={styles.actionMenuItem} onPress={handleDuplicate}>
              <Text style={styles.actionMenuText}>
                {t('history.duplicateAction')}
              </Text>
            </Pressable>
            <Pressable
              style={styles.actionMenuItem}
              onPress={openDeleteConfirm}
            >
              <Text style={styles.actionMenuTextDanger}>
                {t('history.deleteAction')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <RenameFileModal
        visible={isRenameVisible}
        initialValue={activeBaseName}
        onCancel={() => setIsRenameVisible(false)}
        onConfirm={handleRenameConfirm}
      />

      <ConfirmDeleteModal
        visible={isDeleteVisible}
        message={
          activeItem?.fileName
            ? t('history.deleteMessageWithName', { name: activeItem.fileName })
            : t('history.deleteMessageFallback')
        }
        confirmLabel={t('history.deleteAction')}
        onCancel={() => setIsDeleteVisible(false)}
        onConfirm={handleDeleteConfirm}
      />

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
  buttonDisabled: { opacity: 0.6, borderColor: '#0073ff' },
  actionBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,18,32,0.45)',
  },
  actionModalWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  actionCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  actionMenuItem: {
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  actionMenuText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '700',
  },
  actionMenuTextDanger: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  bannerWrap: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
});
