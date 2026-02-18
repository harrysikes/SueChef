import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { pickImage, takePhoto, scanReceipt, scanBestByDate, type ReceiptItem, type BestByResult } from '@/services/vision';
import { usePantryStore } from '@/store/pantryStore';
import { colors, spacing, radius, typography } from '@/theme';

type ScanMode = 'receipt' | 'bestby';

export default function ScanScreen() {
  const [mode, setMode] = useState<ScanMode>('receipt');
  const [loading, setLoading] = useState(false);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [bestByResults, setBestByResults] = useState<BestByResult[]>([]);
  const { addItem } = usePantryStore();

  const runReceiptScan = async (uri: string) => {
    setLoading(true);
    setReceiptItems([]);
    setBestByResults([]);
    try {
      const items = await scanReceipt(uri);
      setReceiptItems(items);
      if (items.length === 0) Alert.alert('No items found', 'We couldn\'t read items from this receipt. Try better lighting or a clearer photo.');
    } catch (e: any) {
      Alert.alert('Scan failed', e.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const runBestByScan = async (uri: string) => {
    setLoading(true);
    setReceiptItems([]);
    setBestByResults([]);
    try {
      const results = await scanBestByDate(uri);
      setBestByResults(results);
      if (results.length === 0) Alert.alert('No dates found', 'We couldn\'t find Best By / Use By dates. Try a clearer, well-lit photo of the label.');
    } catch (e: any) {
      Alert.alert('Scan failed', e.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanReceipt = () => {
    Alert.alert('Scan receipt', 'Take a photo or choose from library', [
      { text: 'Take photo', onPress: async () => { const uri = await takePhoto(); if (uri) await runReceiptScan(uri); }},
      { text: 'Choose from library', onPress: async () => { const uri = await pickImage(); if (uri) await runReceiptScan(uri); }},
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleScanBestBy = () => {
    Alert.alert('Scan Best By date', 'Take a photo or choose from library', [
      { text: 'Take photo', onPress: async () => { const uri = await takePhoto(); if (uri) await runBestByScan(uri); }},
      { text: 'Choose from library', onPress: async () => { const uri = await pickImage(); if (uri) await runBestByScan(uri); }},
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const addReceiptItemToPantry = async (item: ReceiptItem) => {
    try {
      await addItem({
        name: item.name,
        quantity: item.quantity,
        source: 'receipt_scan',
      });
      setReceiptItems((prev) => prev.filter((i) => i !== item));
      Alert.alert('Added', `"${item.name}" added to pantry.`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const addBestByToPantry = async (r: BestByResult) => {
    if (!r.bestByDate) return;
    try {
      await addItem({
        name: r.itemName || 'Item',
        bestByDate: new Date(r.bestByDate),
        source: 'receipt_scan',
      });
      setBestByResults((prev) => prev.filter((x) => x !== r));
      Alert.alert('Added', `Added to pantry with Best By ${r.bestByDate}.`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Receipt or Best By dates</Text>
      </View>

      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeBtn, mode === 'receipt' && styles.modeBtnActive]}
          onPress={() => setMode('receipt')}
        >
          <Text style={[styles.modeBtnText, mode === 'receipt' && styles.modeBtnTextActive]}>Receipt</Text>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, mode === 'bestby' && styles.modeBtnActive]}
          onPress={() => setMode('bestby')}
        >
          <Text style={[styles.modeBtnText, mode === 'bestby' && styles.modeBtnTextActive]}>Best By</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.scanButton}
        onPress={mode === 'receipt' ? handleScanReceipt : handleScanBestBy}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.scanButtonText}>
            {mode === 'receipt' ? 'Scan receipt' : 'Scan Best By date'}
          </Text>
        )}
      </Pressable>

      {receiptItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receipt items</Text>
          {receiptItems.map((item, i) => (
            <Pressable key={i} style={styles.resultRow} onPress={() => addReceiptItemToPantry(item)}>
              <Text style={styles.resultName}>{item.name}</Text>
              {(item.quantity || item.price) && (
                <Text style={styles.resultMeta}>
                  {[item.quantity, item.price].filter(Boolean).join(' · ')}
                </Text>
              )}
              <Text style={styles.addLabel}>Add to pantry</Text>
            </Pressable>
          ))}
        </View>
      )}

      {bestByResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Best By dates</Text>
          {bestByResults.map((r, i) => (
            <Pressable key={i} style={styles.resultRow} onPress={() => addBestByToPantry(r)}>
              <Text style={styles.resultName}>{r.itemName || 'Item'}</Text>
              <Text style={styles.resultMeta}>{r.bestByDate} {r.rawText ? `(${r.rawText})` : ''}</Text>
              <Text style={styles.addLabel}>Add to pantry</Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  subtitle: { ...typography.subhead, color: colors.textSecondary },
  modeRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm },
  modeBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeBtnText: { ...typography.bodyBold, color: colors.text },
  modeBtnTextActive: { color: colors.onPrimary },
  scanButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  scanButtonText: { ...typography.bodyBold, color: colors.onPrimary },
  section: { padding: spacing.lg, paddingTop: spacing.xl },
  sectionTitle: { ...typography.title3, color: colors.text, marginBottom: spacing.md },
  resultRow: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  resultName: { ...typography.bodyBold, color: colors.text },
  resultMeta: { ...typography.footnote, color: colors.textSecondary, marginTop: 2 },
  addLabel: { ...typography.footnote, color: colors.primary, marginTop: 4 },
});
