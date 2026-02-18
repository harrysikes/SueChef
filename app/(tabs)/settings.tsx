import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useUserPreferencesStore, type MealSlot, type StandardItem } from '@/store/userPreferencesStore';
import { colors, spacing, radius, typography } from '@/theme';

const SLOTS: { key: MealSlot; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snacks', label: 'Snacks' },
];

export default function SettingsScreen() {
  const { allergies, standardItems, addAllergy, removeAllergy, setStandardItems, loadPreferences, savePreferences } = useUserPreferencesStore();
  const [allergyInput, setAllergyInput] = useState('');
  const [standardInputs, setStandardInputs] = useState<Partial<Record<MealSlot, string>>>({});

  useEffect(() => {
    loadPreferences();
  }, []);

  const handleAddAllergy = async () => {
    const t = allergyInput.trim();
    if (!t) return;
    await addAllergy(t);
    setAllergyInput('');
  };

  const handleAddStandard = async (slot: MealSlot, raw: string) => {
    const names = raw.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    const items: StandardItem[] = names.map((name) => ({ name }));
    const current = standardItems[slot] || [];
    setStandardItems(slot, [...current, ...items]);
    setStandardInputs((prev) => ({ ...prev, [slot]: '' }));
    await savePreferences();
  };

  const handleRemoveStandard = async (slot: MealSlot, index: number) => {
    const current = standardItems[slot] || [];
    setStandardItems(slot, current.filter((_, i) => i !== index));
    await savePreferences();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Allergies & standard items</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Food allergies</Text>
        <Text style={styles.hint}>Sue will never suggest these ingredients.</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="e.g. peanuts, shellfish"
            value={allergyInput}
            onChangeText={setAllergyInput}
            onSubmitEditing={handleAddAllergy}
          />
          <Pressable style={styles.addBtn} onPress={handleAddAllergy}>
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>
        <View style={styles.chipRow}>
          {allergies.map((a) => (
            <Pressable key={a} style={styles.chip} onPress={() => removeAllergy(a)}>
              <Text style={styles.chipText}>{a}</Text>
              <Text style={styles.chipX}> ×</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Standard items</Text>
        <Text style={styles.hint}>Items you buy every week (breakfast, snacks, etc.). Used for grocery planning.</Text>
        {SLOTS.map(({ key, label }) => (
          <View key={key} style={styles.slotBlock}>
            <Text style={styles.slotLabel}>{label}</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                placeholder={`Add ${label.toLowerCase()} items, comma-separated`}
                value={standardInputs[key] || ''}
                onChangeText={(v) => setStandardInputs((p) => ({ ...p, [key]: v }))}
                onSubmitEditing={() => standardInputs[key] && handleAddStandard(key, standardInputs[key]!)}
              />
              <Pressable
                style={styles.addBtn}
                onPress={() => standardInputs[key] && handleAddStandard(key, standardInputs[key]!)}
              >
                <Text style={styles.addBtnText}>Add</Text>
              </Pressable>
            </View>
            <View style={styles.chipRow}>
              {(standardItems[key] || []).map((item, i) => (
                <Pressable key={i} style={styles.chip} onPress={() => handleRemoveStandard(key, i)}>
                  <Text style={styles.chipText}>{item.name}</Text>
                  <Text style={styles.chipX}> ×</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
        <Pressable style={styles.saveBtn} onPress={() => savePreferences().then(() => Alert.alert('Saved', 'Preferences saved.'))}>
          <Text style={styles.saveBtnText}>Save preferences</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  title: { ...typography.largeTitle, color: colors.text },
  subtitle: { ...typography.subhead, color: colors.textSecondary, marginTop: spacing.xs },
  section: { padding: spacing.lg, paddingTop: 0 },
  sectionTitle: { ...typography.title3, color: colors.text, marginBottom: spacing.xs },
  hint: { ...typography.footnote, color: colors.textTertiary, marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.text,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  addBtnText: { ...typography.bodyBold, color: colors.onPrimary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: 4,
    paddingLeft: 10,
    paddingRight: 4,
    borderRadius: radius.full,
  },
  chipText: { ...typography.footnote, color: colors.primary },
  chipX: { ...typography.footnote, color: colors.primary },
  slotBlock: { marginBottom: spacing.lg },
  slotLabel: { ...typography.bodyBold, color: colors.text, marginBottom: spacing.xs },
  saveBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  saveBtnText: { ...typography.bodyBold, color: colors.onPrimary },
});
