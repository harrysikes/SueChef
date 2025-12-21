import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { usePantryStore } from '@/store/pantryStore';
import PantryItemRow from '@/components/PantryItemRow';
import dayjs from 'dayjs';

export default function PantryScreen() {
  const { items, addItem, removeItem, updateItem } = usePantryStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemExpiration, setNewItemExpiration] = useState('');

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    addItem({
      name: newItemName.trim(),
      quantity: newItemQuantity.trim() || undefined,
      expirationDate: newItemExpiration ? dayjs(newItemExpiration).toDate() : undefined,
      source: 'manual',
    });

    setNewItemName('');
    setNewItemQuantity('');
    setNewItemExpiration('');
    setShowAddModal(false);
  };

  const sortedItems = [...items].sort((a, b) => {
    if (!a.expirationDate) return 1;
    if (!b.expirationDate) return -1;
    return dayjs(a.expirationDate).diff(dayjs(b.expirationDate));
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pantry</Text>
        <Pressable onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </Pressable>
      </View>

      {showAddModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Pantry Item</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Item name"
              value={newItemName}
              onChangeText={setNewItemName}
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Quantity (optional)"
              value={newItemQuantity}
              onChangeText={setNewItemQuantity}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Expiration date (YYYY-MM-DD)"
              value={newItemExpiration}
              onChangeText={setNewItemExpiration}
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setShowAddModal(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleAddItem} style={[styles.modalButton, styles.modalButtonPrimary]}>
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.listContainer}>
        {sortedItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Your pantry is empty</Text>
            <Text style={styles.emptySubtext}>Add items manually or let Sue track them from your grocery lists</Text>
          </View>
        ) : (
          sortedItems.map((item) => (
            <PantryItemRow
              key={item.id}
              item={item}
              onUpdate={updateItem}
              onDelete={() => removeItem(item.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'System',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'System',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    fontFamily: 'System',
  },
  emptySubtext: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    fontFamily: 'System',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    fontFamily: 'System',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 12,
    fontSize: 17,
    marginBottom: 12,
    fontFamily: 'System',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 17,
    color: '#007AFF',
    fontFamily: 'System',
  },
  modalButtonTextPrimary: {
    color: '#ffffff',
    fontWeight: '600',
  },
});



