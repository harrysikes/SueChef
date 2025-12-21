import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useGroceryStore, GroceryItem } from '@/store/groceryStore';

export default function GroceryListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { lists, updateList } = useGroceryStore();
  const list = lists.find((l) => l.id === id);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');

  useEffect(() => {
    if (list) {
      setItems(list.items);
    }
  }, [list]);

  if (!list) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>List not found</Text>
      </View>
    );
  }

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    const newItem: GroceryItem = {
      name: newItemName.trim(),
      quantity: newItemQuantity.trim() || undefined,
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    updateList(id, { items: updatedItems });
    setNewItemName('');
    setNewItemQuantity('');
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    updateList(id, { items: updatedItems });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>{list.name}</Text>
      </View>

      <ScrollView style={styles.content}>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No items in this list</Text>
          </View>
        ) : (
          items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.quantity && <Text style={styles.itemQuantity}>{item.quantity}</Text>}
              </View>
              <Pressable onPress={() => handleRemoveItem(index)} style={styles.deleteButton}>
                <Text style={styles.deleteText}>Remove</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.addSection}>
        <TextInput
          style={styles.input}
          placeholder="Item name"
          value={newItemName}
          onChangeText={setNewItemName}
        />
        <TextInput
          style={styles.input}
          placeholder="Quantity (optional)"
          value={newItemQuantity}
          onChangeText={setNewItemQuantity}
        />
        <Pressable onPress={handleAddItem} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Item</Text>
        </Pressable>
      </View>
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
  },
  backButton: {
    fontSize: 17,
    color: '#007AFF',
    marginBottom: 8,
    fontFamily: 'System',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'System',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 17,
    color: '#8E8E93',
    fontFamily: 'System',
  },
  itemRow: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    fontFamily: 'System',
  },
  itemQuantity: {
    fontSize: 15,
    color: '#8E8E93',
    fontFamily: 'System',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'System',
  },
  addSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5E5',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 12,
    fontSize: 17,
    marginBottom: 12,
    fontFamily: 'System',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  errorText: {
    fontSize: 17,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 60,
    fontFamily: 'System',
  },
});



